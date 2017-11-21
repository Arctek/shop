import { Component, State, Listen, Prop } from '@stencil/core';
import { default as Bluebird } from 'bluebird';

let Shop, ShopFactory, Product, Order;

declare global { 
    interface Window { web3: any; }
}

/* For now until stencil fixes JS imports, just use global web3 object */
declare var Web3:any;
declare var TruffleContract:any;

interface GetWeb3Result {
  web3: any
}

@Component({
  tag: 'shop-app',
  styleUrl: 'shop-app.scss'
})
export class ShopApp {

  @State() web3: any;
  @State() accounts: any;
  @State() account: string;
  @State() shops: any;
  @State() shop: any;
  @State() cart: any;
  @State() product: any;
  @State() shopFactory: any;

  @State() isLoading = false;
  @State() loadFailed = false;
  @State() isInShop = false;

  shopFactoryContract: any;
  shopContract: any;
  productContract: any;
  orderContract: any;
 
  fetchContractsABI() {
    return Promise.all([
      fetch('/assets/contracts/ShopFactory.json', {cache: "no-store"}).then(resp => resp.json()).then((ABI) => { ShopFactory = ABI; }),
      fetch('/assets/contracts/Shop.json', {cache: "no-store"}).then(resp => resp.json()).then((ABI) => { Shop = ABI; }),
      fetch('/assets/contracts/Product.json', {cache: "no-store"}).then(resp => resp.json()).then((ABI) => { Product = ABI; }),
      fetch('/assets/contracts/Order.json', {cache: "no-store"}).then(resp => resp.json()).then((ABI) => { Order = ABI; })
    ]); 
  }

  instantiateContracts() {
    this.shopFactoryContract = TruffleContract(ShopFactory);
    this.shopFactoryContract.setProvider(this.web3.currentProvider);
    this.shopContract = TruffleContract(Shop);
    this.shopContract.setProvider(this.web3.currentProvider);
    this.productContract = TruffleContract(Product);
    this.productContract.setProvider(this.web3.currentProvider);
    this.orderContract = TruffleContract(Order);
    this.orderContract.setProvider(this.web3.currentProvider);

    this.shopFactoryContract.deployed().then(instance => this.shopFactory = instance).then(() => this.getShops());
  }

  getShops() {
    this.isLoading = true;

    this.contractChildCollectionIterator(
      this.shopFactory.getShopCount,
      this.shopFactory.shopIndex,
      this.shopContract,
      { name: this.web3.toAscii, merchant: '' },
      this.shops
    )
    .then(shops => {
      this.shops = shops;
      this.isLoading = false; 
    });
  }

  loadShopProducts(shop) {
    this.isLoading = true;

    let shopContract = this.shops[shop].contract;

    // fetch products for shop
    this.contractChildCollectionIterator(
      shopContract.getProductCount,
      shopContract.productIndex,
      this.productContract,
      {
        name: this.web3.toAscii,
        sku: this.web3.toAscii,
        category: this.web3.toAscii,
        price: 0,
        stock: 0,
        image: this.web3.toAscii,
        merchant: ''
      },
      null
    )
    .then(products => {
      this.shops[shop].products = products;
      this.shop = shop;
      this.isLoading = false;
    });
  }

  // iterate over children contracts that belong to a parent contract; i.e. shops belong to shopfactory, products belong to shops
  contractChildCollectionIterator(parentCountFunction, parentIndexFunction, childContract, childProperties, cachedCollection) {
    return parentCountFunction().then((childCount) => {
      let promiseChain = [];
      let children = {};
      let noExisting = !cachedCollection;

      for (let i = 0; i < childCount; i++) {
        promiseChain.push(
          parentIndexFunction(i).then((childAddress) => {
            if (noExisting || !(childAddress in cachedCollection)) {
              return childContract.at(childAddress)
              .then(contract => 
                this.contractGetProperties(contract, childProperties)
                .then(child => {
                  child.contract = contract;
                  children[childAddress] = child
                })
              );
            }
            else {
              children[childAddress] = cachedCollection[childAddress];
            }
          })
        );
      }
      return Promise.all(promiseChain).then(() => children);
    });
  }

  contractGetProperties(contract, properties) {
    let propPromiseChain = [];
    let props: any = {};
    Object.keys(properties).map((item, i) =>
      propPromiseChain.push(
        contract[item].call().then(prop => 
          props[item] = (typeof properties[item] === "function") ? properties[item](prop) : prop
        )
      )
    );
    return Promise.all(propPromiseChain).then(() => props);
  }

  componentWillLoad() {   
    let self = this;

    // run this straight up, since to fetch the json we don't need to wait on web3 just yet
    let fetchContractsPromise = self.fetchContractsABI();

    let getWeb3 = new Promise(function(resolve, reject) {
        let results: GetWeb3Result;
        let web3;// = window.web3

        if ('web3' in window) {
          web3 = window.web3;
        }

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof web3 !== 'undefined') {
          // Use Mist/MetaMask's provider.
          web3 = new Web3(web3.currentProvider)

          results = {
            web3: web3
          }

          console.log('Injected web3 detected.');

          resolve(results)
        } else {
          // Fallback to localhost if no web3 injection. We've configured this to
          // use the development console's port by default.
          let provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')

          web3 = new Web3(provider)

          results = {
            web3: web3
          }

          console.log('No web3 instance injected, using Local web3.');

          resolve(results)
        }
    });

    this.isLoading = true;

    getWeb3
    .then((results: GetWeb3Result) => {      
      let web3 = results.web3;

      if (typeof web3.eth.getBlockPromise !== "function") {
        Bluebird.promisifyAll(web3.eth, { suffix: "Promise" });
      }

      web3.toAsciiOriginal = web3.toAscii;
      web3.toAscii = function (input) { return web3.toAsciiOriginal(input).replace(/\u0000/g, '') }

      self.web3 = web3;

      this.web3.eth.getAccountsPromise((err, accounts) => {
        if (!err) {
          self.accounts = accounts;
          self.account = accounts[0];
        }
        else {
          console.log("No accounts");

          this.loadFailed = true;
        }

        this.isLoading = false;
      });


      // Instantiate contract once web3 provided; and abi's fetched
      //fetchContractsPromise.then(() => this.instantiateContracts());
    })
    .then(() => fetchContractsPromise)
    .then(() => this.instantiateContracts())
    .catch((err) => {
      console.log('Error finding web3:');
      console.log(err);
      this.isLoading = false;
    });
  }


  selectAccount = (account) => {
    this.account = account; 
  }

  selectProduct(product) {
    this.product = product; 
  }

  goBack(type) {
    if (type == "product") {
      this.product = null;
    }
    else {
      this.shop = null;
      this.product = null;
    }
  }

  createShop = (fields) => {
    this.isLoading = true;

    this.shopFactory.deployShop(fields.name, { from: this.account, gas: 33000000 }).then(() => this.getShops());
  }

  createProduct = (fields) => {
    let shopContract = this.shops[this.shop].contract;

    shopContract.addProduct(
      fields.name,
      fields.sku,
      fields.category,
      fields.price,
      fields.stock,
      fields.image,
      { from: this.account, gas: 18000000 }
    ).then(() => this.loadShopProducts(this.shop));

  }

  addToCart = () => {

  }

  editProduct = (fields) => {
    this.isLoading = true;

    let productContract = this.shops[this.shop].products[this.product].contract;

    productContract.update(
      fields.name,
      fields.sku,
      fields.category,
      fields.price,
      fields.stock,
      fields.image,
      { from: this.account }
    ).then(() =>
      this.contractGetProperties(
        productContract,
        {
          name: this.web3.toAscii,
          sku: this.web3.toAscii,
          category: this.web3.toAscii,
          price: 0,
          stock: 0,
          image: this.web3.toAscii,
          merchant: ''
        }
      ).then(props => {
        props.contract = productContract;
        this.shops[this.shop].products[this.product] = props;
        this.isLoading = false;
      })
    );

     
  }

  deleteProduct = (fields) => {

  }

  removeCartProduct = (product) => {

  }

  resetShop = () => {
    this.shop = null;
  }

  loadShop = (shop) => {
    if (shop === null) {
      this.product = null;
    }

    if (this.shops) {
      if (shop && !('products' in this.shops[shop])) {
        this.loadShopProducts(shop);
      }
      else {
        this.shop = shop;
      }

      if (this.shop !== null) {
        let fields = { 
          name: "Product Name",
          sku: "SKU",
          category: "Category",
          price: "Price",
          stock: "Stock",
          image: "Image"
        }; 

        return (
          <shop-component 
            account={this.account} 
            address={this.shop} 
            data={this.shops[shop]} 
            createProductFields={fields} 
            createProductCallback={this.createProduct} />
        );
      }
    }
  }

  loadProduct = (shop, product) => {
    this.product = product;

    if (this.shop !== null) {
      if (this.shops && 'products' in this.shops[shop]) {
        return (
          <shop-product 
            account={this.account} 
            shop={this.shop}
            address={this.product} 
            data={this.shops[shop].products[product]}
            addCartCallback={this.addToCart} 
            editCallback={this.editProduct}
            deleteCallback={this.deleteProduct} />
        );
      }
      else if (this.shops) {
        // come here via browser history
        this.loadShopProducts(shop);
      }
    }
  }
  
  render() {
    if (this.loadFailed) {
      return (
        <div>Failed to load web3</div>
      );
    }

    return ( 
      <div>
        <header class="clearfix">
          <div class="width-container">
            <stencil-route-link url="/"><h1>Shop Front DAPP</h1></stencil-route-link>
            <user-accounts accounts={this.accounts} account={this.account} callback={this.selectAccount} />
            {this.shop != null
              ? <stencil-route-link url="/cart"><div class="cart-link">Cart</div></stencil-route-link>
              : <div />
            }
          </div>
        </header>
        <main>
          <div class="width-container">
            {this.isLoading === true
            ? <div class="loading-icon" />
            : <stencil-router>
                <stencil-route
                  url="/"
                  component="shop-list"
                  componentProps={{
                    "shops" : this.shops ? this.shops : {},
                    "createFields" : { 
                      name: "Shop Name"
                    },
                    "createCallback" : this.createShop,
                    "backCallback" : this.resetShop
                  }}
                  exact={true} />
                <stencil-route
                  url="/shop/:shop"
                  routeRender={(props: { [key: string]: any }) => this.loadShop(props.match.params.shop)}
                  exact={true} />
                <stencil-route
                  url="/shop/:shop/:product"
                  component="shop-product"
                  routeRender={(props: { [key: string]: any }) => 
                    this.loadProduct(
                      props.match.params.shop,
                      props.match.params.product
                  )} />
              </stencil-router>
            }
          </div>
        </main>
      </div>
    );
  }
}

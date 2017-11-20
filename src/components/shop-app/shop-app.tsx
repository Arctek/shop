import { Component, State, Listen } from '@stencil/core';
import { default as Bluebird } from 'bluebird';
//import * as TruffleContract from 'truffle-contract';

const ShopFactoryAddress = "0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4";

let Shop, ShopFactory, Product, Order;
/*
let Shop;

fetch('../../package.json')
.then(resp => resp.json()) 
.then((packageJson) => { 
  console.log(packageJson.version); 
}); 
//import Shop from './Shop.json';    
//import ShopFactory from '../../../build/contracts/ShopFactory.json';
//import Shop from '../../../build/contracts/Shop.json';
//import Product from '../../../build/contracts/Product.json';
//import Order from '../../../build/contracts/Order.json';*/ 

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
  @State() shopFactory: any;

  @State() isLoading = false;

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
      },
      null
    )
    .then(products => {
      this.shops[shop].products = products;
      this.shop = shop;
      this.isLoading = false;
    });
  }

  selectShop(shop) {
    if (shop && !('products' in this.shops[shop])) {
      this.loadShopProducts(shop);
    }
    else {
      this.shop = shop;
    }
  }


  // iterate over children contracts that belong to a parent contract; i.e. shops belong to shopfactory, products belong to shops
  contractChildCollectionIterator(parentCountFunction, parentIndexFunction, childContract, childProperties, cachedCollection) {
    return parentCountFunction().then((childCount) => {
      let promiseChain = [];
      let children = {};
      let noExisting = !cachedCollection;

      for (let i = 0; i < childCount; i++) {

        promiseChain.push(
          parentIndexFunction(i).then( (childAddress) => {
            if (noExisting || !(childAddress in cachedCollection)) {
              return childContract.at(childAddress)
              .then(contract => {
                let child = { ...childProperties, contract: contract };
                console.log(contract);
                let propPromiseChain = [];
                Object.keys(childProperties).map((item, i) => {
                  propPromiseChain.push(
                    contract[item].call().then(prop => {
                      if (typeof child[item] === "function") {
                        child[item] = child[item](prop);
                      }
                      else {
                        child[item] = prop;
                      }
                    })
                  )
                  }
                );
                return Promise.all(propPromiseChain).then(() => {
                  children[childAddress] = child;
                });
              });
            }
            else {
              children[childAddress] = cachedCollection[childAddress];
            }
          })
        );
      }

      return Promise.all(promiseChain).then(() => {
        return children;
      });

    });
  }

  componentDidLoad() {   
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
        self.accounts = accounts;
        self.account = accounts[0];

        this.isLoading = false;
      })
      .catch(err => {
        console.log("No accounts");

        this.isLoading = false;
      });


      // Instantiate contract once web3 provided; and abi's fetched
      fetchContractsPromise.then(() => this.instantiateContracts());
    })
    .catch((err) => {
      console.log('Error finding web3:');
      console.log(err);
      this.isLoading = false;
    });
  }


  selectAccount = (account) => {
    this.account = account; 
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
  
  render() {
    let mainContent = [];

    if (this.isLoading) {
      mainContent.push(<div class="loading-icon" />);
    }
    else {
      if (this.shop) {

        let shop = this.shops[this.shop];

        mainContent.push(<div class="shop-title"><div class="shop-back" onClick={() => this.selectShop(null)}>Back</div><h2>{shop.name}</h2></div>);

        if ('products' in shop) {
          let products = shop.products;

          Object.keys(products).map((item, i) => {
            let product = products[item];

            let imageStyle = { 'backgroundImage': 'url('+product.image.trim()+')' };

            mainContent.push(
              <div class="product-tile">
                <div class="product-image" style={imageStyle} />
                <div class="product-title">{product.name}</div>
                <div class="product-price">{product.price.toString(10)} wei</div>
              </div>
            );
          });
        }

        let fields = { 
          name: "Product Name",
          sku: "SKU",
          category: "Category",
          price: "Price",
          stock: "Stock",
          image: "Image"
        };

        if (shop.merchant === this.account) {
          mainContent.push(<div><create-tile-form title="Create Product" fields={fields} callback={this.createProduct} /></div>);
        }

      }
      else {
        if (this.shops) {
          Object.keys(this.shops).map((item, i) => {
            let shop = this.shops[item];

            mainContent.push(<div class="shop-tile" onClick={() => this.selectShop(item)}><div class="title">{shop.name}</div></div>);
          });
        }

        let fields = { name: "Shop Name" };

        mainContent.push(<create-tile-form title="Create Shop" fields={fields} callback={this.createShop} />);
      }
    }

    return ( 
      <div>
        <header class="clearfix">
          <div class="width-container">
            <h1>Shop Front DAPP</h1>
            <user-accounts accounts={this.accounts} account={this.account} callback={this.selectAccount} />
          </div>
        </header>
        <main>
          <div class="width-container">
            {mainContent}
          </div>
        </main>
      </div>
    );
  }
}

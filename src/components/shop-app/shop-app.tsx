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

  //getShops = async () => {
  getShops() {
    this.isLoading = true;

    this.shopFactory.getShopCount().then((shopCount) => {

      let promiseChain = [];
      let shops = {};
      let noShops = !this.shops;

      for (let i = 0; i < shopCount; i++) {
        promiseChain.push(
          this.shopFactory.shopIndex(i).then( (shopAddress) => {
            if (noShops || !(shopAddress in this.shops)) {
              return this.shopContract.at(shopAddress)
              .then(contract => shops[shopAddress] = {contract: contract, name: ""})
              .then(() => shops[shopAddress].contract.name())
              .then(name => shops[shopAddress].name = name);
            }
            else {
              shops[shopAddress] = this.shops[shopAddress];
            }
          })
        );
      }

      Promise.all(promiseChain).then(() => {
        this.shops = shops;

        this.isLoading = false;
      });

    });    
  }

  componentDidLoad() {   
    let self = this;

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
      console.log(results);
      
      let web3 = results.web3;

      if (typeof web3.eth.getBlockPromise !== "function") {
        Bluebird.promisifyAll(web3.eth, { suffix: "Promise" });
      }

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

  @Listen('userAccountSelected')
  userAccountSelectedHandler(event: CustomEvent) {
    this.account = event.detail.account; 
  }

  @Listen('createShop')
  createShopHandler(event: CustomEvent) {
    this.isLoading = true;

    this.shopFactory.deployShop(event.detail.shopName, { from: this.account, gas: 33000000 }).then(() => this.getShops());
  }
  
  render() {
    let mainContent = [];

    if (this.isLoading) {
      mainContent.push(<div class="loading-icon" />);
    }
    else {

      if (this.shops) {
        Object.keys(this.shops).map((item, i) => {
          let shop = this.shops[item];

          mainContent.push(<div class="shop-tile">{shop.name}</div>);
        });
      }

      mainContent.push(<create-shop />);
    }

    return ( 
      <div>
        <header class="clearfix">
          <div class="width-container">
            <h1>Shop Front DAPP</h1>
            <user-accounts accounts={this.accounts} account={this.account} />
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

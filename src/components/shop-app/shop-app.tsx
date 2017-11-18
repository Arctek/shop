import { Component, State, Listen } from '@stencil/core';
import { default as Promise } from 'bluebird';

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

  @State() isLoading = false;
 
  componentDidLoad() {
    fetch('/assets/contracts/ShopFactory.json').then(resp => resp.json()).then((ABI) => { ShopFactory = ABI; }); 
    fetch('/assets/contracts/Shop.json').then(resp => resp.json()).then((ABI) => { Shop = ABI; }); 
    fetch('/assets/contracts/Product.json').then(resp => resp.json()).then((ABI) => { Product = ABI; }); 
    fetch('/assets/contracts/Order.json').then(resp => resp.json()).then((ABI) => { Order = ABI; }); 

    let self = this;

    let getWeb3 = new Promise(function(resolve, reject) {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      //window.addEventListener('load', function() {
        var results
        var web3;// = window.web3

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
          var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545')

          web3 = new Web3(provider)

          results = {
            web3: web3
          }

          console.log('No web3 instance injected, using Local web3.');

          resolve(results)
        }
     //  })
    });

    this.isLoading = true;

    getWeb3
    .then(results => {

      let web3 = results.web3;

      if (typeof web3.eth.getBlockPromise !== "function") {
        Promise.promisifyAll(web3.eth, { suffix: "Promise" });
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
      })


      // Instantiate contract once web3 provided.
      //this.instantiateContract()
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
  }
  
  render() {
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
            {this.isLoading == true
            ? <div class="loading-icon" />
            : <create-shop />
            }
          </div>
        </main>
      </div>
    );
  }
}

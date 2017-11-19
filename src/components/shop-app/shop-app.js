var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, State, Listen } from '@stencil/core';
import { default as Bluebird } from 'bluebird';
//import * as TruffleContract from 'truffle-contract';
const ShopFactoryAddress = "0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4";
let Shop, ShopFactory, Product, Order;
let ShopApp = class ShopApp {
    constructor() {
        this.isLoading = false;
    }
    fetchContractsABI() {
        // Disable caching for testing, since need to redelpoy
        /*let headers = new Headers();
        headers.append('pragma', 'no-cache');
        headers.append('cache-control', 'no-cache');
    
        let fetchOpt = {
          method: 'GET',
          headers: headers,
        };*/
        return Promise.all([
            fetch('/assets/contracts/ShopFactory.json', { cache: "no-store" }).then(resp => resp.json()).then((ABI) => { ShopFactory = ABI; }),
            fetch('/assets/contracts/Shop.json', { cache: "no-store" }).then(resp => resp.json()).then((ABI) => { Shop = ABI; }),
            fetch('/assets/contracts/Product.json', { cache: "no-store" }).then(resp => resp.json()).then((ABI) => { Product = ABI; }),
            fetch('/assets/contracts/Order.json', { cache: "no-store" }).then(resp => resp.json()).then((ABI) => { Order = ABI; })
        ]);
    }
    instantiateShopFactoryContract() {
        this.fetchContractsABI().then(() => {
            const shopFactoryContract = TruffleContract(ShopFactory);
            shopFactoryContract.setProvider(this.web3.currentProvider);
            shopFactoryContract.deployed().then(instance => this.shopFactory = instance).then(this.getShops);
        });
    }
    getShops() {
        return __awaiter(this, void 0, void 0, function* () {
            //this.isLoading = true;
            this.shopFactory.getShopCount;
        });
    }
    componentDidLoad() {
        let self = this;
        let getWeb3 = new Promise(function (resolve, reject) {
            // Wait for loading completion to avoid race conditions with web3 injection timing.
            //window.addEventListener('load', function() {
            var results;
            var web3; // = window.web3
            if ('web3' in window) {
                web3 = window.web3;
            }
            // Checking if Web3 has been injected by the browser (Mist/MetaMask)
            if (typeof web3 !== 'undefined') {
                // Use Mist/MetaMask's provider.
                web3 = new Web3(web3.currentProvider);
                results = {
                    web3: web3
                };
                console.log('Injected web3 detected.');
                resolve(results);
            }
            else {
                // Fallback to localhost if no web3 injection. We've configured this to
                // use the development console's port by default.
                var provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
                web3 = new Web3(provider);
                results = {
                    web3: web3
                };
                console.log('No web3 instance injected, using Local web3.');
                resolve(results);
            }
            //  })
        });
        this.isLoading = true;
        getWeb3
            .then(results => {
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
            // Instantiate contract once web3 provided.
            this.instantiateShopFactoryContract();
        })
            .catch((err) => {
            console.log('Error finding web3:');
            console.log(err);
            this.isLoading = false;
        });
    }
    userAccountSelectedHandler(event) {
        this.account = event.detail.account;
    }
    createShopHandler(event) {
        this.isLoading = true;
        /* console.log(this.shopFactory);
         var contractData = this.shopFactory.contract.deployShop.getData(event.detail.shopName, { from: this.account });
         var estimate = this.web3.eth.estimateGas({data: contractData})
     
         alert(estimate);
     */
        this.shopFactory.deployShop(event.detail.shopName, { from: this.account, gas: 33000000 }).then(() => this.getShops);
    }
    render() {
        return (h("div", null,
            h("header", { class: "clearfix" },
                h("div", { class: "width-container" },
                    h("h1", null, "Shop Front DAPP"),
                    h("user-accounts", { accounts: this.accounts, account: this.account }))),
            h("main", null,
                h("div", { class: "width-container" }, this.isLoading == true
                    ? h("div", { class: "loading-icon" })
                    : h("create-shop", null)))));
    }
};
__decorate([
    State()
], ShopApp.prototype, "web3", void 0);
__decorate([
    State()
], ShopApp.prototype, "accounts", void 0);
__decorate([
    State()
], ShopApp.prototype, "account", void 0);
__decorate([
    State()
], ShopApp.prototype, "shops", void 0);
__decorate([
    State()
], ShopApp.prototype, "shop", void 0);
__decorate([
    State()
], ShopApp.prototype, "shopFactory", void 0);
__decorate([
    State()
], ShopApp.prototype, "isLoading", void 0);
__decorate([
    Listen('userAccountSelected')
], ShopApp.prototype, "userAccountSelectedHandler", null);
__decorate([
    Listen('createShop')
], ShopApp.prototype, "createShopHandler", null);
ShopApp = __decorate([
    Component({
        tag: 'shop-app',
        styleUrl: 'shop-app.scss'
    })
], ShopApp);
export { ShopApp };

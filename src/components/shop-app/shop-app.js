var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, State } from '@stencil/core';
import { default as Promise } from 'bluebird';
//import  * as getWeb3 from './../../assets/js/getWeb3';
import Web3 from 'web3';
let ShopApp = class ShopApp {
    componentWillLoad() {
        let getWeb3 = new Promise(function (resolve, reject) {
            // Wait for loading completion to avoid race conditions with web3 injection timing.
            window.addEventListener('load', function () {
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
                    var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
                    web3 = new Web3(provider);
                    results = {
                        web3: web3
                    };
                    console.log('No web3 instance injected, using Local web3.');
                    resolve(results);
                }
            });
        });
        getWeb3
            .then(results => {
            let web3 = results.web3;
            if (typeof web3.eth.getBlockPromise !== "function") {
                Promise.promisifyAll(web3.eth, { suffix: "Promise" });
            }
            this.web3 = web3;
            // Instantiate contract once web3 provided.
            //this.instantiateContract()
        })
            .catch(() => {
            console.log('Error finding web3.');
        });
    }
    render() {
        return (h("div", null));
    }
};
__decorate([
    State()
], ShopApp.prototype, "web3", void 0);
ShopApp = __decorate([
    Component({
        tag: 'shop-app',
        styleUrl: 'shop-app.scss'
    })
], ShopApp);
export { ShopApp };

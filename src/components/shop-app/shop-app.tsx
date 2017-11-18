import { Component, State, Listen } from '@stencil/core';
import { default as Promise } from 'bluebird';

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
 
  componentDidLoad() {
    let self = this;
    let getWeb3 = new Promise(function(resolve, reject) {
      // Wait for loading completion to avoid race conditions with web3 injection timing.
      window.addEventListener('load', function() {
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
      })
    })

    getWeb3
    .then(results => {

      let web3 = results.web3;

      if (typeof web3.eth.getBlockPromise !== "function") {
        Promise.promisifyAll(web3.eth, { suffix: "Promise" });
      }

      self.web3 = web3;

      this.web3.eth.getAccountsPromise((err, accounts) => {
        self.accounts = accounts;
        console.log(accounts);
      })
      .catch(err => {
        console.log("No accounts");
      })


      // Instantiate contract once web3 provided.
      //this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    });
  }

  @Listen('userAccountSelected')
  userAccountSelectedHandler(event: CustomEvent) {
    this.account = event.detail.account; 
  }

  render() {
    return (
      <div>
        <header class="clearfix">
          <h1>Shop Front DAPP</h1>
          <user-accounts accounts={this.accounts} account={this.account} />
        </header>
        <main>

        </main>
      </div>
    );
  }
}

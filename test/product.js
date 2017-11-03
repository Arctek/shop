'use strict';

const Product = artifacts.require("./Product.sol");

import { default as Promise } from 'bluebird';

if (typeof web3.eth.getBlockPromise !== "function") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

web3.eth.getTransactionReceiptMined = require("../test_util/getTransactionReceiptMined.js");
web3.eth.expectedPayableExceptionPromise = require("../test_util/expectedPayableExceptionPromise.js");
web3.eth.expectedExceptionPromise = require("../test_util/expectedExceptionPromise.js");
web3.eth.makeSureAreUnlocked = require("../test_util/makeSureAreUnlocked.js");
web3.eth.makeSureHasAtLeast = require("../test_util/makeSureHasAtLeast.js");
web3.eth.calculateGasCost = require("../test_util/calculateGasCost.js");
assert.topicContainsAddress = require("../test_util/topicContainsAddress.js");
assert.disallowPausedKilledActions = require("../test_util/disallowPausedKilledActions.js")(web3);

contract('Product', accounts => {
    const gasToUse = 3000000;
    const productName = "Red Widget";
    let merchant, bob;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 2, "should have at least 2 accounts");
        merchant = accounts[0];
        bob = accounts[1];

        return web3.eth.makeSureAreUnlocked([merchant, bob])
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [bob, merchant], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    
    /*beforeEach(() => {
        return Product.new({ from: merchant }).then(instance => contract = instance);
    });*/

    

});

'use strict';

const Shop = artifacts.require("./Shop.sol");
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
web3.toHexPacked = require("../test_util/toHexPacked.js");
assert.topicContainsAddress = require("../test_util/topicContainsAddress.js");
assert.disallowPausedKilledActions = require("../test_util/disallowPausedKilledActions.js")(web3);

contract('Shop', accounts => {
    const gasToUse = 3000000;

    const shopName = "My First Shop";

    const productName = "Red Widget";
    const productSku = "RW-101";
    const productCategory = "Widgets";
    const productPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
    const productStock = new web3.BigNumber((Math.floor(Math.random() * 30) + 1));
    const productImage = "https://image2";

    let owner, merchant, bob;

    // have to set this here, otherwise loops outside of it() wont work
    const addressList = { "owner": accounts[0], "merchant": accounts[1] };

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 3, "should have at least 3 accounts");
        owner = accounts[0];
        merchant = accounts[1];
        bob = accounts[2];

        return web3.eth.makeSureAreUnlocked([owner, merchant, bob])
            .then(() => web3.eth.makeSureHasAtLeast(owner, [merchant, bob], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [owner, bob], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
            .then(() => web3.eth.makeSureHasAtLeast(bob, [owner, merchant], web3.toWei(1)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    describe("Constructor", () => {
        it('should not allow blank merchant address', () =>
            Shop.new(null, shopName, { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank name', () =>
            Product.new(merchant, "", { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

    });

    describe("Contract Functions", () => {
    });
});

function assertNotFail(error)  {
    assert.notEqual(error.message, 'assert.fail()', 'should have thrown');
}
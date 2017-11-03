'use strict';

const ShopFactory = artifacts.require("./ShopFactory.sol");

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

contract('ShopFactory', accounts => {
    const gasToUse = 3000000;
    const shopName = "Bobs Widgets";
    let owner, bob;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 2, "should have at least 2 accounts");
        owner = accounts[0];
        bob = accounts[1];

        return web3.eth.makeSureAreUnlocked([owner, bob])
            .then(() => web3.eth.makeSureHasAtLeast(owner, [bob, owner], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    
    beforeEach(() => {
        return ShopFactory.new({ from: owner }).then(instance => contract = instance);
    });

    it('should not allow deploy shop with no shop name', () => {
        return web3.eth.expectedExceptionPromise(() => 
            contract.deployShop("", { from: bob, gas: gasToUse }),
        gasToUse);
    });

    it('should allow deploying a shop', async () => {
        let txObject = await contract.deployShop(shopName, { from: bob, gas: gasToUse });
        
        assertLogDeployShop(txObject, bob, shopName);
    });

});

function assertLogDeployShop(txObject, merchant, shopName) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogDeployShop", "should have received LogKill event");
                
    assert.strictEqual(
        txObject.logs[0].args.merchant,
        merchant,
        "should be the merchant");
    assert.include(
        web3.toAscii(txObject.logs[0].args.shopName),
        shopName,
        "should be the shop name");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], merchant);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), shopName, "should be the shop name");
}

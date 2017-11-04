'use strict';

const Order = artifacts.require("./Order.sol");
const Product = artifacts.require("./Product.sol");
const Shop = artifacts.require("./Shop.sol");

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

contract('Order', accounts => {
    const gasToUse = 3000000;

    const shopName = "Test Shop";

    let shopOwner, merchant, user, bob, shopContract;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 4, "should have at least 4 accounts");
        shopOwner = accounts[0];
        merchant = accounts[1];
        user = accounts[2];
        bob = accounts[3];

        return web3.eth.makeSureAreUnlocked([shopOwner, merchant])
            .then(() => web3.eth.makeSureHasAtLeast(shopOwner, [merchant], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [shopOwner], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    beforeEach(() =>
        Shop.new(merchant, shopName, { from: shopOwner }).then(instance => shopContract = instance)
    );

    describe("Constructor", () => {
        it('should not allow empty shop address', () =>
            Order.new(null, { from: user })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        
        it('should instantiate a order instance', async () => {
            let contract = await Order.new(shopContract.address, { from: user });
            
            let contractShop = await contract.shop();

            assert.strictEqual(contractShop, shopContract.address, "shop does not match expected value");
        });
    });
});

//function createProducts

function assertNotFail(error)  {
    assert.notEqual(error.message, 'assert.fail()', 'should have thrown');
}

function assertLogUpdate(txObject, who, name, sku, category, price, stock, image) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogUpdate", "should have received LogUpdate event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.include(
        txObject.logs[0].args.name,
        web3.toHexPacked(name, 66),
        "should be the name");
    assert.include(
        txObject.logs[0].args.sku,
        web3.toHexPacked(sku, 66),
        "should be the sku");
    assert.include(
        txObject.logs[0].args.category,
        web3.toHexPacked(category, 66),
        "should be the category");

    assert.include(
        txObject.logs[0].args.image,
        web3.toHexPacked(image, 66),
        "should be the image");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 4, "should have 4 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), name, "should be the name");
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[3]), sku, "should be the sku");
}

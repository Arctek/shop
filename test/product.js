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
web3.toHexPacked = require("../test_util/toHexPacked.js");
assert.topicContainsAddress = require("../test_util/topicContainsAddress.js");
assert.disallowPausedKilledActions = require("../test_util/disallowPausedKilledActions.js")(web3);

contract('Product', accounts => {
    const gasToUse = 3000000;
    const productName = "Red Widget";
    const productSku = "RW-101";
    const productCategory = "Widgets";
    const productPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
    const productStock = new web3.BigNumber((Math.floor(Math.random() * 30) + 1));
    const productImage = "https://image";

    let merchant, bob;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 2, "should have at least 2 accounts");
        merchant = accounts[0];
        bob = accounts[1];

        return web3.eth.makeSureAreUnlocked([merchant, bob])
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [bob, merchant], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    describe("Contructor", () => {
        it('should not allow blank merchant address', () =>
            Product.new(null, productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank merchant name', () =>
            Product.new(merchant, "", productSku, productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank merchant sku', () =>
            Product.new(merchant, productName, "", productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank merchant category', () =>
            Product.new(merchant, productName, productSku, "", productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should instantiate a product instance', async () => {
            let contract = await Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant });
            
            let contractMerchant = await contract.merchant();
            let contractProductName = await contract.name();
            let contractProductSku = await contract.sku();
            let contractProductCategory = await contract.category();
            let contractProductStock = await contract.stock();
            let contractProductImage = await contract.image();

            assert.strictEqual(contractMerchant, merchant, "merchant does not match expected value");
            assert.strictEqual(contractProductName, web3.toHexPacked(productName, 66), "name does not match expected value");
            assert.strictEqual(contractProductSku, web3.toHexPacked(productSku, 66), "sku does not match expected value");
            assert.strictEqual(contractProductCategory, web3.toHexPacked(productCategory, 66), "category does not match expected value");
            assert.deepEqual(contractProductStock, productStock, "stock does not match expected value");
            assert.strictEqual(contractProductImage, web3.toHexPacked(productImage, 66), "image does not match expected value");
        });
    });
    /*beforeEach(() => {
        return Product.new({ from: merchant }).then(instance => contract = instance);
    });*/

    
    /*assert.disallowPausedKilledActions([
        ["test", () => {}]
    ]
    , merchant, gas);*/
});

function assertNotFail(error)  {
    assert.notEqual(error.message, 'assert.fail()', 'should have thrown');
}
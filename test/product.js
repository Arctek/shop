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
    const productImage = "https://image2";

    const updateProductName = "Blue Doo-dad";
    const updateProductSku = "BW-202";
    const updateProductCategory = "Doo-dads";
    const updateProductPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
    const updateProductStock = new web3.BigNumber((Math.floor(Math.random() * 30) + 1));
    const updateProductImage = "https://image";

    let merchant, bob;

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 2, "should have at least 2 accounts");
        merchant = accounts[0];
        bob = accounts[1];

        return web3.eth.makeSureAreUnlocked([merchant, bob])
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [bob, merchant], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    describe("Constructor", () => {
        it('should not allow blank merchant address', () =>
            Product.new(null, productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank name', () =>
            Product.new(merchant, "", productSku, productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank sku', () =>
            Product.new(merchant, productName, "", productCategory, productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank category', () =>
            Product.new(merchant, productName, productSku, "", productPrice, productStock, productImage, { from: merchant })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should instantiate a product instance', async () => {
            let contract = await Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant });
            
            let contractMerchant = await contract.merchant();
            let contractProductName = await contract.name();
            let contractProductSku = await contract.sku();
            let contractProductCategory = await contract.category();
            let contractProductPrice = await contract.price();
            let contractProductStock = await contract.stock();
            let contractProductImage = await contract.image();

            assert.strictEqual(contractMerchant, merchant, "merchant does not match expected value");
            assert.strictEqual(contractProductName, web3.toHexPacked(productName, 66), "name does not match expected value");
            assert.strictEqual(contractProductSku, web3.toHexPacked(productSku, 66), "sku does not match expected value");
            assert.strictEqual(contractProductCategory, web3.toHexPacked(productCategory, 66), "category does not match expected value");
            assert.deepEqual(contractProductPrice, productPrice, "price does not match expected value");
            assert.deepEqual(contractProductStock, productStock, "stock does not match expected value");
            assert.strictEqual(contractProductImage, web3.toHexPacked(productImage, 66), "image does not match expected value");
        });
    });

    describe("Contract Functions", () => {
        beforeEach(() => Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant }).then(instance => contract = instance));

        describe("Update Function", () => {
            it('should not allow a blank name', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.update("", updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage, { from: merchant }),
                gasToUse);
            });

            it('should not allow a blank sku', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.update(updateProductName, "", updateProductCategory, updateProductPrice, updateProductStock, updateProductImage, { from: merchant }),
                gasToUse);
            });

            it('should not allow a blank category', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.update(updateProductName, updateProductSku, "", updateProductPrice, updateProductStock, updateProductImage, { from: merchant }),
                gasToUse);
            });

            it('should update a product', async () => {
                let txObject = await contract.update(updateProductName, updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage, { from: merchant });

                assertLogUpdate(txObject, merchant, updateProductName, updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage);
                
                let contractProductName = await contract.name();
                let contractProductSku = await contract.sku();
                let contractProductCategory = await contract.category();
                let contractProductPrice = await contract.price();
                let contractProductStock = await contract.stock();
                let contractProductImage = await contract.image();

                assert.strictEqual(contractProductName, web3.toHexPacked(updateProductName, 66), "name does not match expected value");
                assert.strictEqual(contractProductSku, web3.toHexPacked(updateProductSku, 66), "sku does not match expected value");
                assert.strictEqual(contractProductCategory, web3.toHexPacked(updateProductCategory, 66), "category does not match expected value");
                assert.deepEqual(contractProductPrice, updateProductPrice, "price does not match expected value");
                assert.deepEqual(contractProductStock, updateProductStock, "stock does not match expected value");
                assert.strictEqual(contractProductImage, web3.toHexPacked(updateProductImage, 66), "image does not match expected value");
            });
        });

        describe("Set Merchant Function", () => {
            it('should not allow a blank merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(null, { from: merchant }),
                gasToUse);
            });

            it('should not allow the same merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(merchant, { from: merchant }),
                gasToUse);
            });

            it('should set the merchant', async () => {
                let txObject = await contract.setMerchant(bob, { from: merchant });

                assertLogSetMerchant(txObject, merchant, bob);
                
                let contractMerchant = await contract.merchant();

                assert.strictEqual(contractMerchant, bob, "merchant does not match expected value");
            });
        });

        describe("Set Name Function", () => {
            it('should not allow a blank name', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setName("", { from: merchant }),
                gasToUse);
            });

            it('should not allow the same merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setName(productName, { from: merchant }),
                gasToUse);
            });

            it('should set the name', async () => {
                let txObject = await contract.setName(updateProductName, { from: merchant });

                assertLogSetName(txObject, merchant, updateProductName);
                
                let contractProductName = await contract.name();

                assert.strictEqual(contractProductName, web3.toHexPacked(updateProductName, 66), "name does not match expected value");
            });
        });
    });

    
    
    /*assert.disallowPausedKilledActions([
        ["test", () => {}]
    ]
    , merchant, gas);*/
});

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

function assertLogSetMerchant(txObject, who, merchant) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetMerchant", "should have received LogSetMerchant event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.merchant,
        merchant,
        "should be merchant");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.topicContainsAddress(txObject.receipt.logs[0].topics[2], merchant);
}

function assertLogSetName(txObject, who, name) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetName", "should have received LogSetName event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.name,
        web3.toHexPacked(name, 66),
        "should be merchant");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), name, "should be the name");
}

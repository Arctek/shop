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
assert.logSetMerchant = require("../test_util/assertLogSetMerchant.js");
let createProducts = require("../test_util/createProducts.js");

contract('Shop', accounts => {
    const gasToUse = 3000000;

    const shopName = "My First Shop";
    const updatedShopName = "My Second Shop";

    const productName = "Red Widget";
    const productSku = "RW-101";
    const productCategory = "Widgets";
    const productPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
    const productStock = new web3.BigNumber((Math.floor(Math.random() * 30) + 1));
    const productImage = "https://image2";

    let owner, merchant, bob, productContracts;

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
            Shop.new(merchant, "", { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should instantiate a shop instance', async () => {
            let contract = await Shop.new(merchant, shopName, { from: owner });
            
            let contractMerchant = await contract.merchant();
            let contractShopName = await contract.name();

            assert.strictEqual(contractMerchant, merchant, "merchant does not match expected value");
            assert.strictEqual(contractShopName, web3.toHexPacked(shopName, 66), "name does not match expected value");
        });

    });

    describe("Contract Functions", () => {
        beforeEach(() => Shop.new(merchant, shopName, { from: owner }).then(instance => contract = instance));

        describe("Set Shop Name Function", () => {
            it('should not allow non-owner or non-merchant', () => 
                web3.eth.expectedExceptionPromise(() => 
                    contract.setShopName(updatedShopName, { from: bob }), gasToUse)
            );

            it('should not allow a blank name', () => 
                web3.eth.expectedExceptionPromise(() => 
                    contract.setShopName("", { from: merchant }), gasToUse)
            );

            it('should not allow the same name', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.setShopName(shopName, { from: merchant }), gasToUse)
            );

            for (const who in addressList) {
                it('should set the name for ' + who, async () => {
                    let txObject = await contract.setShopName(updatedShopName, { from: addressList[who] });

                    assertLogSetShopName(txObject, addressList[who], updatedShopName);
                    
                    let contractShopName = await contract.name();

                    assert.strictEqual(contractShopName, web3.toHexPacked(updatedShopName, 66), "name does not match expected value");
                });
            }
        });

        describe("Set Merchant Function", () => {
            it('should not allow non-owner or non-merchant', () => 
                web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(bob, { from: bob }), gasToUse)
            );

            it('should not allow a blank merchant', () => 
                web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(null, { from: merchant }), gasToUse)
            );

            it('should not allow the same merchant', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(merchant, { from: merchant }), gasToUse)
            );

            for (const who in addressList) {
                it('should set the merchant for ' + who, async () => {
                    let txObject = await contract.setMerchant(bob, { from: addressList[who] });

                    assert.logSetMerchant(txObject, addressList[who], bob);
                    
                    let contractMerchant = await contract.merchant();

                    assert.strictEqual(contractMerchant, bob, "merchant does not match expected value");
                });
            }
        });

        describe("Add Product Function", () => {
            it('should not allow non-owner or non-merchant', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.addProduct(productName, productSku, productCategory, productPrice, productStock, productImage, { from: bob }), gasToUse)
            );

            it('should not allow a blank name', () => 
                web3.eth.expectedExceptionPromise(() => 
                    contract.addProduct("", productSku, productCategory, productPrice, productStock, productImage, { from: merchant }), gasToUse)
            );

            it('should not allow a blank sku', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.addProduct(productName, "", productCategory, productPrice, productStock, productImage, { from: merchant }), gasToUse)
            );

            it('should not allow a blank category', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.addProduct(productName, productSku, "", productPrice, productStock, productImage, { from: merchant }), gasToUse)
            );

            for (const who in addressList) {
                it('should add a product for ' + who, async() => {
                    let address = addressList[who];
                
                    let txObject = await contract.addProduct(productName, productSku, productCategory, productPrice, productStock, productImage, { from: address });

                    let productIndexVal = await contract.productIndex(0);
                    let productCount = await contract.getProductCount();
                    let productStruct = await contract.productsStruct(productIndexVal);

                    let productContract = Product.at(productIndexVal);

                    assertLogAddProduct(txObject, address, productIndexVal, productName, productSku, productCategory, productPrice, productStock, productImage);
                    
                    let contractProductName = await productContract.name();
                    let contractProductSku = await productContract.sku();
                    let contractProductCategory = await productContract.category();
                    let contractProductPrice = await productContract.price();
                    let contractProductStock = await productContract.stock();
                    let contractProductImage = await productContract.image();

                    assert.strictEqual(contractProductName, web3.toHexPacked(productName, 66), "name does not match expected value");
                    assert.strictEqual(contractProductSku, web3.toHexPacked(productSku, 66), "sku does not match expected value");
                    assert.strictEqual(contractProductCategory, web3.toHexPacked(productCategory, 66), "category does not match expected value");
                    assert.deepEqual(contractProductPrice, productPrice, "price does not match expected value");
                    assert.deepEqual(contractProductStock, productStock, "stock does not match expected value");
                    assert.strictEqual(contractProductImage, web3.toHexPacked(productImage, 66), "image does not match expected value");
                });
            }
        });

        describe("Remove Product Function", () => {
            beforeEach(async () => { productContracts = await createProducts(Product, contract, merchant, 3); });

            it('should not allow non-owner or non-merchant', () =>
                web3.eth.expectedExceptionPromise(() => 
                    contract.removeProduct(productContracts[0].address, { from: bob }), gasToUse)
            );

            it('should not allow a non-added product', async () => {
                let productContract = await Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: owner });

                return web3.eth.expectedExceptionPromise(() => 
                    contract.removeProduct(productContract.address, { from: merchant }), gasToUse);
            });

            for (const who in addressList) {
                it('should remove a product for ' + who, async () => {
                    let address = addressList[who];
                    let productContract = productContracts[0];

                    let contractAddress = productContract.address;
                    let contractProductName = await productContract.name();
                    let contractProductSku = await productContract.sku();
                    let contractProductCategory = await productContract.category();

                    let txObject = await contract.removeProduct(contractAddress, { from: address });

                    let productCount = await contract.getProductCount();

                    assertLogRemoveProduct(txObject, address, contractAddress, contractProductName, contractProductSku, contractProductCategory);

                    assert.deepEqual(productCount, new web3.BigNumber(2), "product count does not match expected value");
                });
            }
        });

        describe("Submit Order Function", () => {
            //kill, paused, status, total, quantity, 
        });
    });
});

function assertNotFail(error)  {
    assert.notEqual(error.message, 'assert.fail()', 'should have thrown');
}

function assertLogSetShopName(txObject, who, name) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetShopName", "should have received LogSetShopName event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.name,
        web3.toHexPacked(name, 66),
        "should be name");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), name, "should be the name");
}

function assertLogAddProduct(txObject, who, product, name, sku, category, price, stock, image) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogAddProduct", "should have received LogAddProduct event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.product,
        product,
        "should be product address");
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
    assert.deepEqual(
        txObject.logs[0].args.price,
        price,
        "should be the price");
    assert.deepEqual(
        txObject.logs[0].args.stock,
        stock,
        "should be the stock");
    assert.include(
        txObject.logs[0].args.image,
        web3.toHexPacked(image, 66),
        "should be the image");

    assert.strictEqual(txObject.receipt.logs[0].topics.length, 4, "should have 4 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.topicContainsAddress(txObject.receipt.logs[0].topics[2], product);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[3]), name, "should be the name");
}

function assertLogRemoveProduct(txObject, who, product, name, sku, category) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogRemoveProduct", "should have received LogRemoveProduct event");
    
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.product,
        product,
        "should be product address");
    assert.strictEqual(
        txObject.logs[0].args.name,
        name,
        "should be the name");
    assert.strictEqual(
        txObject.logs[0].args.sku,
        sku,
        "should be the sku");
    assert.strictEqual(
        txObject.logs[0].args.category,
        category,
        "should be the category");

    assert.strictEqual(txObject.receipt.logs[1].topics.length, 4, "should have 4 topics");

    assert.topicContainsAddress(txObject.receipt.logs[1].topics[1], who);
    assert.topicContainsAddress(txObject.receipt.logs[1].topics[2], product);
    assert.strictEqual(txObject.receipt.logs[1].topics[3], name, "should be the name");
}
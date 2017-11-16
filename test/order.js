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
    
    const zeroBigNumber = new web3.BigNumber(0);
    const oneBigNumber = new web3.BigNumber(1);

    const productName = "Red Widget";
    const productSku = "RW-101";
    const productCategory = "Widgets";
    const productPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
    const productStock = oneBigNumber;
    const productQuantity = oneBigNumber;
    const productImage = "https://image2";

    let shopOwner, merchant, user, bob, orderContract, shopContract, productContract, productContracts;

    async function createProduct(quantity) {
        let txObject = await shopContract.addProduct(productName, productSku, productCategory, productPrice, quantity > 0 ? quantity : productQuantity, productImage, { from: merchant });

        return Product.at(txObject.logs[0].args.product);
    }    

    before("should prepare accounts", () => {
        assert.isAtLeast(accounts.length, 4, "should have at least 4 accounts");
        shopOwner = accounts[0];
        merchant = accounts[1];
        user = accounts[2];
        bob = accounts[3];

        return web3.eth.makeSureAreUnlocked([shopOwner, merchant, user, bob])
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

    describe("Contract Functions", () => {
        beforeEach(() => Order.new(shopContract.address, { from: user }).then(instance => orderContract = instance));

        describe("Add Product Function", () => {
            before(async () => { productContract = await createProduct(); });

            it('should not allow a empty address', () => 
                web3.eth.expectedExceptionPromise(() => 
                    orderContract.addProduct(null, productStock, { from: user }), gasToUse)
            );

            it('should not allow zero quantity', () =>
                web3.eth.expectedExceptionPromise(() => 
                    orderContract.addProduct(productContract.address, 0, { from: user }), gasToUse)
            );

            it('should not allow quantity greater than product stock', () => 
                web3.eth.expectedExceptionPromise(() => 
                    orderContract.addProduct(productContract.address, 2, { from: user }), gasToUse)
            );

            it('should add a product', async () => {
                let txObject = await orderContract.addProduct(productContract.address, productQuantity, { from: user });

                let productIndexVal = await orderContract.productIndex(0);
                let productCount = await orderContract.getProductCount();
                let productStruct = await orderContract.productsStruct(productContract.address);

                assertLogAddProduct(txObject, user, productContract.address, productQuantity);

                assert.strictEqual(productIndexVal, productContract.address, "product address index did not match expected value");
                assert.deepEqual(productCount, oneBigNumber, "product count did not match expected value");

                assertProductStruct(productStruct, productContract.address, zeroBigNumber, productName, productSku, productCategory, productPrice, productQuantity, productImage);
            });

            it('should add multiple products', async () => {
                let expectedProductCount = new web3.BigNumber(3);

                productContracts = await createProducts(shopContract, merchant, expectedProductCount.toNumber());

                for (let index = 0; index < expectedProductCount.toNumber(); index++) {
                    productContract = productContracts[index];

                    let contractProductName = await productContract.name();
                    let contractProductSku = await productContract.sku();
                    let contractProductCategory = await productContract.category();
                    let contractProductPrice = await productContract.price();
                    let contractProductImage = await productContract.image();

                    let txObject = await orderContract.addProduct(productContract.address, oneBigNumber, { from: user });

                    let productIndexVal = await orderContract.productIndex(index);
                    let productStruct = await orderContract.productsStruct(productContract.address);

                    assertLogAddProduct(txObject, user, productContract.address, productQuantity);
                    
                    assert.strictEqual(productIndexVal, productContract.address, "product address index did not match expected value");

                    assertProductStruct(productStruct, productContract.address, new web3.BigNumber(index), contractProductName, contractProductSku, contractProductCategory, contractProductPrice, oneBigNumber, contractProductImage);
                }

                let productCount = await orderContract.getProductCount();

                assert.deepEqual(productCount, expectedProductCount, "product count did not match expected value");
            });

            it('should increase an existing product quantity', async () => {
                productContract = await createProduct(10);
                
                await orderContract.addProduct(productContract.address, oneBigNumber, { from: user });
                let txObject = await orderContract.addProduct(productContract.address, 5, { from: user });

                let productStruct = await orderContract.productsStruct(productContract.address);

                assert.deepEqual(productStruct[6], new web3.BigNumber(6), "quantity did not increase");
            });
        });

        describe("Remove Product Function", () => {
            before(async () => { productContract = await createProduct(); });

            it('should not allow a empty address', () => 
                web3.eth.expectedExceptionPromise(() => 
                    orderContract.removeProduct(null, productStock, { from: user }), gasToUse)
            );

            it('should remove a product', async () => {
                await orderContract.addProduct(productContract.address, productQuantity, { from: user });

                let txObject = await orderContract.removeProduct(productContract.address, zeroBigNumber, { from: user });

                let productCount = await orderContract.getProductCount();

                assertLogRemoveProduct(txObject, user, productContract.address, zeroBigNumber);

                assert.deepEqual(productCount, zeroBigNumber, "product count did not match expected value");                
            });

            it('should decrease an existing product quantity', async () => {
                productContract = await createProduct(10);
                
                await orderContract.addProduct(productContract.address, 5, { from: user });
                let txObject = await orderContract.removeProduct(productContract.address, oneBigNumber, { from: user });

                let productStruct = await orderContract.productsStruct(productContract.address);

                assert.deepEqual(productStruct[6], new web3.BigNumber(4), "quantity did not decrease");
            });

            it('should remove multiple products and leave the remaining ones', async () => {
                let addProductCount = new web3.BigNumber(5);

                productContracts = await createProducts(shopContract, merchant, addProductCount.toNumber());

                let index = 0;
                let totalProductCount = addProductCount;

                // Add items
                for (let index = 0; index < addProductCount.toNumber(); index++) {
                    productContract = productContracts[index];

                    await orderContract.addProduct(productContract.address, oneBigNumber, { from: user });
                }

                // Remove 2 products
                for (; index < 2; index++) {
                    productContract = productContracts[index];

                    let txObject = await orderContract.removeProduct(productContract.address, zeroBigNumber, { from: user });

                    totalProductCount = totalProductCount.minus(1);

                    let productCount = await orderContract.getProductCount();

                    assertLogRemoveProduct(txObject, user, productContract.address, zeroBigNumber);

                    assert.deepEqual(productCount, totalProductCount, "product count did not match expected value");
                }

                // check the remaining items
                for (; index < addProductCount.toNumber(); index++) {
                    productContract = productContracts[index];

                    let contractProductName = await productContract.name();
                    let contractProductSku = await productContract.sku();
                    let contractProductCategory = await productContract.category();
                    let contractProductPrice = await productContract.price();
                    let contractProductImage = await productContract.image();

                    let productStruct = await orderContract.productsStruct(productContract.address);
                    let productIndex = productStruct[1];

                    let productIndexVal = await orderContract.productIndex(productIndex);
                    
                    assert.strictEqual(productIndexVal, productContract.address, "product address index did not match expected value");

                    assertProductStruct(productStruct, productContract.address, productIndex, contractProductName, contractProductSku, contractProductCategory, contractProductPrice, oneBigNumber, contractProductImage);
                }

                let productCount = await orderContract.getProductCount();

                assert.deepEqual(productCount, addProductCount.minus(2), "product count did not match expected value");
            });

            
        });

    });
});

async function createProducts(shopContract, merchant, count) {
    let productCount = count > 0 ? count : Math.floor(Math.random() * 9) + 1;

    let productsContracts = [];

    for(let i = 0; i < productCount; i++) {
        // some random product data
        let productName = Math.random().toString(36).slice(2);;
        let productSku = Math.random().toString(36).slice(2);;
        let productCategory = Math.random().toString(36).slice(2);;
        let productPrice = new web3.BigNumber((Math.floor(Math.random() * 100000) + 1) * 2);
        let productStock = new web3.BigNumber((Math.floor(Math.random() * 30) + 1));
        let productImage = "https://" + Math.random().toString(36).slice(2);

        let txObject = await shopContract.addProduct(productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant })

        productsContracts.push(Product.at(txObject.logs[0].args.product));
    }

    return productsContracts;
}

function assertNotFail(error)  {
    assert.notEqual(error.message, 'assert.fail()', 'should have thrown');
}

function assertLogAddProduct(txObject, who, product, quantity) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogAddProduct", "should have received LogAddProduct event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.product,
        product,
        "should be product");
    assert.deepEqual(
        txObject.logs[0].args.quantity,
        quantity,
        "should be quantity");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.topicContainsAddress(txObject.receipt.logs[0].topics[2], product);
}

function assertLogRemoveProduct(txObject, who, product, quantity) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogRemoveProduct", "should have received LogRemoveProduct event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.product,
        product,
        "should be product");
    assert.deepEqual(
        txObject.logs[0].args.quantity,
        quantity,
        "should be quantity");

    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.topicContainsAddress(txObject.receipt.logs[0].topics[2], product);
}

function assertProductStruct(struct, product, index, name, sku, category, price, quantity, image) {
    assert.strictEqual(
        struct[0],
        product,
        "should be product");
    assert.deepEqual(
        struct[1],
        index,
        "should be index");
    assert.strictEqual(
        struct[2],
        web3.toHexPacked(name, 66),
        "should be name");
    assert.strictEqual(
        struct[3],
        web3.toHexPacked(sku, 66),
        "should be sku");
    assert.strictEqual(
        struct[4],
        web3.toHexPacked(category, 66),
        "should be category");
    assert.deepEqual(
        struct[5],
        price,
        "should be price");
    assert.deepEqual(
        struct[6],
        quantity,
        "should be quantity");
    assert.strictEqual(
        struct[7],
        web3.toHexPacked(image, 66),
        "should be image");
}
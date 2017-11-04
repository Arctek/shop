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

    let owner, merchant, bob;

    // have to set this here, otherwise loops outside of it() wont work
    const addressList = { "owner": accounts[0], "merchant": accounts[1] };

    before("should prepare accounts", function() {
        assert.isAtLeast(accounts.length, 3, "should have at least 3 accounts");
        owner = accounts[0];
        merchant = accounts[1];
        bob = accounts[2];

        return web3.eth.makeSureAreUnlocked([merchant, bob])
            .then(() => web3.eth.makeSureHasAtLeast(owner, [merchant, bob], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
            .then(() => web3.eth.makeSureHasAtLeast(merchant, [owner, bob], web3.toWei(2)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject))
            .then(() => web3.eth.makeSureHasAtLeast(bob, [owner, merchant], web3.toWei(1)))
            .then(txObject => web3.eth.getTransactionReceiptMined(txObject));
    });

    describe("Constructor", () => {
        it('should not allow blank merchant address', () =>
            Product.new(null, productName, productSku, productCategory, productPrice, productStock, productImage, { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank name', () =>
            Product.new(merchant, "", productSku, productCategory, productPrice, productStock, productImage, { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank sku', () =>
            Product.new(merchant, productName, "", productCategory, productPrice, productStock, productImage, { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should not allow blank category', () =>
            Product.new(merchant, productName, productSku, "", productPrice, productStock, productImage, { from: owner })
            .then(() => { assert.fail('should have thrown before') }).catch(assertNotFail)
        );

        it('should instantiate a product instance', async () => {
            let contract = await Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: owner });
            
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
        beforeEach(() => Product.new(merchant, productName, productSku, productCategory, productPrice, productStock, productImage, { from: owner }).then(instance => contract = instance));

        describe("Update Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.update(updateProductName, updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage, { from: bob }),
                gasToUse);
            });

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

            for (const who in addressList) {
                it('should update a product for ' + who, async() => {
                    let address = addressList[who];
                
                    let txObject = await contract.update(updateProductName, updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage, { from: address });

                    assertLogUpdate(txObject, address, updateProductName, updateProductSku, updateProductCategory, updateProductPrice, updateProductStock, updateProductImage);
                    
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
            }
        });


        describe("Set Merchant Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setMerchant(bob, { from: bob }),
                gasToUse);
            });

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

            for (const who in addressList) {
                it('should set the merchant for ' + who, async () => {
                    let txObject = await contract.setMerchant(bob, { from: addressList[who] });

                    assertLogSetMerchant(txObject, addressList[who], bob);
                    
                    let contractMerchant = await contract.merchant();

                    assert.strictEqual(contractMerchant, bob, "merchant does not match expected value");
                });
            }
        });

        describe("Set Name Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setName(updateProductName, { from: bob }),
                gasToUse);
            });

            it('should not allow a blank name', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setName("", { from: merchant }),
                gasToUse);
            });

            it('should not allow the same name', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setName(productName, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the name for ' + who, async () => {
                    let txObject = await contract.setName(updateProductName, { from: addressList[who] });

                    assertLogSetName(txObject, addressList[who], updateProductName);
                    
                    let contractProductName = await contract.name();

                    assert.strictEqual(contractProductName, web3.toHexPacked(updateProductName, 66), "name does not match expected value");
                });
            }
        });

        describe("Set Sku Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setSku(updateProductSku, { from: bob }),
                gasToUse);
            });

            it('should not allow a blank sku', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setSku("", { from: merchant }),
                gasToUse);
            });

            it('should not allow the same sku', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setSku(productSku, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the sku for ' + who, async () => {
                    let txObject = await contract.setSku(updateProductSku, { from: addressList[who] });

                    assertLogSetSku(txObject, addressList[who], updateProductSku);
                    
                    let contractProductSku = await contract.sku();

                    assert.strictEqual(contractProductSku, web3.toHexPacked(updateProductSku, 66), "sku does not match expected value");
                });
            }
        });

        describe("Set Category Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setCategory(productCategory, { from: bob }),
                gasToUse);
            });

            it('should not allow a blank category', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setCategory("", { from: merchant }),
                gasToUse);
            });

            it('should not allow the same category', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setCategory(productCategory, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the category for ' + who, async () => {
                    let txObject = await contract.setCategory(updateProductCategory, { from: addressList[who] });

                    assertLogSetCategory(txObject, addressList[who], updateProductCategory);
                    
                    let contractProductCategory = await contract.category();

                    assert.strictEqual(contractProductCategory, web3.toHexPacked(updateProductCategory, 66), "category does not match expected value");
                });
            }
        });

        describe("Set Price Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setPrice(updateProductPrice, { from: bob }),
                gasToUse);
            });

            it('should not allow the same price', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setPrice(productPrice, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the price for ' + who, async () => {
                    let txObject = await contract.setPrice(updateProductPrice, { from: addressList[who] });

                    assertLogSetPrice(txObject, addressList[who], updateProductPrice);
                    
                    let contractProductPrice = await contract.price();

                    assert.deepEqual(contractProductPrice, updateProductPrice, "price does not match expected value");
                });
            }
        });

        describe("Set Stock Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setStock(updateProductStock, { from: bob }),
                gasToUse);
            });

            it('should not allow the same stock', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setStock(productStock, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the stock for ' + who, async () => {
                    let txObject = await contract.setStock(updateProductStock, { from: addressList[who] });

                    assertLogSetStock(txObject, addressList[who], updateProductStock);
                    
                    let contractProductStock = await contract.stock();

                    assert.deepEqual(contractProductStock, updateProductStock, "stock does not match expected value");
                });
            }
        });

        describe("Set Image Function", () => {
            it('should not allow non-owner or non-merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setImage(updateProductImage, { from: bob }),
                gasToUse);
            });

            it('should not allow the same image', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.setImage(productImage, { from: merchant }),
                gasToUse);
            });

            for (const who in addressList) {
                it('should set the image', async () => {
                    let txObject = await contract.setImage(updateProductImage, { from: addressList[who] });

                    assertLogSetImage(txObject, addressList[who], updateProductImage);
                    
                    let contractProductImage = await contract.image();

                    assert.strictEqual(contractProductImage, web3.toHexPacked(updateProductImage, 66), "image does not match expected value");
                });
            }
        });

        describe("Destroy Function", () => {
            it('should not allow non-owner', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.destroy({ from: bob }),
                gasToUse);
            });

            it('should not allow merchant', () => {
                return web3.eth.expectedExceptionPromise(() => 
                    contract.destroy({ from: merchant }),
                gasToUse);
            });

            it('should self destruct', async () => {
                let txObject = await contract.destroy({ from: owner });

                assertLogDestroy(txObject, owner);
                
                let contractMerchant = await contract.owner();

                assert.strictEqual(contractMerchant, "0x", "owner should be blank");
            });
        });
    });
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

function assertLogSetSku(txObject, who, sku) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetSku", "should have received LogSetSku event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.sku,
        web3.toHexPacked(sku, 66),
        "should be merchant");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), sku, "should be the sku");
}

function assertLogSetCategory(txObject, who, category) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetCategory", "should have received LogSetCategory event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.category,
        web3.toHexPacked(category, 66),
        "should be merchant");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), category, "should be the category");
}

function assertLogSetPrice(txObject, who, price) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetPrice", "should have received LogSetPrice event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.deepEqual(
        txObject.logs[0].args.price,
        price,
        "should be price");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.deepEqual(web3.toBigNumber(txObject.receipt.logs[0].topics[2]), price, "should be the price");
}

function assertLogSetStock(txObject, who, stock) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetStock", "should have received LogSetStock event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.deepEqual(
        txObject.logs[0].args.stock,
        stock,
        "should be stock");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.deepEqual(web3.toBigNumber(txObject.receipt.logs[0].topics[2]), stock, "should be the stock");
}

function assertLogSetImage(txObject, who, image) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogSetImage", "should have received LogSetImage event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");
    assert.strictEqual(
        txObject.logs[0].args.image,
        web3.toHexPacked(image, 66),
        "should be merchant");
    
    assert.strictEqual(txObject.receipt.logs[0].topics.length, 3, "should have 3 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
    assert.include(web3.toAscii(txObject.receipt.logs[0].topics[2]), image, "should be the image");
}

function assertLogDestroy(txObject, who) {
    assert.equal(txObject.logs.length, 1, "should have received 1 event");
    assert.strictEqual(txObject.logs[0].event, "LogDestroy", "should have received LogDestroy event");
                
    assert.strictEqual(
        txObject.logs[0].args.who,
        who,
        "should be who");

    assert.strictEqual(txObject.receipt.logs[0].topics.length, 2, "should have 2 topics");

    assert.topicContainsAddress(txObject.receipt.logs[0].topics[1], who);
}

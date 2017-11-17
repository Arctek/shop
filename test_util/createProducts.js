"use strict";

module.exports = async function createProducts(Product, shopContract, merchant, count) {
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

        let txObject = await shopContract.addProduct(productName, productSku, productCategory, productPrice, productStock, productImage, { from: merchant });

        productsContracts.push(Product.at(txObject.logs[0].args.product));
    }

    return productsContracts;
}
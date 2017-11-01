pragma solidity 0.4.15;

import "./Killable.sol";
import "./Shop.sol";

contract Order is Killable {
    struct ProductStruct {
        Product product;
        uint index;

        bytes32 name;
        bytes32 sku;
        bytes32 category;
        uint price;
        uint quantity;
        bytes32 image;
    }

    mapping (address => ProductStruct) public productsStruct;
    address[] public productIndex; // max 10 unique products per order

    address public shop;

    uint total;

    function getProductCount()
        public
        constant
        returns(uint productCount)
    {
        return productIndex.length;
    }

    function addProduct(address _product, uint _quantity)
        isOwner
        public
        returns(bool success)
    {
        require(_product != address(0));
        require(_quantity > 0);

        Product untrustedProduct = Product(_product);

        uint productStock = untrustedProduct.stock();
        uint productPrice = untrustedProduct.price();

        require(productStock <= _quantity);

        uint productTotal = productPrice * _quantity;

        require(productTotal + total > total);

        total += productTotal;

        if (productsStruct[untrustedProduct].product != address(0)) {
            require(productsStruct[untrustedProduct].quantity + _quantity < productStock);

            productsStruct[untrustedProduct].quantity += _quantity;
        }
        else {
            require(productIndex.length + 1 < 10);

            productIndex.push(untrustedProduct);
            productsStruct[untrustedProduct].product = untrustedProduct;
            productsStruct[untrustedProduct].index = productIndex.length;
            productsStruct[untrustedProduct].name = untrustedProduct.name();
            productsStruct[untrustedProduct].sku = untrustedProduct.sku();
            productsStruct[untrustedProduct].category = untrustedProduct.category();
            productsStruct[untrustedProduct].price = productPrice;
            productsStruct[untrustedProduct].quantity = _quantity;
            productsStruct[untrustedProduct].image = untrustedProduct.image();
        }

        //LogAddProduct(msg.sender, _product, _quantity);

        return true;
    }

    function removeProduct(address _product, uint _quantity)
        isOwner
        public
        returns(bool success)
    {
        

        return true;
    }

    function payment()
        public
        returns(bool success)
    {
        require(msg.sender == shop);

        uint balance = this.balance;

        msg.sender.transfer(balance);

        //LogPayment(msg.sender, balance);

        return true;
    }
}
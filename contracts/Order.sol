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

    enum OrderStatus { Created, Paid, Cancelled }

    mapping (address => ProductStruct) public productsStruct;
    address[] public productIndex; // max 10 unique products per order

    address public shop;

    OrderStatus public status;
    uint public total;
    //uint public balance;

    event LogAddProduct(address indexed who, address indexed product, uint quantity);
    event LogRemoveProduct(address indexed who, address indexed product, uint quantity);
    event LogSetStatus(address indexed who, OrderStatus indexed status);

    modifier isCreated() {
        require(status == OrderStatus.Created);
        _;
    }

    function Order(Shop _shop) {
        require(_shop.owner() != address(0));
        shop = _shop;
    }

    function getProductCount()
        public
        constant
        returns(uint productCount)
    {
        return productIndex.length;
    }

    function getProductAtIndex(uint8 _index) 
        public
        constant
        returns(address product)
    {
        return productsStruct[productIndex[_index]].product;
    }

    function getProductQuantityAtIndex(uint8 _index) 
        public
        constant
        returns(uint quantity)
    {
        return productsStruct[productIndex[_index]].quantity;
    }

    function addProduct(address _product, uint _quantity)
        isOwner
        isCreated
        public
        returns(bool success)
    {
        require(_product != address(0));
        require(_quantity > 0);

        Product untrustedProduct = Product(_product);

        uint productStock = untrustedProduct.stock();
        uint productPrice = untrustedProduct.price();

        require(productStock >= _quantity);

        uint productTotal = productPrice * _quantity;

        require(productTotal + total > total);

        total += productTotal;

        if (productsStruct[untrustedProduct].product != address(0)) {
            require(productsStruct[untrustedProduct].quantity + _quantity < productStock);

            productsStruct[untrustedProduct].quantity += _quantity;
        } else {
            require(productIndex.length + 1 < 10);

            productIndex.push(untrustedProduct);
            productsStruct[untrustedProduct].product = untrustedProduct;
            productsStruct[untrustedProduct].index = productIndex.length - 1;
            productsStruct[untrustedProduct].name = untrustedProduct.name();
            productsStruct[untrustedProduct].sku = untrustedProduct.sku();
            productsStruct[untrustedProduct].category = untrustedProduct.category();
            productsStruct[untrustedProduct].price = productPrice;
            productsStruct[untrustedProduct].quantity = _quantity;
            productsStruct[untrustedProduct].image = untrustedProduct.image();
        }

        LogAddProduct(msg.sender, _product, _quantity);

        return true;
    }

    function removeProduct(address _product, uint _quantity)
        isOwner
        isCreated
        public
        returns(bool success)
    {
        require(productsStruct[_product].product != address(0));

        if (_quantity >= productsStruct[_product].quantity || _quantity == 0) {
            uint rowToDelete = productsStruct[_product].index;
            address keyToMove = productIndex[productIndex.length-1]; 

            productIndex[rowToDelete] = keyToMove; 
            productsStruct[keyToMove].index = rowToDelete;
            productIndex.length = productIndex.length - 1;
        } else {
            require(productsStruct[_product].quantity - _quantity > 0);
            productsStruct[_product].quantity -= _quantity;
        }

        LogRemoveProduct(msg.sender, _product, _quantity);

        return true;
    }

    function setStatus(OrderStatus _status) 
        public
        returns(bool success)
    {
        require(msg.sender == shop);

        status = _status;

        LogSetStatus(msg.sender, _status);

        return true;
    }

    function kill() public isCreated returns(bool success) {
        return super.kill();
    }

    /*function pay()
        public
        isOwner
        isNotLocked
        payable
        returns(bool success)
    {
        require(msg.value > 0);
        require(msg.value == total);

        balance = msg.value;
        locked = true;

        return true;
    }

    function cancel()
        public
        isOwner
        returns(bool success)
    {
        require(paid != true);
        // cancel order and refund
        selfdestruct(msg.sender);

        return true;
    }

    function processPayment()
        public
        returns(bool success)
    {
        require(msg.sender == shop);
        require(balance > 0);

        msg.sender.transfer(balance);

        balance = 0;
        paid = true;
        //LogPayment(msg.sender, balance);

        return true;
    }*/
}
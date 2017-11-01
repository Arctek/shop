pragma solidity 0.4.15;

import "./Killable.sol";
import "./Product.sol";
import "./Order.sol";

contract Shop is Killable {
    struct ProductStruct {
        Product product;
        uint index;
    }

    struct OrderStruct {
        Order order;
        uint index;
    }

    mapping (address => ProductStruct) public productsStruct;
    address[] public productIndex;
    mapping (address => OrderStruct) public ordersStruct;
    address[] public orderIndex;

    address public merchant;

    event LogAddProduct(address indexed who, bytes32 indexed name, bytes32 indexed sku, bytes32 category, uint price, uint stock, bytes32 image);
    event LogRemoveProduct(address indexed who, address indexed product,  bytes32 indexed name, bytes32 sku, bytes32 category);

    modifier isOwnerOrMerchant() {
        require(msg.sender == owner || msg.sender == merchant);
        _;
    }

    modifier onlyIfProduct(address productAddress) {
        require(productsStruct[productAddress].product != address(0));
        _;
    }

    function Shop(address _merchant) public {
        require(merchant != address(0));
        merchant = _merchant;
    }

    function getProductCount()
        public
        constant
        returns(uint productCount)
    {
        return productIndex.length;
    }

    function addProduct(bytes32 _name, bytes32 _sku, bytes32 _category, uint _price, uint _stock, bytes32 _image)
        isOwnerOrMerchant
        public
        returns(address productContract)
    {
        require(_name != "");
        require(_sku != "");
        require(_category != "");

        Product trustedProduct = new Product(merchant, _name, _sku, _category, _price, _stock, _image);

        productIndex.push(trustedProduct);
        productsStruct[trustedProduct].product = trustedProduct;
        productsStruct[trustedProduct].index = productIndex.length;

        LogAddProduct(msg.sender, _name, _sku, _category, _price, _stock, _image);

        return trustedProduct;
    }

    function removeProduct(address _product)
        isOwnerOrMerchant
        onlyIfProduct(_product)
        public
        returns(bool success)
    {
        Product trustedProduct = Product(_product);

        bytes32 productName = trustedProduct.name;
        bytes32 productSku = trustedProduct.sku;
        bytes32 productCategory = trustedProduct.category;

        require(trustedProduct.destroy());

        uint rowToDelete = productsStruct[_product].index;
        address keyToMove = productIndex[productIndex.length-1]; 

        productIndex[rowToDelete] = keyToMove; 
        productsStruct[keyToMove].index = rowToDelete;
        productIndex.length = productIndex.length - 1;

        LogRemoveProduct(msg.sender, _product, productName, productSku, productCategory);

        return true;
        // Hmm removing this here will be a problem if it exists on any orders; but we should write product details when an order is submitted
    }

    function submitOrder(address _order)
        public
        returns(bool success)
    {
        // validate order
        Order untrustedOrder = Product(_order);

        // Only 10 unique items - no unnounded looping
        require(untrustedOrder.productIndex.length < 10);
    }
}
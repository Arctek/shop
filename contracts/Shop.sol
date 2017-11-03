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
        bool paid;
    }

    mapping (address => ProductStruct) public productsStruct;
    address[] public productIndex;
    mapping (address => OrderStruct) public ordersStruct;
    address[] public orderIndex;

    address public merchant;
    uint public balance;

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

        bytes32 productName = trustedProduct.name();
        bytes32 productSku = trustedProduct.sku();
        bytes32 productCategory = trustedProduct.category();

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

    function processPayment(address _order)
        public
        payable
        returns(bool success)
    {
        require(ordersStruct[_order].order != address(0));
        require(balance + msg.value > balance);

        return true;
    }

    function submitOrder(address _order)
        public
        payable
        returns(bool success)
    {
        // validate order
        Order untrustedOrder = Order(_order);

        // Only 10 unique items - no unnounded looping
        require(untrustedOrder.killed() != true);
        require(untrustedOrder.paused() != true);
        require(untrustedOrder.status() == Order.OrderStatus.Created);
        require(untrustedOrder.total() > 0);
        require(msg.value == untrustedOrder.total());
        require(msg.value + balance > balance);

        balance += msg.value;

        uint productCount = untrustedOrder.getProductCount();

        require(productCount > 0);
        require(productCount < 10);

        uint orderTotal = 0;

        //Product[] memory orderProducts;

        // accounting, in case we have been duped
        for (uint8 i = 0; i < productCount; i++) {
            Product untrustedProduct = Product(untrustedOrder.getProductAtIndex(i));

            uint productQuantity = untrustedOrder.getProductQuantityAtIndex(i);
            uint productStock = untrustedProduct.stock();
            uint remainingStock = productStock - productQuantity;

            require(productQuantity > 0);
            require(productQuantity <= untrustedProduct.stock());
            require(remainingStock < productStock);

            uint productPrice = untrustedProduct.price();
            uint productTotal = productPrice * productQuantity;

            require(productTotal > 0);
            require(productTotal > productPrice);
            require(orderTotal + productTotal > orderTotal);

            require(untrustedProduct.setStock(remainingStock));

            orderTotal += productPrice;            
        }

        require(orderTotal == msg.value);
        require(untrustedOrder.setStatus(Order.OrderStatus.Paid));

        orderIndex.push(untrustedOrder);
        ordersStruct[untrustedOrder].order = untrustedOrder;
        ordersStruct[untrustedOrder].index = orderIndex.length;

        return true;
    }
}
pragma solidity 0.4.15;

import "./Killable.sol";
import "./Product.sol";

contract Shop is Killable {
    mapping (address => Product) public products;
    address[] public productIndex;

    address public merchant;

    event LogAddProduct(address indexed who, string indexed name, bytes32 indexed sku, string indexed category, uint price, uint stock, string image);

    modifier isOwnerOrMerchant() {
        require(msg.sender == owner || msg.sender == merchant);
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

    function addProduct(string _name, bytes32 _sku, string _category, uint _price, uint _stock, string _image)
        isOwnerOrMerchant
        public
        returns(bool success)
    {
        require(_name != "");
        require(_sku != "");
        require(_category != "");

        Product trustedProduct = new Product(_name, _sku, _category, _price, _stock, _image);

        productIndex.push(trustedProduct);
        shops[trustedProduct] = trustedProduct;

        LogAddProduct(msg.sender, _name, _sku, _category, _price, _stock, _image);

        return true;
    }
}
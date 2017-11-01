pragma solidity 0.4.15;

import "./Killable.sol";

contract Product is Ownable {
    address public merchant;

    string public name;
    bytes32 public sku;
    string public category;
    uint public price;
    uint public stock;
    string public image;

    event LogUpdate(address indexed who, string indexed name, bytes32 indexed sku, string indexed category, uint price, uint stock, string image);
    event LogSetName(address indexed who, string indexed name, bytes32 indexed sku);
    event LogSetSku(address indexed who, string indexed name, bytes32 indexed sku);
    event LogSetCategory(address indexed who, string indexed name, bytes32 indexed sku, string indexed category);
    event LogSetPrice(address indexed who, string indexed name, bytes32 indexed sku, uint price);
    event LogSetStock(address indexed who, string indexed name, bytes32 indexed sku, uint stock);
    event LogSetImage(address indexed who, string indexed name, bytes32 indexed sku, string image);
    event LogDestroy(address indexed who);

    modifier isOwnerOrMerchant() {
        require(msg.sender == owner || msg.sender == merchant);
        _;
    }

    function Product(address _merchant, string _name, bytes32 _sku, string _category, uint _price, uint _stock, string _image) public {
        require(_name != "");
        require(_sku != "");
        require(_category != "");

        merchant = _merchant;

        name = _name;
        sku = _sku;
        category = _category;
        price = _price;
        stock = _stock;
        image = _image;
    }

    function update(string _name, bytes32 _sku, string _category, uint _price, uint _stock, string _image) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        require(_name != "");
        require(_sku != "");
        require(_category != "");

        if (name != _name) {
            name = _name;
        }
        if (sku != _sku) {
            sku = _sku;
        }
        if (category != _category) {
            category = _category;
        }
        if (price != _price) {
            price = _price;
        }
        if (stock != _stock) {
            stock = _stock;
        }
        if (image != _image) {
            image = _image;
        }

        LogUpdate(msg.sender, _name, _sku, _category, _price, _stock, _image);

        return true;
    }

    function setName(string _name) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        require(_name != "");

        name = _name;

        LogSetName(msg.sender, _name, sku);

        return true;
    }

    function setSku(bytes32 _sku) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        require(_sku != "");

        sku = _sku;

        LogSetSku(msg.sender, name, _sku);

        return true;
    }

    function setCategory(string _category) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        require(_category != "");

        category = _category;

        LogSetCategory(msg.sender, name, sku, _category);

        return true;
    }

    function setPrice(uint _price) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        price = _price;

        LogSetPrice(msg.sender, name, sku, _price);

        return true;
    }

    function setStock(uint _stock) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        stock = _stock;

        LogSetStock(msg.sender, name, sku, _stock);

        return true;
    }

    function setImage(string _image) 
        public
        isOwnerOrMerchant
        returns(bool success) 
    {
        image = _image;

        LogSetImage(msg.sender, name, sku, _image);

        return true;
    }

    function destroy() 
        public
        isOwner
        returns(bool success)
    {
        selfdestruct(msg.sender);
        LogDestroy(msg.sender);
        return true;
    }
}
pragma solidity 0.4.15;

import "./Killable.sol";

contract Product is Ownable {
    address public merchant;

    bytes32 public name;
    bytes32 public sku;
    bytes32 public category;
    uint public price;
    uint public stock;
    bytes32 public image;

    event LogUpdate(address indexed who, bytes32 indexed name, bytes32 indexed sku, bytes32 category, uint price, uint stock, bytes32 image);
    event LogSetName(address indexed who, bytes32 indexed name, bytes32 indexed sku);
    event LogSetSku(address indexed who, bytes32 indexed name, bytes32 indexed sku);
    event LogSetCategory(address indexed who, bytes32 indexed name, bytes32 indexed sku, bytes32 category);
    event LogSetPrice(address indexed who, bytes32 indexed name, bytes32 indexed sku, uint price);
    event LogSetStock(address indexed who, bytes32 indexed name, bytes32 indexed sku, uint stock);
    event LogSetImage(address indexed who, bytes32 indexed name, bytes32 indexed sku, bytes32 image);
    event LogDestroy(address indexed who);

    modifier isOwnerOrMerchant() {
        require(msg.sender == owner || msg.sender == merchant);
        _;
    }

    function Product(address _merchant, bytes32 _name, bytes32 _sku, bytes32 _category, uint _price, uint _stock, bytes32 _image) public {
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

    function update(bytes32 _name, bytes32 _sku, bytes32 _category, uint _price, uint _stock, bytes32 _image) 
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

    function setName(bytes32 _name) 
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

    function setCategory(bytes32 _category) 
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

    function setImage(bytes32 _image) 
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
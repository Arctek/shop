pragma solidity 0.4.15;

import "./Shop.sol";

contract ShopFactory is Ownable {
    struct ShopStruct {
        Shop shop;
        uint index;
    }

    mapping (address => ShopStruct) public shopsStruct;
    address[] public shopIndex;

    modifier onlyIfShop(address shopAddress) {
        require(shopsStruct[shopAddress].shop != address(0));
        _;
    }

    event LogDeployShop(address merchant);
    
    function getShopCount()
        public
        constant
        returns(uint shopCount)
    {
        return shopIndex.length;
    }
    
    function deployShop(/* shop name etc */)
        public
        returns(address shopContract)
    {
        Shop trustedShop = new Shop(msg.sender);
        shopIndex.push(trustedShop);
        shopsStruct[trustedShop].shop = trustedShop;
        shopsStruct[trustedShop].index = shopIndex.length;

        LogDeployShop(msg.sender);

        return trustedShop;
    }
}
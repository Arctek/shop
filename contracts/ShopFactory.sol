pragma solidity 0.4.15;

import "./Shop.sol";

contract ShopFactory is Ownable {
    mapping (address => Shop) public shops;
    address[] public shopIndex;

    modifier onlyIfShop(address shop) {
        require(shops[campaign]);
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
        returns(address campaignContract)
    {
        Shop trustedShop = new Shop(msg.sender);
        shopIndex.push(trustedCampaign);
        shops[trustedCampaign] = trustedCampaign;

        LogDeployShop(msg.sender);

        return trustedCampaign;
    }
}
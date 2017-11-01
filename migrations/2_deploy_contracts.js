var ShopFactory = artifacts.require("./ShopFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(ShopFactory);
};

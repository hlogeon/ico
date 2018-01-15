var SafeMath = artifacts.require('./SafeMath.sol');
var JincorToken = artifacts.require("./JincorToken.sol");
var JincorTokenPreSale = artifacts.require("./JincorTokenPreSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, JincorToken);
  deployer.deploy(JincorToken);
};

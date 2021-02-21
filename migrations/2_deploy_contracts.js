const CasadaToken = artifacts.require("CasadaToken");
const CasadaTokenSale = artifacts.require("CasadaTokenSale");
var tokenPrice = 1000000000000000;

module.exports = async function (deployer) {
  await deployer.deploy(CasadaToken, 1000000);
  await deployer.deploy(CasadaTokenSale, CasadaToken.address,tokenPrice);
  
};

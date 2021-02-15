const CasadaToken = artifacts.require("CasadaToken");

module.exports = function (deployer) {
  deployer.deploy(CasadaToken);
};

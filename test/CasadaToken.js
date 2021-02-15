var CasadaToken = artifacts.require("CasadaToken");
var assert = require('assert');

contract("CasadaToken", function(accounts){
    it("sets the total supply upon deployment", function(){
        return  CasadaToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.strictEqual(totalSupply.toNumber(),1000000,"sets the total supply to 1,000,000");
        });
    });
})
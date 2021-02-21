
const CasadaTokenSale = artifacts.require("CasadaTokenSale");
const CasadaToken = artifacts.require("CasadaToken");
var assert = require("assert");


contract("CasadaTokenSale", function(accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000;
    var tokensAvailable = 750000;
    var numberOfTokens;

    it("initialies the contract with the correct values", function(){
        return CasadaTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notStrictEqual(address, 0x0, "has contract address")
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notStrictEqual(address, 0x0, "has token contract address")
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.strictEqual(price.toNumber(), tokenPrice, "token price is correct")
        })
    })

    it("facilitates token buying", function(){
        return CasadaToken.deployed().then(function(instance){
          tokenInstance = instance;
          
          return CasadaTokenSale.deployed();
        }).then(function(instance){
          tokenSaleInstance = instance;
          return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin})
        }).then(function(receipt){ 
          numberOfTokens = 10;
          return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value:  numberOfTokens * tokenPrice});
        }).then(function(receipt){
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(receipt.logs[0].event, "Sell", 'should be the "Sell" event');
            assert.strictEqual(receipt.logs[0].args._buyer, buyer, "logs the account that purchased the tokens from");
            assert.strictEqual(receipt.logs[0].args._amount.toNumber(), numberOfTokens, "logs the number of tokens purchased");
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.strictEqual(amount.toNumber(), numberOfTokens, "increments the number of tokens sold");
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), numberOfTokens);
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), tokensAvailable - numberOfTokens);
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "msg.valu must be  equal number of tokens in wei");
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});        
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf("revert") >= 0, "cannot purchase more tokens than available");
        });
    });
});
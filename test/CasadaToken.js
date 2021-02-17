var assert = require("assert");

var CasadaToken = artifacts.require("./CasadaToken.sol");

contract('CasadaToken', function(accounts) {
  var tokenInstance;

  it('initializes the contract with the correct values', function() {
    return CasadaToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function(name) {
      assert.strictEqual(name, 'Casada', 'has the correct name');
      return tokenInstance.symbol();
    }).then(function(symbol) {
      assert.strictEqual(symbol, 'CAS', 'has the correct symbol');
      return tokenInstance.standard();
    }).then(function(standard) {
      assert.strictEqual(standard, 'Casada v1.0', 'has the correct standard');
    });
  })

  it('allocates the initial supply upon deployment', function() {
    return CasadaToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(function(totalSupply) {
      assert.strictEqual(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
      return tokenInstance.balanceOf(accounts[0]);
    }).then(function(adminBalance) {
      assert.strictEqual(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
    });
  });

  it('transfers token ownership', function() {
    return CasadaToken.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.transfer.call(accounts[1], 250000,{from: accounts[0]});
    }).then(function(success){
      assert.strictEqual(success, true, "it returns true");
      return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
    }).then(function(receipt) {
        assert.strictEqual(receipt.logs.length, 1, "triggers one event");
        assert.strictEqual(receipt.logs[0].event, "Transfer", 'should be the "Transer" event');
        assert.strictEqual(receipt.logs[0].args._from, accounts[0], "logs the account the tokens are trasfered from");
        assert.strictEqual(receipt.logs[0].args._to, accounts[1], "logs the account the tokens are trasfered to");
        assert.strictEqual(receipt.logs[0].args._value.toNumber(), 250000, "logs the transfer amount");
        return tokenInstance.balanceOf(accounts[1]);
    }).then(function(balance){
        assert.strictEqual(balance.toNumber(),250000,"adds the amount to the receiving account");
        return tokenInstance.balanceOf(accounts[0]);
    }).then(function(balance){
        assert.strictEqual(balance.toNumber(),750000,"decucts amount from the sending account");
    });

  })
  
})
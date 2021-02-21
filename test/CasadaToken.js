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
    })
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

  });

  it("approves tokens to delegated transfer", function(){
    return CasadaToken.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.approve.call(accounts[1],100);
    }).then(function(success){
      assert.strictEqual(success,true, "it returns true");
      return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
    }).then(function(receipt){
      assert.strictEqual(receipt.logs.length, 1, "triggers one event");
      assert.strictEqual(receipt.logs[0].event, "Approval", 'should be the "Approval" event');
      assert.strictEqual(receipt.logs[0].args._owner, accounts[0], "logs the account the tokens are trasfered from");
      assert.strictEqual(receipt.logs[0].args._spender, accounts[1], "logs the account the tokens are trasfered to");
      assert.strictEqual(receipt.logs[0].args._value.toNumber(), 100, "logs the transfer amount");
      return tokenInstance.allowance(accounts[0],accounts[1]);
    }).then(function(allowance){
      assert.strictEqual(allowance.toNumber(), 100, "stores the allowance for delegated transfer");

    });
  })

  it("handles delegated token transfer", function(){
    return CasadaToken.deployed().then(function(instance){
      tokenInstance = instance;
      fromAccount = accounts[2];
      toAccount = accounts[3];
      spendingAccount = accounts[4];

      return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
    }).then(function(receipt){
      return tokenInstance.approve(spendingAccount,10,{from: fromAccount});
    }).then(function(receipt){
      return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf("revert") >= 0, "cannot transfer value larger than balance");
      return tokenInstance.transferFrom(fromAccount,toAccount, 20 , {from: spendingAccount});
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf("revert") >= 0, "cannot transfer value larger than approved amount");
      return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
    }).then(function(success){
      assert.strictEqual(success,true);
      return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
    }).then(function(receipt){
      assert.strictEqual(receipt.logs.length, 1, "triggers one event");
      assert.strictEqual(receipt.logs[0].event, "Transfer", 'should be the "Transer" event');
      assert.strictEqual(receipt.logs[0].args._from, fromAccount, "logs the account the tokens are trasfered from");
      assert.strictEqual(receipt.logs[0].args._to, toAccount, "logs the account the tokens are trasfered to");
      assert.strictEqual(receipt.logs[0].args._value.toNumber(), 10, "logs the transfer amount");

      return tokenInstance.balanceOf(fromAccount);
    }).then(function(balance){
      assert.strictEqual(balance.toNumber(),90, "deducts the amount from the sending account");

      return tokenInstance.allowance(fromAccount,spendingAccount);
    }).then(function(allowance){
      assert.strictEqual(allowance.toNumber(), 0, "decucts the amount from the allowance");
    });
  });
  
})
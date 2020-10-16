var assert = require('assert');
const { toChecksumAddress } = require('web3-utils');


var DappToken = artifacts.require("./DappToken.sol");
contract('DappToken', function(accounts){
    it('initializes the contract with the correct values', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.strictEqual(name, "Dapp Token", "has the correct name");
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.strictEqual(symbol, "Dapp", 'it should be Dapp')
            return tokenInstance.standard();
        }).then(function(standard){
            assert.strictEqual(standard, "Dapp Token v1.0", "has the correvt values");        
        })
    })

    it('allocates the initial supply upon deployment', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
           assert.strictEqual(totalSupply.toNumber(), 1000000, 'sets the totalSupply to 1000000');
           return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.strictEqual(adminBalance.toNumber(),1000000, 'it should be 1000000')
        })
    });
    it('transfers token ownership', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 99999999999999999999999);
        }).then(assert.fail).catch(function(error){
            //console.log(error);
            //assert(error.message.indexOf('revert')>=0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success){
            assert.strictEqual(success, true, "transaction should be sucessful");
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt){
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event");
            assert.strictEqual(receipt.logs[0].args._from, accounts[0], "logs the accounts the token has transfered from");
            assert.strictEqual(receipt.logs[0].args._to, accounts[1], "logs the account the token is transferred to");
            assert.strictEqual(receipt.logs[0].args._value.toNumber(), 250000, "logs the transfer amount");
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), 250000, 'adds the amount to the receiving account' );
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), 750000, 'deducts the amount from the sending account')
        });
    })
    it('approves tokens for delegated transfers', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.strictEqual(success, true, 'approve the transaction');
            return tokenInstance.approve(accounts[1], 100);
        }).then(function(receipt){
           //console.log(receipt.logs[0].args);
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(receipt.logs[0].event, "Approval", "Should be the 'Approval' event");
            assert.strictEqual(receipt.logs[0].args._owner, accounts[0], "logs the account the tokens are authorized by");
            assert.strictEqual(receipt.logs[0].args._spender, accounts[1], "logs the account the tokens are authorized to");
            assert.strictEqual(receipt.logs[0].args._value.toNumber(), 100, "logs the transfer amount");
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.strictEqual(allowance.toNumber(), 100, 'stores the allowance for delegated transfer')
        })
    })

    it('handles delegated token transfers', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount =accounts[4];
            return tokenInstance.transfer(fromAccount,100, {from: accounts[0]});
          //  return tokenInstance.approve.call(accounts[1])
        }).then(function(receipt){
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount})
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount, 52646987899, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
          //  console.log(error);
            assert(error.message.indexOf('revert')>=0, 'cannot transfer value larger than the balance');
            //Try transfering someting than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert')>= 0, "cannot transfer value larger than the approved amount");
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(success){
            assert.strictEqual(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt){
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(receipt.logs[0].event, "Transfer", "Should be the 'Transfer' event");
            assert.strictEqual(receipt.logs[0].args._from, accounts[2], "logs the accounts the token has transfered from");
            assert.strictEqual(receipt.logs[0].args._to, accounts[3], "logs the account the token is transferred to");
            assert.strictEqual(receipt.logs[0].args._value.toNumber(), 10, "logs the transfer amount");
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), 90, "deducts amont from sending account");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), 10, "adds the amont to receiving account");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            assert.strictEqual(allowance.toNumber(), 0, "deducts the allowance for spending account")
        })
    })
})
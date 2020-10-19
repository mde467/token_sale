var DappTokenSale = artifacts.require('./DappTokenSale.sol');
var DappToken = artifacts.require('./DappToken.sol');
var assert = require('assert');
const { toChecksumAddress } = require('web3-utils');

contract('DappTokenSale', function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var tokensAvailble = 750000;
    var admin = accounts[0];
   
    var buyer = accounts[1];
    var numberOfTokens ;
    it('initialzes the contract with the correct values', function(){
        return DappTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notStrictEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notStrictEqual(address, 0x0, 'has a token contract  address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.strictEqual(price.toNumber(), tokenPrice, 'token Price is correct');
        })
    })

    it('facilitates token buying',function(){
        return DappToken.deployed().then(function(instance){
           //Grab token instance first.
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailble, {from:admin});
        }).then(function(receipt){
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value:  numberOfTokens * tokenPrice});
        }).then(function(receipt){
            assert.strictEqual(receipt.logs.length, 1, "triggers one event");
            assert.strictEqual(receipt.logs[0].event, "Sell", "Should be the 'Sell' event");
            assert.strictEqual(receipt.logs[0].args._buyer, buyer, "logs the accounts the token has bought by");
            assert.strictEqual(receipt.logs[0].args._amount.toNumber(), numberOfTokens, "logs the number of tokens purchased");
            return tokenSaleInstance.tokensSold();
        }).then(function(amount){
            assert.strictEqual(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), tokensAvailble-numberOfTokens, "balnce should be correct");
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value:  1});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0 , "value is not correct");
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value:  numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0 , "trying to buy more tokens than available tokens")
        });
    })

    it('ends the token sale', function(){
        return DappToken.deployed().then(function(instance){
            tokenInstance = instance;
            return DappTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert')>=0, "onlu admin can end a token sale");
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.strictEqual(balance.toNumber(), 999990, 'returns all unsold tokens to admin');
            return tokenInstance.tokenPrice();
        }).then(function(tokenPrice){
            assert.strictEqual(tokenPrice.toNumber(), 0, "token price reset");
        })
    })

})
pragma solidity >=0.4.22 <0.8.0;

import "./DappToken.sol";
contract DappTokenSale{
    address admin;
    DappToken public tokenContract ;
    uint256 public tokenPrice ;
    uint256 public tokensSold;
    address payable  secondAddress  ;
    event Sell (address _buyer, uint256 _amount);
    constructor(DappToken _tokenContract, uint256 _tokenPrice) public {
      admin = msg.sender;
        secondAddress  = address(uint160(admin));
      tokenContract = _tokenContract;
      tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z){
        require(y==0 || (z=x*y)/y==x);
    }
    function buyTokens(uint256 _numberOfTokens) public payable{
        //require that the value is equal to the tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this))>=_numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold+=_numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }
    function endSale() public {
        //Require admin access
        require(msg.sender == admin);
        //Transfer remaining dapp Tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //Destroy the contract
      //  selfdestruct(secondAddress);
    }
}
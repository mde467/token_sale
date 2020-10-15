// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract DappToken{
    event Transfer(
        address indexed _form,
        address indexed _to,
        uint256 _value
    );
    //Conhstructor 
    //Set the total number of tokens
    //Read the total number of tokens
    string  public name = "Dapp Token";
    string  public symbol = "Dapp";
    string public standard = "Dapp Token v1.0";
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    constructor(uint256 _initialSupply) public  {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply; 
    }
    function transfer(address _to, uint256 _value ) public returns(bool success){
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender]-=_value;
        balanceOf[_to]+=_value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
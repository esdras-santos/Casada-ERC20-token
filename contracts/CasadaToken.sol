pragma solidity ^0.5.0;

contract CasadaToken {
    string public name = "Casada";
    string public symbol = "CAS";
    uint8 public decimals = 4;

    uint256 public totalSupply;

    event Transfer(
      address indexed _from,
      address indexed _to,
      uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
  
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value/10000);
        balanceOf[msg.sender] -= _value/10000;
        balanceOf[_to] += _value/10000;

        emit Transfer(msg.sender, _to, _value/10000);

        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value/10000;
        emit Approval(msg.sender, _spender, _value/10000);
        return true;        
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){
        require(_value/10000 <= balanceOf[_from]);
        require(_value/10000 <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value/10000;
        balanceOf[_to] += _value/10000;

        allowance[_from][msg.sender] -= _value/10000;

        emit Transfer(_from, _to, _value/10000);

        return true;
    }
}
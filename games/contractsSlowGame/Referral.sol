pragma solidity ^0.4.8;

contract Referral {
   
    //addresses of referrals
    mapping(address => address) public adviserOf;
    mapping(address => address) public operatorOf;
   
    //Profit (BET) of adviser and operator
    mapping(address => uint) public adviserProfit;
    mapping(address => uint) public operatorProfit;
   
    //Count of referrals 
    mapping(address => uint) public adviserCount;
    mapping(address => uint) public operatorCount;
    

    
    function getAdviser(address _player) constant returns(address)
    { 
      return adviserOf[_player];  
    }

   
    function getOperator(address _player) constant returns(address)
    { 
      return operatorOf[_player];  
    }
    
    function upProfit(address _adviser , uint _profitAdviser, address _operator, uint _profitOperator) {
        adviserProfit[_adviser] += _profitAdviser;
        operatorProfit[_operator] += _profitOperator;
    }
    
    function setService(address _operator, address _adviser)
    {
        if(adviserOf[msg.sender] == 0 && operatorOf[msg.sender] == 0 && _operator != 0 )
        {
            operatorCount[_operator]++;
            operatorOf[msg.sender] = _operator;
            if(_adviser != 0)
            {
                adviserCount[_adviser]++;
                adviserOf[msg.sender] = _adviser;
            }
            else
            {
                adviserOf[msg.sender] = _operator;
            }
        } 
        else throw;
    }
    
}
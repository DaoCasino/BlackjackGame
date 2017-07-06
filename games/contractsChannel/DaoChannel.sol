pragma solidity ^0.4.2;
import "./ERC20.sol";
import "./owned.sol";

contract DaoChannel is owned {
	uint   public meta_version = 1;
    string public meta_code    = 'daochannel_v1';
    string public meta_name    = 'DaoChannel';
    string public meta_link    = 'https://github.com/DaoCasino/';
	
    // Stores tokens
    ERC20 token;
	
	struct Channel {
        address player;
		
        uint balance;
        
        bool open;
    }
	
	mapping (address => Channel) public allChannels;
	
	/*
        CONSTRUCTOR
    */

    function DaoChannel(address tokenAddress) {
        token = ERC20(tokenAddress);
    }
	
	function newChannel(uint deposit) {
		allChannels[msg.sender] = Channel({
            player:  msg.sender,
            balance: deposit,
            open:    true
        });
		
		token.transferFrom(msg.sender, this, deposit); 
	}
	
	function closeChannel(address player, uint value, bool add) {
	    if(!allChannels[player].open){
	        throw;
	    }
		uint profit;
		if(add){
			profit = allChannels[player].balance + value;
		} else {
			profit = allChannels[player].balance - value;
		}
		
		allChannels[player].open = false;
		
		token.transfer(player, profit);
	}
	
	function getOpenChannel(address player)
        public
        constant
        returns (bool)
    {
        if(player==0){ player = msg.sender; }
        return allChannels[player].open;
    }
}
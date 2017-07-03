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
        address partner;
		
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
	
	function newChannel(address partner, uint deposit) {
		token.transfer(this, deposit);
		
		allChannels[msg.sender] = Channel({
            player: msg.sender,
            partner: partner,
            balance: deposit,
            open: true
        });
	}
	
	function closeChannel(address player, uint value, bool add) {
	    if(!allChannels[player].open){
	        throw;
	    }
	    if(value > allChannels[player].balance){
	        throw;
	    }
		uint profit;
		if(add){
			profit = allChannels[player].balance + value;
		} else {
			profit = allChannels[player].balance - value;
		}
		token.transfer(player, profit);
		allChannels[player].open = false;
	}
	
	function getOpenChannel(address player)
        public
        constant
        returns (bool)
    {
	    return allChannels[player].open;
	}
}
/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.1
 */

var RoomJS = function(){
	var _self     = this;
	var _Users    = {};
	var _maxUsers = 3;
	
	_self.addUser = function(address, deposit, id, callback){
		var params = {prnt:_self, balance:deposit, address:address, callback:callback, bMultiplayer:true};
		
		var logic = new LogicMultJS(params);
		
		if (!id) {
			id = Object.keys(_Users).length
		}

		var user = {
			address: address, 
			deposit: deposit,
			logic:   logic,
			id:      id
		}

		if (!_Users[address]) {
			_Users[address] = user
		}

		_Users[address].callback = callback

		return user;
	}
	
	_self.callFunction = function(address, name, params){
		if(_Users[address].logic[name]){
			_Users[address].logic[name].apply(null, params);
		}
	}
	
	_self.getUsers = function(){
		return _Users;
	}
	_self.getUsersArr = function(){
		return Object.values( _Users );
	}
	
	_self.getTagUser = function(address){
		return _Users[address];
	}

	_self.getMaxUsers = function(){
		return _maxUsers
	}
	_self.full = function(){
		return (Object.values( _Users ).length >= _maxUsers)
	}	
	
	return _self;
}
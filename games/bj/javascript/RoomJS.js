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
		if (_Users[address]) {
			return _Users[address];
		}
		console.log("addUser: id=", id);
		var params = {prnt:_self, balance:deposit, address:address, callback:callback, bMultiplayer:true};
		
		var logic = new LogicMultJS(params);
		
		if (!id) {
			id = Object.keys(_Users).length
		}

		var user = {
			address:    address, 
			deposit:    deposit,
			logic:      logic,
			id:         id
		}

		if (!_Users[address]) {
			_Users[address] = user
		}

		_Users[address].callback = callback
		_self.mixDeck()
		
		return user
	}

	_self.callFunction = function(address, name, params){
		if(_Users[address].logic[name]){
			_Users[address].logic[name].apply(null, params);
		}
	}
	
	_self.disableUser = function(address){
		_Users[address].id = -1
		_Users[address].disabled = true
		_self.refreshIDs()
	}

	_self.removeUser = function(address){
		delete(_Users[address]);
		_self.refreshIDs()
	}

	_self.refreshIDs = function(){
		var num = 0
		for(var addr in _Users){
			if (_Users[addr].disabled) {
				continue;
			}

			_Users[addr].id = num
			num++
		}
	}
	_self.mixDeck = function(){
		var num = 0
		for(var addr in _Users){
			if (_Users[addr].disabled) {
				continue;
			}

			_Users[addr].logic.mixDeck();
			num++
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
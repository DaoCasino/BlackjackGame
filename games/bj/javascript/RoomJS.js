/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.0
 */

var RoomJS = function(){
	var _self = this;
	var _arUsers = [];
	var _arTagUsers = [];
	var _countUsers = 0;
	
	// _self.init = function(){
		// Casino.onGameStateChange(function(data){
			// if(data.action && data.action=='callFunction'){
				// _self[data.function_name](data.function_args)
			// }
		// })
	// }
	
	_self.addUser = function(address, bet, callback){
		var params = {prnt:_self, balance:bet, address:address, callback:callback};
		var logic = new LogicMultJS(params);
		var user = {address:address, 
					id:_countUsers,
					bet:bet,
					logic:logic};
		_arUsers.push(user);
		_arTagUsers[address] = user;
		_countUsers ++;
		
		return user;
	}
	
	_self.callFunction = function(id, name, params){
		_arUsers[id].logic[name].apply(null, params);
	}
	
	_self.getUsers = function(){
		return _arUsers;
	}
	
	_self.getTagUser = function(address){
		return _arTagUsers[address];
	}
	
	return _self;
}
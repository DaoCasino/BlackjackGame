/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.1
 */

var RoomJS = function(){
	var _self       = this;
	var _Users      = {};
	var _maxUsers   = 3;
	var _arCards    = [];
	var COUNT_DECKS = 4
	var COUNT_CARDS = 52
	
	_self.addUser = function(address, deposit, id, callback){
		if (_Users[address]) {
			return _Users[address];
		}
		
		var params = {prnt:_self, balance:deposit, address:address, callback:callback, bMultiplayer:true};
		var logic = new LogicJS(params);
		
		if (typeof id === 'undefined') {
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
		if(_Users && _Users[address] && _Users[address].logic && _Users[address].logic[name]){
			_Users[address].logic[name].apply(null, params);
		}
		
		// check result game
		var gameOver = false;
		for(var addr in _Users){
			if (_Users[addr].disabled) {
				continue;
			}

			if(_Users[addr].logic.getGame().result){
				gameOver = true;
			}
		}
		
		if(gameOver){
			console.log("Game Over");
			var prcnt = Math.ceil(COUNT_DECKS*COUNT_CARDS*0.75);
			if(_arCards.length < prcnt){
				_self.mixDeck();
			}
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
	
	_self.createCard = function(seed, val, _address){
		var hash = ABI.soliditySHA3(['bytes32'],[ seed ]);
		if(val){
			hash = [hash[val]];
		}
		
		var rand = bigInt(hash.toString('hex'),16).divmod(_arCards.length).remainder.value;
		var id = _arCards[rand];
		_arCards.splice(rand, 1);
		console.log("createCard: id=", id, "len=", _arCards.length);
		return id;
	}
	
	_self.mixDeck = function(){		
		_arCards = [];
		var count = COUNT_CARDS*COUNT_DECKS;
		var id = 0;
		
		for(var i=0; i<count; i++){
			_arCards.push(id);
			id ++;
			if(id > COUNT_CARDS-1){
				id = 0;
			}
		}
		
		console.log("Mix deck:", _arCards);
		
		// old
		for(var addr in _Users){
			if (_Users[addr].disabled) {
				continue;
			}
			
			// _Users[addr].logic.mixDeck();
			_Users[addr].logic.getResult().mixing = true;
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
	_self.getDeck = function(){
		return _arCards;
	}
	_self.getMaxUsers = function(){
		return _maxUsers
	}
	_self.full = function(){
		return (Object.values( _Users ).length >= _maxUsers)
	}	
	
	return _self;
}
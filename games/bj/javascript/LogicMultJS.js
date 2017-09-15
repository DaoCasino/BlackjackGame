/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.9
 */

var LogicMultJS = function(params){
	var _self = this;

	var BLACKJACK = 21;
	
	var DEAL = 0;
	var HIT = 1;
	var STAND = 2;
	var SPLIT = 3;
	var DOUBLE = 4;
	var INSURANCE = 5;
	
	var COUNT_DECKS = 4;
	var COUNT_CARDS = 52;
	
	var _address = "0x";
	
	var _money = 0;
	var _balance = 0;
	var _myPoints = 0;
	var _splitPoints = 0;
	var _housePoints = 0;
	var _idGame = 0;
	
	var _arMyCards = [];
	var _arMySplitCards = [];
	var _arHouseCards = [];
	var _arMyPoints = [];
	var _arMySplitPoints = [];
	var _arHousePoints = [];
	var _arDecks = [];
	var _arCards = [];
	
	var _bStand = false;
	var _bStandNecessary = false;
	var _bSplit = false;
	var _bMultiplayer = false;
	var _bDealerStart = false;
	var _bDealerEnd = false;
	
	var _prnt;
	var _callback;
	
	if(params){
		if(params.prnt){
			_prnt = params.prnt;
		}
		if(params.address){
			_address = params.address;
		}
		if(params.callback){
			_callback = params.callback;
		}
		_bMultiplayer = params.bMultiplayer || false;
		_balance = params.balance || 0;
	}
	
	var _objSpeedGame = {method:"",
						result:false, 
						play:false, 
						idGame:-1, 
						curGame:{}, 
						betGame:0, 
						betSplitGame:0, 
						money:_money,
						insurance:false};
	var _objResult = {main:"", split:"", betMain:0, betSplit:0, profit:0, mixing:false};
	
	mixDeck();
	
	// single methods
	_self.bjDeal = function(_s, _bet){
		_objSpeedGame.method = "bjDeal";
		_idGame ++;
		_objResult = {main:"", split:"", betMain:0, betSplit:0, profit:-_bet, mixing:false};
		_objSpeedGame.result  = false;
		_objSpeedGame.play    = true;
		_objSpeedGame.curGame = {};
		_objSpeedGame.betGame = _bet;
		_objSpeedGame.betSplitGame = 0;
		_money -= _bet;
		_objSpeedGame.money = _money;
		_objSpeedGame.insurance = false;
		_arMyCards = [];
		_arMySplitCards = [];
		_arHouseCards = [];
		_arMyPoints = [];
		_arMySplitPoints = [];
		_arHousePoints = [];
		_bStand = false;
		_bStandNecessary = false;
		_bSplit = false;
		
		dealCard(true, true, _s, 15);
		dealCard(false, true, _s, 16);
		dealCard(true, true, _s, 17);
		refreshGame(_s);
	}
	
	_self.bjHit = function(_s, isMain){
		_objSpeedGame.method = "bjHit";
		dealCard(true, isMain, _s);
		refreshGame(_s);
	}
	
	_self.bjStand = function(_s, isMain){
		_objSpeedGame.method = "bjStand";
		stand(isMain, _s);
		refreshGame(_s);
	}
	
	_self.bjSplit = function(_s){	
		_objSpeedGame.method = "bjSplit";
		_arMySplitCards = [_arMyCards[1]];
		_arMyCards = [_arMyCards[0]];
		_arMySplitPoints = [_arMyPoints[0]];
		_arMyPoints = [_arMyPoints[0]];
		_myPoints = getMyPoints();
		_splitPoints = getMySplitPoints();
		_bSplit = true;
		dealCard(true, true, _s, 15);
		dealCard(true, false, _s, 16);
		_objSpeedGame.betSplitGame = _objSpeedGame.betGame;
		_money -= _objSpeedGame.betSplitGame;
		_objSpeedGame.money = _money;
		_objResult.profit -= _objSpeedGame.betSplitGame;
		refreshGame(_s);
	}
	
	_self.bjDouble = function(_s, isMain){
		_objSpeedGame.method = "bjDouble";
		dealCard(true, isMain, _s);
		stand(isMain, _s);
		if(isMain){
			_money -= _objSpeedGame.betGame;
			_objResult.profit -= _objSpeedGame.betGame;
			_objSpeedGame.betGame *= 2;
		} else {
			_money -= _objSpeedGame.betSplitGame;
			_objResult.profit -= _objSpeedGame.betSplitGame;
			_objSpeedGame.betSplitGame *= 2;
		}
		_objSpeedGame.money = _money;
		refreshGame(_s);
	}
	
	_self.bjInsurance = function(_bet){
		_objSpeedGame.method = "bjInsurance";
		_objSpeedGame.insurance = true;
		_money -= _bet;
		_objSpeedGame.money = _money;
		_objResult.profit -= _bet;
	}
	
	// multiplayer methods
	_self.bjBet = function(_bet){
		_idGame ++;
		_objResult = {main:"", split:"", betMain:0, betSplit:0, profit:-_bet, mixing:false};
		
		_objSpeedGame.method       = "bjBet";
		_objSpeedGame.result       = false;
		_objSpeedGame.curGame      = {};
		_objSpeedGame.betGame      = _bet;
		_objSpeedGame.betSplitGame = 0;
		
		_money -= _bet;
		
		_objSpeedGame.money     = _money;
		_objSpeedGame.insurance = false;
		
		_arMyCards       = [];
		_arMySplitCards  = [];
		_arHouseCards    = [];
		_arMyPoints      = [];
		_arMySplitPoints = [];
		_arHousePoints   = [];
		
		_bStand          = false;
		_bStandNecessary = false;
		_bSplit          = false;
		
		if(typeof _callback === 'function'){
			_callback(_address, _objSpeedGame);
		}
	}
	
	_self.bjDealer = function(_s){
		if (_bDealerStart) return;
		_bDealerStart = true;
		_bDealerEnd = false;

		_objSpeedGame.play = true;
		_objSpeedGame.method = "bjDealer";
		dealCard(false, true, _s);
		refreshGame(_s);
	}
	
	_self.bjDealerStand = function(_s, isMain){
		if (_bDealerEnd) return;
		_bDealerStart = false;
		_bDealerEnd = true;

		_objSpeedGame.method = "bjDealerStand";
		_bStand = true;
		
		var val = 15;
		while (_housePoints < 17 && val < 32) {
			dealCard(false, true, _s, val);
			val += 1;
		}
		refreshGame(_s);
	}
	
	_self.bjMultStand = function(_s, isMain){
		_objSpeedGame.method = "bjMultStand";
		
		_bSplit = false;
		if (!isMain) {
			return;
		}
		_bStand = true;
		
		if(typeof _callback === 'function'){
			_callback(_address, _objSpeedGame);
		}
	}
	
	_self.bjMultDouble = function(_s, isMain){
		_objSpeedGame.method = "bjMultDouble";
		dealCard(true, isMain, _s);
		
		if(isMain){
			_bStand = true;
			_money -= _objSpeedGame.betGame;
			_objResult.profit -= _objSpeedGame.betGame;
			_objSpeedGame.betGame *= 2;
		} else {
			_bSplit = false;
			_money -= _objSpeedGame.betSplitGame;
			_objResult.profit -= _objSpeedGame.betSplitGame;
			_objSpeedGame.betSplitGame *= 2;
		}
		_objSpeedGame.money = _money;
		refreshGame(_s);
	}
	
	// get methods
	_self.makeID = function(){
		var count = 64;
		var str = "0x";
		var possible = "abcdef0123456789";
		var t = String(getTimer());
		count -= t.length;
		str += t;

		for( var i=0; i < count; i++ ){
			str += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		
		str = "0x" + web3_sha3(numToHex(str));
		
		return str;
	}
	
	_self.getGame = function(){
		return _objSpeedGame;
	}
	
	_self.getResult = function(){
		return _objResult;
	}
	
	_self.getBalance = function(){
		var balance = _balance + _money;
		return balance;
	}
	
	_self.getValCards = function(cardIndex){
		var cardType = Math.floor(cardIndex / 4);
		var cardSymbol = String(cardType);
		var s = cardIndex % 4 + 1;
		var suit = "";
		switch (cardType) {
			case 0:
				cardSymbol = "K";
				break;
			case 1:
				cardSymbol = "A";
				break;
			case 11:
				cardSymbol = "J";
				break;
			case 12:
				cardSymbol = "Q";
				break;
		}
		
		var spriteName = cardSymbol;
		return spriteName;
	}
	
	_self.refreshGame = function(_s){
		refreshGame(_s);
	}
	
	function mixDeck(){
		_arCards = [];
		_objResult.mixing = true;
		var count = COUNT_CARDS*COUNT_DECKS;
		var id = 0;
		
		for(var i=0; i<count; i++){
			_arCards.push(id);
			id ++;
			if(id > COUNT_CARDS-1){
				id = 0;
			}
		}
	}
	
	function refreshGame(_s){
		checkResult(true, _s);
		if(_arMySplitCards.length > 0){
			checkResult(false, _s);
		}
		
		_objSpeedGame.money = _money;
		_objSpeedGame.curGame = {"arMyCards":_arMyCards,
				"arMySplitCards":_arMySplitCards,
				"arHouseCards":_arHouseCards}
				
		if(typeof _callback === 'function'){
			_callback(_address, _objSpeedGame);
		}
		
		if(_objSpeedGame.result){
			// console.log("Game Over", _objResult.profit, _money);
			var prcnt = Math.ceil(COUNT_DECKS*COUNT_CARDS*0.75);
			if(_arCards.length < prcnt){
				mixDeck();
			}
		}
	}
	
	function stand(isMain, _s){
		_bSplit = false;
		if (!isMain) {
			return;
		}
		_bStand = true;
		
		if(_myPoints > BLACKJACK &&
		(_arMySplitCards.length == 0 ||
		_splitPoints > BLACKJACK)){
			dealCard(false, true, _s, 15);
		} else {
			var val = 15;
			while (_housePoints < 17 && val < 32) {
				dealCard(false, true, _s, val);
				val += 1;
			}
		}
	}

	function dealCard(player, isMain, seed, val){
		var newCard = createCard(seed, val);
		
		var cardType = Math.floor(newCard / 4);
		var point = cardType;
		
		switch (cardType) {
			case 0:
			case 11:
			case 12:
				point = 10;
				break;
			case 1:
				point = 11;
				break;
		}
		
		if(player){
			if (isMain) {
				_arMyPoints.push(point);
				_myPoints = getMyPoints();
				_arMyCards.push(newCard);
				// console.log("dealClient: Main", newCard, getNameCard(newCard));
				if(_myPoints >= BLACKJACK && !_bSplit){
					if(_bMultiplayer){
						_bStand = true;
					} else {
						stand(isMain, seed);
					}
				}
			} else {
				_arMySplitPoints.push(point);
				_splitPoints = getMySplitPoints();
				_arMySplitCards.push(newCard);
				// console.log("dealClient: Split", newCard, getNameCard(newCard));
			}
		} else {
			_arHousePoints.push(point);
			_housePoints = getHousePoints();
			_arHouseCards.push(newCard);
			// console.log("dealClient: House", newCard, getNameCard(newCard));
		}
	}
	
	function checkResult(isMain, _s){
		if(_arHouseCards.length < 2){
			return false;
		}
		var points = getMySplitPoints();
		var bet = _objSpeedGame.betSplitGame;
		var betWin = 0;
		var countCard = _arMySplitCards.length;
		var state = "";
		
		if(isMain){
			countCard = _arMyCards.length;
			points = getMyPoints();
			bet = _objSpeedGame.betGame;
			
			if(_objSpeedGame.result){
				return false;
			}
		}
		
		if(points == BLACKJACK && _housePoints == BLACKJACK && state==""){
			state = "push";
			betWin = bet;
			if(isMain && !_bSplit){
				_objSpeedGame.result = true;
			}
		}
		if (_housePoints == BLACKJACK && points != BLACKJACK && state=="") {
			state = "lose";
			if(isMain){
				_objSpeedGame.result = true;
				if(_objSpeedGame.insurance){
					betWin = bet;
				}
			}
        }
		
        if (points == BLACKJACK && state=="") {
			if(countCard == 2){
				state = "blackjack";
				bet = bet * 2.5;
				betWin = bet;
			}
			if(isMain){
				if(!_bSplit){
					_objSpeedGame.result = true;
				}
			} else {
				_bSplit = false;
			}
        }
        if (points > BLACKJACK && state=="") {
            state = "bust";
			if(isMain){
				if(!_bSplit){
					_objSpeedGame.result = true;
				}
			} else {
				_bSplit = false;
			}
        }
		if (points == _housePoints && state=="") {
            state = "push";
			betWin = bet;
        }
        if (points < _housePoints && _housePoints <= BLACKJACK && state=="") {
			state = "lose";
        }
		
		if (state=="") {
			state = "win";
			bet = bet * 2;
			betWin = bet;
		}
		
		if(!_objSpeedGame.result && isMain){
			if(_bStand){
				_objSpeedGame.result = true;
			} else if(points == BLACKJACK && !_bSplit){
				if(_bStandNecessary){
					_objSpeedGame.result = true;
				} else {
					_bStandNecessary = true;
					if(_bMultiplayer){
						_self.bjMultStand(_s, isMain);
					} else {
						_self.bjStand(_s, isMain);
					}
					return false;
				}
			}
		}
		
		if(_objSpeedGame.result){
			_objSpeedGame.play = false

			_money += betWin;
			_objSpeedGame.money = _money;
			_objResult.profit += betWin;
			if(isMain){
				_objResult.main = state;
				_objResult.betMain = betWin;
				// console.log("result: Main", state, "_money = "+betWin);
			} else {
				_objResult.split = state;
				_objResult.betSplit = betWin;
				// console.log("result: Split", state, "_money = "+betWin);
			}
		}
	}
	
	function createCard(cardNumber, val){	
		var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]);
		if(val != undefined){
			hash = [hash[val]];
		}
		
		var rand = bigInt(hash.toString('hex'),16).divmod(_arCards.length).remainder.value;
		var id = _arCards[rand];
		_arCards.splice(rand, 1);
		// console.log("createCard:", _arCards.length, _address);
		return id;
	}
	
	function getPoint(id){
		var cardType = Math.floor(id / 4);
		var point = cardType;
		
		switch (cardType) {
			case 0:
			case 11:
			case 12:
				point = 10;
				break;
			case 1:
				point = 11;
				break;
		}
		
		return point;
	}
	
	function getMyPoints(){
		var myPoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arMyPoints.length; i++) {
			var curPoint = _arMyPoints[i];
			myPoints += curPoint;
			if(curPoint == 11){
				countAce ++;
			}
		}
		while(myPoints > 21 && countAce > 0){
			countAce --;
			myPoints -= 10;
		}
		
		return myPoints;
	}
	
	function getMySplitPoints(){
		var mySplitPoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arMySplitPoints.length; i++) {
			var curPoint = _arMySplitPoints[i];
			mySplitPoints += curPoint;
			if(curPoint == 11){
				countAce ++;
			}
		}
		
		while(mySplitPoints > 21 && countAce > 0){
			countAce --;
			mySplitPoints -= 10;
		}
		
		return mySplitPoints;
	}
	
	function getHousePoints(){
		var housePoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arHousePoints.length; i++) {
			var curPoint = _arHousePoints[i];
			housePoints += curPoint;
			if(curPoint == 11){
				countAce ++;
			}
		}
		
		while(housePoints > 21 && countAce > 0){
			countAce --;
			housePoints -= 10;
		}
		
		return housePoints;
	}
	
	function getNameCard(cardIndex){
		var cardType = Math.floor(cardIndex / 4);
		var cardSymbol = String(cardType);
		var s = cardIndex % 4 + 1;
		var suit = "";
		switch (cardType) {
			case 0:
				cardSymbol = "K";
				break;
			case 1:
				cardSymbol = "A";
				break;
			case 11:
				cardSymbol = "J";
				break;
			case 12:
				cardSymbol = "Q";
				break;
		}
		switch (s) {
			case 1:
				suit = "Hearts";
				break;
			case 2:
				suit = "Diamonds";
				break;
			case 3:
				suit = "Spades";
				break;
			case 4:
				suit = "Clubs";
				break;
		}
		
		var spriteName = suit + "_" + cardSymbol;
		return spriteName;
	}
	
	function getTimer(){
		var d = new Date();
		var n = d.getTime();
		return n;
	}
	
	// only for client
	_self.loadGame = function(game, result){
		_objSpeedGame = game;
		_objResult = result;
		_money = _objSpeedGame.money;
		
		_arMyCards = _objSpeedGame.curGame.arMyCards || [];
		_arMySplitCards = _objSpeedGame.curGame.arMySplitCards || [];
		_arHouseCards = _objSpeedGame.curGame.arHouseCards || [];
		_arMyPoints = [];
		_arMySplitPoints = [];
		_arHousePoints = [];
		
		for (var i = 0; i < _arMyCards.length; i++) {
			var point = getPoint(_arMyCards[i]);
			_arMyPoints.push(point);
		}
		for (var i = 0; i < _arMySplitCards.length; i++) {
			var point = getPoint(_arMySplitCards[i]);
			_arMySplitPoints.push(point);
		}
		for (var i = 0; i < _arHouseCards.length; i++) {
			var point = getPoint(_arHouseCards[i]);
			_arHousePoints.push(point);
		}
	}
	
	_self.setDealerCards  = function(arHouseCards, value){
		_arHouseCards = arHouseCards || [];
		_objSpeedGame.curGame.arHouseCards = _arHouseCards;
		_arHousePoints = [];
		for (var i = 0; i < _arHouseCards.length; i++) {
			var point = getPoint(_arHouseCards[i]);
			_arHousePoints.push(point);
		}
		_housePoints = getHousePoints();
		
		if(value){
			_bStand = true;
		}
	}
	
	_self.getMyPoints      = getMyPoints;
	_self.getPoint         = getPoint;
	_self.getMySplitPoints = getMySplitPoints;
	_self.getHousePoints   = getHousePoints;
	_self.mixDeck = mixDeck;
	
	return _self;
}
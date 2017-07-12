/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.4
 */

var LogicJS = function(params){
	var self = this;

	var BLACKJACK = 21;

	var DEAL = 0;
	var HIT = 1;
	var STAND = 2;
	var SPLIT = 3;
	var DOUBLE = 4;
	var INSURANCE = 5;
	
	var COUNT_DECKS = 4;
	var COUNT_CARDS = 52;
	
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
	
	var _prnt;
	var _callback;
	
	if(params){
		if(params.prnt){
			_prnt = params.prnt;
		}
		if(params.callback){
			_callback = params.callback;
		}
		_balance = params.balance || 0;
	}
	
	var _objSpeedGame = {result:false, 
						idGame:-1, 
						curGame:{}, 
						betGame:0, 
						betSplitGame:0, 
						money:_money,
						insurance:false};
	var _objResult = {main:"", split:"", betMain:0, betSplit:0, profit:0, mixing:false};
	
	mixDeck();
	
	self.bjDeal = function(_s, _bet){
		_idGame ++;
		_objResult = {main:"", split:"", betMain:0, betSplit:0, profit:-_bet, mixing:false};
		_objSpeedGame.result = false;
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
		
		var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);
		dealCard(true, true, seedarr[15]);
		dealCard(false, true, seedarr[16]);
		dealCard(true, true, seedarr[17]);
		refreshGame(_s);
	}
	
	self.bjHit = function(_s, isMain){
		dealCard(true, isMain, _s);
		refreshGame(_s);
	}
	
	self.bjStand = function(_s, isMain){
		var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);
		stand(isMain, seedarr);
		refreshGame(_s);
	}
	
	self.bjSplit = function(_s){	
		var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);
		_arMySplitCards = [_arMyCards[1]];
		_arMyCards = [_arMyCards[0]];
		_arMySplitPoints = [_arMyPoints[0]];
		_arMyPoints = [_arMyPoints[0]];
		_myPoints = getMyPoints();
		_splitPoints = getMySplitPoints();
		dealCard(true, true, seedarr[15]);
		dealCard(true, false, seedarr[16]);
		_objSpeedGame.betSplitGame = _objSpeedGame.betGame;
		_money -= _objSpeedGame.betSplitGame;
		_objSpeedGame.money = _money;
		_objResult.profit -= _objSpeedGame.betSplitGame;
		refreshGame(_s);
	}
	
	self.bjDouble = function(_s, isMain){
		var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);
		dealCard(true, isMain, _s);
		stand(isMain, seedarr);
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
	
	self.bjInsurance = function(_bet){
		_objSpeedGame.insurance = true;
		_money -= _bet;
		_objSpeedGame.money = _money;
	}
	
	self.makeID = function(){
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
	
	self.getGame = function(){
		return _objSpeedGame;
	}
	
	self.getResult = function(){
		return _objResult;
	}
	
	self.getBalance = function(){
		var balance = _balance + _money;
		return balance;
	}
	
	self.getValCards = function(cardIndex){
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
	
	function mixDeck(){
		_arCards = [];
		_objResult.mixing = true;
		
		for(var i=0; i<52; i++){
			_arDecks[i] = 0;
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
			_callback(_objSpeedGame);
		}
		
		if(_objSpeedGame.result){
			// console.log("Game Over", _objResult.profit, _money);
			var prcnt = Math.ceil(COUNT_DECKS*COUNT_CARDS*0.25);
			if(_arCards.length > prcnt){
				mixDeck();
			}
		}
	}
	
	function stand(isMain, s){
		if (!isMain) {
			return;
		}
		
		_bStand = true;
		
		if(_myPoints > BLACKJACK &&
		(_arMySplitCards.length == 0 ||
		_splitPoints > BLACKJACK)){
			dealCard(false, true, s[15]);
		} else {
			var val = 15;
			while (_housePoints < 17 && val < 64) {
				dealCard(false, true, s[val]);
				val += 1;
			}
		}
	}

	function dealCard(player, isMain, seed){
		var newCard = createCard(seed);
		
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
				if(_myPoints >= BLACKJACK){
					var seedarr = ABI.rawEncode([ "bytes32" ], [ seed ]);
					stand(isMain, seedarr);
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
		var points = _splitPoints;
		var bet = _objSpeedGame.betSplitGame;
		var betWin = 0;
		var countCard = _arMySplitCards.length;
		var state = "";
		
		if(isMain){
			countCard = _arMyCards.length;
			points = _myPoints;
			bet = _objSpeedGame.betGame;
			
			if(_objSpeedGame.result){
				return false;
			}
		}
		
		if(points == BLACKJACK && _housePoints == BLACKJACK && state==""){
			state = "push";
			betWin = bet;
			if(isMain){
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
		
        if (points == BLACKJACK && state=="" && countCard == 2) {
			state = "blackjack";
			bet = bet * 2.5;
			betWin = bet;
			if(isMain){
				_objSpeedGame.result = true;
			}
        }
        if (points > BLACKJACK && state=="") {
            state = "bust";
			if(isMain){
				_objSpeedGame.result = true;
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
		
		if(!_objSpeedGame.result){
			if(_bStand){
				_objSpeedGame.result = true;
			} else if(points == BLACKJACK && isMain){
				if(_bStandNecessary){
					_objSpeedGame.result = true;
				} else {
					_bStandNecessary = true;
					self.bjStand(_s, isMain);
					return false;
				}
			}
		}
		
		if(_objSpeedGame.result){
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

	function checkCard(rand){
		if(_arCards.length > 40){
			mixDeck();
		}
		
		if(_arDecks[rand] < COUNT_DECKS){
		} else {
			for(var i=0; i<52; i++){
				if(_arDecks[i] < COUNT_DECKS){
					rand = i;
					break;
				}
			}
		}
		
		return rand;
	}
	
	function createCard(cardNumber){	
		var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]).toString('hex');
			hash = hash.substr(hash.length-2, hash.length) // uint8
		var rand = bigInt(hash,16).divmod(52).remainder.value;
		rand = checkCard(rand);
		_arDecks[rand] ++;
		_arCards.push(rand);
		return rand;
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

	return self;
}
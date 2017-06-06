var BLACKJACK = 21;

var DEAL = 0;
var HIT = 1;
var STAND = 2;
var SPLIT = 3;
var DOUBLE = 4;

var prnt;
var arMethod = ["DEAL", "HIT", "STAND", "SPLIT", "DOUBLE"];

function Contract(_prnt) {
	prnt = _prnt;
	this.myPoints = 0;
	this.splitPoints = 0;
	this.housePoints = 0;
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
}

Contract.prototype.confirmSeed = function(_s, method, _objGame, isMain){
	this.myPoints = _objGame.myPoints;
	this.splitPoints = _objGame.splitPoints;
	this.housePoints = _objGame.housePoints;
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
	
	var i = 0;
	var point = 0;
	for (i = 0; i < _objGame.arMyCards.length; i++) {
		point = _objGame.arMyCards[i].id;
		this._arMyCards.push(point);
	}
	for (i = 0; i < _objGame.arMySplitCards.length; i++) {
		point = _objGame.arMySplitCards[i].id;
		this._arMySplitCards.push(point);
	}
	for (i = 0; i < _objGame.arHouseCards.length; i++) {
		point = _objGame.arHouseCards[i].id;
		this._arHouseCards.push(point);
	}
	
	switch(method){
		case DEAL:
			this.dealCard(true, true, _s[1]);
			this.dealCard(false, true, _s[2]);
			this.dealCard(true, true, _s[3]);
			break;
		case HIT:
			this.dealCard(true, isMain, _s);
			break;
		case STAND:
			this.stand(isMain, _s);
			break;
		case SPLIT:
			this.dealCard(true, true, _s[1]);
			this.dealCard(true, false, _s[2]);
			break;
		case DOUBLE:
			this.dealCard(true, isMain, _s);
			break;
	}
	
	var objGame = {"arMyCards":this._arMyCards,
			"arMySplitCards":this._arMySplitCards,
			"arHouseCards":this._arHouseCards}
	
	prnt.responseServer(objGame);
}

Contract.prototype.stand = function(isMain, s){
	if (!isMain) {
		return;
	}
	
	if(this.myPoints > BLACKJACK &&
	(this._arMySplitCards.lenth == 0 ||
	this.splitPoints > BLACKJACK)){
		this.dealCard(false, true, s[1]);
	} else {
		var val = 1;
		while (this.housePoints < 17 && val < 21) {
			this.dealCard(false, true, s[val]);
			val += 1;
		}
	}
}

Contract.prototype.dealCard = function(player, isMain, seed){
	var newCard = this.deal(seed);
	
	if(player){
		if (isMain) {
			this.myPoints += newCard;
			this._arMyCards.push(newCard);
		} else {
			this.splitPoints += newCard;
			this._arMySplitCards.push(newCard);
		}
	} else {
		this.housePoints += newCard;
		this._arHouseCards.push(newCard);
	}
}

Contract.prototype.deal = function(cardNumber){
	var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]).toString('hex');
	var rand = bigInt(hash,16).divmod(52).remainder.value;
	
	return rand;
}
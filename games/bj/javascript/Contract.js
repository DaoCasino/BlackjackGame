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
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHousePoints = [];
}

Contract.prototype.confirmSeed = function(_s, method, _objGame, isMain){
	this.myPoints = _objGame.myPoints;
	this.splitPoints = _objGame.splitPoints;
	this.housePoints = _objGame.housePoints;
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
	this._arMyPoints = [this.myPoints];
	this._arMySplitPoints = [this.splitPoints];
	this._arHousePoints = [this.housePoints];
	
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

	var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);

	switch(method){
		case DEAL:
			this.dealCard(true, true, seedarr[15]);
			this.dealCard(false, true, seedarr[16]);
			this.dealCard(true, true, seedarr[17]);
			break;
		case HIT:
			this.dealCard(true, isMain, _s);
			break;
		case STAND:
			this.stand(isMain, seedarr);
			break;
		case SPLIT:
			this.dealCard(true, true, seedarr[15]);
			this.dealCard(true, false, seedarr[16]);
			break;
		case DOUBLE:
			this.dealCard(true, isMain, _s);
			this.stand(isMain, seedarr);
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
		this.dealCard(false, true, s[15]);
	} else {
		var val = 15;
		while (this.housePoints < 17 && val < 64) {
			this.dealCard(false, true, s[val]);
			val += 1;
		}
	}
}

Contract.prototype.dealCard = function(player, isMain, seed){
	var newCard = this.deal(seed);
	// console.log("dealClient:", newCard, prnt.getNameCard(newCard));
	
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
			this._arMyPoints.push(point);
			this.myPoints = this.getMyPoints();
			this._arMyCards.push(newCard);
		} else {
			this._arMySplitPoints.push(point);
			this.splitPoints = this.getMySplitPoints();
			this._arMySplitCards.push(newCard);
		}
	} else {
		this._arHousePoints.push(point);
		this.housePoints = this.getHousePoints();;
		this._arHouseCards.push(newCard);
	}
}

Contract.prototype.deal = function(cardNumber){	
	var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]).toString('hex');
	var rand = bigInt(hash,16).divmod(52).remainder.value;
	// rand = 29;
	// rand = 21;
	// rand = 40;
	return rand;
}

Contract.prototype.getMyPoints = function(){
	var myPoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arMyPoints.length; i++) {
		var curPoint = this._arMyPoints[i];
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

Contract.prototype.getMySplitPoints = function(){
	var mySplitPoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arMySplitPoints.length; i++) {
		var curPoint = this._arMySplitPoints[i];
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

Contract.prototype.getHousePoints = function(){
	var housePoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arHousePoints.length; i++) {
		var curPoint = this._arHousePoints[i];
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

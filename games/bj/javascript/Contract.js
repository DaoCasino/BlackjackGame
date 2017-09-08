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
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHousePoints = [];
	// console.log("confirmSeed:", _s);
	
	var i = 0;
	var id = 0;
	var point = 0;
	for (i = 0; i < _objGame.arMyCards.length; i++) {
		id = _objGame.arMyCards[i].id;
		point = _objGame.arMyCards[i].point;
		this._arMyCards.push(id);
		this._arMyPoints.push(point);
	}
	for (i = 0; i < _objGame.arMySplitCards.length; i++) {
		id = _objGame.arMySplitCards[i].id;
		point = _objGame.arMySplitCards[i].point;
		this._arMySplitCards.push(id);
		this._arMySplitPoints.push(point);
	}
	for (i = 0; i < _objGame.arHouseCards.length; i++) {
		id = _objGame.arHouseCards[i].id;
		point = _objGame.arHouseCards[i].point;
		this._arHouseCards.push(id);
		this._arHousePoints.push(point);
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
	(this._arMySplitCards.length == 0 ||
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
			console.log("dealClient: Main", newCard, prnt.getNameCard(newCard));
			if(this.myPoints > BLACKJACK){
				var seedarr = ABI.rawEncode([ "bytes32" ], [ seed ]);
				this.stand(isMain, seedarr);
			}
		} else {
			this._arMySplitPoints.push(point);
			this.splitPoints = this.getMySplitPoints();
			this._arMySplitCards.push(newCard);
			console.log("dealClient: Split", newCard, prnt.getNameCard(newCard));
		}
	} else {
		this._arHousePoints.push(point);
		this.housePoints = this.getHousePoints();;
		this._arHouseCards.push(newCard);
		console.log("dealClient: House", newCard, prnt.getNameCard(newCard));
	}
}

Contract.prototype.deal = function(cardNumber){	
	var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]).toString('hex');
	if(!options_rpc){
		hash = hash.substr(hash.length-2, hash.length) // uint8
	}
	var rand = bigInt(hash,16).divmod(52).remainder.value;
	// rand = 29;
	// rand = 21;
	// if(Math.random()>0.5){
		// rand = 40;
	// } else {
		// rand = 4;
	// }
	return rand;
}

Contract.prototype.testSeed = function(_s, _method){
	var seedarr = ABI.rawEncode([ "bytes32" ], [ _s ]);
	if(_method == DEAL){
		for(var i = 15; i < 18; i++){
			var s = seedarr[i];
			var newCard = this.deal(s);
			if(i%2 == 0){
				console.log("dealClient: House", s, newCard, prnt.getNameCard(newCard));
			} else {
				console.log("dealClient:Main", s, newCard, prnt.getNameCard(newCard));
			}
		}
	} else if(_method == HIT){
		var newCard = this.deal(_s);
		console.log("dealClient: Main", _s, newCard, prnt.getNameCard(newCard));		
	}
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

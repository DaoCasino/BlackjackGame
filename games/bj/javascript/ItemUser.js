function ItemUser(prnt, ind, address) {
	PIXI.Container.call( this );
	this.init(prnt, ind, address);
}

ItemUser.prototype = Object.create(PIXI.Container.prototype);
ItemUser.prototype.constructor = ItemUser;

ItemUser.prototype.init = function(prnt, ind, address) {
	this.chips_mc = new PIXI.Container();
	this.cards_mc = new PIXI.Container();
	this.gfx_mc = new PIXI.Container();
	
	this._prnt = prnt;
	this._cardSuit;
	this._arChips = [];
	this._arSplitChips = [];
	this._arWinChips = [];
	this._arWinSplitChips = [];
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._dealedCards = [];
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHolder = [];
	this._arNewCards = [];
	this._ofsC = 22;
	this._ofssSC = 80;
	this._ofsP = 220;
	this._timeNewCard = 0;
	this._loadPlayerCard = 0;
	this._loadSplitCard = 0;
	this._lastSplitCard = 0;
	this._lastPlayerCard = 0;
	this._timeShowButtons = 0;
	this._scaleCard = 0.75;
	this._ind = ind;
	this._myPoints = 0;
	this._mySplitPoints = 0;
	this._ang = rad(35);
	if(ind){
		this._ang = -rad(35);
	}
	// this._ang = 0
	this._bSplit = false;
	this._side = "right";
	
	this.addChild(this.chips_mc);
	this.addChild(this.cards_mc);
	this.addChild(this.gfx_mc);
	
	var b = this._ofsC * Math.tan(this._ang); // b = a ·tg(B)
	var fontSize = 24;
	this.tfMyPoints = addText("", fontSize, "#ffde00", "#000000", "right", 200, 4)
	this.tfMyPoints.x = 0;
	this.tfMyPoints.y = -this._ofsP + 1*b-this.tfMyPoints.height/2;
	this.addChild(this.tfMyPoints);
	this.tfMySplitPoints = addText("", fontSize, "#ffde00", "#000000", "right", 200, 4)
	this.tfMySplitPoints.x = this.tfMyPoints.x+this._ofssSC;
	this.tfMySplitPoints.y = -this._ofsP + 1*b-this.tfMySplitPoints.height/2;
	this.addChild(this.tfMySplitPoints);
	var adr = address.substr(0,8);
	this.tfIdUser = addText(adr, fontSize, "#ffffff", "#000000", "center", 100, 4)
	this.tfIdUser.x = 0;
	this.tfIdUser.y = 40;
	this.addChild(this.tfIdUser);
}

ItemUser.prototype.createObj = function(point, name, sc) {	
	if(sc){}else{sc = 1};
	var mc = undefined;
	var newObj = true;
	
	for (var i = 0; i < this._arHolder.length; i++ ) {
		mc = this._arHolder[i];
		if (mc) {
			if (mc.dead && mc.name == name) {
				mc.visible = true;
				newObj = false;
				break;
			}
		}
	}
	
	if (newObj) {
		if(name == "suit"){
			mc = new PIXI.Container();
			mc.w = 150;
			mc.h = 250;
			var bg = new PIXI.Graphics();
			bg.beginFill(0x00000).drawRect(-mc.w/2, -mc.h, mc.w, mc.h).endFill();
			bg.scale.x = sc;
			bg.scale.y = sc;
			bg.visible = false;
			mc.addChild(bg);
			var skin = addObj(name, 0, 0, sc);
			if(skin){
				skin.y = - 110;
				mc.addChild(skin);
			}
		} else {
			mc = addObj(name, 0, 0, sc);
		}
		this.gfx_mc.addChild(mc);
		this._arHolder.push(mc);
	}
	
	mc.x = point.x;
	mc.y = point.y;
	mc.width = mc.w;
	mc.dead = false;
	
	return mc;
}

ItemUser.prototype.addHolderObj = function(obj){
	obj.visible = false;
	obj.dead = true;
	obj.x = _W + 150;
	obj.y = _H + 50;
}

ItemUser.prototype.clearGame = function(){
	this._bSplit = false;
	this._loadPlayerCard = 0;
	this._loadSplitCard = 0;
	this._lastPlayerCard = 0;
	this._lastSplitCard = 0;
	this._myPoints = 0;
	this._mySplitPoints = 0;
	
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arNewCards = [];
	
	this.clearChips();
	this.clearSplitChips();
	this.tfMyPoints.setText("");
	this.tfMySplitPoints.setText("");
	
	var i = 0;
	
	for (i = 0; i < this._dealedCards.length; i++) {
		var card = this._dealedCards[i];
		this.cards_mc.removeChild(card);
	}
	for (i = 0; i < this._arHolder.length; i++) {
		var mc = this._arHolder[i];
		this.addHolderObj(mc);
	}
	
	
	this._dealedCards = [];
	if(this._cardSuit){
		this._cardSuit.width = this._cardSuit.w;
		this._cardSuit.visible = false;
	}
}

// POINTS
ItemUser.prototype.showMyPoints = function(){
	this._myPoints = this.getMyPoints();
	if(this._myPoints > 0){
		this.tfMyPoints.setText(this._myPoints);
	} else {
		this.tfMyPoints.setText("");
	}
}

ItemUser.prototype.showMySplitPoints = function(){
	this._mySplitPoints = this.getMySplitPoints();
	if(this._mySplitPoints > 0){
		this.tfMySplitPoints.setText(this._mySplitPoints);
	} else {
		this.tfMySplitPoints.setText("");
	}
}

ItemUser.prototype.getMyPoints = function(){
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

ItemUser.prototype.getMySplitPoints = function(){
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

// CHIPS
ItemUser.prototype.clearChips = function(){	
	for (var i = 0; i < this._arChips.length; i++) {
		var chip = this._arChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arChips = [];
	for (var i = 0; i < this._arWinChips.length; i++) {
		var chip = this._arWinChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arWinChips = [];
}

ItemUser.prototype.clearSplitChips = function(){	
	for (var i = 0; i < this._arSplitChips.length; i++) {
		var chip = this._arSplitChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arSplitChips = [];
	for (var i = 0; i < this._arWinSplitChips.length; i++) {
		var chip = this._arWinSplitChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arWinSplitChips = [];
}

ItemUser.prototype.fillChips = function(value, type){
	var b = this._ofsC * Math.tan(this._ang); // b = a ·tg(B)
	var setBet = value;
	var countChip = 0;
	var posX = 0;
	var startY = 0;
	var left = false;
	if(_objSpeedGame){
		if(_objSpeedGame.betSplitGame > 0){
			left = true;
		}
	}
	if(type == "split"){
		this.clearSplitChips();
		posX += this._ofssSC;
		if(this._ind == 0){
			startY = 100;
		} else {
			startY = -100;
		}
	} else if(type == "mainWin"){
		if(this._bSplit || this.countPlayerSplitCard > 0){
			left = true;
		}
		if(left){
			posX -= this._ofssSC;
		}
	} else if(type == "splitWin"){
		posX += this._ofssSC;
	} else if(this._bSplit || 
	this.countPlayerSplitCard > 0 || 
	type == "main" || left){
		this.clearChips();
		posX -= this._ofssSC;
	} else {
		this.clearChips();
	}
	while(setBet > 0){
		var posY = -countChip*6+startY;
		if(setBet >= 5*valToken){
			setBet -= 5*valToken;
			this.addChip("chip_6", posX, posY, type);
			countChip ++;
		} else if(setBet >= 2*valToken){
			setBet -= 2*valToken;
			this.addChip("chip_5", posX, posY, type);
			countChip ++;
		} else if(setBet >= 1*valToken){
			setBet -= 1*valToken;
			this.addChip("chip_4", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.5*valToken){
			setBet -= 0.5*valToken;
			this.addChip("chip_3", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.1*valToken){
			setBet -= 0.1*valToken;
			this.addChip("chip_2", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.05*valToken){
			setBet -= 0.05*valToken;
			this.addChip("chip_1", posX, posY, type);
			countChip ++;
		} else if(setBet > 0){
			setBet = 0;
		}
	}
}

ItemUser.prototype.addChip = function(name, x, y, type) {
	var array = this._arChips;
	if(type == "split"){
		array = this._arSplitChips;
	} else if(type == "mainWin"){
		array = this._arWinChips;
	} else if(type == "splitWin"){
		array = this._arWinSplitChips;
	}
	var chip = addObj(name, x, y, _scaleChip);
	this.chips_mc.addChild(chip);
	array.push(chip);
}

// CARDS
ItemUser.prototype.addCard = function(name, loadCard, countCard, array){
	for (var i = loadCard; i < countCard; i++) {
		var cardIndex = array[i];
		this._timeNewCard = 1000;
		
		if(name == "arMyCards"){
			this._loadPlayerCard++;
			this._arNewCards.push({type:"player", id:cardIndex});
		} else if(name == "arMySplitCards"){
			this._loadSplitCard++;
			this._arNewCards.push({type:"split", id:cardIndex});
		}
	}
}

ItemUser.prototype.getCard = function(cardIndex){
	var cardType = Math.floor(cardIndex / 4);
	var cardSymbol = String(cardType);
	var point = cardType;
	var ace = false;
	switch (cardType) {
		case 0:
			cardSymbol = "K";
			point = 10;
			break;
		case 1:
			cardSymbol = "A";
			point = 11;
			ace = true;
			break;
		case 11:
			cardSymbol = "J";
			point = 10;
			break;
		case 12:
			cardSymbol = "Q";
			point = 10;
			break;
	}
	var suit = String(cardIndex % 4 + 1);
	var spriteName = suit + "_" + cardSymbol;
	var newCard = new PIXI.Container();
	var h = 250;
	var bg = new PIXI.Graphics();
	bg.beginFill(0x00000).drawRect(-75, -h, 150, h).endFill();
	bg.scale.x = this._scaleCard;
	bg.scale.y = this._scaleCard;
	bg.visible = false;
	newCard.addChild(bg);
	var skin = addObj(spriteName, 0, 0, this._scaleCard);
	if(skin){
		skin.y = - 110;
		newCard.addChild(skin);
		newCard.id = cardIndex;
		newCard.point = point;
		newCard.ace = ace;
	}else{
		// console.log("UNDEFINED spriteName:", cardIndex, spriteName);
	}
	
	return newCard;
}

ItemUser.prototype.getNameCard = function(cardIndex){
	var cardType = Math.floor(cardIndex / 4);
	var cardSymbol = String(cardType);
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
	
	return cardSymbol;
}

ItemUser.prototype.sendCard = function(obj){
	var type = obj.type;
	var cardIndex = obj.id;
	var card = undefined;
	var suit = this.createObj({x:1487-this.x, y:298-this.y}, "suit", this._scaleCard);
	var _x = 0;
	var _y = 0;
	var coord = {x:_x, y:_y};
	if(type != "suit"){
		card = this.getCard(cardIndex);
	}
	
	if(type == "player"){
		coord = this.showPlayerCard(card);
	} else if(type == "split"){
		coord = this.showPlayerSplitCard(card);
	} else if(type == "suit"){
		coord = this.showSuitCard();
		card = this._cardSuit;
	}
	
	this._timeShowButtons = TIME_SHOW_BTN + this._arNewCards.length*TIME_NEW_CARD;
	this._prnt.updateShowBtn(this._timeShowButtons);
	
	var _self = this;
	
	if(card){
		card.visible = false;
		if(type == "suit"){
			createjs.Tween.get(suit).to({x:coord.x, y:coord.y, rotation:this._ang},400)
								.call(function(){
									_self.addHolderObj(suit);
									card.visible = true;
								});
		} else {
			createjs.Tween.get(suit).to({x:coord.x, y:coord.y, rotation:this._ang},400).to({width:10},150)
							.call(function(){
								_self.addHolderObj(suit);
								card.visible = true;
							});
		}
	} else {
		console.log("card: null");
	}
}

ItemUser.prototype.showPlayerCard = function(card){
	if(card){
		var left = false;
		if(this._bSplit){
			left = true;
		}
		
		var b = this._ofsC * Math.tan(this._ang); // b = a ·tg(B)
		
		if(left){
			card.x = - this._ofssSC + this._lastPlayerCard*this._ofsC;
			card.y = -60 + this._lastPlayerCard*b;
		} else {
			card.x = this._lastPlayerCard*this._ofsC;
			card.y = -40 + this._lastPlayerCard*b;
		}
		
		card.rotation=this._ang;
		if(this._side == "left"){
			this.tfMyPoints.x = card.x - this._lastPlayerCard*this._ofsC+100;
			this.tfMyPoints.y = -this._ofsP + card.y;
		} else {
			this.tfMyPoints.x = card.x - this._lastPlayerCard*this._ofsC-140;
			this.tfMyPoints.y = -this._ofsP + card.y+70;
		}
		this.cards_mc.addChild(card);
		this._lastPlayerCard++;
		this._dealedCards.push(card);
		this._arMyCards.push(card);
		this._arMyPoints.push(card.point);
		this.showMyPoints();
		
		return {x:card.x, y:card.y}
	}
	
	return {x:0, y:0}
}

ItemUser.prototype.showPlayerSplitCard = function(card){
	if(card){
		var b = this._ofsC * Math.tan(this._ang); // b = a ·tg(B)
		var count = this._lastPlayerCard+this._lastSplitCard + 4;
		card.x = - this._ofssSC + count*this._ofsC;
		card.y = -60 + count*b;
		card.rotation=this._ang;
		if(this._side == "left"){
			this.tfMySplitPoints.x = card.x - (count-this._lastSplitCard)*this._ofsC+100;
			this.tfMySplitPoints.y = -this._ofsP + card.y;
		} else {
			this.tfMySplitPoints.x = card.x - (count-this._lastSplitCard)*this._ofsC-140;
			this.tfMySplitPoints.y = -this._ofsP + card.y+70;
		}
		this.cards_mc.addChild(card);
		this._lastSplitCard++;
		this._dealedCards.push(card);
		this._arMySplitCards.push(card);
		this._arMySplitPoints.push(card.point);
		this.showMySplitPoints();
		return {x:card.x, y:card.y}
	}
	
	return {x:0, y:0}
}

// SERVER
ItemUser.prototype.responseServer = function(curGame) {
	if(curGame.arMySplitCards && curGame.arMySplitCards.length > 0){
		this._bSplit = true;
		if(this._ind == 0){
			this.y = _H/2+120;
		} else if(this._ind == 1){
			this.y = _H/2+220;
			this._ang = -rad(30);
		}
	}
	for(var name in curGame){
		var obj = curGame[name];
		switch(name){
			case "arMyCards":
				this.addCard(name, this._loadPlayerCard, obj.length, obj);
				break;
			case "arMySplitCards":
				this.addCard(name, this._loadSplitCard, obj.length, obj);
				break;
		}
	}
	
}

ItemUser.prototype.update = function(diffTime) {
	this._timeNewCard -= diffTime;
	// console.log("update:", this._arNewCards.length > 0, this._timeNewCard);
	if(this._arNewCards.length > 0 && this._timeNewCard < 1){
		this._timeNewCard = TIME_NEW_CARD;
		this.sendCard(this._arNewCards[0]);
		this._arNewCards.shift();
	}
}
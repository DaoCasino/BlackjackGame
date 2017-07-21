function WndHistory(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

WndHistory.prototype = Object.create(PIXI.Container.prototype);
WndHistory.prototype.constructor = WndHistory;

WndHistory.prototype.init = function(_prnt) {
	this._prnt = _prnt;
	this._callback = undefined;
	this._arButtons =[];
	this._posTfY = -210;
	
	var rect = new PIXI.Graphics();
	rect.beginFill(0x000000).drawRect(-_W/2, -_H/2, _W, _H).endFill();
	rect.alpha = 0.5;
	this.addChild(rect);
	
	var bg = addObj("wndInfo",0,0,0.5);
	this.addChild(bg);
	
	var posLineX = 400;
	var stY = -190;
	var endY = 260;
	var thinLine = new PIXI.Graphics();
	thinLine.lineStyle(2, 0xffffff)
	thinLine.moveTo(posLineX, stY)
		   .lineTo(posLineX, endY);
	this.addChild(thinLine);
	
	var scrollZone = new PIXI.Container();
	this.addChild(scrollZone);
	var zone = new PIXI.Graphics();
	zone.beginFill(0xFF0000).drawRect(0, 0, 50, endY-stY).endFill();
	zone.x = -zone.width/2;
	zone.y = -zone.height/2;
	scrollZone.addChild(zone);
	scrollZone.w = 50;
	scrollZone.h = endY-stY;
	scrollZone.x = posLineX;
	scrollZone.y = stY+scrollZone.h/2;
	scrollZone.name = "scrollZone";
	scrollZone.visible = false;
	scrollZone._selected = false;
	this._arButtons.push(scrollZone);
	
	var btnClose = addButton("btnClose", 400, -270, 0.5);
	this.addChild(btnClose);
	this._arButtons.push(btnClose);
	var headScroll = addButton("headScroll", posLineX, stY, 1);
	headScroll.rotation = Math.PI/2;
	this.addChild(headScroll);
	this._arButtons.push(headScroll);
	this.headScroll = headScroll;
	
	btnClose.interactive = true;
	btnClose.buttonMode=true;
	btnClose.overSc=true;
	headScroll.interactive = true;
	headScroll.buttonMode=true;
	
	var tfTitle = addText(getText("history_game"), 40, "#FFFFFF", "#000000", "center", 500, 3);
	tfTitle.y = -270 - tfTitle.height/2;
	this.addChild(tfTitle);
	var tfName = addText(getText("status"), 20, "#FFCC00", undefined, "left", 500)
	tfName.x = -400;
	tfName.y = -240;
	this.addChild(tfName);
	var tfBalance = addText(getText("balance"), 20, "#FFCC00", undefined, "left", 500)
	tfBalance.x = -200;
	tfBalance.y = -240;
	this.addChild(tfBalance);
	var tfCards = addText(getText("cards"), 20, "#FFCC00", undefined, "left", 500)
	tfCards.x = -20;
	tfCards.y = -240;
	this.addChild(tfCards);
	this.tfName = addText("", 20, "#FFFFFF", undefined, "left", 500)
	this.tfName.x = -400;
	this.tfName.y = this._posTfY;
	this.addChild(this.tfName);
	this.tfBalance = addText("", 20, "#FFFFFF", undefined, "left", 500)
	this.tfBalance.x = -200;
	this.tfBalance.y = this._posTfY;
	this.addChild(this.tfBalance);
	this.tfCards = addText("", 20, "#FFFFFF", undefined, "left", 500)
	this.tfCards.x = -20;
	this.tfCards.y = this._posTfY;
	this.addChild(this.tfCards);
	
	this.hMask = 530;
	var zoneMask = new PIXI.Graphics();
	zoneMask.beginFill(0xFF0000).drawRect(0, 0, 800, this.hMask).endFill();
	zoneMask.x = -50-zoneMask.width/2;
	zoneMask.y = 50-zoneMask.height/2;
	this.addChild(zoneMask);
	
	this.tfName.mask = zoneMask;
	this.tfBalance.mask = zoneMask;
	this.tfCards.mask = zoneMask;
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('mouseup', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

WndHistory.prototype.show = function(ar) {
	// ar = [
			// {name:"open_channel", deposit:10000000},
			// {name:"start_game"},
			// {name:"deal", balance:5000000, house:["4"], my:["8", "Q"], split:[], transaction:-5000000},
			// {name:"stand", balance:5000000, house:["5","7","3"], my:[], split:[], transaction:0},
			// {name:"end_game"},
			// {name:"end_channel", profit:-5000000}
		// ];
	
	if(ar.length == 0){
		return;
	}
	
	var strName = "";
	var strBalance = "";
	var strCards = "";
	for (var i = 0; i < ar.length; i++) {
		var obj = ar[i];
		var cards = "";
		
		for(var tag in obj){
			var value = obj[tag];
			if(tag == "name"){
				if(value == "open_channel" || value == "end_channel"){
					strName += "* " + getText(value) + " *";
				} else if(value == "start_game" || value == "end_game"){
					strName += "----------------------------";
				} else {
					strName += getText(value);
				}
			} else if(tag == "deposit"){
				strBalance += "deposit: " + convertToken(value);
			} else if(tag == "transaction"){
				strBalance += "trans: " + convertToken(value);
			} else if(tag == "profit"){
				strBalance += "profit: " + convertToken(value);
			} else if(tag == "balance"){
				strBalance += "balance: " + convertToken(value);
			} else if(tag == "my" || tag == "split" || tag == "house"){
				if(value.length > 0){
					cards += "| "+tag+":" + value.toString()+" |";
				}
			}
		}
		strName += "\n";
		strBalance += "\n";
		strCards += cards + "\n";
	}
	
	this.tfName.setText(strName);
	this.tfBalance.setText(strBalance);
	this.tfCards.setText(strCards);
}

WndHistory.prototype.clickObj = function(item_mc, evt) {
	// sound_play("button_click");
	var name = item_mc.name
	// console.log("clickObj:", name);
	item_mc._selected = false;
	if(item_mc.over){
		item_mc.over.visible = false;
	}
	if(item_mc.overSc){
		item_mc.scale.x = 1*item_mc.sc;
		item_mc.scale.y = 1*item_mc.sc;
	}
	
	if(name == "btnClose"){
		this._prnt.closeWindow(this);
	} else if(name == "scrollZone"){
		this.scrollHead(evt);
	}
}

WndHistory.prototype.scrollHead = function(evt){
	var mouseY = evt.data.global.y - this.y;
	var posY = Math.max(mouseY, -190);
	posY = Math.min(posY, 260);
	this.headScroll.y = posY;
	
	if(this.tfName.height > this.hMask){
		var difH = this.tfName.height - this.hMask;
		var sc = (posY + 190)/450;
		var textY = this._posTfY - difH*sc;
		console.log("posY:", sc, difH*sc);
		this.tfName.y = textY;
		this.tfBalance.y = textY;
		this.tfCards.y = textY;
	}
	
}

WndHistory.prototype.checkButtons = function(evt){
	var phase = evt.type; 
	var mouseX = evt.data.global.x - this.x
	var mouseY = evt.data.global.y - this.y;
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)){
			if((item_mc.visible || item_mc.name == "scrollZone") && 
			item_mc._selected == false && item_mc.alpha == 1){
				item_mc._selected = true;
				if(item_mc.over){
					item_mc.over.visible = true;
				} else if(item_mc.overSc){
					item_mc.scale.x = 1.1*item_mc.sc;
					item_mc.scale.y = 1.1*item_mc.sc;
				}
			}
		} else {
			if(item_mc._selected){
				item_mc._selected = false;
				if(item_mc.over){
					item_mc.over.visible = false;
				} else if(item_mc.overSc){
					item_mc.scale.x = 1*item_mc.sc;
					item_mc.scale.y = 1*item_mc.sc;
				}
			}
		}
	}
	
	if((phase=='touchstart' || phase == 'mousedown') && this.headScroll._selected){
		this._pressHead = true;
	}
}

WndHistory.prototype.touchHandler = function(evt){	
	if(!this.visible){
		return false;
	}
	// mousedown , mousemove
	// touchstart, touchmove, touchend
	var phase = evt.type; 
	var item_mc; //MovieClip
	var i = 0;
	
	if(phase=='mousemove' || phase == 'touchmove' || 
	phase == 'touchstart' || phase == 'mousedown'){
		if(this._pressHead){
			this.scrollHead(evt);
			return;
		}
		this.checkButtons(evt);
	} else if (phase == 'mouseup' || phase == 'touchend') {
		this._pressHead = false;
		for (i = 0; i < this._arButtons.length; i ++) {
			item_mc = this._arButtons[i];
			if((item_mc.visible || item_mc.name == "scrollZone") && item_mc._selected){
				this.clickObj(item_mc, evt);
				return;
			}
		}
	}
}

WndHistory.prototype.removeAllListener = function(){
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('mouseup', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
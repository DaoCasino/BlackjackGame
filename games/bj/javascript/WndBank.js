function WndBank(_prnt, maxBet) {
	PIXI.Container.call( this );
	this.init(_prnt, maxBet);
}

WndBank.prototype = Object.create(PIXI.Container.prototype);
WndBank.prototype.constructor = WndBank;

WndBank.prototype.init = function(_prnt, maxBet) {
	this._prnt = _prnt;
	this._callback = undefined;
	this._arButtons= [];
	this._pressHead = false;
	this._curBet = 0;
	this._maxBet = maxBet;
	
	var rect = new PIXI.Graphics();
	rect.beginFill(0x000000).drawRect(-_W/2, -_H/2, _W, _H).endFill();
	rect.alpha = 0.5;
	this.addChild(rect);
	
	var bg = addObj("wndInfo",0,0,0.3);
	this.addChild(bg);
	
	var posLineY = 50;
	var thinLine = new PIXI.Graphics();
	thinLine.lineStyle(2, 0xffffff)
	thinLine.moveTo(-200, posLineY)
		   .lineTo(200, posLineY);
	this.addChild(thinLine);
	var fatLine = new PIXI.Graphics();
	fatLine.lineStyle(7, 0xffffff)
	fatLine.moveTo(-200, posLineY)
		   .lineTo(200, posLineY);
	this.addChild(fatLine);
	this.fatLine = fatLine;
	this.fatLine.scale.x = 0;
	
	var btnClose = addButton("btnClose", 230, -150, 0.5);
	this.addChild(btnClose);
	this._arButtons.push(btnClose);
	var btnOk = addButton("btnGreen", 0, 140, 0.75);
	this.addChild(btnOk);
	btnOk.alpha = 0.5;
	this._arButtons.push(btnOk);
	this.btnOk = btnOk;
	var headScroll = addButton("headScroll", -200, posLineY, 1);
	this.addChild(headScroll);
	this._arButtons.push(headScroll);
	this.headScroll = headScroll;
	
	btnClose.interactive = true;
	btnClose.buttonMode=true;
	btnClose.overSc=true;
	btnOk.interactive = true;
	btnOk.buttonMode=true;
	btnOk.overSc=true;
	headScroll.interactive = true;
	headScroll.buttonMode=true;
	
	this.tf = addText("", 26, "#FFCC00", "#000000", "center", 500, 3)
	this.tf.y = -120;
	this.addChild(this.tf);
	var tfOk = addText("OK", 34, "#FFFFFF", undefined, "center", 350)
	tfOk.y = - tfOk.height/2;
	btnOk.addChild(tfOk);
	var tfBet = addText("0 BET", 40, "#FFFFFF", undefined, "center", 350)
	tfBet.y = -5- tfBet.height/2;
	this.addChild(tfBet);
	this.tfBet = tfBet;
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('mouseup', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

function convertToken(value){
	var val = value/valToken;
	return val;
}

WndBank.prototype.show = function(str, callback, maxBet) {
	this._callback = callback;
	this.tf.setText(str);
	this._maxBet = maxBet;
}

WndBank.prototype.clickObj = function(item_mc) {
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
	
	if(name == "btnGreen"){
		if(this._callback){
			this._callback(this._curBet);
		}
		this._prnt.closeWindow(this);
	} else if(name == "btnClose"){
		this._prnt.closeWindow(this);
	}
}

WndBank.prototype.scrollHead = function(evt){
	var mouseX = evt.data.global.x - this.x;
	var posX = Math.max(mouseX, -200);
	posX = Math.min(posX, 200);
	this.headScroll.x = posX;
	
	var sc = (posX + 200)/400;
	this.fatLine.x = -200 + 200*sc;
	this.fatLine.scale.x = sc;
	
	if(posX > -200){
		this.btnOk.alpha = 1;
	} else {
		this.btnOk.alpha = 0.5;
	}
	
	var minBet = 0;
	this._curBet = sc*this._maxBet;
	var value = toFixed(convertToken(this._curBet), 2);
	value = roundBet(value*100)
	this._curBet = value*valToken;
	this.tfBet.setText(String(value) + " BET");
}

WndBank.prototype.checkButtons = function(evt){
	var phase = evt.type; 
	var mouseX = evt.data.global.x - this.x
	var mouseY = evt.data.global.y - this.y;
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY)){
			if(item_mc.visible && item_mc._selected == false && item_mc.alpha == 1){
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

WndBank.prototype.touchHandler = function(evt){	
	if(!this.visible){
		return false;
	}
	// mousedown , mousemove, mouseup
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
			if(item_mc.visible && item_mc._selected){
				this.clickObj(item_mc);
				return;
			}
		}
	}
}

WndBank.prototype.removeAllListener = function(){
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('mouseup', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
function WndBankrolls(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

WndBankrolls.prototype = Object.create(PIXI.Container.prototype);
WndBankrolls.prototype.constructor = WndBankrolls;

WndBankrolls.prototype.init = function(_prnt) {
	this.listBanks = new PIXI.Container();
	this._prnt = _prnt;
	this._callback = undefined;
	this._arButtons = [];
	this._posTfY = -112;
	
	var rect = new PIXI.Graphics();
	rect.beginFill(0x000000).drawRect(-_W/2, -_H/2, _W, _H).endFill();
	rect.alpha = 0.5;
	this.addChild(rect);
	
	var bg = addObj("wndInfo",0,0,1,0.4,0.3);
	this.addChild(bg);
	
	var posLineX = 320;
	var stY = -120;
	var endY = 90;
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
	
	var headScroll = addButton("headScroll", posLineX, stY, 1);
	headScroll.rotation = Math.PI/2;
	this.addChild(headScroll);
	this._arButtons.push(headScroll);
	this.headScroll = headScroll;
	
	var btnOk = addButton("btnGreen", 0, 130, 0.75);
	this.addChild(btnOk);
	this._arButtons.push(btnOk);
	
	btnOk.interactive = true;
	btnOk.buttonMode=true;
	btnOk.overSc=true;
	headScroll.interactive = true;
	headScroll.buttonMode=true;
	
	var tfTitle = addText(getText("select_bankrollers"), 34, "#FFCC00", "#000000", "center", 500, 3);
	tfTitle.y = -160 - tfTitle.height/2;
	this.addChild(tfTitle);
	var tfOk = addText("OK", 26, "#FFFFFF", undefined, "center", 350)
	tfOk.y = - tfOk.height/2;
	btnOk.addChild(tfOk);
	
	this.listBanks.y = this._posTfY;
	this.addChild(this.listBanks);
	
	this.hMask = 200;
	var zoneMask = new PIXI.Graphics();
	zoneMask.alpha= 0.5;
	zoneMask.beginFill(0xFF0000).drawRect(0, 0, 600, this.hMask).endFill();
	zoneMask.x = -50-zoneMask.width/2;
	zoneMask.y = -30-zoneMask.height/2;
	this.addChild(zoneMask);
	
	this.listBanks.mask = zoneMask;
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('mouseup', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

WndBankrolls.prototype.show = function(ar) {
	// ar = [
			// "0xe26b3678fef015f3122e78f9d85b292ce45975b1", 
			// "0xa2c89aac657b2f8f0df83635e7ceb05fcd6bf6f8",
			// "0xe26b3678fef015f3122e78f9d85b292ce45975b1", 
			// "0xa2c89aac657b2f8f0df83635e7ceb05fcd6bf6f8",
			// "0xe26b3678fef015f3122e78f9d85b292ce45975b1", 
			// "0xa2c89aac657b2f8f0df83635e7ceb05fcd6bf6f8",
			// "0xe26b3678fef015f3122e78f9d85b292ce45975b1", 
			// "0xa2c89aac657b2f8f0df83635e7ceb05fcd6bf6f8"
		// ];
	
	if(ar.length == 0){
		return;
	}
	
	for (var i = 0; i < ar.length; i++) {
		var obj = ar[i];
		this.addBankroller(i, obj);
		
		/*for(var tag in obj){
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
			}
		}*/
	}
	
	if(this.listBanks.height <= this.hMask){
		this.headScroll.visible = false;
	}
}

WndBankrolls.prototype.addBankroller = function(i, obj){
	var item = new PIXI.Container();
	item.name = "bankroller";
	item.id = obj;
	item.x = -50;
	item.y = i*40;
	item.w = 600;
	item.h = 35;
	item._selected = false;
	item.interactive = true;
	item.buttonMode=true;
	this.listBanks.addChild(item);
	
	var bg = new PIXI.Graphics();
	if(i%2==0){
		bg.alpha= 0.1;
	} else {
		bg.alpha= 0.15;
	}
	bg.beginFill(0xFFFFFF).drawRect(0, 0, item.w, item.h).endFill();
	bg.x = -bg.width/2;
	bg.y = -bg.height/2;
	item.addChild(bg);
	var bgSelect = new PIXI.Graphics();
	bgSelect.beginFill(0xFFCC00).drawRect(0, 0, item.w, item.h).endFill();
	bgSelect.alpha= 0.5;
	bgSelect.x = -bgSelect.width/2;
	bgSelect.y = -bgSelect.height/2;
	item.addChild(bgSelect);
	var bgOver = new PIXI.Graphics();
	bgOver.lineStyle(3, 0xFFFFFF, 1);
	bgOver.drawRect(2, 2, 596, 31);
	bgOver.x = -bgOver.width/2;
	bgOver.y = -bgOver.height/2;
	bgOver.visible = false;
	item.addChild(bgOver);
	
	var tfName = addText(obj, 20, "#FFFFFF", undefined, "left", 400)
	tfName.x = -280;
	tfName.y = -tfName.height/2+2;
	item.addChild(tfName);
	
	item.sel = bgSelect;
	item.over = bgOver;
	
	if(i > 0){
		bgSelect.visible = false;
	} else {
		this._selectedBank = item;
		addressChannel = item.id;
	}
	
	this._arButtons.push(item);
}

WndBankrolls.prototype.selectBankroller = function(item_mc){
	if(item_mc.sel.visible){
		return;
	}
	this._selectedBank.sel.visible = false;
	item_mc.sel.visible = true;
	this._selectedBank = item_mc;
	addressChannel = item_mc.id;
}

WndBankrolls.prototype.clickObj = function(item_mc, evt) {
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
		this._prnt.startGame();
	} else if(name == "scrollZone"){
		this.scrollHead(evt);
	} else if(name == "bankroller"){
		this.selectBankroller(item_mc);
	}
}

WndBankrolls.prototype.scrollHead = function(evt){
	var stY = -120;
	var endY = 90;
	var dist = Math.abs(stY) + endY;
	var mouseY = evt.data.global.y - this.y;
	var posY = Math.max(mouseY, stY);
	posY = Math.min(posY, endY);
	this.headScroll.y = posY;
	
	if(this.listBanks.height > this.hMask){
		var difH = this.listBanks.height - this.hMask;
		var sc = (posY - stY)/dist;
		var textY = this._posTfY - difH*sc;
		this.listBanks.y = textY;
	}
}

WndBankrolls.prototype.checkButtons = function(evt){
	var phase = evt.type; 
	var mouseX = evt.data.global.x - this.x
	var mouseY = evt.data.global.y - this.y;
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(item_mc.name == "bankroller"){
			mouseY = evt.data.global.y - this.y - this.listBanks.y;
		}
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

WndBankrolls.prototype.touchHandler = function(evt){	
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

WndBankrolls.prototype.removeAllListener = function(){
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('mouseup', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
function WndBankrolls(_prnt, callback) {
	PIXI.Container.call( this );
	this.init(_prnt, callback);
}

WndBankrolls.prototype = Object.create(PIXI.Container.prototype);
WndBankrolls.prototype.constructor = WndBankrolls;

var _this;

WndBankrolls.prototype.init = function(_prnt, callback) {
	_this = this;
	this.listBanks = new PIXI.Container();
	this._prnt = _prnt;
	this._callback = callback;
	this._arButtons = [];
	this._arBankrollers = [];
	this._arSelected = [];
	this._posTfY = -112;
	this._countBank = 1;
	this._selectB = false;
	
	var rect = new PIXI.Graphics();
	rect.beginFill(0x000000).drawRect(-_W/2, -_H/2, _W, _H).endFill();
	rect.alpha = 0.5;
	this.addChild(rect);
	
	var bg = addObj("wndInfo",0,0,1,0.45,0.3);
	this.addChild(bg);
	
	var loading = new ItemLoading(this);
	this.addChild(loading);
	this.loading = loading;
	
	var posLineX = 370;
	this.stY = -120;
	this.endY = 90;
	this.distSc = Math.abs(this.stY) + this.endY;
	var thinLine = new PIXI.Graphics();
	thinLine.lineStyle(2, 0xffffff)
	thinLine.moveTo(posLineX, this.stY)
		   .lineTo(posLineX, this.endY);
	this.addChild(thinLine);
	
	var scrollZone = new PIXI.Container();
	this.addChild(scrollZone);
	var zone = new PIXI.Graphics();
	zone.beginFill(0xFF0000).drawRect(0, 0, 50, this.endY-this.stY).endFill();
	zone.x = -zone.width/2;
	zone.y = -zone.height/2;
	scrollZone.addChild(zone);
	scrollZone.w = 50;
	scrollZone.h = this.endY-this.stY;
	scrollZone.x = posLineX;
	scrollZone.y = this.stY+scrollZone.h/2;
	scrollZone.name = "scrollZone";
	scrollZone.visible = false;
	scrollZone._selected = false;
	this._arButtons.push(scrollZone);
	
	var headScroll = addButton("headScroll", posLineX, this.stY, 1);
	headScroll.rotation = Math.PI/2;
	this.addChild(headScroll);
	this._arButtons.push(headScroll);
	this.headScroll = headScroll;
	
	var btnOk = addButton("btnGreen", 0, 130, 0.75);
	btnOk.name = "btnOk";
	this.addChild(btnOk);
	this._arButtons.push(btnOk);
	var btnRefresh = addButton("btnRed", -150, 130, 0.75);
	btnRefresh.name = "btnRefresh";
	this.addChild(btnRefresh);
	this._arButtons.push(btnRefresh);
	
	btnRefresh.visible = false;
	btnOk.visible = false;
	
	btnOk.interactive = true;
	btnOk.buttonMode=true;
	btnOk.overSc=true;
	btnRefresh.interactive = true;
	btnRefresh.buttonMode=true;
	btnRefresh.overSc=true;
	headScroll.interactive = true;
	headScroll.buttonMode=true;
	
	var tfTitle = addText(getText("select_bankrollers"), 34, "#FFCC00", "#000000", "center", 500, 3);
	tfTitle.y = -160 - tfTitle.height/2;
	this.addChild(tfTitle);
	this.tfTitle = tfTitle;
	var tfOk = addText("OK", 26, "#FFFFFF", undefined, "center", 350)
	tfOk.y = - tfOk.height/2;
	btnOk.addChild(tfOk);
	var tfRefresh = addText(getText("refresh"), 26, "#FFFFFF", undefined, "center", 350)
	tfRefresh.y = - tfRefresh.height/2;
	btnRefresh.addChild(tfRefresh);
	
	this.btnOk = btnOk;
	this.btnRefresh = btnRefresh;
	
	this.listBanks.y = this._posTfY;
	this.addChild(this.listBanks);
	
	this.hMask = 200;
	var zoneMask = new PIXI.Graphics();
	zoneMask.alpha= 0.5;
	zoneMask.beginFill(0xFF0000).drawRect(0, 0, 700, this.hMask).endFill();
	zoneMask.x = -30-zoneMask.width/2;
	zoneMask.y = -29-zoneMask.height/2;
	this.addChild(zoneMask);
	
	this.listBanks.mask = zoneMask;
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('mouseup', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
	window.addEventListener('wheel', this.mouseWheel);
}

WndBankrolls.prototype.clearList = function() {
	this._arButtons = [this.btnOk, this.btnRefresh];
	
	for (var i = 0; i < this._arBankrollers.length; i++) {
		var item = this._arBankrollers[i];
		this.listBanks.removeChild(item);
		item = undefined;
	}
	this._arBankrollers = [];
	this._arSelected = [];
}

WndBankrolls.prototype.show = function() {
	this.clearList();
	var ar = Casino.getBankrollers('BJ');
	var arAdr = Object.keys(ar);
	var load = false;
	
	// console.log("showBankrolls:", arAdr);
	// ar = ["0xe26b3678fef015f3122e78f9d85b292ce45975b1"];
	this.loading.visible = (arAdr.length == 0);
	
	if(arAdr.length == 0){
		this.tfTitle.setText(getText("search_bankrollers"));
		this.headScroll.visible = false;
		this.btnOk.visible = false;
		return;
	}
	
	var blacklist = ["0xc6dc32b6bbcfb2ef17fb3042be3a138528caaecc"];
	for (var i = 0; i < arAdr.length; i++) {
		for (var j = 0; j < blacklist.length; j++) {
			if(arAdr[i] == blacklist[j]){
				arAdr.splice(i, 1);
			}
		}
	}
	
	if(login_obj["addressBankroller"] && login_obj["openChannel"]){
		var adr = login_obj["addressBankroller"];
		
		if(arAdr.indexOf(adr)>-1){
			load = true;
			addressChannel = adr;
			addressContract = addressChannel;
			arAdr = [addressContract];
			this.tfTitle.setText(getText("continue_game"));
		}
	}
	
	this._countBank = arAdr.length;
	
	this.btnOk.visible = true;
	this._selectB = false;
	
	var i = 0;
	for(var tag in ar){
		var obj = ar[tag];
		this.addBankroller(i, tag, obj);
		i ++;
	}
	
	this.headScroll.visible = (this.listBanks.height > this.hMask);
	
	if(!this._selectB && this._arBankrollers.length > 0){
		this._selectB = true;
		var item = this._arBankrollers[0];
		item.sel.visible = true;
		addressChannel = item.id;
		this._selectedBank = item;
		this._arSelected.push(item);
	}
	
	addressContract = addressChannel;
}

WndBankrolls.prototype.addBankroller = function(i, adr, obj){
	var item = new PIXI.Container();
	item.name = "bankroller";
	item.id = adr;
	item.x = -30;
	item.y = 1+i*40;
	item.w = 700;
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
	bgOver.drawRect(2, 2, item.w-4, 31);
	bgOver.x = -bgOver.width/2;
	bgOver.y = -bgOver.height/2;
	bgOver.visible = false;
	item.addChild(bgOver);
	
	var tfName = addText(adr, 20, "#FFFFFF", undefined, "left", 400)
	tfName.x = -320;
	tfName.y = -tfName.height/2+2;
	item.addChild(tfName);
	
	// console.log("----------------------------")
	for(var tag in obj){
		var value = obj[tag];
		// console.log("obj:", tag, value);
		if(value){
			if(tag == "stat"){
				if(value.game){
					var tfBank = addText(value.game.balance, 20, "#4AFF2F", undefined, "left", 100)
					tfBank.x = 250;
					tfBank.y = -tfBank.height/2+2;
					item.addChild(tfBank);
				}
				if(value.players_now){
					var tfUser = addText(value.players_now, 20, "#2AE1FF", undefined, "left", 100)
					tfUser.x = 190;
					tfUser.y = -tfUser.height/2+2;
					item.addChild(tfUser);
				}
			}
		}
	}
	
	item.sel = bgSelect;
	item.over = bgOver;
	
	if(this._selectedBank){
		if(this._selectedBank.id == item.id){
			this._selectB = true;
			this._arSelected.push(item);
		} else {
			bgSelect.visible = false;
		}
	} else {
		if(i > 0){
			bgSelect.visible = false;
		} else {
			this._selectB = true;
			this._selectedBank = item;
			this._arSelected.push(item);
			addressChannel = item.id;
		}
	}
	
	this._arButtons.push(item);
	this._arBankrollers.push(item);
}

WndBankrolls.prototype.selectBankroller = function(item_mc){
	if(this._selectedBank == item_mc){
		return;
	}
	
	for (var i = 0; i < this._arSelected.length; i++) {
		var item = this._arSelected[i];
		item.sel.visible = false;
	}
	
	item_mc.sel.visible = true;
	this._arSelected.push(item_mc);
	this._selectedBank = item_mc;
	addressChannel = item_mc.id;
	addressContract = addressChannel;
}

WndBankrolls.prototype.update = function(diffTime) {
	this.loading.update(diffTime);
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
	
	if(name == "btnOk"){
		this._callback();
	} else if(name == "btnRefresh"){
		this.show();
	} else if(name == "scrollZone"){
		this.mouseBtn(evt);
	} else if(name == "bankroller"){
		this.selectBankroller(item_mc);
	}
}

WndBankrolls.prototype.mouseWheel = function(evt){
	var count = Math.max(_this._countBank - 5, 1);
	var offset = -_this.distSc/count;
	var mouseY = _this.headScroll.y + offset;
	if(evt.deltaY > 0){
		mouseY = _this.headScroll.y - offset;
	}
	_this.scrollHead(mouseY);
}

WndBankrolls.prototype.mouseBtn = function(evt){
	var mouseY = evt.data.global.y - this.y;
	this.scrollHead(mouseY);
}

WndBankrolls.prototype.scrollHead = function(mouseY){
	var posY = Math.max(mouseY, this.stY);
	posY = Math.min(posY, this.endY);
	this.headScroll.y = posY;
	
	if(this.listBanks.height > this.hMask){
		var difH = this.listBanks.height - this.hMask;
		var sc = (posY - this.stY)/this.distSc;
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
			this.mouseBtn(evt);
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
	window.addEventListener('wheel', this.mouseWheel);
}
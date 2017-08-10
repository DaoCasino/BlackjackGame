function ScrMenu() {
	PIXI.Container.call( this );
	this.init();
}

ScrMenu.prototype = Object.create(PIXI.Container.prototype);
ScrMenu.prototype.constructor = ScrMenu;

var TIME_GET_STATE = 10000;

var _prnt;

ScrMenu.prototype.init = function() {
	_prnt = this;
	this._arButtons = [];
	this._timeGetState = 0;
	
	this.bg = addObj("bgMenu", _W/2, _H/2);
	this.bg.scale.x =  _W/this.bg.w;
	this.bg.scale.y =  _H/this.bg.h;
	this.addChild(this.bg);
	
	var btnSingle = addButton("btnDefault", _W/2, _H/2+100);
	btnSingle.name = "btnSingle";
	btnSingle.interactive = true;
	btnSingle.buttonMode=true;
	btnSingle.overSc = true;
	this.addChild(btnSingle);
	this._arButtons.push(btnSingle);
	var tf = addText(getText("single_mode"), 24, "#FFFFFF", undefined, "center", 350, 2)
	tf.x = 0;
	tf.y = -tf.height/2;
	btnSingle.addChild(tf);
	
	var btnMultiplayer = addButton("btnDefault", _W/2, _H/2+220);
	btnMultiplayer.name = "btnMultiplayer";
	btnMultiplayer.interactive = true;
	btnMultiplayer.buttonMode=true;
	btnMultiplayer.overSc = true;
	this.addChild(btnMultiplayer);
	this._arButtons.push(btnMultiplayer);
	var tf = addText(getText("multiplayer_mode"), 24, "#FFFFFF", undefined, "center", 350, 2)
	tf.x = 0;
	tf.y = -tf.height/2;
	btnMultiplayer.addChild(tf);
	
	var tfWait = addText("Please wait. \n Loading game.", 26, "#FFCC00", "#000000", "center", 500, 3)
	tfWait.x = btnSingle.x;
	tfWait.y = btnSingle.y - tfWait.height;
	this.addChild(tfWait);
	var loading = new ItemLoading(this);
	loading.x = _W/2;
	loading.y = _H/2+120;
	this.addChild(loading);
	this.loading = loading;
	
	tfWait.visible = false;
	loading.visible = false;
	
	// if(!options_debug){
		// _prnt.showBankrolls();
		// btnSingle.visible = false;
	// }
	
	var str1 = "This game is a proof of concept and intended for test purposes. It is based on experimental software.";
	var str2 = "In no respect shall this game or its authors incur any liability for the loss of ether.";
	var str3 = "Players who access this game from other jurisdictions do so at their own volition and are responsible for compliance with local law.";
	var str4 = "This program comes with ABSOLUTELY NO WARRANTY.";
	
	var tf3 = addText(str3, 16, "#FFFFFF", "#0000000", "center", _W, 3)
	tf3.x = _W/2;
	tf3.y = _H - tf3.height-20;
	this.addChild(tf3);
	var tf2 = addText(str2, 16, "#FFFFFF", "#0000000", "center", _W, 3)
	tf2.x = _W/2;
	tf2.y = tf3.y - tf2.height;
	this.addChild(tf2);
	var tf1 = addText(str1, 16, "#FFFFFF", "#0000000", "center", _W, 3)
	tf1.x = _W/2;
	tf1.y = tf2.y - tf1.height;
	this.addChild(tf1);
	
	this.interactive = true;
	this.on('mouseup', this.touchHandler);
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrMenu.prototype.showBankrolls = function(){
	this._wndList = new WndBankrolls(this, _prnt.startGame);
	this._wndList.x = _W/2;
	this._wndList.y = _H/2;
	this.addChild(this._wndList);
	this._wndList.show();
}

ScrMenu.prototype.startGame = function(){
	if(_prnt._wndList){
		_prnt._wndList.visible = false;
	}
	_prnt.removeAllListener();
	showSpeedGame();
}

// UPDATE
ScrMenu.prototype.update = function(diffTime){
	this.loading.update(diffTime);
	
	if(this._wndList){
		this._timeGetState += diffTime;
		this._wndList.update(diffTime);
		if(this._timeGetState >= TIME_GET_STATE){
			this._timeGetState = 0;
			this._wndList.show();
		}
	}
}

ScrMenu.prototype.clickCell = function(item_mc) {
	if(item_mc.name.search("btn") != -1){
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
	}
	
	if(item_mc.name == "btnNormal"){
		if(!passwordUser){
			passwordUser = prompt("enter your password");
		}
		this.removeAllListener();
		options_speedgame = false;
		showGame();
	} else if(item_mc.name == "btnSingle"){
		this.removeAllListener();
		options_multiplayer = false;
		gameCode = "BJ";
		localStorage.game_code = gameCode;
		showSpeedGame();
	} else if(item_mc.name == "btnMultiplayer"){
		this.removeAllListener();
		options_multiplayer = true;
		gameCode = "BJ_m";
		localStorage.game_code = gameCode;
		showSpeedGame();
	}
}

ScrMenu.prototype.checkButtons = function(evt){
	var mouseX = evt.data.global.x;
	var mouseY = evt.data.global.y;
	
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY) &&
		item_mc.visible && item_mc.dead != true){
			if(item_mc._selected == false){
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
}

ScrMenu.prototype.touchHandler = function(evt){
	if(this.bWindow){
		return false;
	}
	var phase = evt.type;
	
	if(phase=='mousemove' || phase == 'touchmove' || phase == 'touchstart' || phase == "mousedown"){
		this.checkButtons(evt);
	} else if (phase == 'mouseup' || phase == 'touchend') {
		for (var i = 0; i < this._arButtons.length; i++) {
			var item_mc = this._arButtons[i];
			if(item_mc._selected){
				this.clickCell(item_mc);
				return;
			}
		}
	}
}

ScrMenu.prototype.removeAllListener = function(){
	if(this._wndList){
		this._wndList.removeAllListener();
	}
	this.interactive = false;
	this.off('mouseup', this.touchHandler);
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
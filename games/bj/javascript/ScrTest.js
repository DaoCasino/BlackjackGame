function ScrTest() {
	PIXI.Container.call( this );
	this.init();
}

ScrTest.prototype = Object.create(PIXI.Container.prototype);
ScrTest.prototype.constructor = ScrTest;

var TIME_GET_STATE = 1000;

var _self;
var _room;
var _arUsers = [];
var _timeGetState = 0;

ScrTest.prototype.init = function() {
	_self = this;
	this._arButtons = [];
	
	var rect = new PIXI.Graphics();
	rect.beginFill(0xffffff).drawRect(0, 0, _W, _H).endFill();
	this.addChild(rect);
	
	var tfTitle = addText(getText("multiplayer"), 34, "#FFCC00", "#000000", "center", 500, 3);
	tfTitle.x = _W/2;
	tfTitle.y = 50 - tfTitle.height/2;
	this.addChild(tfTitle);
	var tfMyNick = addText(getText("myKey"), 34, "#217215");
	tfMyNick.x = _W/2;
	tfMyNick.y = _H - 150 - tfMyNick.height/2;
	this.addChild(tfMyNick);
	this.tfMyNick = tfMyNick;
	var tfUsersNick = addText(getText("usersKey"), 34, "#723213");
	tfUsersNick.x = _W/2;
	tfUsersNick.y = 150 - tfUsersNick.height/2;
	this.addChild(tfUsersNick);
	this.tfUsersNick = tfUsersNick;
	var tfMyRnd = addText("0", 50, "#217215");
	tfMyRnd.x = _W/2;
	tfMyRnd.y = _H/2 + 100 - tfMyRnd.height/2;
	this.addChild(tfMyRnd);
	this.tfMyRnd = tfMyRnd;
	var tfUserRnd = addText("0", 50, "#723213");
	tfUserRnd.x = _W/2;
	tfUserRnd.y = _H/2 - 100 - tfUserRnd.height/2;
	this.addChild(tfUserRnd);
	this.tfUserRnd = tfUserRnd;
	this.createBtn();
	
	_room = new RoomJS();
	_room.addUser(openkey, 0);
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrTest.prototype.refreshUser = function(arUsers){
	if(_arUsers != arUsers){
		_arUsers = arUsers;
		var strUsers = "";
		for (var i = 0; i < _arUsers.length; i++) {
			var user = _arUsers[i];
			if(user.address == openkey){
				_self.tfMyNick.setText(openkey);
			} else {
				strUsers += user.address + "\n";
			}
		}
		if(strUsers == ""){
			strUsers = getText("usersKey");
		}
		_self.tfUsersNick.setText(strUsers);
	}
}

// UPDATE
ScrTest.prototype.update = function(diffTime){
	if(options_pause){
		return false;
	}
	
	_timeGetState += diffTime;
	if(_timeGetState >= TIME_GET_STATE){
		_timeGetState = 0;
		_self.refreshUser(_room.getUsers());
	}
}

///////////////////-----


ScrTest.prototype.createBtn = function() {
	var scGui = 0.5;
	this.btnDeal = this.createButton2("btnDeal", "deal", _W/2, _H-300, scGui);
	this.btnStand = this.createButton2("btnStand", "stand", _W/2, 300, scGui);
	this.btnStand.alpha = 0.5;
}

ScrTest.prototype.createButton2 = function(name, title, x, y, sc) {
	if(sc){}else{sc=1}
	
	var btn = addButton(name, x, y, sc);
	btn.interactive = true;
	btn.buttonMode=true;
	btn.overSc=true;
	btn.disabled=false;
	this.addChild(btn);
	this._arButtons.push(btn);
	
	var tf = addText(getText(title), 46, "#FFFFFF", "#000000", "center", 200, 6)
	tf.x = 0;
	tf.y = 120;
	btn.addChild(tf);
	
	return btn;
}

ScrTest.prototype.clickDeal = function() {
	if(this.btnStand.alpha == 0.5){
		this.tfMyRnd.setText(Math.ceil(Math.random()*100));
		this.btnStand.alpha = 1;
		this.btnDeal.alpha = 0.5;
	}
}

ScrTest.prototype.clickStand = function() {
	if(this.btnDeal.alpha == 0.5){
		this.tfUserRnd.setText(Math.ceil(Math.random()*100));
		this.btnDeal.alpha = 1;
		this.btnStand.alpha = 0.5;
	}
}

// CLICK
ScrTest.prototype.clickCell = function(item_mc) {
	var name = item_mc.name;
	if(item_mc.name.search("btn") != -1){
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
	}
	if(item_mc.overSc){
		item_mc.scale.x = 1*item_mc.sc;
		item_mc.scale.y = 1*item_mc.sc;
	}
	
	if(item_mc.name == "btnDeal"){
		this.clickDeal();
	} else if(item_mc.name == "btnStand"){
		this.clickStand();
	}
}

ScrTest.prototype.checkButtons = function(evt){
	var mouseX = evt.data.global.x;
	var mouseY = evt.data.global.y;
	
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, mouseX, mouseY) &&
		item_mc.visible && item_mc.dead != true){
			if(item_mc.disabled != true && item_mc.alpha == 1){
				if(item_mc._selected == false){
					item_mc._selected = true;
					if(item_mc.over){
						item_mc.over.visible = true;
					} else if(item_mc.overSc){
						item_mc.scale.x = 1.1*item_mc.sc;
						item_mc.scale.y = 1.1*item_mc.sc;
					}
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

ScrTest.prototype.touchHandler = function(evt){
	var phase = evt.type;
	
	if(phase=='mousemove' || phase == 'touchmove' || phase == 'touchstart'){
		this.checkButtons(evt);
	} else if (phase == 'mousedown' || phase == 'touchend') {
		for (var i = 0; i < this._arButtons.length; i++) {
			var item_mc = this._arButtons[i];
			if(item_mc._selected){
				this.clickCell(item_mc);
				return;
			}
		}
	}
}

ScrTest.prototype.removeAllListener = function(){	
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}

function ItemUsers(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

ItemUsers.prototype = Object.create(PIXI.Container.prototype);
ItemUsers.prototype.constructor = ItemUsers;

ItemUsers.prototype.init = function(_prnt) {
	this._prnt        = _prnt;
	this._arUsers     = {};
	this._arHolder    = [];
	this._arNewCards  = [];
	this._arHideCards = [];
}

ItemUsers.prototype.addUser = function(id) {
	var countUsers = Object.keys(this._arUsers).length

	if(countUsers >= 2){
		return false;
	}

	var offset = 550;
	var user = new ItemUser(this, countUsers);
	user.y = _H/2+160;
	// test
	// user.responseServer({"arMyCards":[12, 4],
				// "arMySplitCards":[]});
	this.addChild(user);
	this._arUsers[id] = user;
	if (Object.keys(this._arUsers).length==1) {
		user.x = _W/2 - offset;
		user._side = "left";
	} else {
		user.x = _W/2 + offset;
		user._side = "right";
	}
}

ItemUsers.prototype.updateShowBtn = function(timeShowButtons) {
	this._prnt.updateShowBtn(timeShowButtons);
}

ItemUsers.prototype.getUser = function(id) {
	var user = this._arUsers[id];
	return user;
}

// SERVER
ItemUsers.prototype.responseServer = function(id, curGame) {
	var user = this._arUsers[id];
	user.responseServer(curGame);
}

ItemUsers.prototype.update = function(diffTime) {
	for(var i in this._arUsers){
		var user = this._arUsers[i];
		user.update(diffTime);
	}
}
function ItemUsers(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

ItemUsers.prototype = Object.create(PIXI.Container.prototype);
ItemUsers.prototype.constructor = ItemUsers;

ItemUsers.prototype.init = function(_prnt) {
	this._prnt        = _prnt;
	this._arUsers     = {};
	this._arTagUsers     = {};
	this._arHolder    = [];
	this._arNewCards  = [];
	this._arHideCards = [];
}

ItemUsers.prototype.addUser = function(address, id) {
	var countUsers = Object.keys(this._arUsers).length

	if(countUsers >= 2){
		return false;
	}

	var offset = 550;
	var user = new ItemUser(this, countUsers, address);
	user.y = _H/2+160;
	this.addChild(user);
	this._arUsers[id] = user;
	this._arTagUsers[address] = user;
	if (Object.keys(this._arUsers).length==1) {
		user.x = _W/2 - offset;
		user._side = "left";
	} else {
		user.x = _W/2 + offset;
		user._side = "right";
	}
	
	return {x:user.x, y:user.y};
}

ItemUsers.prototype.updateShowBtn = function(timeShowButtons) {
	this._prnt.updateShowBtn(timeShowButtons);
}

ItemUsers.prototype.getUser = function(id) {
	var user = this._arUsers[id];
	return user;
}

ItemUsers.prototype.getTagUser = function(address) {
	return this._arTagUsers[address];
}

ItemUsers.prototype.removeUser = function(address) {
	var user = this._arTagUsers[address];
	user.clearGame();
	this.removeChild(user);
	user = undefined;
	delete(this._arUsers[address]);
	delete(this._arTagUsers[address]);
}

ItemUsers.prototype.clearUsers = function() {
	for(var key in this._arUsers){
		this._arUsers[key].clearGame();
	}
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
function ItemUsers(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

ItemUsers.prototype = Object.create(PIXI.Container.prototype);
ItemUsers.prototype.constructor = ItemUsers;

ItemUsers.prototype.init = function(_prnt) {
	this._arUsers = [];
	this._arHolder = [];
	this._arNewCards = [];
	this._arHideCards = [];
}

ItemUsers.prototype.addUser = function(id) {
	if(this._arUsers.length > 1){
		return false;
	}
	var offset = 550;
	var user = new ItemUser(this, this._arUsers.length);
	user.y = _H/2+160;
	// test
	// user.responseServer({"arMyCards":[12, 4],
				// "arMySplitCards":[]});
	// user.fillChips(valToken);
	// user.fillChips(valToken, "split");
	this.addChild(user);
	this._arUsers[id] = user;
	switch(this._arUsers.length){
		case 1:
			user.x = _W/2 - offset;
			break;
		case 2:
			user.x = _W/2 + offset;
			break;
	}
}

// ItemUsers.prototype.userSplit = function() {
	// var user = this._arUsers[1];
	// if(user && user._bSplit){
		// user.y = _H/2+220;
		// console.log("secondUserSplit 2:", user.y);
	// }
// }

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
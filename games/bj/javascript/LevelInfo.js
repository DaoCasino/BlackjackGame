function LevelInfo(delay) {
	PIXI.Container.call( this );
	this.init(delay);
}

LevelInfo.prototype = new MovieClip();


LevelInfo.prototype.init = function(delay) {
	if(delay){}else{delay=60}
	this.a = new PIXI.Container();
	this.addChild(this.a);
	
	var str = getText("your_turn");
	var tf = addText(str, 60, "#EC8018", "#0000000", "center", 300, 4, fontArchivo);
	this.a.addChild(tf);
	
	this.d = delay
	this.alpha = 0
	this.x = _W / 2
	this.y = _H / 2 + 20
	this.yy = this.y - 50
	
	arClips.push(this);
}

LevelInfo.prototype.loop = function() {
	if(this.d > 10){
		this.y = this.y + (this.yy - this.y) / 4;
		this.alpha = Math.min(1, this.alpha + 0.1)
	} else {
		this.y -= 3;
		this.alpha = Math.max(0, this.alpha - 0.1)
	}
	this.d--, !this.d ? (this.die()) : (undefined);
}
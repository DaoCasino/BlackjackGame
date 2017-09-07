function ItemLoading(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

ItemLoading.prototype = Object.create(PIXI.Container.prototype);
ItemLoading.prototype.constructor = ItemLoading;

const TIME_STEP = 150;

ItemLoading.prototype.init = function(_prnt) {
	this._arCircles = [];
	this._timeStep = 0;
	this._num = 0;
	var w = 150;
	var count = 6;
	var step = w/count;
	
	for (var i = 0; i < 6; i++) {
		var circle = new PIXI.Graphics();
		circle.beginFill(0xffffff).drawCircle(0, 0, 5).endFill();
		circle.x = - w/2 + step*i;
		this.addChild(circle);
		this._arCircles.push(circle);
	}
	
}

ItemLoading.prototype.update = function(diffTime) {
	// console.log("update:!", _timeStep);
	this._timeStep += diffTime;
	if(this._timeStep > TIME_STEP){
		this._timeStep = 0;
		var prevNum = this._num - 1;
		if(prevNum < 0){
			prevNum = this._arCircles.length-1;
		}
		var circle = this._arCircles[this._num];
		circle.scale.x = 1.5;
		circle.scale.y = 1.5;
		var prevCircle = this._arCircles[prevNum];
		prevCircle.scale.x = 1;
		prevCircle.scale.y = 1;
		
		this._num ++;
		if(this._num >= this._arCircles.length){
			this._num = 0;
		}
	}
}
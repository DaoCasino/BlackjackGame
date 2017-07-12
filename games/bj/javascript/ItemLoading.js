function ItemLoading(_prnt) {
	PIXI.Container.call( this );
	this.init(_prnt);
}

ItemLoading.prototype = Object.create(PIXI.Container.prototype);
ItemLoading.prototype.constructor = ItemLoading;

const TIME_STEP = 150;

var _arCircles = [];
var _timeStep = 0;
var _num = 0;

ItemLoading.prototype.init = function(_prnt) {
	var w = 150;
	var count = 6;
	var step = w/count;
	
	for (var i = 0; i < 6; i++) {
		var circle = new PIXI.Graphics();
		circle.beginFill(0xffffff).drawCircle(0, 0, 5).endFill();
		circle.x = - w/2 + step*i;
		this.addChild(circle);
		_arCircles.push(circle);
	}
	
}

ItemLoading.prototype.update = function(diffTime) {
	_timeStep += diffTime;
	if(_timeStep > TIME_STEP){
		_timeStep = 0;
		var prevNum = _num - 1;
		if(prevNum < 0){
			prevNum = _arCircles.length-1;
		}
		var circle = _arCircles[_num];
		circle.scale.x = 1.5;
		circle.scale.y = 1.5;
		var prevCircle = _arCircles[prevNum];
		prevCircle.scale.x = 1;
		prevCircle.scale.y = 1;
		
		_num ++;
		if(_num >= _arCircles.length){
			_num = 0;
		}
	}
}
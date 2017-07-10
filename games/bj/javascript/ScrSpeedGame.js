function ScrSpeedGame() {
	PIXI.Container.call( this );
	this.init();
}

ScrSpeedGame.prototype = Object.create(PIXI.Container.prototype);
ScrSpeedGame.prototype.constructor = ScrSpeedGame;

var TIME_SHOW_BTN = 300;
var TIME_GET_STATE = 5000;
var C_DEAL = "e731240f";
var C_HIT = "a45939bf";
var C_SPLIT = "5fe71222";
var C_STAND = "7018c942";
var C_INSURANCE = "262b497d";
var C_DOUBLE = "f086fbfd";
var C_ALLOWANCE = "dd62ed3e";
var C_CONFIRM = "b00606a5";
var R_WIN = "WIN!";
var R_LOSE = "LOSE...";
var R_BUST = "BUST!";
var R_PUSH = "PUSH";
var R_BLACKJACK = "BLACKJACK";
var INSURANCE = -1;
var DEAL = 0;
var HIT = 1;
var STAND = 2;
var SPLIT = 3;
var DOUBLE = 4;
var CONFIRM = 5;
var NEWCHANNEL = 6;
var CLOSECHANNEL = 7;
var BLACKJACK = 21;

var _prnt;
var _logic;
var _curWindow;
var _wndInfo;
var _wndInsurance;
var _wndBank;
var _wndWarning;
var _callback;
var _cardSuit;
var _mixingCard;
var _objSpeedGame = {result:true, idGame:-1, curGame:{}, betGame:0, betSplitGame:0, money:0};

var urlEtherscan = "https://api.etherscan.io/";

var _startGame = false;
var _bWait = false;
var _bClear = false;
var _bStand = false;
var _bSplit = false;
var _bWindow = false;
var _bClickApprove = false;
var _bStandSplit = false;
var _bEndTurnSplit = false;
var _bOpenChannel = false;

var _minBet = 5000000;
var _maxBet = 500000000;
var _countBankrollers = 0;
var _balance = 0;
var _balanceSession = 0;
var _balancePlEth = 0;
var _balanceBank = 0;
var _betGame = 0;
var _betSplitGame = 0;
var _betGameOld = 0;
var _myPoints = 0;
var _mySplitPoints = 0;
var _valInsurance = 0;
var _scaleChip = 0.45;
var _scaleCard = 0.9;
var _allowance = 0;
var _timeCloseWnd = 0;
var _countPlayerCard = 0;
var _countSplitCard = 0;
var _countHouseCard = 0;
var _loadPlayerCard = 0;
var _loadSplitCard = 0;
var _loadHouseCard = 0;
var _lastPlayerCard = 0;
var _lastSplitCard = 0;
var _lastHouseCard = 0;
var _timeNewCard = 0;
var _timeShowButtons = 0;
var _timeGetState = 0;
var _timeMixing = 0;
var _currentMethod = -1;
var _idGame = localStorage._idGame || 0;

var _dealedCards = [];

ScrSpeedGame.prototype.init = function() {
	this.face_mc = new PIXI.Container();
	this.back_mc = new PIXI.Container();
	this.game_mc = new PIXI.Container();
	this.chips_mc = new PIXI.Container();
	this.cards_mc = new PIXI.Container();
	this.gfx_mc = new PIXI.Container();
	
	_prnt = this;
	_callback = this.response;
	this.startTime = getTimer();
	this._arButtons = [];
	this._arBtnChips = [];
	this._arChips = [];
	this._arSplitChips = [];
	this._arWinChips = [];
	this._arWinSplitChips = [];
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHousePoints = [];
	this._arHolder = [];
	this._arNewCards = [];
	
	this.bg = addObj("bgGame"+rndBg, _W/2, _H/2);
	scaleBack = _W/this.bg.w;
	this.bg.scale.x = scaleBack;
	this.bg.scale.y = scaleBack;
	this.addChild(this.bg);
	
	this.game_mc.addChild(this.chips_mc);
	this.game_mc.addChild(this.cards_mc);
	this.addChild(this.back_mc);
	this.addChild(this.game_mc);
	this.addChild(this.gfx_mc);
	this.addChild(this.face_mc);
	
	this.createGUI();
	this.createText();
	this.createBtn();
	
	if(options_rpc){
		urlEtherscan = "https://ropsten.etherscan.io/";
		addressContract = addressRpcContract;
	}else if(options_testnet){
		urlEtherscan = "https://ropsten.etherscan.io/";
		if(options_speedgame){
			addressContract = addressSpeedContract;
		} else {
			addressContract = addressTestContract;
		}
	}
	
	infura.sendRequest("getBalance", openkey, _callback);
	this.getBalancePlayer();
	this.getBalanceBank();
	this.getBalanceErc();
	this.getBankrolls();
	
	if(openkey){} else {
		this.showError(ERROR_KEY, showHome);
	}

	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrSpeedGame.prototype.createGUI = function() {
	var scGui = 0.5;
	var stepY = 50;
	var icoKey = addObj("icoKey", 40, 40, scGui);
	icoKey.interactive = true;
	icoKey.buttonMode=true;
	icoKey._selected=false;
	this.face_mc.addChild(icoKey);
	this._arButtons.push(icoKey);
	var icoEthereum = addObj("icoEthereum", 40, 40+stepY*1, scGui);
	icoEthereum.interactive = true;
	icoEthereum._selected=false;
	icoEthereum.disabled=false;
	icoEthereum.hint2 = '0 BET';
	this.icoEthereum = icoEthereum;
	this._arButtons.push(icoEthereum);
	this.face_mc.addChild(icoEthereum);
	var icoTime = addObj("icoTime", 40, 40+stepY*2, scGui);
	this.face_mc.addChild(icoTime);
	var btnFrame = addButton("btnFrame", 345, 38, 1, 1.2);
	btnFrame.name = "btnKey";
	btnFrame.interactive = true;
	btnFrame.buttonMode=true;
	this.face_mc.addChild(btnFrame);
	this._arButtons.push(btnFrame);
	this.btnFrame = btnFrame;
	
	this.seat = addObj("seat", _W/2+7, _H/2+220);
	this.seat.visible = false;
	this.back_mc.addChild(this.seat);
	var metal = addObj("metal", 566, 40, scaleBack);
	this.back_mc.addChild(metal);
	var descBet = addObj("descBet", 500, 170, scaleBack);
	this.back_mc.addChild(descBet);
	var cardsLeft = addObj("cardsLeft", 280, 340, scaleBack);
	this.back_mc.addChild(cardsLeft);
	var cardsRight = addObj("cardsRight", 1650, 205, scaleBack);
	this.back_mc.addChild(cardsRight);
	
	_mixingCard = new ItemMixing(this);
	_mixingCard.x = _W/2 + 400;
	_mixingCard.y = _H/2 - 150;
	_mixingCard.visible = false;
	this.gfx_mc.addChild(_mixingCard);
	
	var strUser = 'id'
	var fontSize = 24;
	this.tfIdUser = addText(strUser, fontSize, "#ffffff", "#000000", "left", 1000, 4)
	this.tfIdUser.x = icoKey.x + 30;
	this.tfIdUser.y = icoKey.y - 12;
	this.face_mc.addChild(this.tfIdUser);
	this.tfBalance = addText(String(_balanceSession) + " (" + String(_balance) + ")" + " BET", 
					fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfBalance.x = icoEthereum.x + 30;
	this.tfBalance.y = icoEthereum.y - 12;
	this.face_mc.addChild(this.tfBalance);
	this.tfTotalTime = addText("0", fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfTotalTime.x = icoTime.x + 30;
	this.tfTotalTime.y = icoTime.y - 12;
	this.face_mc.addChild(this.tfTotalTime);
	this.tfBankrollers= addText("Bankrollers: 0", fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfBankrollers.x = icoTime.x - 10;
	this.tfBankrollers.y = this.tfTotalTime.y + 45;
	this.face_mc.addChild(this.tfBankrollers);
	this.tfVers= addText(version, fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfVers.x = icoTime.x - 10;
	this.tfVers.y = this.tfBankrollers.y + 40;
	this.face_mc.addChild(this.tfVers);
	var strVer = "beta version";
	if(options_speedgame){
		strVer = "alpha version";
	}
	if(openkey){
		this.tfIdUser.setText(openkey);
	}
	this.tfVers2= addText(strVer, fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfVers2.x = icoTime.x - 10;
	this.tfVers2.y = _H - this.tfVers2.height;
	this.face_mc.addChild(this.tfVers2);
	
	// desc text
	this.tfYourBet = addText("Your bet: 0", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	this.tfYourBet.x = -70;
	this.tfYourBet.y = 0;
	descBet.addChild(this.tfYourBet);
	var tfMinBet = addText("MIN BET: 0.05", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	tfMinBet.x = -100;
	tfMinBet.y = -100;
	descBet.addChild(tfMinBet);
	var tfMaxBet = addText("MAX BET: 5", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	tfMaxBet.x = -90;
	tfMaxBet.y = -60;
	descBet.addChild(tfMaxBet);
}

ScrSpeedGame.prototype.createText = function() {
	var fontSize = 24;
	this.tfStatus = addText("Select bet", 40, "#ffde00", "#000000", "center", 400, 4, fontDigital)
	this.tfStatus.x = _W/2;
	this.tfStatus.y = _H/2+290;
	this.face_mc.addChild(this.tfStatus);
	this.tfMyBet = addText("", 30, "#ffde00", "#000000", "right", 400, 4, fontDigital)
	this.tfMyBet.x = _W/2-50;
	this.tfMyBet.y = _H/2+200;
	this.face_mc.addChild(this.tfMyBet);
	this.tfSplitBet = addText("", 30, "#ffde00", "#000000", "right", 400, 4, fontDigital)
	this.tfSplitBet.x = this.tfMyBet.x+200;
	this.tfSplitBet.y = this.tfMyBet.y;
	this.face_mc.addChild(this.tfSplitBet);
	this.tfMyPoints = addText("", fontSize, "#ffffff", "#000000", "right", 200, 4)
	this.tfMyPoints.x = _W/2-150;
	this.tfMyPoints.y = _H/2-15;
	this.face_mc.addChild(this.tfMyPoints);
	this.tfMySplitPoints = addText("", fontSize, "#ffffff", "#000000", "right", 200, 4)
	this.tfMySplitPoints.x = this.tfMyPoints.x+280;
	this.tfMySplitPoints.y = this.tfMyPoints.y;
	this.face_mc.addChild(this.tfMySplitPoints);
	this.tfHousePoints = addText("", fontSize, "#ffffff", "#000000", "right", 200, 4)
	this.tfHousePoints.x = this.tfMyPoints.x;
	this.tfHousePoints.y = _H/2-285;
	this.face_mc.addChild(this.tfHousePoints);
}

ScrSpeedGame.prototype.createBtn = function() {
	var doc = window.document;
	var docEl = doc.documentElement;
	this._fRequestFullScreen = docEl.requestFullscreen || 
								docEl.mozRequestFullScreen || 
								docEl.webkitRequestFullScreen || 
								docEl.msRequestFullscreen;
	this._fCancelFullScreen = doc.exitFullscreen || 
								doc.mozCancelFullScreen || 
								doc.webkitExitFullscreen || 
								doc.msExitFullscreen;
								
	var scGui = 0.5;
	var offsetY = 50;
	var btnDeal = this.createButton2("btnDeal", "Deal", _W/2+90, 950, scGui);
	this.btnDeal = btnDeal;
	var btnClear = this.createButton2("btnClearBets", "Clear Bets", _W/2-90, 950, scGui);
	this.btnClear = btnClear;
	var btnHit = this.createButton2("btnHit", "Hit", _W/2+90, 950, scGui);
	this.btnHit = btnHit;
	var btnStand = this.createButton2("btnStand", "Stand", _W/2-90, 950, scGui);
	this.btnStand = btnStand;
	btnDeal.alpha = 0.5;
	btnClear.alpha = 0.5;
	btnHit.alpha = 0.5;
	btnHit.alpha = 0.5;
	btnStand.alpha = 0.5;
	btnHit.visible = false;
	btnStand.visible = false;
	btnDeal.hint = 'To activate "Deal" please choose a bet';
	btnClear.hint = 'To "Clear" please choose a bet';
	
	if(options_splitdouble){
		var btnSplit = this.createButton2("btnSplit", "Split", 1650, 800, scGui);
		this.btnSplit = btnSplit;
		var btnDouble = this.createButton2("btnDouble", "Double", 1500, 890, scGui);
		this.btnDouble = btnDouble;
		btnSplit.alpha = 0.5;
		btnDouble.alpha = 0.5;
		btnSplit.hint = 'To play "Split" wait for dealt a pair';
		btnDouble.hint = 'To play "Double"  on hard 9-11 points';
	}
	
	if(!options_rpc){
		var btnContract = addButton("btnContract", 80, _H - 80);
		btnContract.name = "btnSmart";
		btnContract.interactive = true;
		btnContract.buttonMode=true;
		btnContract.overSc = true;
		btnContract.hint2 = 'Show contract';
		this.addChild(btnContract);
		this._arButtons.push(btnContract);
	}
	
	
	var btnDao = addButton("btnDao", _W - 80, _H - 80);
	btnDao.interactive = true;
	btnDao.buttonMode=true;
	btnDao.overSc = true;
	this.addChild(btnDao);
	this._arButtons.push(btnDao);
	var btnFullscreen = addButton("btnFullscreen", _W - 80, _H - 190);
	btnFullscreen.interactive = true;
	btnFullscreen.buttonMode=true;
	btnFullscreen.overSc = true;
	this.addChild(btnFullscreen);
	this._arButtons.push(btnFullscreen);
	var btnExit = addButton("btnCashout", _W - 80, _H - 300);
	btnExit.interactive = true;
	btnExit.buttonMode=true;
	btnExit.overSc = true;
	this.btnExit = btnExit;
	this.addChild(btnExit);
	this._arButtons.push(btnExit);
	var btnFB = addButton("btnFacebookShare", _W - 80, 70, 0.35);
	btnFB.name = "btnShare";
	btnFB.interactive = true;
	btnFB.buttonMode=true;
	btnFB.overSc = true;
	this.addChild(btnFB);
	this._arButtons.push(btnFB);
	var btnTweet = addButton("btnTweetShare", _W - 80, 180, 0.35);
	btnTweet.name = "btnTweet";
	btnTweet.interactive = true;
	btnTweet.buttonMode=true;
	btnTweet.overSc = true;
	this.addChild(btnTweet);
	this._arButtons.push(btnTweet);
	
	btnFB.hint2 = 'Share Facebook';
	btnTweet.hint2 = 'Tweet';
	btnDao.hint2 = 'Home';
	btnFullscreen.hint2 = 'Fullscreen';
	btnExit.hint2 = 'Cash out';
	
	var posX = _W/2-680;
	var posY = _H/2+180+offsetY;
	var stepX = 90;
	var stepY = 50;
	var indexX = 1;
	
	for (var i = 1; i < 7; i++) {
		this.addBtnChip("chip_"+i, posX+stepX*(indexX-1), posY+stepY*(i-1));
		
		indexX++;
		if(i%3==0){
			indexX = 0;
			posX = _W/2-640;
			posY = _H/2+100+offsetY;
		}
	}
	this.showChips(false);
	this.isCashoutAvailable();
}

ScrSpeedGame.prototype.showWndInsurance = function(str, callback) {
	if(_wndInsurance == undefined){
		_wndInsurance = new WndInsurance(this);
		_wndInsurance.x = _W/2;
		_wndInsurance.y = _H/2;
		this.face_mc.addChild(_wndInsurance);
	}
	
	_bWindow = true;
	_wndInsurance.show(str, callback)
	_wndInsurance.visible = true;
	_curWindow = _wndInsurance;
}

ScrSpeedGame.prototype.showWndBank = function() {
	if(_wndBank == undefined){
		_wndBank = new WndBank(_prnt);
		_wndBank.x = _W/2;
		_wndBank.y = _H/2;
		_prnt.face_mc.addChild(_wndBank);
	}
	
	var str = "Select the amount of BET \n you are ready to play.";
	_bWindow = true;
	_wndBank.show(str, function(value){
				_balanceSession = value;
				_balance -= _balanceSession;
				_prnt.refreshBalance();
				// init logic
				_prnt.prnt = _prnt;
				_prnt.balance = _balanceSession;
				_prnt.callback = _prnt.responseServer;
				_logic = new LogicJS(_prnt);
				_prnt.openChannel();
				if(options_debug){
					_bOpenChannel = true;
					_prnt.showChips(true);
				}
			}, _balance)
	_wndBank.visible = true;
	_curWindow = _wndBank;
}

ScrSpeedGame.prototype.showWndWarning = function(str) {
	if(_wndWarning == undefined){
		_wndWarning = new PIXI.Container();
		_wndWarning.x = _W/2;
		_wndWarning.y = _H/2;
		_prnt.face_mc.addChild(_wndWarning);
		
		var bg = addObj("wndInfo",0,0,1, 0.3, 0.15);
		_wndWarning.addChild(bg);
		var tf = addText("", 26, "#FFCC00", "#000000", "center", 500, 3)
		_wndWarning.addChild(tf);
		
		_wndWarning.tf = tf;
	}
	
	
	_wndWarning.tf.setText(str);
	_wndWarning.tf.y = -_wndWarning.tf.height/2;
	_wndWarning.visible = true;
}

ScrSpeedGame.prototype.closeWindow = function(wnd) {
	_curWindow = wnd;
	_timeCloseWnd = 200;
}

ScrSpeedGame.prototype.addChip = function(name, x, y, type) {
	var array = this._arChips;
	if(type == "split"){
		array = this._arSplitChips;
	} else if(type == "mainWin"){
		array = this._arWinChips;
	} else if(type == "splitWin"){
		array = this._arWinSplitChips;
	}
	var chip = addObj(name, x, y, _scaleChip);
	this.chips_mc.addChild(chip);
	array.push(chip);
}

ScrSpeedGame.prototype.addBtnChip = function(name, x, y) {	
	var chip = addButton(name, x, y, _scaleChip);
	chip.interactive = true;
	chip.buttonMode=true;
	chip.overSc=true;
	this.face_mc.addChild(chip);
	this._arButtons.push(chip);
	this._arBtnChips.push(chip);
}

ScrSpeedGame.prototype.createButton2 = function(name, title, x, y, sc) {
	if(sc){}else{sc=1}
	
	var btn = addButton(name, x, y, sc);
	btn.interactive = true;
	btn.buttonMode=true;
	btn.overSc=true;
	btn.disabled=false;
	this.face_mc.addChild(btn);
	this._arButtons.push(btn);
	
	var tf = addText(title, 46, "#FFFFFF", "#000000", "center", 200, 6)
	tf.x = 0;
	tf.y = 120;
	btn.addChild(tf);
	
	return btn;
}

ScrSpeedGame.prototype.getBankrolls = function(){
	if(options_debug){
		_countBankrollers = 1;
		_prnt.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
		_prnt.showWndBank();
		return false;
	}
	
	var urlRequest = "https://platform.dao.casino/api/proxy.php?a=bankrolls&game="+metaCode;
	_bWait= true;
	
	$.ajax(urlRequest).done(function (d) {
		_bWait = false;
		var _arr = JSON.parse(d);
		if (!_arr) {
			_prnt.showError(ERROR_BANKROLLER);      
			return;
		}
		
		_countBankrollers = _arr.length;
		_prnt.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
		
		// load game
		/*if(login_obj["objGame"]){
			_objSpeedGame = login_obj["objGame"];
			if(_objSpeedGame.result){
				_objSpeedGame = {result:false, idGame:_idGame, curGame:{}, betGame:0, betSplitGame:0, money:0};
				_prnt.showChips(true);
			} else {
				_prnt.responseServer(_objSpeedGame.curGame);
				_idGame = _objSpeedGame.idGame;
				_betGame = _objSpeedGame.betGame;
				_betSplitGame = _objSpeedGame.betSplitGame;
				if(_betGame > 0){
					_prnt.fillChips(_betGame);
					_prnt.tfMyBet.setText(_betGame/valToken);
				}
				if(_betGame > 0 && _betSplitGame > 0){
					_prnt.fillChips(_betSplitGame, "split");
					_prnt.tfSplitBet.setText(_betSplitGame/valToken);
				}
				_startGame = true;
				_prnt.showButtons(true);
			}
		} else {*/
			_prnt.showWndBank();
		// }
	}).fail(function() {
		_prnt.showWndWarning("Speed mode don't work. \n Try later.");
		_prnt.showButtons(false);
		_prnt.showChips(false);
	});
	
}

ScrSpeedGame.prototype.openChannel = function(){
	if(!options_debug){
		_prnt.showWndWarning("Please wait. \n Send BETs into the game");
		Casino.startGame('BJ', addressContract, convertToken(_balanceSession), function(result){
			_bOpenChannel = true;
			_prnt.isCashoutAvailable();
			_prnt.showChips(true);
			_wndWarning.visible = false;
		});
	}
}

ScrSpeedGame.prototype.closeChannel = function() {
	if(_bOpenChannel && _objSpeedGame.result && !options_debug){
		if(_logic.getResult()){
			var deposit = _objSpeedGame.money;
			_prnt.showButtons(false);
			_prnt.showChips(false);
			_prnt.btnExit.alpha = 0.5;
			_prnt.resetGame();
			_prnt.showWndWarning("Please wait. \n Soon will your BETs.");
			Casino.endGame(deposit, function(obj){
				_wndWarning.visible = false;
				if(obj == true){
					_bOpenChannel = false;
					_prnt.isCashoutAvailable();
					_prnt.createWndInfo("The gaming session was closed successfully.", undefined, "OK");
					_prnt.showChips(true);
					_prnt.getBalancePlayer();
					infura.sendRequest("getBalance", openkey, _callback);
				} else {
					var str = obj.error + ". " + deposit + " != " + obj.profit;
					_prnt.showError(str);
					_prnt.btnExit.alpha = 1;
				}
			})
		} else {
			_prnt.showError("Profit is undefined.");
			return false;
		}
	}
}

ScrSpeedGame.prototype.resetGame = function(){
	this.tfStatus.setText("");
	this.tfMyPoints.setText("");
	this.tfMySplitPoints.setText("");
	this.tfHousePoints.setText("");
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHousePoints = [];
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
	this._arNewCards = [];
	_bClear = true;
	_bWait = false;
	_balanceSession = 0;
	this.clearBet();
	this.clearGame();
}

ScrSpeedGame.prototype.clearGame = function(){
	_startGame = false;
	_bWait = false;
	_bStand = false;
	_bSplit = false;
	_bStandSplit = false;
	_bEndTurnSplit = false;
	_countPlayerCard = 0;
	_countSplitCard = 0;
	_countHouseCard = 0;
	_loadPlayerCard = 0;
	_loadSplitCard = 0;
	_loadHouseCard = 0;
	_lastPlayerCard = 0;
	_lastSplitCard = 0;
	_lastHouseCard = 0;
	_bInsurance = 0;
	_currentMethod = -1;
	_myPoints = 0;
	_mySplitPoints = 0;
	
	var i = 0;
	
	for (i = 0; i < _dealedCards.length; i++) {
		var card = _dealedCards[i];
		this.cards_mc.removeChild(card);
	}
	for (i = 0; i < this._arHolder.length; i++) {
		var mc = this._arHolder[i];
		this.addHolderObj(mc);
	}
	
	_dealedCards = [];
	if(_cardSuit){
		_cardSuit.width = _cardSuit.w;
		_cardSuit.visible = false;
	}
}

ScrSpeedGame.prototype.clearBet = function(){
	_betGame = 0;
	_betSplitGame = 0;
	_betGameOld = 0;
	_valInsurance = 0;
	this.clearChips();
	this.clearSplitChips();
	this.clearText();
}

ScrSpeedGame.prototype.clearChips = function(){	
	for (var i = 0; i < this._arChips.length; i++) {
		var chip = this._arChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arChips = [];
	for (var i = 0; i < this._arWinChips.length; i++) {
		var chip = this._arWinChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arWinChips = [];
}

ScrSpeedGame.prototype.clearSplitChips = function(){	
	for (var i = 0; i < this._arSplitChips.length; i++) {
		var chip = this._arSplitChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arSplitChips = [];
	for (var i = 0; i < this._arWinSplitChips.length; i++) {
		var chip = this._arWinSplitChips[i];
		this.chips_mc.removeChild(chip);
	}
	this._arWinSplitChips = [];
}

ScrSpeedGame.prototype.clearText = function(){
	if(this.btnClear){
		this.btnClear.alpha = 0.5;
		this.btnDeal.alpha = 0.5;
		this.tfStatus.setText("Select bet");
		this.tfYourBet.setText("Your bet: 0");
		this.tfMyBet.setText("");
		this.tfSplitBet.setText("");
	}
}

ScrSpeedGame.prototype.clickChip = function(item_mc){
	if(!_bOpenChannel){
		_prnt.showWndBank();
		return false;
	}
	
	if(_betGame == 0){
		_prnt.clearChips();
		_prnt.clearSplitChips();
	}
	
	var name = item_mc.name;
	var value = chipVale[Number(name.substr(5))]*valToken;
	var oldBet = _betGame;
	_betGame += value;
	_betGame = toFixed(_betGame, 2);
	
	if(_balanceSession == 0){
		_prnt.showWndBank();
		_betGame = oldBet;
		return false;
	} else if(_betGame > _balanceSession || _balancePlEth == 0){
		_prnt.showError(ERROR_BALANCE);
		_betGame = oldBet;
	} else if(_betGame > maxBet){
		_prnt.showError(ERROR_MAX_BET);
		_betGame = oldBet;
	} else {
		var str = "Your bet: " + String(convertToken(_betGame));
		_prnt.tfYourBet.setText(str);
		_prnt.tfSplitBet.setText("");
		_prnt.tfMyBet.setText(convertToken(_betGame));
		_prnt.tfMyBet.x = _W/2-50;
	}
	if(_betGame > 0){
		_prnt.btnDeal.alpha = 1;
		_prnt.btnClear.alpha = 1;
		if(!_bClear){
			_prnt.tfStatus.setText("");
			_prnt.tfMyPoints.setText("");
			_prnt.tfMySplitPoints.setText("");
			_prnt.tfHousePoints.setText("");
			_prnt._arMyPoints = [];
			_prnt._arMySplitPoints = [];
			_prnt._arHousePoints = [];
			_prnt._arMyCards = [];
			_prnt._arMySplitCards = [];
			_prnt._arHouseCards = [];
			_bClear = true;
			_prnt.clearGame();
			_prnt.showButtons(true);
		}
	}
	
	if(_betGameOld == _betGame){
		return false;
	}
	_betGameOld = _betGame;
	_prnt.sendChip(item_mc, _betGame);
}

ScrSpeedGame.prototype.showSmartContract = function() {
	var url = urlEtherscan + "address/" + addressContract;
	if(options_mainet){
		url = "https://etherscan.io/" + "address/" + addressContract;
	}
	window.open(url, "_blank"); 
}

ScrSpeedGame.prototype.showError = function(value, callback) {
	var str = "ERR"
	switch(value){
		case ERROR_KEYTHEREUM:
			str = "OOOPS! \n The key is not created. Try a different browser."
			break;
		case ERROR_BUF:
			str = "OOOPS! \n Transaction failed."
			_prnt.resetGame();
			break;
		case ERROR_KEY:
			str = "OOOPS! \n The key is not valid."
			break;
		case ERROR_BANK:
			str = "OOOPS! \n No money in the bank. \n Please contact to administrator."
			break;
		case ERROR_CONTRACT:
			str = "OOOPS! \n The transaction is not sent. \n Contact technical support."
			break;
		case ERROR_BALANCE:
			str = "OOOPS! \n You do not have enough money."
			break;
		case ERROR_DEAL:
			str = "OOOPS! \n The transaction did not pass. \n Try later."
			break;
		case ERROR_MAX_BET:
			str = "OOOPS! \n The maximum bet is 5."
			break;
		case ERROR_BANKROLLER:
			str = "OOOPS! \n No online bankroller. \n Come back later"
			break;
		default:
			str = "ERROR! \n\n " + value + " \n\n Contact technical support.";
			break;
	}
	_prnt.createWndInfo(str, callback);
}

ScrSpeedGame.prototype.showInsurance = function() {
	if(true){
		return false;
	}
	var price = _betGame/2;
	price = toFixed((convertToken(price)), 4);
	var str = "Do you want Insurance? \n " + price + " BET.";
	this.showWndInsurance(str, this.clickInsurance);
	_bInsurance = 0;
}

ScrSpeedGame.prototype.showResult = function(_name, _x, _y, type, bet) {
	var delay = _prnt._arNewCards.length+1;
	var tf = _prnt.createObj({x:_x, y:_y}, _name);
	tf.alpha = 0;
	createjs.Tween.get(tf).wait(1000*delay).to({y:_y, alpha:1},300).to({y:_y-50},500);
	
	
	var array = _prnt._arChips;
	if(type == "split"){
		array = _prnt._arSplitChips;
	}
	
	var _x = 0;
	var _y = 0;
	var speed = 500;
	if(_name == "win" || _name == "blackjack"){
		_prnt.fillChips(bet/2, type+"Win", 150);
		var array2 = _prnt._arWinChips;
		if(type == "split"){
			array2 = _prnt._arWinSplitChips;
		}
		
		for (var i = 0; i < array2.length; i++) {
			var chip = array2[i];
			_x = chip.x;
			_y = _H+100+i*12;
			createjs.Tween.get(chip).to({x:_x, y:(_y-150)/2},speed).to({x:_x, y:_y},speed);
		}
	}
	
	for (var i = 0; i < array.length; i++) {
		var chip = array[i];
		_x = chip.x;
		_y = _H + 100+i*12;
		if(_name == "lose" || _name == "bust"){
			_y = 150;
			createjs.Tween.get(chip).to({x:_x, y:_y, alpha:0},speed*2);
		} else if(_name == "push"){
			createjs.Tween.get(chip).to({x:_x, y:_y},speed*2);
		} else {
			createjs.Tween.get(chip).wait(speed).to({x:_x, y:_y},speed);
		}
	}
}

ScrSpeedGame.prototype.createWndInfo = function(str, callback, addStr) {
	if(_bWindow){
		return false;
	}
	if(_wndInfo == undefined){
		_wndInfo = new WndInfo(this);
		_wndInfo.x = _W/2;
		_wndInfo.y = _H/2;
		this.face_mc.addChild(_wndInfo);
	}
	
	_bWindow = true;
	_wndInfo.show(str, callback, addStr)
	_wndInfo.visible = true;
	_curWindow = _wndInfo;
}

ScrSpeedGame.prototype.showTooltip = function(item, str, _x, _y) {
	if(_x){}else{_x=_W/2}
	if(_y){}else{_y=_H/2}
	if(this.tooltip == undefined){
		this.tooltip = new tooltip(this);
		this.addChild(this.tooltip);
	}
	var w = this.tooltip.width;
	var h = this.tooltip.height;
	
	this.tooltip.x = _x;
	this.tooltip.y = _y-100;
	if(this.tooltip.x - w/2 < 20){
		this.tooltip.x = 20 + w/2;
	} else if(this.tooltip.x + w/2 > _W-20){
		this.tooltip.x = _W-20 - w/2;
	}
	if(this.tooltip.y - h/2 < 20){
		this.tooltip.y = 20 + h/2;
		if(hit_test_rec(item, w, h, this.tooltip.x, this.tooltip.y)){
			this.tooltip.y += this.tooltip.height;
		}
	} else if(this.tooltip.y + h/2 > _H-20){
		this.tooltip.y = _W-20 - h/2;
		if(hit_test_rec(item, w, h, this.tooltip.x, this.tooltip.y)){
			this.tooltip.y -= this.tooltip.height;
		}
	}
	this.tooltip.show(str);
	this.tooltip.visible = true;
}

ScrSpeedGame.prototype.showChips = function(value) {
	var a = 0.5;
	var alpha = a;
	
	if(value){
		alpha = 1;
	}
	if(_startGame || _countBankrollers == 0){
		alpha = a;
	}
	
	for (var i = 0; i < this._arBtnChips.length; i++) {
		var obj = this._arBtnChips[i];
		obj.alpha = alpha;
	}
	
	if(value && _betGame == 0 && _countBankrollers > 0){
		_bClear = false;
		_bWait = false;
		this.tfStatus.setText("Select bet");
	}
}

ScrSpeedGame.prototype.showButtons = function(value) {
	var a = 0.5;
	var alpha = a;
	if(value && !_objSpeedGame.result){
		alpha = 1;
	}
	
	if(_startGame){
		this.btnHit.visible = true;
		this.btnStand.visible = true;
		this.btnDeal.visible = false;
		this.btnClear.visible = false;
	} else {
		this.btnHit.visible = false;
		this.btnStand.visible = false;
		this.btnDeal.visible = true;
		this.btnClear.visible = true;
		alpha = a;
	}
    this.btnHit.alpha = alpha;
    this.btnStand.alpha = alpha;
	if(options_splitdouble){
		if(value && this.isSplitAvailable()){
			this.btnSplit.alpha = 1;
		} else {
			this.btnSplit.alpha = a;
		}
		if(value && this.isDoubleAvailable()){
			this.btnDouble.alpha = 1;
		} else {
			this.btnDouble.alpha = a;
		}
	}
	this.isCashoutAvailable();
}

ScrSpeedGame.prototype.showPlayerCard = function(card){
	if(card){
		if(_mySplitPoints > 0){
			card.x = _W/2 - 200 + _lastPlayerCard*30;
			this.tfMyPoints.x = _W/2-270;
		} else {
			card.x = _W/2 - 80 + _lastPlayerCard*30;
			this.tfMyPoints.x = _W/2-150;
		}
		if(_bSplit){
			card.img.tint = 0x999999;
		}
		card.y = _H/2 + 70;
		this.cards_mc.addChild(card);
		_lastPlayerCard++;
		_dealedCards.push(card);
		this._arMyCards.push(card);
		this._arMyPoints.push(card.point);
		
		this.showMyPoints();
		
		return {x:card.x, y:card.y}
	}
	
	return {x:0, y:0}
}

ScrSpeedGame.prototype.showPlayerSplitCard = function(card){
	if(card){
		card.x = _W/2 + 200 + _lastSplitCard*30;
		card.y = _H/2 + 70;
		this.cards_mc.addChild(card);
		_lastSplitCard++;
		_dealedCards.push(card);
		this._arMySplitCards.push(card);
		this._arMySplitPoints.push(card.point);
		this.showMySplitPoints();
		return {x:card.x, y:card.y}
	}
	
	return {x:0, y:0}
}

ScrSpeedGame.prototype.showHouseCard = function(card){
	if(card){
		card.x = _W/2 - 80 + _lastHouseCard*30;
		card.y = _H/2 - 200;
		this.cards_mc.addChild(card);
		_lastHouseCard++;
		_dealedCards.push(card);
		this._arHouseCards.push(card);
		this._arHousePoints.push(card.point);
		
		this.showHousePoints();
		return {x:card.x, y:card.y}
	}
	
	return {x:0, y:0}
}

ScrSpeedGame.prototype.isCashoutAvailable = function() {
	if(_bOpenChannel && _objSpeedGame.result){
		this.btnExit.alpha = 1;
	} else {
		this.btnExit.alpha = 0.5;
	}
}

ScrSpeedGame.prototype.isSplitAvailable = function() {
	var value = false;
	if(this._arMyCards.length == 2 &&
	_balanceSession >= _betGame &&
	_bSplit == false &&
	_betGame > 0 &&
	this._arMySplitCards.length == 0 &&
	((this._arMyPoints[0] == this._arMyPoints[1]) ||
	(this._arMyCards[0].ace && this._arMyCards[1].ace))){
		value = true;
	}
	
	return value;
}

ScrSpeedGame.prototype.isDoubleAvailable = function() {
	if(((!_bSplit && this._arMyCards.length == 2 && 
	_myPoints > 8 && _myPoints < 12) ||
	(_bSplit && this._arMySplitCards.length == 2 &&
	_mySplitPoints > 8 && _mySplitPoints < 12)) &&
	_balanceSession >= _betGame){
		return true;
	}
	
	return false;
}

ScrSpeedGame.prototype.addCard = function(name, loadCard, countCard, array){
	for (var i = loadCard; i < countCard; i++) {
		var cardIndex = array[i];
		_timeNewCard = 1000;
		
		if(name == "arMyCards"){
			_loadPlayerCard++;
			_prnt._arNewCards.push({type:"player", id:cardIndex});
		} else if(name == "arMySplitCards"){
			_loadSplitCard++;
			_prnt._arNewCards.push({type:"split", id:cardIndex});
		} else if(name == "arHouseCards"){
			_loadHouseCard ++;
			_prnt._arNewCards.push({type:"house", id:cardIndex});
		}
	}
}

ScrSpeedGame.prototype.fullscreen = function() {
	 if(options_fullscreen) { 
		this._fCancelFullScreen.call(window.document);
		options_fullscreen = false;
	}else{
		this._fRequestFullScreen.call(window.document.documentElement);
		options_fullscreen = true;
	}
}

ScrSpeedGame.prototype.fillChips = function(value, type, _y){
	if(_y == undefined){_y = this.seat.y}
	var setBet = value;
	var countChip = 0;
	var posX = this.seat.x;
	
	if(type == "split"){
		this.clearSplitChips();
		posX += 200;
	} else if(type == "mainWin"){
		if(_bSplit || this.countPlayerSplitCard > 0){
			posX -= 200;
		}
	} else if(type == "splitWin"){
		posX += 200;
	} else if(_bSplit || 
	this.countPlayerSplitCard > 0 || 
	type == "main"){
		this.clearChips();
		posX -= 200;
	} else {
		this.clearChips();
	}
	while(setBet > 0){
		var posY = _y-countChip*6;
		if(setBet >= 5*valToken){
			setBet -= 5*valToken;
			this.addChip("chip_6", posX, posY, type);
			countChip ++;
		} else if(setBet >= 2*valToken){
			setBet -= 2*valToken;
			this.addChip("chip_5", posX, posY, type);
			countChip ++;
		} else if(setBet >= 1*valToken){
			setBet -= 1*valToken;
			this.addChip("chip_4", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.5*valToken){
			setBet -= 0.5*valToken;
			this.addChip("chip_3", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.1*valToken){
			setBet -= 0.1*valToken;
			this.addChip("chip_2", posX, posY, type);
			countChip ++;
		} else if(setBet >= 0.05*valToken){
			setBet -= 0.05*valToken;
			this.addChip("chip_1", posX, posY, type);
			countChip ++;
		} else if(setBet > 0){
			setBet = 0;
		}
	}
}

ScrSpeedGame.prototype.shareTwitter = function() {
	// @daocasino @ethereumproject @edcon #blockchain #ethereum
	if(twttr){
		var urlGame = 'http://platform.dao.casino/';
		var url="https://twitter.com/intent/tweet";
		var str='Play blackjack for tokens '+ " " + urlGame;
		var hashtags="blockchain,ethereum,blackjack";
		var via="daocasino";
		window.open(url+"?text="+str+";hashtags="+hashtags+";via="+via,"","width=500,height=300");
	}
}

ScrSpeedGame.prototype.shareFB = function() {
	if (typeof(FB) != 'undefined' && FB != null ) {
		var urlGame = 'http://platform.dao.casino/';
		var urlImg = "http://platform.dao.casino/games/blackjack/game/images/share/bgMenu.jpg";
		
		FB.ui({
		  method: 'feed',
		  picture: urlImg,
		  link: urlGame,
		  caption: 'PLAY',
		  description: 'Play blackjack for ether',
		}, function(response){});
	} else {
		console.log("FB is not defined");
	}
}

ScrSpeedGame.prototype.createObj = function(point, name, sc) {	
	if(sc){}else{sc = 1};
	var mc = undefined;
	var newObj = true;
	
	for (var i = 0; i < _prnt._arHolder.length; i++ ) {
		mc = _prnt._arHolder[i];
		if (mc) {
			if (mc.dead && mc.name == name) {
				mc.visible = true;
				newObj = false;
				break;
			}
		}
	}
	
	if (newObj) {
		if(name == "blackjack"){
			mc = addText(R_BLACKJACK, 50, "#FCB70F", "#4F3904", "left", 300, 4);
			mc.name = "blackjack";
			mc.w = mc.width;
		} else if(name == "win"){
			mc = addText(R_WIN, 50, "#FCB70F", "#4F3904", "left", 300, 4);
			mc.name = "win";
			mc.w = mc.width;
		} else if(name == "bust"){
			mc = addText(R_BUST, 50, "#EC8018", "#3F2307", "left", 300, 4);
			mc.name = "bust";
			mc.w = mc.width;
		} else if(name == "lose"){
			mc = addText(R_LOSE, 50, "#D72319", "#64100B", "left", 300, 4);
			mc.name = "lose";
			mc.w = mc.width;
		} else if(name == "push"){
			mc = addText(R_PUSH, 50, "#999999", "#333333", "left", 300, 4);
			mc.name = "tfPush";
			mc.w = mc.width;
		} else {
			mc = addObj(name, 0, 0, sc);
		}
		_prnt.gfx_mc.addChild(mc);
		_prnt._arHolder.push(mc);
	}
	
	mc.x = point.x;
	mc.y = point.y;
	mc.width = mc.w;
	mc.dead = false;
	
	return mc;
}

ScrSpeedGame.prototype.addHolderObj = function(obj){
	obj.visible = false;
	obj.dead = true;
	obj.x = _W + 150;
	obj.y = _H + 50;
}

ScrSpeedGame.prototype.makeID = function(count){
	if(count){}else{count = 64}
    var str = "0x";
    var possible = "abcdef0123456789";
	var t = String(getTimer());
	count -= t.length;
	str += t;

    for( var i=0; i < count; i++ ){
		str += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	
	if(!options_rpc){
		str = "0x" + web3_sha3(numToHex(str));
	}
	
    return str;
}

ScrSpeedGame.prototype.signSeed = function(seed, callback){
	Casino.getFastRandom(seed, function (res) {
		if(res.error){
			_prnt.showError(res.error);
			_prnt.closeChannel();
		} else {
			callback(res.random)
		}
	})
}

ScrSpeedGame.prototype.sendChip = function(item_mc, betGame, type){
	var chip = _prnt.createObj(item_mc, item_mc.name, _scaleChip);
	if(chip == undefined){
		_prnt.fillChips(betGame);
		return false;
	}
	var _x = _prnt.seat.x;
	var _y = _prnt.seat.y;
	if(type == "split"){
		_x += 200;
	} else if(_bSplit){
		_x -= 200;
	}
	createjs.Tween.get(chip).to({x:_x, y:_y},500)
							.call(function(){
								_prnt.addHolderObj(chip);
								_prnt.fillChips(betGame);
							});
}

ScrSpeedGame.prototype.sendCard = function(obj){
	var type = obj.type;
	var cardIndex = obj.id;
	var card = undefined;
	var suit = _prnt.createObj({x:1487, y:298}, "suit", _scaleCard);
	var _x = 0;
	var _y = 0;
	var coord = {x:_x, y:_y};
	
	if(type != "suit"){
		card = _prnt.getCard(cardIndex);
	}
	
	if(type == "player"){
		coord = _prnt.showPlayerCard(card);
		if(_betGame > 0){
			_timeShowButtons = TIME_SHOW_BTN + _prnt._arNewCards.length*1000;
		}
	} else if(type == "split"){
		coord = _prnt.showPlayerSplitCard(card);
		if(_betGame > 0){
			_timeShowButtons = TIME_SHOW_BTN + _prnt._arNewCards.length*1000;
		}
	} else if(type == "house"){
		coord = _prnt.showHouseCard(card);
		
		if(_loadHouseCard==1){
			_prnt._arNewCards.push({type:"suit", id:0});
			if(_valInsurance == 0 && card.point == 11 && _myPoints != BLACKJACK){
				_prnt.showInsurance();
			}
		}
	} else if(type == "suit"){
		coord = _prnt.showSuitCard();
		card = _cardSuit;
	}
	
	if(card){
		card.visible = false;
		if(type == "suit"){
			createjs.Tween.get(suit).to({x:coord.x, y:coord.y},400)
								.call(function(){
									_prnt.addHolderObj(suit);
									card.visible = true;
								});
		} else {
			var bSuit = false;
			if(_cardSuit){
				if(_loadHouseCard > 1 && type == "house" && _cardSuit.width == _cardSuit.w){
					bSuit = true;
				}
			}
			if(bSuit){
				_prnt.addHolderObj(suit);
				createjs.Tween.get(_cardSuit).to({width:10},150)
								.call(function(){
									_cardSuit.visible = false;
									card.visible = true;
								});
			} else {
				createjs.Tween.get(suit).to({x:coord.x, y:coord.y},400).to({width:10},150)
								.call(function(){
									_prnt.addHolderObj(suit);
									card.visible = true;
								});
			}
		}
		// switch to maingame
		if(_bSplit){
			if(_prnt._arNewCards.length == 1 &&
			(_currentMethod == DOUBLE || _mySplitPoints >= BLACKJACK)){
				_bSplit = false;
				_prnt.timeShowButtons = TIME_SHOW_BTN + _prnt._arNewCards.length*1000;
				_prnt.darkCards(_prnt._arMyCards, false);
				_prnt.darkCards(_prnt._arMySplitCards, true);
			}
		}
	} else {
		console.log("card: null");
	}
}

ScrSpeedGame.prototype.darkCards = function(array, value) {
	for (var i = 0; i < array.length; i++) {
		var card = array[i];
		if(value){
			card.img.tint = 0x999999;
		} else {
			card.img.tint = 0xffffff;
		}
	}
}

ScrSpeedGame.prototype.autoSplitStand = function(){
	_bEndTurnSplit = true;
	if(_bSplit && !_bStandSplit){
		_bStandSplit = true;
		if(_currentMethod == HIT){
			_bSplit = false;
		}
	} //else {
		// this.bStand = true;
	// }
	
	this.showButtons(false);
	this.darkCards(this._arMyCards, false);
	this.darkCards(this._arMySplitCards, true);
}

ScrSpeedGame.prototype.showMyPoints = function(){
	_myPoints = this.getMyPoints();
	if(_myPoints > 0){
		this.tfMyPoints.setText(_myPoints);
	} else {
		this.tfMyPoints.setText("");
	}
}

ScrSpeedGame.prototype.showMySplitPoints = function(){
	_mySplitPoints = this.getMySplitPoints();
	if(_mySplitPoints > 0){
		this.tfMySplitPoints.setText(_mySplitPoints);
		if(!_bEndTurnSplit){
			if(_mySplitPoints >= 21){
				this.autoSplitStand();
			}
		}
	} else {
		this.tfMySplitPoints.setText("");
	}
}

ScrSpeedGame.prototype.showHousePoints = function(){
	_housePoints = this.getHousePoints();
	if(_housePoints > 0){
		this.tfHousePoints.setText(_housePoints);
	} else {
		this.tfHousePoints.setText("");
	}
}

ScrSpeedGame.prototype.getMyPoints = function(){
	var myPoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arMyPoints.length; i++) {
		var curPoint = this._arMyPoints[i];
		myPoints += curPoint;
		if(curPoint == 11){
			countAce ++;
		}
	}
	
	while(myPoints > 21 && countAce > 0){
		countAce --;
		myPoints -= 10;
	}
	
	return myPoints;
}

ScrSpeedGame.prototype.getMySplitPoints = function(){
	var mySplitPoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arMySplitPoints.length; i++) {
		var curPoint = this._arMySplitPoints[i];
		mySplitPoints += curPoint;
		if(curPoint == 11){
			countAce ++;
		}
	}
	
	while(mySplitPoints > 21 && countAce > 0){
		countAce --;
		mySplitPoints -= 10;
	}
	
	return mySplitPoints;
}

ScrSpeedGame.prototype.getHousePoints = function(){
	var housePoints = 0;
	var countAce = 0;
	for (var i = 0; i < this._arHousePoints.length; i++) {
		var curPoint = this._arHousePoints[i];
		housePoints += curPoint;
		if(curPoint == 11){
			countAce ++;
		}
	}
	
	while(housePoints > 21 && countAce > 0){
		countAce --;
		housePoints -= 10;
	}
	
	return housePoints;
}

ScrSpeedGame.prototype.showSuitCard = function(){
	if(_cardSuit){} else {
		_cardSuit = addObj("suit", 0, 0, _scaleCard);
		this.gfx_mc.addChild(_cardSuit);
	}
	_cardSuit.width = _cardSuit.w;
	_cardSuit.x = _W/2 - 80 + _lastHouseCard*30;
	_cardSuit.y = _H/2 - 200;
	if(_bStand){
		_cardSuit.visible = false;
	} else {
		_cardSuit.visible = true;
	}
	
	return {x:_cardSuit.x, y:_cardSuit.y};
}

ScrSpeedGame.prototype.getCard = function(cardIndex){
	var cardType = Math.floor(cardIndex / 4);
	var cardSymbol = String(cardType);
	var point = cardType;
	var ace = false;
	switch (cardType) {
		case 0:
			cardSymbol = "K";
			point = 10;
			break;
		case 1:
			cardSymbol = "A";
			point = 11;
			ace = true;
			break;
		case 11:
			cardSymbol = "J";
			point = 10;
			break;
		case 12:
			cardSymbol = "Q";
			point = 10;
			break;
	}
	var suit = String(cardIndex % 4 + 1);
	var spriteName = suit + "_" + cardSymbol;
	var newCard = addObj(spriteName, 0, 0, _scaleCard);
	if(newCard){
		newCard.id = cardIndex;
		newCard.point = point;
		newCard.ace = ace;
	}else{
		// console.log("UNDEFINED spriteName:", cardIndex, spriteName);
	}
	
	return newCard;
}

// ACTION
ScrSpeedGame.prototype.clickDeal = function(){
	var seed = makeID();
	_currentMethod = DEAL;
	_idGame ++;
	localStorage._idGame = _idGame;
	
	if((_betGame >= _minBet && 
	_balanceBank >= (_betGame/valToken)*3) && 
	_countBankrollers > 0){
		if(_balancePlEth > 0){
			this.btnDeal.alpha = 0.5;
			this.btnClear.alpha = 0.5;
			this.showChips(false);
			_startGame = true;
			if(options_debug){
				_logic.bjDeal(seed, _betGame);
			} else {
				Casino.callGameFunction(_idGame, msgID(), 
					'bjDeal', ['confirm('+seed+')', _betGame]
				);
				this.signSeed(seed, function(result){_logic.bjDeal(result, _betGame);});
			}
		} else {
			this.showError(ERROR_BALANCE);
			this.clearBet();
			this.showChips(true);
		}
	} else {
		if(_countBankrollers > 0){
			this.showError(ERROR_BANK);
		} else {
			this.showError(ERROR_BANKROLLER);
		}
		this.clearBet();
		this.showChips(true);
	}
}

ScrSpeedGame.prototype.clickHit = function(){
	var seed = makeID();
	_currentMethod = HIT;
	if(options_debug){
		_logic.bjHit(seed, !_bSplit);
	} else {
		Casino.callGameFunction(_idGame, msgID(), 
			'bjHit', ['confirm('+seed+')', !_bSplit]
		);
		this.signSeed(seed, function(result){_logic.bjHit(result, !_bSplit);});
	}
	this.showButtons(false);
}

ScrSpeedGame.prototype.clickStand = function(){
	if(_bSplit){
		_bSplit = false;
		_prnt.darkCards(_prnt._arMyCards, false);
		_prnt.darkCards(_prnt._arMySplitCards, true);
	} else {
		var seed = makeID();
		_currentMethod = STAND;
		if(options_debug){
			_logic.bjStand(seed, !_bSplit);
		} else {
			Casino.callGameFunction(_idGame, msgID(), 
				'bjStand', ['confirm('+seed+')', !_bSplit]
			);
			this.signSeed(seed, function(result){_logic.bjStand(result, !_bSplit);});	
		}
		this.showButtons(false);
	}
}

ScrSpeedGame.prototype.clickDouble = function(){
	var seed = makeID();
	_currentMethod = DOUBLE;
	if(options_debug){
		_logic.bjDouble(seed, !_bSplit);
	} else {
		Casino.callGameFunction(_idGame, msgID(), 
			'bjDouble', ['confirm('+seed+')', !_bSplit]
		);
		this.signSeed(seed, function(result){_logic.bjDouble(result, !_bSplit);});	
	}
	this.showButtons(false);
	
	if(_bSplit){
		_betSplitGame *= 2;
		this.fillChips(_betSplitGame, "split");
		var str = String(convertToken(_betSplitGame));
		this.tfSplitBet.setText(str);
	} else {
		_betGame *= 2;
		if(this._arMySplitCards.length > 0){
			this.fillChips(_betGame, "main");
		} else {
			this.fillChips(_betGame);
		}
		var str = String(convertToken(_betGame));
		this.tfMyBet.setText(str);
	}
}

ScrSpeedGame.prototype.clickSplit = function(){
	if(_balanceSession < _betGame){
		_prnt.showError(ERROR_BALANCE);
		return false;
	}
	
	_loadPlayerCard = 1;
	_loadSplitCard = 1;
	_lastPlayerCard = 1;
	_lastSplitCard = 1;
	
	var seed = makeID();
	_currentMethod = SPLIT;
	if(options_debug){
		_logic.bjSplit(seed);
	} else {
		Casino.callGameFunction(_idGame, msgID(), 
			'bjSplit', ['confirm('+seed+')']
		);
		this.signSeed(seed, function(result){_logic.bjSplit(result);});	
	}
	this.showButtons(false);
	
	_bSplit = true;
	_betSplitGame = _betGame;
	this.fillChips(_betGame);
	this.fillChips(_betGame, "split");
	var str = String(convertToken(_betGame));
	this.tfMyBet.setText(str);
	this.tfMyBet.x = _W/2 - 250;
	this.tfSplitBet.setText(str);
	
	this._arMySplitCards = [this._arMyCards[1]];
	this._arMyCards = [this._arMyCards[0]];
	
	this._arMyCards[0].x = _W/2 - 200;
	this._arMySplitCards[0].x = _W/2 + 200;
	this.tfMyPoints.x = _W/2-270;
	this._arMyPoints = [this._arMyCards[0].point];
	this._arMySplitPoints = [this._arMySplitCards[0].point];
	this.showMyPoints();
	this.showMySplitPoints();
	this.darkCards(this._arMyCards, true);
	this.darkCards(this._arMySplitCards, false);
}

ScrSpeedGame.prototype.clickInsurance = function(){
	// var prnt = obj_game["game"];
	// prnt.bInsurance = 1;
	// infura.sendRequest("requestInsurance", openkey, _callback);
	// prnt.bWait = true;
	// prnt.showButtons(false);
	
	// if(options_speedgame){
		// prnt.bInsurance = 2;
	// }
}

ScrSpeedGame.prototype.checkResult = function(objResult){
	var _xM = _W/2 - 80-75;
	var _xS = _W/2 + 200-75;
	var _y = _H/2 - 35;
	var strResultM = "";
	var strResultS = "";
	_startGame = false;
	_bClear = false;
	_betGame = 0;
	_betGameOld = 0;
	var betMain = objResult.betMain/valToken;
	var betSplit = objResult.betSplit/valToken;
	
	if(betMain > 0){
		strResultM = "+"+String(betMain)
	}
	if(betSplit > 0){
		strResultS = "+"+String(betSplit)
	}
	
	if(_mySplitPoints > 0){
		_xM = _W/2 - 200-75;
	}
	_prnt.showResult(objResult.main, _xM, _y, "main", objResult.betMain);
	_prnt.tfMyBet.setText(strResultM);
	if(_mySplitPoints > 0){
		_prnt.showResult(objResult.split, _xS, _y, "split", objResult.betSplit);
		_prnt.tfSplitBet.setText(strResultS);
	}
	
	_prnt.showChips(true);
	_prnt.isCashoutAvailable();
	
	if(objResult.mixing){
		_mixingCard.visible = true;
		_timeMixing = 3000;
	}
	
	if(_balanceSession == 0){
		_prnt.closeChannel();
		_prnt.showChips(false);
	}
}

// BLOCKCHAIN
ScrSpeedGame.prototype.getBalancePlayer = function(){
	var value = callERC20("balanceOf", openkey);
	_balance = Number(value);
	_prnt.refreshBalance();
}

ScrSpeedGame.prototype.refreshBalance = function(){
	var str = toFixed(convertToken(_balanceSession), 2) + " (" +
						toFixed(convertToken(_balance), 2) + ")" + " BET";
	var str2 = "Game balance: " + toFixed(convertToken(_balanceSession), 2) + " ( Player balance: " +
						toFixed(convertToken(_balance), 2) + ")" + " BET";
	_prnt.tfBalance.setText(str);
	_prnt.icoEthereum.hint = str2;
}

ScrSpeedGame.prototype.getBalanceBank = function(){
	var value = callERC20("balanceOf", addressContract);
	_balanceBank = Number(value);
}

ScrSpeedGame.prototype.getBalanceErc = function(){
	var value = callERC20("balanceOf", addressCurErc);
	_balanceErc = Number(value);
}

ScrSpeedGame.prototype.response = function(command, value, error) {
	if(value == undefined || error){
		if((command == "sendRaw" || command == "gameTxHash")){
			if(error){
				// OUT OF GAS - error client (wrong arguments from the client)
				// invalid JUMP - throw contract
				console.log("response:", error);
				_prnt.showError(error.message);
			} else {
				_prnt.showError(ERROR_CONTRACT);
			}
			_bWait = false;
		}
		return false;
	}
	
	if(command == "getBalance"){
		_balancePlEth = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
	} else if(command == "getBalanceBank"){
		_balanceBank = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
	} else if(command == "newChannel"){
		_prnt.responseTransaction(command, value);
		_bOpenChannel = true;
	} else if(command == "closeChannel"){
		_prnt.responseTransaction(command, value);
		_bOpenChannel = false;
	} else if(command == "sendRaw"){
	}
}

ScrSpeedGame.prototype.responseTransaction = function(name, value) {
	var args = [];
	var price = 0;
	var nameRequest = "sendRaw";
	var gasPrice="0x"+numToHex(40000000000);
	var gasLimit=0x927c0; //web3.toHex('600000');
	if(name == "newChannel"){
		price = _balanceSession;
		args = [price];
		console.log("newChannel:", price);
	} else if(name == "closeChannel"){
		if(_logic.getResult()){
			price = _logic.getResult().profit;
			var add = price > 0;
			console.log("closeChannel:", price, add);
			args = [openkey, Math.abs(price), add];
		} else {
			_prnt.showError("Profit is undefined.");
			return false;
		}
	}
	
	var options = {};
	options.nonce = value;
	options.to = addressContract;
	options.gasPrice = gasPrice;
	options.gasLimit = gasLimit;
	
	console.log("The transaction was signed:", name);
	// The transaction was signed
	
	if(ks){
		ks.keyFromPassword(passwordUser, function (err, pwDerivedKey) {
			if (err) {
				console.log("err:", err);
				_prnt.showError(ERROR_BUF);
				return false;
			}
			
			var registerTx = lightwallet.txutils.functionTx(abi, name, args, options);
			var params = "0x"+lightwallet.signing.signTx(ks, pwDerivedKey, registerTx, sendingAddr);
			infura.sendRequest(nameRequest, params, _callback, undefined, _currentMethod);
		})
	} else {
		_prnt.showError(ERROR_BUF);
		if(_prnt.countPlayerCard == 0){
			_prnt.clearBet();
			_prnt.tfStatus.setText("");
			_prnt.showChips(true);
			_prnt.bClickStart = false;
		}
		_prnt.bWait = false;
	}
}

// SERVER
ScrSpeedGame.prototype.responseServer = function(obj) {
	_prnt.tfStatus.setText("");
	_objSpeedGame = obj;
	_objSpeedGame.curGame = obj.curGame;
	_balanceSession = _logic.getBalance();
	login_obj["objGame"] = _objSpeedGame;
	_prnt.refreshBalance();
	// saveData();
	
	for(var name in _objSpeedGame.curGame){
		var obj = _objSpeedGame.curGame[name];
		switch(name){
			case "arMyCards":
				_countPlayerCard = obj.length;
				_prnt.addCard(name, _loadPlayerCard, _countPlayerCard, obj);
				break;
			case "arMySplitCards":
				_countSplitCard = obj.length;
				_prnt.addCard(name, _loadSplitCard, _countSplitCard, obj);
				break;
			case "arHouseCards":
				_countHouseCard = obj.length;
				_prnt.addCard(name, _loadHouseCard, _countHouseCard, obj);
				break;
		}
	}
	
	if(_objSpeedGame.result){
		var delay = _prnt._arNewCards.length+1;
		createjs.Tween.get({}).wait(1000*delay).call(function(){
								_prnt.checkResult(_logic.getResult());
							});
	}
}

// UPDATE
ScrSpeedGame.prototype.update = function(diffTime){
	if(options_pause){
		return false;
	}
	
	_mixingCard.update(diffTime);
	if(_timeMixing > 0 && _mixingCard.visible){
		_timeMixing -= diffTime;
		if(_timeMixing < 100){
			_timeMixing = 0;
			_mixingCard.visible = false;
		}
	}
	
	
	if(_timeCloseWnd > 0 && _curWindow){
		_timeCloseWnd -= diffTime;
		if(_timeCloseWnd < 100){
			_timeCloseWnd = 0;
			_curWindow.visible = false;
			_curWindow = undefined;
			_bWindow = false;
		}
	}
	
	_timeNewCard -= diffTime;
	if(this._arNewCards.length > 0 && _timeNewCard < 1){
		_timeNewCard = 1000;
		this.sendCard(this._arNewCards[0]);
		this._arNewCards.shift();
	}
	if(_timeShowButtons > 0){
		_timeShowButtons -= diffTime;
		if(_timeShowButtons <= 0){
			this.showButtons(true);
		}
	}
}

// CLICK
ScrSpeedGame.prototype.clickCell = function(item_mc) {
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
	} else if(item_mc.name == "btnHit"){
		this.clickHit();
	} else if(item_mc.name == "btnStand"){
		this.clickStand();
	} else if(item_mc.name == "btnSplit"){
		this.clickSplit();
	} else if(item_mc.name == "btnDouble"){
		this.clickDouble();
	} else if(item_mc.name == "btnFullscreen"){
		this.fullscreen();
	} else if(item_mc.name == "btnKey" || item_mc.name == "icoKey"){
		copyToClipboard(openkey);
	} else if(item_mc.name == "btnShare"){
		this.shareFB();
	} else if(item_mc.name == "btnTweet"){
		this.shareTwitter();
	} else if(item_mc.name == "btnClearBets"){
		this.clearBet();
	} else if(item_mc.name == "btnCashout"){
		this.closeChannel();
	} else if(item_mc.name == "btnSmart"){
		this.showSmartContract();
	} else if(item_mc.name == "btnDao"){
		this.removeAllListener();
		// var url = "https://platform.dao.casino/";
		var url = "/";
		window.open(url, "_self");
	} else if(item_mc.name.search("chip") != -1){
		this.clickChip(item_mc);
	}
}

ScrSpeedGame.prototype.checkButtons = function(evt){
	_mouseX = evt.data.global.x;
	_mouseY = evt.data.global.y;
	if(this.tooltip){
		this.tooltip.visible = false;
	}
	
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, _mouseX, _mouseY) &&
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
					if(item_mc.name == "icoKey"){
						this.btnFrame.over.visible = true;
					}
				}
				if(item_mc.hint2){
					this.showTooltip(item_mc, item_mc.hint2, item_mc.x, item_mc.y);
				}
			} else if(item_mc.hint){
				this.showTooltip(item_mc, item_mc.hint, item_mc.x, item_mc.y);
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
				if(item_mc.name == "icoKey"){
					this.btnFrame.over.visible = false;
				}
			}
		}
	}
}

ScrSpeedGame.prototype.touchHandler = function(evt){
	if(this.bWindow){
		return false;
	}
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

ScrSpeedGame.prototype.removeAllListener = function(){
	if(_wndInfo){
		_wndInfo.removeAllListener();
	}
	if(this.wndInsurance){
		this.wndInsurance.removeAllListener();
	}
	
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}
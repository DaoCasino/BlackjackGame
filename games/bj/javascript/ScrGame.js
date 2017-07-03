
function ScrGame() {
	PIXI.Container.call( this );
	this.init();
}

ScrGame.prototype = Object.create(PIXI.Container.prototype);
ScrGame.prototype.constructor = ScrGame;

var TIME_GET_STATE = 10000;
var TIME_WAIT = 500;
var TIME_SHOW_BTN_CHIPS = 3000;
var TIME_SHOW_BTN = 300;
var TIME_LONG_RESPONSE = 1000*60*7;
var S_IN_PROGRESS = 0;	
var S_PLAYER_WON = 1;	
var S_HOUSE_WON = 2;	
var S_TIE = 3;	
var S_IN_PROGRESS_SPLIT = 4;
var S_BLACKJACK = 5;
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
var BLACKJACK = 21;

var C_DEAL = "e731240f";
var C_HIT = "a45939bf";
var C_SPLIT = "5fe71222";
var C_STAND = "7018c942";
var C_INSURANCE = "262b497d";
var C_DOUBLE = "f086fbfd";
var C_ALLOWANCE = "dd62ed3e";
var C_CONFIRM = "b00606a5";

var urlResult = "http://api.dao.casino/daohack/api.php?a=getreuslt&id";
var urlEtherscan = "https://api.etherscan.io/";
var urlBalance = "";
var betGame = 0;
var betSplitGame = 0;
var betGameOld = 0;
var betGameCur = 0;
var valInsurance = 0;
var houseScore = 0;
var minBet = 5000000;
var maxBet = 500000000;
var obj_game = {};
var objSpeedGame = {result:false, idGame:-1, lastGame:{}, betGame:0, betSplitGame:0};
var _callback;
var _mouseX;
var _mouseY;
var blockNumber;
var idOraclizeGame = undefined;
var resultTxid = undefined;
var gasAmount = 4000000;
var idGame = -1;
var idOldGame = -1;
var _allowance = 0;
var _seed = "";
var _seedUsed = "";
var _currentMethod = -1;
var _nonceTx = "";
var _haveBankroll = false;

var accounts;
var account;
var gameIsGoingOn;
var dealedCards = new Array();
var suit = {0: 'Hearts', 1: 'Diamonds', 2: 'Spades', 3: 'Clubs'};
var cardType = {0: 'King', 1: 'Ace', 2: '2', 3: '3', 4: '4', 5: '5', 
				6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
                11: 'Jacket', 12: 'Queen'};

var unit = [];
unit[0] = "Main";
unit[1] = "House";
unit[2] = "Split";
var chipVale = [];
chipVale[1] = 0.05;
chipVale[2] = 0.1;
chipVale[3] = 0.5;
chipVale[4] = 1;
chipVale[5] = 2;
chipVale[6] = 5;
var lastPlayerCard = 0;
var lastPlayerSplitCard = 0;
var lastHouseCard = 0;
var loadPlayerCard = 0;
var loadPlayerSplitCard = 0;
var loadHouseCard = 0;
var stateNow = -1;
var stateOld = -1;
var stateSplit = -1;
var scaleCard = 0.9;
var scaleBack = 1;
var scaleChip = 0.45;
var _oStartingCardOffset;
var _oDealerCardOffset;
var _oReceiveWinOffset;
var _oFichesDealerOffset;
var _oRemoveCardsOffset;
var _contract;
var _countBankrollers = 0;
var _balancePlSpeed = -1;

var _strWaitBlockchain = "Wait response from blockchain.";

ScrGame.prototype.init = function() {
	this.face_mc = new PIXI.Container();
	this.back_mc = new PIXI.Container();
	this.game_mc = new PIXI.Container();
	this.cards_mc = new PIXI.Container();
	this.gfx_mc = new PIXI.Container();
	
	_contract = new Contract(this);
	this.startTime = getTimer();
	this.gameTime = getTimer();
	this._arButtons = [];
	this._arBtnChips = [];
	this._arChips = [];
	this._arSplitChips = [];
	this._arMyPoints = [];
	this._arMySplitPoints = [];
	this._arHousePoints = [];
	this._arMyCards = [];
	this._arMySplitCards = [];
	this._arHouseCards = [];
	this._arNewCards = [];
	this._arHolder = [];
	this.timeGetState = TIME_GET_STATE-1000;
	this.timeGetCards = 0;
	this.timeTotal = 0;
	this.timeWait = 0;
	this.timeCloseWnd = 0;
	this.timeNewCard = 0;
	this.timeShowBtnChips = 0;
	this.timeShowButtons = 0;
	this.timeWaitResponse = 0;
	this.countPlayerCard = 0;
	this.countPlayerSplitCard = 0;
	this.countHouseCard = 0;
	this.valPlayerScore = 0;
	this.valSplitScore = 0;
	this.countWait = 0;
	this.myPoints = 0;
	this.mySplitPoints = 0;
	this.housePoints = 0;
	this.oldBalance = -1;
	this.cardSuit = undefined;
	this.tooltip;
	this.wndInfo;
	this.wndInsurance;
	this.wndApprove;
	this.curWindow;
	this.startGame = false;
	this._gameOver = false;
	this._gameEnd = false;
	this.bWindow = false;
	this.bBetLoad = false;
	this.bWait = false;
	this.bWaitSplit = false;
	this.bStand = false;
	this.bClear = false;
	this.bSplit = false;
	this.bStandSplit = false;
	this.bDouble = false;
	this.bSplitDouble = false;
	this.bEndTurnSplit = false;
	this.bClickStart = false;
	this.bApprove = false;
	this.bClickApprove = false;
	this.bStandNecessary = false;
	this.bShowResult = false;
	this.bInsurance = -1;
	login_obj["allowance"] = false;
	
	obj_game = {};
	this.clearBet();
	this.clearGame();
	
	this.bg = addObj("bgGame"+rndBg, _W/2, _H/2);
	scaleBack = _W/this.bg.w;
	this.bg.scale.x = scaleBack;
	this.bg.scale.y = scaleBack;
	this.addChild(this.bg);
	
	if(options_rpc){
		TIME_GET_STATE = 2000;
		urlEtherscan = "https://ropsten.etherscan.io/";
		addressContract = addressRpcContract;
		addressStorage = addressRpcStorage;
	}else if(options_testnet){
		urlEtherscan = "https://ropsten.etherscan.io/";
		if(options_speedgame){
			addressContract = addressSpeedContract;
			addressStorage = addressSpeedStorage;
		} else {
			addressContract = addressTestContract;
			addressStorage = addressTestStorage;
		}
	}
	
	obj_game["game"] = this;
	obj_game["balance"] = 0;
	obj_game["balanceBank"] = 0;
	obj_game["balancePlEth"] = 0;
	_callback = obj_game["game"].response;
	
	if(options_debug){
		var str = "Debug";
		var tfDebug = addText(str, 20, "#FF0000", "#000000", "right", 400)
		tfDebug.x = _W-20;
		tfDebug.y = _H-30;
		this.face_mc.addChild(tfDebug);
	}
	
	this.game_mc.addChild(this.cards_mc);
	this.addChild(this.back_mc);
	this.addChild(this.game_mc);
	this.addChild(this.gfx_mc);
	this.addChild(this.face_mc);
	
	this.createGUI();
	this.createAccount();
	
	infura.sendRequest("getBalance", openkey, _callback);
	this.getBalancePlayer();
	this.getBalanceBank();
	this.getBalanceErc();
	infura.sendRequest("getBlockNumber", undefined, _callback);
	this.checkGameState(true);
	this.tfApprove = addText("Wait. Approve contract.", 50, "#FCB70F", "#4F3904", "center", 600, 4);
	this.tfApprove.x = _W/2;
	this.tfApprove.y = _H/2 - 35;
	this.face_mc.addChild(this.tfApprove);
	this.getAllowance();
	if(this.bApprove){
		this.getBankrolls();
	} else {
		// this.showWndApprove();
		this.acceptApprove();
	}
	this.getGameId();
	
	if(openkey){} else {
		this.showError(ERROR_KEY, showHome);
	}
	
	for(var i=0; i<52; i++){
		this.getCard(i);
	}

	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrGame.prototype.resetGame = function(){
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
	this.bClear = true;
	this.bWait = false;
	this.clearBet();
	this.clearGame();
}

ScrGame.prototype.clearGame = function(){
	idOraclizeGame = undefined;
	resultTxid = undefined;
	lastPlayerCard = 0;
	lastPlayerSplitCard = 0;
	lastHouseCard = 0;
	loadPlayerCard = 0;
	loadPlayerSplitCard = 0;
	loadHouseCard = 0;
	houseScore = 0;
	stateNow = -1;
	stateSplit = -1;
	_seed = "";
	_seedUsed = "";
	_currentMethod = -1;
	this.timeTotal = 0;
	this.timeCloseWnd = 0;
	this.timeNewCard = 0;
	this.timeWaitResponse = 0;
	this.countWait = 0;
	this.countPlayerCard = 0;
	this.countPlayerSplitCard = 0;
	this.countHouseCard = 0;
	this.myPoints = 0;
	this.mySplitPoints = 0;
	this.valPlayerScore = 0;
	this.valSplitScore = 0;
	this.bStand = false;
	this.bSplit = false;
	this.bStandSplit = false;
	this.bDouble = false;
	this.bSplitDouble = false;
	this.bEndTurnSplit = false;
	this.bWaitSplit = false;
	this.bClickStart = false;
	this.bStandNecessary = false;
	this.bShowResult = false;
	this._gameEnd = false;
	this.bInsurance = -1;
	var i = 0;
	
	for (i = 0; i < dealedCards.length; i++) {
		var card = dealedCards[i];
		this.cards_mc.removeChild(card);
	}
	for (i = 0; i < this._arHolder.length; i++) {
		var mc = this._arHolder[i];
		this.addHolderObj(mc);
	}
	
	dealedCards = [];
	if(this.cardSuit){
		this.cardSuit.width = this.cardSuit.w;
		this.cardSuit.visible = false;
	}
}

ScrGame.prototype.clearText = function(){
	if(this.btnClear){
		this.btnClear.alpha = 0.5;
		this.btnStart.alpha = 0.5;
		this.arrow.visible = true;
		this.tfStatus.setText("Select bet");
		this.tfYourBet.setText("Your bet: 0");
		this.tfMyBet.setText("");
		this.tfSplitBet.setText("");
		this.tfStatus.x = _W/2;
	}
}

ScrGame.prototype.clearBet = function(){
	betGame = 0;
	betSplitGame = 0;
	betGameOld = 0;
	valInsurance = 0;
	this.clearChips();
	this.clearSplitChips();
	this.clearText();
}

ScrGame.prototype.clearChips = function(){
	while (this._arChips.length > 0) {
		var chip = this._arChips[0];
		this.game_mc.removeChild(chip);
		this._arChips.shift();
	}
	this._arChips = [];
}

ScrGame.prototype.clearSplitChips = function(){	
	for (i = 0; i < this._arSplitChips.length; i++) {
		var chip = this._arSplitChips[i];
		this.game_mc.removeChild(chip);
	}
	this._arSplitChips = [];
}

ScrGame.prototype.createAccount = function() {
	if(privkey){
		if(openkey){}else{openkey=1, privkey=1};
		this.tfIdUser.setText(openkey);
	}else{
		/*var tfCreateKey = addText("Now you generate address", 40, "#FF8611", "#000000", "center", 800)
		tfCreateKey.x = _W/2;
		tfCreateKey.y = 120;
		this.face_mc.addChild(tfCreateKey);
		createjs.Tween.get(tfCreateKey).wait(3000).to({alpha:0},500)*/
		
		this.showError(ERROR_KEYTHEREUM);
	}
}

ScrGame.prototype.createGUI = function() {
	var scGui = 0.5;
	var stepY = 50;
	var icoKey = addObj("icoKey", 40, 40, scGui);
	icoKey.interactive = true;
	icoKey.buttonMode=true;
	icoKey._selected=false;
	this.face_mc.addChild(icoKey);
	this._arButtons.push(icoKey);
	var icoEthereum = addObj("icoEthereum", 40, 40+stepY*1, scGui);
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
	
	_oStartingCardOffset = new vector(1487,298);
	_oDealerCardOffset = new vector(_W/2-80,_H/2-200);
	_oReceiveWinOffset = new vector(418,820);
	_oFichesDealerOffset = new vector(_W/2-80,_H/2+70);
	_oRemoveCardsOffset = new vector(388,138);
	
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
	
	this.tfGetEth = addText("", 40, "#FFFFFF", "#000000", "center", 400)
	this.tfGetEth.x = _W/2;
	this.tfGetEth.y = 100;
	this.face_mc.addChild(this.tfGetEth);
	
	var offsetY = 50;
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
	this.arrow = addObj("hintArrow", _W/2-570, _H/2+150);
	this.arrow.rotation = rad(0);
	this.arrow.visible = false;
	this.game_mc.addChild(this.arrow);
	
	var strUser = 'id'
	var fontSize = 24;
	this.tfIdUser = addText(strUser, fontSize, "#ffffff", "#000000", "left", 1000, 4)
	this.tfIdUser.x = icoKey.x + 30;
	this.tfIdUser.y = icoKey.y - 12;
	this.face_mc.addChild(this.tfIdUser);
	this.tfBalance = addText(String(obj_game["balance"]) + " BET", fontSize, "#ffffff", "#000000", "left", 400, 4)
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
	this.tfVers2= addText(strVer, fontSize, "#ffffff", "#000000", "left", 400, 4)
	this.tfVers2.x = icoTime.x - 10;
	this.tfVers2.y = _H - this.tfVers2.height;
	this.face_mc.addChild(this.tfVers2);
	this.tfYourBet = addText("Your bet: 0", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	this.tfYourBet.x = -70;
	this.tfYourBet.y = 0;
	descBet.addChild(this.tfYourBet);
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
	var tfMinBet = addText("MIN BET: 0.05", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	tfMinBet.x = -100;
	tfMinBet.y = -100;
	descBet.addChild(tfMinBet);
	var tfMaxBet = addText("MAX BET: 5", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
	tfMaxBet.x = -90;
	tfMaxBet.y = -60;
	descBet.addChild(tfMaxBet);
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
	
	this.mixingCard = new ItemMixing(this);
	this.mixingCard.x = _W/2 + 400;
	this.mixingCard.y = _H/2 - 150;
	this.mixingCard.visible = false;
	this.addChild(this.mixingCard);
	
	var btnDeal = this.createButton2("btnDeal", "Deal", _W/2+90, 950, scGui);
	this.btnStart = btnDeal;
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
	
	if(options_rpc){
		var btnConfirm = addButton("btnContract", 180, _H - 80);
		btnConfirm.name = "btnConfirm";
		btnConfirm.interactive = true;
		btnConfirm.buttonMode=true;
		btnConfirm.overSc = true;
		btnConfirm.hint2 = 'Confirm';
		this.addChild(btnConfirm);
		this._arButtons.push(btnConfirm);
	}
	
	var btnLog = addButton("btnContract", 280, _H - 80);
	btnLog.name = "btnLog";
	btnLog.interactive = true;
	btnLog.buttonMode=true;
	btnLog.overSc = true;
	btnLog.hint2 = 'Show logs';
	this.addChild(btnLog);
	this._arButtons.push(btnLog);
	// btnLog.visible= false;
	
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
	
	if(openkey){
		this.tfIdUser.setText(openkey);
		if(options_rpc){
			this.bWait = false;
			this.showButtons(true);
			this.showChips(true);
		} else {
			this.bWait = true;
		}
	}
}

ScrGame.prototype.createWndInfo = function(str, callback, addStr) {
	if(this.wndInfo == undefined){
		this.wndInfo = new WndInfo(this);
		this.wndInfo.x = _W/2;
		this.wndInfo.y = _H/2;
		this.face_mc.addChild(this.wndInfo);
	}
	
	this.bWindow = true;
	this.wndInfo.show(str, callback, addStr)
	this.wndInfo.visible = true;
	this.curWindow = this.wndInfo;
}

ScrGame.prototype.showTooltip = function(item, str, _x, _y) {
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

ScrGame.prototype.showWndInsurance = function(str, callback) {
	if(this.wndInsurance == undefined){
		this.wndInsurance = new WndInsurance(this);
		this.wndInsurance.x = _W/2;
		this.wndInsurance.y = _H/2;
		this.face_mc.addChild(this.wndInsurance);
	}
	
	this.bWindow = true;
	this.wndInsurance.show(str, callback)
	this.wndInsurance.visible = true;
	this.curWindow = this.wndInsurance;
}

ScrGame.prototype.acceptApprove = function() {
	var prnt = obj_game["game"];
	if(obj_game["balancePlEth"] > 0 && _allowance < maxBet){
		login_obj["allowance"] = true;
		// approve(addressContract, 100000000000); // 1000 tokens
		approve(100000000000); // 1000 tokens
		prnt.bClickApprove = true;
		prnt.bWait = true;
		prnt.showChips(false);
	} else {
		prnt.showError(ERROR_BALANCE);
	}
}

ScrGame.prototype.showWndApprove = function() {
	var str = "Do you want to approve the cancellation of 1000 tokens inside the game?";
	if(obj_game["balancePlEth"] > 0){
		this.createWndInfo(str, this.acceptApprove, "Approve");
	} else {
		this.showError(ERROR_BALANCE);
	}
}

ScrGame.prototype.closeWindow = function(wnd) {
	if(false){
		wnd.visible = false;
		obj_game["game"].curWindow = undefined;
	} else {
		obj_game["game"].curWindow = wnd;
		obj_game["game"].timeCloseWnd = 200;
	}
}

ScrGame.prototype.addChip = function(name, x, y, type) {
	var array = this._arChips;
	if(type == "split"){
		array = this._arSplitChips;
	}
	var chip = addObj(name, x, y, scaleChip);
	this.game_mc.addChild(chip);
	array.push(chip);
}

ScrGame.prototype.addBtnChip = function(name, x, y) {	
	var chip = addButton(name, x, y, scaleChip);
	chip.interactive = true;
	chip.buttonMode=true;
	chip.overSc=true;
	this.face_mc.addChild(chip);
	this._arButtons.push(chip);
	this._arBtnChips.push(chip);
}

ScrGame.prototype.createButton = function(name, x, y, label, sc, size) {
	if(sc){}else{sc=1}
	if(size){}else{size=22}
	
	var skin = "btnDefault";
	
	var btn = addButton(skin, x, y, sc);
	btn.name = name;
	btn.interactive = true;
	btn.buttonMode=true;
	btn.overSc=true;
	if(name == "btnSmart" || name == "btnDao"){
		this.addChild(btn);
	} else {
		this.face_mc.addChild(btn);
	}
	this._arButtons.push(btn);
	var tf = addText(label, size, "#FFFFFF", undefined, "center", 350)
	tf.x = 0;
	tf.y = -tf.height/2;
	btn.addChild(tf);
	
	return btn;
}

ScrGame.prototype.createButton2 = function(name, title, x, y, sc) {
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

ScrGame.prototype.showChips = function(value) {
	var a = 0.5;
	var alpha = a;
	
	if(value){
		alpha = 1;
	}
	if(this.startGame || 
	_countBankrollers == 0 || 
	!_haveBankroll){
		alpha = a;
	}
	if(betGame != 0 && value && this.bWait){
		alpha = a;
	}
	
	for (var i = 0; i < this._arBtnChips.length; i++) {
		var obj = this._arBtnChips[i];
		obj.alpha = alpha;
	}
	
	if(value && betGame == 0 && _countBankrollers > 0){
		this.bClear = false;
		this.bWait = false;
		this.arrow.visible = true;
		this.tfStatus.setText("Select bet");
	}
}

ScrGame.prototype.showButtons = function(value) {
	if(this.tfStatus.getText() == _strWaitBlockchain && value){
		return;
	}
	if(!_haveBankroll){
		return;
	}
	
	var a = 0.5;
	var alpha = a;
	if(value){
		alpha = 1;
	}
	
	// if(this._arMyCards.length == 0 && betGame > 0){ // TODO fixed first game
		// this.btnStand.visible = true;
		// this.btnStand.alpha = 1;
		// this.btnStart.visible = false;
		// this.btnClear.visible = false;
		// return;
	// }
	
	if(this.startGame){
		this.btnHit.visible = true;
		this.btnStand.visible = true;
		this.btnStart.visible = false;
		this.btnClear.visible = false;
	} else {
		this.btnHit.visible = false;
		this.btnStand.visible = false;
		this.btnStart.visible = true;
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
}

ScrGame.prototype.showPlayerCard = function(card){
	if(card){
		// IN_PROGRESS_SPLIT
		if(this.mySplitPoints > 0){
			card.x = _W/2 - 200 + lastPlayerCard*30;
			this.tfMyPoints.x = _W/2-270;
		} else {
			card.x = _W/2 - 80 + lastPlayerCard*30;
			this.tfMyPoints.x = _W/2-150;
		}
		card.y = _H/2 + 70;
		this.cards_mc.addChild(card);
		lastPlayerCard++;
		dealedCards.push(card);
		this._arMyCards.push(card);
		this._arMyPoints.push(card.point);
		
		this.showMyPoints();
	}
}

ScrGame.prototype.showPlayerSplitCard = function(card){
	if(card){
		var offsetY = 50;
		card.x = _W/2 + 200 + lastPlayerSplitCard*30;
		card.y = _H/2 + 70;
		this.cards_mc.addChild(card);
		lastPlayerSplitCard++;
		dealedCards.push(card);
		this._arMySplitCards.push(card);
		this._arMySplitPoints.push(card.point);
		this.showMySplitPoints();
	}
}

ScrGame.prototype.offsetCards = function(type, value) {
	var prnt = obj_game["game"];
	var array = prnt._arMyCards;
	if(type == "split"){
		array = prnt._arMySplitCards;
	} else if(type == "house"){
		array = prnt._arHouseCards;
	}
	for (var i = 0; i < array.length; i++) {
		var card = array[i];
		card.x = value + i*30;
	}
}

ScrGame.prototype.darkCards = function(array, value) {
	for (var i = 0; i < array.length; i++) {
		var card = array[i];
		if(value){
			card.img.tint = 0x999999;
		} else {
			card.img.tint = 0xffffff;
		}
	}
}

ScrGame.prototype.showMyPoints = function(){
	this.myPoints = this.getMyPoints();
	if(this.myPoints > 0){
		this.tfMyPoints.setText(this.myPoints);
	} else {
		this.tfMyPoints.setText("");
	}
}

ScrGame.prototype.autoSplitStand = function(){
	this.bEndTurnSplit = true;
	if(this.bSplit && !this.bStandSplit){
		this.bStandSplit = true;
		if(_currentMethod == HIT){
			this.bSplit = false;
		}
	} //else {
		// this.bStand = true;
	// }
	
	this.showButtons(false);
	this.darkCards(this._arMyCards, false);
	this.darkCards(this._arMySplitCards, true);
}

ScrGame.prototype.showMySplitPoints = function(){
	this.mySplitPoints = this.getMySplitPoints();
	if(this.mySplitPoints > 0){
		this.tfMySplitPoints.setText(this.mySplitPoints);
		if(!this.bEndTurnSplit){
			if(this.mySplitPoints > 21){
				this.autoSplitStand();
			} else if(this.mySplitPoints == 21){
				this.autoSplitStand();
			}
		}
	} else {
		this.tfMySplitPoints.setText("");
	}
}

ScrGame.prototype.showHouseCard = function(card){
	if(card){
		card.x = _W/2 - 80 + lastHouseCard*30;
		card.y = _H/2 - 200;
		this.cards_mc.addChild(card);
		lastHouseCard++;
		dealedCards.push(card);
		this._arHouseCards.push(card);
		this._arHousePoints.push(card.point);
		
		this.showHousePoints();
	}
}

ScrGame.prototype.showHousePoints = function(){
	this.housePoints = this.getHousePoints();
	if(this.housePoints > 0){
		this.tfHousePoints.setText(this.housePoints);
	} else {
		this.tfHousePoints.setText("");
	}
}

ScrGame.prototype.getMyPoints = function(){
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

ScrGame.prototype.getMySplitPoints = function(){
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

ScrGame.prototype.getHousePoints = function(){
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

ScrGame.prototype.showSuitCard = function(){
	if(this.cardSuit){} else {
		this.cardSuit = addObj("suit", 0, 0, scaleCard);
		this.gfx_mc.addChild(this.cardSuit);
	}
	this.cardSuit.width = this.cardSuit.w;
	this.cardSuit.x = _W/2 - 80 + lastHouseCard*30;
	this.cardSuit.y = _H/2 - 200;
	if(this.bStand){
		this.cardSuit.visible = false;
	} else {
		this.cardSuit.visible = true;
	}
}

ScrGame.prototype.getNameCard = function(cardIndex){
	var cardType = Math.floor(cardIndex / 4);
	var cardSymbol = String(cardType);
	var s = cardIndex % 4 + 1;
	var suit = "";
	switch (cardType) {
		case 0:
			cardSymbol = "K";
			break;
		case 1:
			cardSymbol = "A";
			break;
		case 11:
			cardSymbol = "J";
			break;
		case 12:
			cardSymbol = "Q";
			break;
	}
	switch (s) {
		case 1:
			suit = "Hearts";
			break;
		case 2:
			suit = "Diamonds";
			break;
		case 3:
			suit = "Spades";
			break;
		case 4:
			suit = "Clubs";
			break;
	}
	
	var spriteName = suit + "_" + cardSymbol;
	return spriteName;
}

ScrGame.prototype.getCard = function(cardIndex){
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
	var newCard = addObj(spriteName, 0, 0, scaleCard);
	if(newCard){
		newCard.id = cardIndex;
		newCard.point = point;
		newCard.ace = ace;
	}else{
		// console.log("UNDEFINED spriteName:", cardIndex, spriteName);
	}
	
	return newCard;
}

ScrGame.prototype.getPlayerCardsNumber = function() {
	infura.ethCall("getPlayerCardsNumber", _callback, "latest");
}

ScrGame.prototype.getSplitCardsNumber = function() {
	infura.ethCall("getSplitCardsNumber", _callback, "latest");
}

ScrGame.prototype.getAllowance = function() {
	var key = openkey.substr(2);
	var spender = addressContract.substr(2);
	var data = "0x"+C_ALLOWANCE + pad(key, 64) + pad(spender, 64);
	var params = {"from":openkey,
				"to":addressCurErc,
				// "to":erc20address,
				"data":data};
	infura.sendRequest("getAllowance", params, _callback);
}

ScrGame.prototype.getInsurance = function(isMain) {
	if(isMain){
		infura.ethCall("getInsurance", _callback, "latest", 1);
	}else{
		infura.ethCall("getInsurance", _callback, "latest", 0);
	}
}

ScrGame.prototype.isInsuranceAvailable = function() {
	infura.ethCall("isInsuranceAvailable", _callback, "latest");
}

ScrGame.prototype.isDoubleAvailable = function() {
	if(((!this.bSplit && this._arMyCards.length == 2 && 
	this.myPoints > 8 && this.myPoints < 12) ||
	(this.bSplit && this._arMySplitCards.length == 2 &&
	this.mySplitPoints > 8 && this.mySplitPoints < 12)) &&
	obj_game["balance"] >= betGame){
		return true;
	}
	
	return false;
}

ScrGame.prototype.getBet = function(isMain) {	
	if(isMain){
		infura.ethCall("getPlayerBet", _callback, "latest", 1);
	} else {
		infura.ethCall("getSplitBet", _callback, "latest", 0);
	}
}

ScrGame.prototype.getGameId = function() {
	infura.ethCall("getGameId", _callback, "latest", 1);
}

ScrGame.prototype.getHouseCardsNumber = function() {
	infura.ethCall("getHouseCardsNumber", _callback, "latest");
}

ScrGame.prototype.isSplitAvailable = function() {
	var value = false;
	
	if((stateNow == S_IN_PROGRESS ||
	options_speedgame) && 
	this._arMyCards.length == 2 &&
	obj_game["balance"] >= betGame &&
	this.bSplit == false &&
	betGame > 0 &&
	this._arMySplitCards.length == 0 &&
	((this._arMyPoints[0] == this._arMyPoints[1]) ||
	(this._arMyCards[0].ace && this._arMyCards[1].ace))){
		value = true;
	}
	
	return value;
}

ScrGame.prototype.checkGameState = function(isMain) {	
	if(isMain){
		infura.ethCall("getGameState", _callback, "latest", 1);
	} else {
		infura.ethCall("getSplitState", _callback, "latest", 0);
	}
}

ScrGame.prototype.getHouseScore = function() {
	infura.ethCall("getHouseScore", _callback, "latest");
}

ScrGame.prototype.getPlayerScore = function(isMain) {	
	if(isMain){
		infura.ethCall("getPlayerScore", _callback, "latest", 1);
	} else {
		infura.ethCall("getPlayerSplitScore", _callback, "latest", 0);
	}
}

ScrGame.prototype.addCard = function(name, loadCard, countCard, array){
	var prnt = obj_game["game"];
	for (var i = loadCard; i < countCard; i++) {
		var cardIndex = array[i];
		prnt.timeNewCard = 1000;
		prnt.bWait = false;
			
		if(name == "arMyCards"){
			loadPlayerCard++;
			prnt._arNewCards.push({type:"player", id:cardIndex});
		} else if(name == "arMySplitCards"){
			loadPlayerSplitCard++;
			prnt._arNewCards.push({type:"split", id:cardIndex});
		} else if(name == "arHouseCards"){
			loadHouseCard ++;
			prnt._arNewCards.push({type:"house", id:cardIndex});
		}
	}
}

ScrGame.prototype.addPlayerCard = function(){
	for (var i = loadPlayerCard; i < this.countPlayerCard; i++) {
		if(options_debug){
			loadPlayerCard++;
			var cardIndex = Math.round(Math.random()*52);
			this._arNewCards.push({type:"player", id:cardIndex});
			this.showButtons(true);
			this.bWait = false;
			if(this.startGame){
				this.tfStatus.setText("");
			}
		} else {
			this.getPlayerCard(i);
		}
	}
	for (var j = loadPlayerSplitCard; j < this.countPlayerSplitCard; j++) {
		if(options_debug){
			loadPlayerSplitCard++;
			var cardIndex = Math.round(Math.random()*52);
			this._arNewCards.push({type:"player", id:cardIndex});
		} else {
			this.getSplitCard(j);
		}
	}
}

ScrGame.prototype.addHouseCard = function(){
	for (var i = loadHouseCard; i < this.countHouseCard; i++) {
		if(options_debug){
			loadHouseCard ++;
			var cardIndex = Math.round(Math.random()*52);
			this._arNewCards.push({type:"house", id:cardIndex});
		} else {
			this.getHouseCard(i);
		}
	}
}

ScrGame.prototype.getPlayerCard = function(value){
	infura.ethCall("getPlayerCard", _callback, "latest", value);
}

ScrGame.prototype.getSplitCard = function(value){
	infura.ethCall("getSplitCard", _callback, "latest", value);
}

ScrGame.prototype.getHouseCard = function(value){
	infura.ethCall("getHouseCard", _callback, "latest", value);
}

ScrGame.prototype.getBalancePlayer = function(){
	var prnt = obj_game["game"];
	var value = callERC20("balanceOf", openkey);
	obj_game["balance"] = Number(value);
	login_obj["balance"] = obj_game["balance"];
	
	if(prnt.oldBalance == -1 && obj_game["balance"] > 0){
		_balancePlSpeed = obj_game["balance"];
	}
	if(obj_game["balance"] > 0){
		prnt.tfGetEth.setText("");
		if(prnt.oldBalance == -1){
			prnt.oldBalance = Number(obj_game["balance"]);
			prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
		}
	}
	if(options_speedgame){
		prnt.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
	} else {
		prnt.tfBalance.setText(convertToken(obj_game["balance"]) + " BET");
	}
}

ScrGame.prototype.getBalanceBank = function(){
	var prnt = obj_game["game"];
	var value = callERC20("balanceOf", addressContract);
	obj_game["balanceBank"] = Number(value);
	login_obj["balanceBank"] = obj_game["balanceBank"];
}

ScrGame.prototype.getBalanceErc = function(){
	var prnt = obj_game["game"];
	var value = callERC20("balanceOf", addressCurErc);
	// var value = callERC20("balanceOf", erc20address);
	obj_game["balanceErc"] = Number(value);
	login_obj["balanceErc"] = obj_game["balanceErc"];
}

ScrGame.prototype.clickHit = function(){
	this.showButtons(false);
	this.bWait = true;
	if(options_debug){
		_currentMethod = HIT;
		this.sendSeed(this.makeID());
	} else {
		infura.sendRequest("hit", openkey, _callback);
	}
}

ScrGame.prototype.clickStand = function(){
	this.bWait = true;
	if(this.bSplit && !this.bStandSplit){
		this.bStandSplit = true;
		// this.bSplit = false;
	}
	if(!this.bSplit){
		this.bStand = true;
	}
	this.showButtons(false);
	
	if(options_debug){
		_currentMethod = STAND;
		this.sendSeed(this.makeID());
	} else {
		infura.sendRequest("stand", openkey, _callback);
	}
}

ScrGame.prototype.clickDouble = function(){
	this.bWait = true;
	if(!this.bSplit){
		this.bStand = true;
	}
	this.showButtons(false);
	if(options_debug){
		_currentMethod = DOUBLE;
		this.sendSeed(this.makeID());
	} else {
		infura.sendRequest("double", openkey, _callback);
	}
	
	if(options_speedgame){
		console.log("clickDouble:", this.bSplit, betSplitGame);
		if(this.bSplit){
			_balancePlSpeed -= betSplitGame;
			betSplitGame *= 2;
			objSpeedGame.betSplitGame = betSplitGame;
			this.bSplitDouble = true;
			this.fillChips(betSplitGame, "split");
			var str = String(convertToken(betSplitGame));
			this.tfSplitBet.setText(str);
		} else {
			_balancePlSpeed -= betGame;
			betGame *= 2;
			objSpeedGame.betGame = betGame;
			this.bDouble = true;
			if(this._arMySplitCards.length > 0){
				this.fillChips(betGame, "main");
			} else {
				this.fillChips(betGame);
			}
			var str = String(convertToken(betGame));
			this.tfMyBet.setText(str);
		}
		this.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
	}
}

ScrGame.prototype.clickSplit = function(){
	if(obj_game["balance"] < betGame && obj_game["balancePlEth"] == 0){
		obj_game["game"].showError(ERROR_BALANCE);
		return false;
	}
	
	this.showButtons(false);
	this.bSplit = true;
	this.fillChips(betGame);
	this.fillChips(betGame, "split");
	var str = String(convertToken(betGame));
	this.tfMyBet.setText(str);
	this.tfMyBet.x = _W/2 - 250;
	this.tfSplitBet.setText(str);
	
	this.bWait = true;
	this.bWaitSplit = true;
	this._arMySplitCards = [this._arMyCards[1]];
	this._arMyCards = [this._arMyCards[0]];
	lastPlayerCard = 1;
	loadPlayerCard = 1;
	lastPlayerSplitCard = 1;
	loadPlayerSplitCard = 1;
	this.countPlayerCard = 1;
	this._arMyCards[0].x = _W/2 - 200;
	this._arMySplitCards[0].x = _W/2 + 200;
	this.tfMyPoints.x = _W/2-270;
	this._arMyPoints = [this._arMyCards[0].point];
	this._arMySplitPoints = [this._arMySplitCards[0].point];
	this.showMyPoints();
	this.showMySplitPoints();
	this.darkCards(this._arMyCards, true);
	this.darkCards(this._arMySplitCards, false);
	
	if(options_debug){
		_currentMethod = SPLIT;
		this.sendSeed(this.makeID());
	} else {
		infura.sendRequest("split", openkey, _callback);
	}
	
	if(options_speedgame){
		_balancePlSpeed -= betGame;
		betSplitGame = betGame;
		objSpeedGame.betGame = betGame;
		objSpeedGame.betSplitGame = betSplitGame;
		this.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
	}
}

ScrGame.prototype.clickInsurance = function(){
	var prnt = obj_game["game"];
	prnt.bInsurance = 1;
	infura.sendRequest("requestInsurance", openkey, _callback);
	prnt.bWait = true;
	prnt.showButtons(false);
	
	if(options_speedgame){
		_balancePlSpeed -= (0.5*betGame)/valToken;
		prnt.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
		prnt.bInsurance = 2;
	}
}

ScrGame.prototype.confirmSeed = function(){
	if(options_rpc && _seed == _seedUsed){
		return false;
	}
	
	if(_seed != ""){
		infura.sendRequest("confirm", openkey, _callback);
	}
}

ScrGame.prototype.fullscreen = function() {
	 if(options_fullscreen) { 
		this._fCancelFullScreen.call(window.document);
		options_fullscreen = false;
	}else{
		this._fRequestFullScreen.call(window.document.documentElement);
		options_fullscreen = true;
	}
}

ScrGame.prototype.fillChips = function(value, type){
	var setBet = value;
	var countChip = 0;
	var posX = this.seat.x;
	
	if(type == "split"){
		this.clearSplitChips();
		posX += 200;
	} else if(this.bSplit || 
	stateNow == S_IN_PROGRESS_SPLIT || 
	this.countPlayerSplitCard > 0 || 
	type == "main"){
		this.clearChips();
		posX -= 200;
	} else {
		this.clearChips();
	}
	while(setBet > 0){
		var posY = this.seat.y-countChip*6;
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

ScrGame.prototype.sendChip = function(item_mc, betGame, type){
	var prnt = obj_game["game"];
	var chip = prnt.createObj(item_mc, item_mc.name, scaleChip);
	if(chip == undefined){
		prnt.fillChips(betGame);
		return false;
	}
	var _x = prnt.seat.x;
	var _y = prnt.seat.y;
	if(type == "split"){
		_x += 200;
	} else if(prnt.bSplit){
		_x -= 200;
	}
	createjs.Tween.get(chip).to({x:_x, y:_y},500)
							.call(function(){
								prnt.addHolderObj(chip);
								prnt.fillChips(betGame);
							});
}

ScrGame.prototype.sendCard = function(obj){
	var type = obj.type;
	var cardIndex = obj.id;
	var prnt = obj_game["game"];
	var card = undefined;
	var suit = prnt.createObj({x:1487, y:298}, "suit", scaleCard);
	var _x = 0;
	var _y = 0;
	
	if(type != "suit"){
		card = prnt.getCard(cardIndex);
	}
	
	if(type == "player"){
		// IN_PROGRESS_SPLIT
		if(prnt.mySplitPoints > 0){
			_x = _W/2 - 200 + lastPlayerCard*30;
			if(prnt.bSplit/* && stateNow == S_IN_PROGRESS_SPLIT*/){
				card.img.tint = 0x999999;
			}
		} else {
			_x = _W/2 - 80 + lastPlayerCard*30;
		}
		_y = _H/2 + 70;
		prnt.showPlayerCard(card);
		if(betGame > 0 || options_speedgame){
			prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
		}
	} else if(type == "split"){
		_x = _W/2 + 200 + lastPlayerSplitCard*30;
		_y = _H/2 + 70;
		if(!prnt.bSplit/* || stateNow == S_IN_PROGRESS*/){
			card.img.tint = 0x999999;
		}
		prnt.showPlayerSplitCard(card);
		if(betGame > 0 || options_speedgame){
			prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
		}
	} else if(type == "house"){
		_x = _W/2 - 80 + lastHouseCard*30;
		_y = _H/2 - 200;
		prnt.showHouseCard(card);
		
		if(loadHouseCard==1){
			prnt._arNewCards.push({type:"suit", id:0});
			if(valInsurance == 0 && card.point == 11 && prnt.myPoints != BLACKJACK){
				prnt.showInsurance();
			}
		}
	} else if(type == "suit"){
		_x = _W/2 - 80 + lastHouseCard*30;
		_y = _H/2 - 200;
		prnt.showSuitCard();
		card = prnt.cardSuit;
	}
	
	if(card){
		prnt.checkResult(true);
		prnt.checkResult(false);
		card.visible = false;
		if(type == "suit"){
			createjs.Tween.get(suit).to({x:_x, y:_y},400)
								.call(function(){
									prnt.addHolderObj(suit);
									card.visible = true;
								});
		} else {
			var bSuit = false;
			if(prnt.cardSuit){
				if(loadHouseCard > 1 && type == "house" && prnt.cardSuit.width == prnt.cardSuit.w){
					bSuit = true;
				}
			}
			if(bSuit){
				prnt.addHolderObj(suit);
				createjs.Tween.get(prnt.cardSuit).to({width:10},150)
								.call(function(){
									prnt.cardSuit.visible = false;
									card.visible = true;
								});
			} else {
				createjs.Tween.get(suit).to({x:_x, y:_y},400).to({width:10},150)
								.call(function(){
									prnt.addHolderObj(suit);
									card.visible = true;
								});
			}
		}
	} else {
		console.log("card: null");
	}
}

ScrGame.prototype.loadBet = function(value){
	if(betGame > 0){
		return false;
	}
	this.timeGetState = TIME_GET_STATE-1000;
	this.bBetLoad = true;
	this.bWait = false;
	this.arrow.visible = false;
	betGame = Number(hexToNum(value));
	betGameCur = betGame;
	var str = String(convertToken(betGame));
	if(betGame == 0){
		str = "";
	} else {
		this.startGame = true;
		this.bClickStart = true;
		idOldGame--;
		this.tfYourBet.setText("Your bet: " + str);
	}
	this.tfMyBet.setText(str);
	this.isSplitAvailable();
	this.fillChips(betGame);
	if(this.countPlayerSplitCard > 0){
		this.tfMyBet.x = _W/2 - 250;
		betSplitGame = betGame;
		this.fillChips(betSplitGame, "split");
		this.tfSplitBet.setText(convertToken(betSplitGame));
	}
}

ScrGame.prototype.clickChip = function(item_mc){
	var prnt = obj_game["game"];
	if(prnt.bApprove || options_rpc){}else{
		prnt.showWndApprove();
		return false;
	}
	prnt.tfApprove.visible = false;
	
	if(betGame == 0){
		prnt.clearChips();
		prnt.clearSplitChips();
	}
	
	var name = item_mc.name;
	var value = chipVale[Number(name.substr(5))]*valToken;
	var oldBet = betGame;
	betGame += value;
	betGame = toFixed(betGame, 2);
	
	if(betGame > obj_game["balance"] || obj_game["balancePlEth"] == 0){
		prnt.showError(ERROR_BALANCE);
		betGame = oldBet;
	} else if(betGame > maxBet){
		prnt.showError(ERROR_MAX_BET);
		betGame = oldBet;
	} else {
		var str = "Your bet: " + String(convertToken(betGame));
		prnt.tfYourBet.setText(str);
		prnt.tfSplitBet.setText("");
		prnt.tfMyBet.setText(convertToken(betGame));
		prnt.tfMyBet.x = _W/2-50;
	}
	if(betGame > 0){
		prnt.btnStart.alpha = 1;
		prnt.btnClear.alpha = 1;
		prnt.arrow.visible = false;
		if(!prnt.bClear){
			prnt.tfStatus.setText("");
			prnt.tfMyPoints.setText("");
			prnt.tfMySplitPoints.setText("");
			prnt.tfHousePoints.setText("");
			prnt._arMyPoints = [];
			prnt._arMySplitPoints = [];
			prnt._arHousePoints = [];
			prnt._arMyCards = [];
			prnt._arMySplitCards = [];
			prnt._arHouseCards = [];
			prnt.bClear = true;
			prnt.clearGame();
		}
	}
	
	if(betGameOld == betGame){
		return false;
	}
	betGameOld = betGame;
	prnt.sendChip(item_mc, betGame);
}

ScrGame.prototype.showSmartContract = function() {
	var url = urlEtherscan + "address/" + addressContract;
	if(options_mainet){
		url = "https://etherscan.io/" + "address/" + addressContract;
	}
	window.open(url, "_blank"); 
}

ScrGame.prototype.showError = function(value, callback) {
	var str = "ERR"
	var prnt = obj_game["game"];
	switch(value){
		case ERROR_KEYTHEREUM:
			str = "OOOPS! \n The key is not created. Try a different browser."
			break;
		case ERROR_BUF:
			str = "OOOPS! \n Transaction failed."
			prnt.resetGame();
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
	prnt.createWndInfo(str, callback);
}

ScrGame.prototype.showTestEther = function() {
	var str = "Your 1 test ether will be available shortly (about minute)";
	this.createWndInfo(str);
}

ScrGame.prototype.showInsurance = function() {
	if(!options_speedgame){
		var price = betGame/2;
		price = toFixed((convertToken(price)), 4);
		var str = "Do you want Insurance? \n " + price + " BET.";
		this.showWndInsurance(str, this.clickInsurance);
		this.bInsurance = 0;
	}
}

ScrGame.prototype.showResult = function(_name, _x, _y) {
	var prnt = obj_game["game"];
	var delay = this._arNewCards.length+4;
	var tf = prnt.createObj({x:_x, y:_y}, _name);
	tf.alpha = 0;
	if(options_speedgame){
		delay = 1;
	}
	createjs.Tween.get(tf).wait(1000*delay).to({y:_y, alpha:1},300).to({y:_y-50},500);
}

ScrGame.prototype.shareTwitter = function() {
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

ScrGame.prototype.shareFB = function() {
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

ScrGame.prototype.createObj = function(point, name, sc) {	
	if(sc){}else{sc = 1};
	var mc = undefined;
	var newObj = true;
	var prnt = obj_game["game"];
	
	for (var i = 0; i < prnt._arHolder.length; i++ ) {
		mc = prnt._arHolder[i];
		if (mc) {
			if (mc.dead && mc.name == name) {
				mc.visible = true;
				newObj = false;
				break;
			}
		}
	}
	
	if (newObj) {
		if(name == "tfBlackjack"){
			mc = addText(R_BLACKJACK, 50, "#FCB70F", "#4F3904", "left", 300, 4);
			mc.name = "tfBlackjack";
			mc.w = mc.width;
		} else if(name == "tfWin"){
			mc = addText(R_WIN, 50, "#FCB70F", "#4F3904", "left", 300, 4);
			mc.name = "tfWin";
			mc.w = mc.width;
		} else if(name == "tfBust"){
			mc = addText(R_BUST, 50, "#EC8018", "#3F2307", "left", 300, 4);
			mc.name = "tfBust";
			mc.w = mc.width;
		} else if(name == "tfLose"){
			mc = addText(R_LOSE, 50, "#D72319", "#64100B", "left", 300, 4);
			mc.name = "tfLose";
			mc.w = mc.width;
		} else if(name == "tfPush"){
			mc = addText(R_PUSH, 50, "#999999", "#333333", "left", 300, 4);
			mc.name = "tfPush";
			mc.w = mc.width;
		} else {
			mc = addObj(name, 0, 0, sc);
		}
		prnt.gfx_mc.addChild(mc);
		prnt._arHolder.push(mc);
	}
	
	mc.x = point.x;
	mc.y = point.y;
	mc.width = mc.w;
	mc.dead = false;
	
	return mc;
}

ScrGame.prototype.addHolderObj = function(obj){
	obj.visible = false;
	obj.dead = true;
	obj.x = _W + 150;
	obj.y = _H + 50;
}

ScrGame.prototype.makeID = function(count){
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

ScrGame.prototype.getLogs = function(){
	var params = {
		"fromBlock": blockNumber,
		// "fromBlock": "0x"+numToHex(1190236),
		"toBlock": "latest",
		"address": addressContract,
	}
	infura.sendRequest("getLogs", params, _callback);
}

ScrGame.prototype.showLogs = function(arLogs){
	if(arLogs == undefined){
		return false;
	}
	var prnt = obj_game["game"];
	var len = arLogs.length;
	var index = 0;
	if(len > 10){
		index = len-10;
	}
	console.log("showLogs: ---------------");
	for (var i = index; i < len; i ++) {
		var obj = arLogs[i];
		if(obj){
			var hash = obj.data;
			if(obj.data.length == 66){
				// console.log("logId:", i, obj.data);
			} else {
				var typeUnit = unit[hexToNum(hash.substring(0,66))];
				var typeCard = hexToNum(hash.substring(67,130));
				var typeS = hash.substring(131,194);
				console.log("dealContract:", typeUnit, typeCard, prnt.getNameCard(typeCard));
				// console.log("Result:", hexToNum(hash.substring(0,66)));
			}
		}
	}
}

ScrGame.prototype.getBankrolls = function(){
	var prnt = obj_game["game"];
	
	if(options_speedgame){
		var urlRequest = "https://platform.dao.casino/api/proxy.php?a=bankrolls&game="+metaCode;
		prnt.bWait = true;
		
		$.ajax(urlRequest).done(function (d) {
			prnt.bWait = false;
			var _arr = JSON.parse(d);
			if (!_arr) {
				prnt.showError(ERROR_BANKROLLER);      
				return;
			}
			
			_haveBankroll = true;
			
			_countBankrollers = _arr.length;
			prnt.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
			
			// load speed game
			if(login_obj["objSpeedGame"]){
				objSpeedGame = login_obj["objSpeedGame"];
				if(objSpeedGame.result){
					objSpeedGame = {result:false, idGame:idGame, lastGame:{}, betGame:0, betSplitGame:0};
					prnt.showChips(true);
				} else {
					prnt.responseServer(objSpeedGame.lastGame);
					idGame = objSpeedGame.idGame;
					betGame = objSpeedGame.betGame;
					betSplitGame = objSpeedGame.betSplitGame;
					if(betGame > 0){
						prnt.fillChips(betGame);
						prnt.tfMyBet.setText(betGame/valToken);
					}
					if(betGame > 0 && betSplitGame > 0){
						prnt.fillChips(betSplitGame, "split");
						prnt.tfSplitBet.setText(betSplitGame/valToken);
					}
					prnt.startGame = true;
					prnt.showButtons(true);
				}
			} else {
				prnt.showChips(true);
			}
		}).fail(function() {
			console.log("SERVER FAIL");
			_haveBankroll = true;
			_countBankrollers= 1;
			prnt.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
			addressContract = addressTestContract;
			addressStorage = addressTestStorage;
			options_speedgame = false;
			prnt.bWait = true;
			prnt.showButtons(false);
			prnt.checkGameState(true);
			prnt.bBetLoad = false;
			prnt.getBet(true);
			prnt.getBet(false);
			prnt.getGameId();
			if(stateNow != S_IN_PROGRESS && stateNow != S_IN_PROGRESS_SPLIT){
				prnt.tfApprove.setText("Speed mode don't work. \n You switched to slow mode.");
				prnt.tfApprove.visible = true;
				idOldGame = idGame;
			} else {
				idOldGame = idGame - 1;
			}
		});
	} else {
		_haveBankroll = true;
		_countBankrollers= 1;
		prnt.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
	}
}

ScrGame.prototype.checkResult = function(isMain){
	if(!options_speedgame){
		return;
	}
	
	var prnt = obj_game["game"];
	var points = prnt.mySplitPoints;
	var bet = betSplitGame/valToken;
	var betWin = 0;
	var countCard = prnt._arMySplitCards.length;
	var strResult = "";
	var str = "";
	var _x = _W/2 + 200-75;
	var _y = _H/2 - 35;
	
	if(isMain){
		countCard = prnt._arMyCards.length;
		points = prnt.myPoints;
		bet = betGame/valToken;
		_x = _W/2 - 80-75;
		if(prnt.mySplitPoints > 0){
			_x = _W/2 - 200-75;
		}
		
		if(prnt._gameEnd){
			return false;
		}
	}
	
	if(prnt._arNewCards.length == 1 && points > 0 && prnt.housePoints > 0){		
		if(points == BLACKJACK && prnt.housePoints == BLACKJACK && str==""){
			str = "tfPush";
			strResult = "+"+String(bet);
			betWin = bet;
			if(isMain){
				prnt._gameEnd = true;
			}
		}
		if (prnt.housePoints == BLACKJACK && points != BLACKJACK && str=="") {
			str = "tfLose";
			strResult = "-"+String(bet);
			if(isMain){
				prnt._gameEnd = true;
			}
        }
		
        if (points == BLACKJACK && str=="" && countCard == 2) {
			str = "tfBlackjack";
			bet = bet * 2.5;
			strResult = "+"+String(bet);
			betWin = bet;
			if(isMain){
				prnt._gameEnd = true;
			}
        }
        if (points > BLACKJACK && str=="") {
            str = "tfBust";
			strResult = "-"+String(bet);
			if(isMain){
				prnt._gameEnd = true;
				// prnt._arHouseCards.push(Math.floor(Math.random(51)));
			}
        }
		if (points == prnt.housePoints && str=="") {
            str = "tfPush";
			strResult = "+"+String(bet);
			betWin = bet;
        }
        if (points < prnt.housePoints && prnt.housePoints <= BLACKJACK && str=="") {
			str = "tfLose";
			strResult = "-"+String(bet);
        }
        if (str=="") {
			str = "tfWin";
			bet = bet * 2;
			strResult = "+"+String(bet);
			betWin = bet;
		}
		
		if(!prnt._gameEnd){
			if(prnt.bStand && !prnt.bSplit){
				prnt._gameEnd = true;
			} else if(points == BLACKJACK && isMain){
				if(prnt.bStandNecessary){
					prnt._gameEnd = true;
				} else {
					console.log("BLACKJACK: 21");
					prnt.showButtons(false);
					prnt.bWait = true;
					prnt.bStandNecessary = true;
					_currentMethod = STAND;
					prnt.sendSeed(_seed);
					
					return false;
				}
			}
		}
		
		if(!isMain && !prnt._gameEnd){
			if(_currentMethod == DOUBLE ||
			(prnt.mySplitPoints >= BLACKJACK && prnt.bSplit)){
				prnt.bSplit = false;
				prnt.bWait = false;
				prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
				prnt.darkCards(prnt._arMyCards, false);
				prnt.darkCards(prnt._arMySplitCards, true);
			}
		}
		
		if(prnt._gameEnd){
			prnt.showResult(str, _x, _y);
			if(isMain){				
				prnt.clearText();
				prnt.timeWaitResponse = 0;
				prnt.bClickStart = false;
				prnt.bWait = false;
				prnt.bShowResult = true;
				prnt.getBalanceBank();
				sessionIsOver = true;
				
				// if(options_debug){
					prnt.bWait = false;
					betGame = 0;
					betGameOld = 0;
					prnt.startGame = false;
					prnt.showChips(true);
				// }
				objSpeedGame.result = true;
				objSpeedGame.betGame = 0;
				objSpeedGame.betSplitGame = 0;
				
				login_obj["objSpeedGame"] = objSpeedGame;
				saveData();
				
				prnt.showButtons(false);
				// prnt.tfStatus.setText(_strWaitBlockchain);
				
				prnt.tfMyBet.setText(strResult);
			} else {
				betSplitGame = 0;
				prnt.tfSplitBet.setText(strResult);
			}
			_balancePlSpeed += betWin*valToken;
			prnt.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
		}
	}
}

// START
ScrGame.prototype.startGameEth = function(){
	if(openkey == undefined){
		obj_game["game"].showError(ERROR_KEY, showHome);
		return false;
	}
	
	this.bClickStart = true;
	if(options_debug){
		_currentMethod = DEAL;
		this.sendSeed(this.makeID());
		this.startGame = true;
	} else {
		infura.sendRequest("deal", openkey, _callback);
	}
	if(options_speedgame){
		sessionIsOver = false;
		_balancePlSpeed -= betGame//valToken;
		this.tfBalance.setText(convertToken(_balancePlSpeed) + " BET");
		objSpeedGame.betGame = betGame;
		if(objSpeedGame.idGame == -1){
			objSpeedGame.idGame = idGame;
		} else {
			objSpeedGame.idGame ++;
		}
	}
}

ScrGame.prototype.sendUrlRequest = function(url, name) {
	var xhr = new XMLHttpRequest();
	var str = url;
	xhr.open("GET", str, true);
	xhr.send(null);
	xhr.onreadystatechange = function() { // (3)
		if (xhr.readyState != 4) return;

		if (xhr.status != 200) {
			console.log("err:" + xhr.status + ': ' + xhr.statusText);
		} else {
			obj_game["game"].response(name, xhr.responseText) 
		}
	}
}

ScrGame.prototype.sendSeed = function(seed) {
	var prnt = obj_game["game"];
	var isMain = true;
	if(prnt.bSplit){
		isMain = false;
	}
	
	if(!isMain && _currentMethod == STAND){
		prnt.bSplit = false;
		prnt.bWait = false;
		prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
		prnt.darkCards(prnt._arMyCards, false);
		prnt.darkCards(prnt._arMySplitCards, true);
	} else {
		var objGame = {"arMyCards":prnt._arMyCards,
				"arMySplitCards":prnt._arMySplitCards,
				"arHouseCards":prnt._arHouseCards,
				"myPoints":prnt.getMyPoints(),
				"splitPoints":prnt.getMySplitPoints(),
				"housePoints":prnt.getHousePoints()}
		
		_contract.confirmSeed(seed, _currentMethod, objGame, isMain);
	}
}

ScrGame.prototype.responseServer = function(value) {
	var prnt = obj_game["game"];
	prnt.tfStatus.setText("");
	// login_obj["lastGame"] = value;
	prnt.bWait = false;
	
	objSpeedGame.result = false;
	objSpeedGame.lastGame = value;
	login_obj["objSpeedGame"] = objSpeedGame;
	saveData();
	
	for(var name in value){
		var obj = value[name];
		switch(name){
			case "arMyCards":
				prnt.countPlayerCard = obj.length;
				prnt.addCard(name, loadPlayerCard, prnt.countPlayerCard, obj);
				break;
			case "arMySplitCards":
				prnt.countSplitCard = obj.length;
				prnt.addCard(name, lastPlayerSplitCard, prnt.countSplitCard, obj);
				break;
			case "arHouseCards":
				prnt.countHouseCard = obj.length;
				prnt.addCard(name, loadHouseCard, prnt.countHouseCard, obj);
				break;
		}
	}
}

ScrGame.prototype.responseTransaction = function(name, value) {
	var prnt = obj_game["game"];
	var data = "";
	var seed = prnt.makeID();
	var args = [];
	var price = 0;
	var nameRequest = "sendRaw";
	var gasPrice="0x"+numToHex(40000000000);
	var gasLimit=0x927c0; //web3.toHex('600000');
	if(name == "deal"){
		_currentMethod = DEAL;
		data = "0x"+C_DEAL+pad(numToHex(betGame), 64);
		price = betGame;
		args = [price, seed];
		betGameCur = betGame;
		nameRequest = "gameTxHash";
	} else if(name == "hit"){
		_currentMethod = HIT;
		data = "0x"+C_HIT;
		args = [seed];
	} else if(name == "stand"){
		_currentMethod = STAND;
		data = "0x"+C_STAND;
		args = [seed];
	} else if(name == "split"){
		_currentMethod = SPLIT;
		data = "0x"+C_SPLIT;
		price = betGame;
		args = [price, seed];
		gasLimit=0xf4240; //1000000
		prnt.offsetCards("player", _W/2 - 200);
		prnt.darkCards(prnt._arMyCards, true);
	} else if(name == "requestInsurance"){
		_currentMethod = INSURANCE;
		data = "0x"+C_INSURANCE;
		price = betGame/2;
		args = [price];
		prnt.bInsurance = 2;
	} else if(name == "double"){
		_currentMethod = DOUBLE;
		data = "0x"+C_DOUBLE;
		price = betGame;
		args = [price, seed];
		if(stateNow == S_IN_PROGRESS_SPLIT){
			betSplitGame = betGame;
			prnt.fillChips(betSplitGame, "split");
			prnt.tfSplitBet.setText(convertToken(betSplitGame));
		} else {
			betGameCur = betGame;
			if(prnt.bSplit){
				prnt.fillChips(betGame, "main");
				prnt.tfMyBet.setText(convertToken(betGame));
			}
		}
	} else if(name == "confirm"){
		_currentMethod = CONFIRM;
		data = "0x"+C_CONFIRM;
		var v = 27;
		var r = prnt.makeID();
		var s = prnt.makeID();
		if(options_rpc){
			args = [_seed, v, r, _seed];
			console.log("confirm", _seed);
		} else {
			args = [_seed, v, r, s];
		}
		_seedUsed = _seed;
	}
	
	if(name != "confirm"){
		_seed = seed;
	}
	
	if(_nonceTx == ""){
		_nonceTx = value;
	} else {
		_nonceTx = numToHex(hexToNum(_nonceTx) + 1);
	}
	
	prnt.getBalancePlayer();
	var options = {};
	options.nonce = _nonceTx;
	options.to = addressContract;
	options.gasPrice = gasPrice;
	options.gasLimit = gasLimit;
	// options.value = price;
	// options.data = data; // method from contact
	
	if(privkey){
		// console.log("The transaction was signed:", name);
		// The transaction was signed
		
		if(ks){
			ks.keyFromPassword(passwordUser, function (err, pwDerivedKey) {
				if (err) {
					console.log("err:", err);
					prnt.showError(ERROR_BUF);
					return false;
				}
				
				var registerTx = lightwallet.txutils.functionTx(abi, name, args, options);
				var params = "0x"+lightwallet.signing.signTx(ks, pwDerivedKey, registerTx, sendingAddr);
				infura.sendRequest(nameRequest, params, _callback, seed, _currentMethod);
				prnt.timeWaitResponse = TIME_LONG_RESPONSE;
			})
		} else {
			prnt.showError(ERROR_BUF);
			if(prnt.countPlayerCard == 0){
				prnt.clearBet();
				prnt.tfStatus.setText("");
				prnt.showChips(true);
				prnt.bClickStart = false;
			}
			prnt.bWait = false;
		}
	}
}

ScrGame.prototype.response = function(command, value, error) {
	var prnt = obj_game["game"];
	
	if(value == undefined || error){
		if((command == "sendRaw" || command == "gameTxHash")){
			if(error){
				// OUT OF GAS - error client (wrong arguments from the client)
				// invalid JUMP - throw contract
				console.log("response:", error);
				prnt.showError(error.message);
			} else {
				prnt.showError(ERROR_CONTRACT);
			}
			prnt.bWait = false;
			if(prnt.countPlayerCard == 0){
				prnt.clearBet();
				prnt.tfStatus.setText("");
				prnt.bClickStart = false;
				prnt.showChips(true);
			}
		}
		return false;
	}
	
	// console.log("response:", command, value);
	if(command == "gameTxHash"){
		prnt.startGame = true;
		prnt.getBalancePlayer();
		prnt.timeGetState = TIME_GET_STATE - 1000;
		prnt.timeWaitResponse = 0;
	} else if(command == "getEthereum"){
		var obj = JSON.parse(value);
		if(prnt.tfGetEth){
			prnt.tfGetEth.setText("Your 1 test ether will be available shortly (about minute)");
		}
		prnt.getBalancePlayer();
	} else if(command == "getBalance"){
		obj_game["balancePlEth"] = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
	} else if(command == "getBalanceBank"){
		obj_game["balanceBank"] = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
	} else if(command == "getBlockNumber"){
		blockNumber = value;
	} else if(command == "getLogs"){
		prnt.showLogs(value);
	} else if(command == "getPlayerCard"){
		if(value != "0x" && loadPlayerCard < prnt.countPlayerCard){
			var cardIndex = hexToNum(value);
			loadPlayerCard++;
			prnt.timeNewCard = 1000;
			prnt._arNewCards.push({type:"player", id:cardIndex});
			console.log("dealContract: Main", cardIndex, prnt.getNameCard(cardIndex));
			prnt.bWait = false;
		}
	} else if(command == "getSplitCard"){
		if(value != "0x" && loadPlayerSplitCard < prnt.countPlayerSplitCard){
			var cardIndex = hexToNum(value);
			loadPlayerSplitCard++;
			prnt.timeNewCard = 1000;
			prnt._arNewCards.push({type:"split", id:cardIndex});
			console.log("dealContract: Split", cardIndex, prnt.getNameCard(cardIndex));
			prnt.bWait = false;
		}
	} else if(command == "getHouseCard"){
		if(value != "0x" && loadHouseCard < prnt.countHouseCard){
			var cardIndex = hexToNum(value);
			loadHouseCard++
			prnt.timeNewCard = 1000;
			prnt._arNewCards.push({type:"house", id:cardIndex});
			console.log("dealContract: House", cardIndex, prnt.getNameCard(cardIndex));
			prnt.bWait = false;
		}
	} else if(command == "getPlayerCardsNumber"){
		if(!prnt.bWaitSplit && hexToNum(value) > prnt.countPlayerCard){
			prnt.countPlayerCard = hexToNum(value);
			prnt.addPlayerCard();
		}
	} else if(command == "getSplitCardsNumber"){
		if(hexToNum(value) > prnt.countPlayerSplitCard){
			prnt.countPlayerSplitCard = hexToNum(value);
			prnt.addPlayerCard();
			if(prnt.countPlayerSplitCard > 0){
				prnt.bWaitSplit = false;
			}
		}
	} else if(command == "getHouseCardsNumber"){
		if(hexToNum(value) > prnt.countHouseCard){
			prnt.countHouseCard = hexToNum(value);
			prnt.addHouseCard();
		}
	} else if(command == "getGameId"){
		idGame = hexToNum(value);
		if(idOldGame == -1){
			idOldGame = idGame;
		}
	} else if(command == "getPlayerBet"){
		if(!options_speedgame){
			if(!prnt.bBetLoad){
				prnt.bBetLoad = true;
				if((stateNow == S_IN_PROGRESS ||
				stateNow == S_IN_PROGRESS_SPLIT) &&
				Number(hexToNum(value)) > 0
				&& prnt.tfStatus){
					prnt.getSplitCardsNumber();
					prnt.getPlayerCardsNumber();
					prnt.getHouseCardsNumber();
					prnt.loadBet(value);
				} else {
					prnt.showChips(true);
				}
			} else {
				betGame = Number(hexToNum(value));
				if(betGame > 0 && prnt._arMyCards.length > 0){
					prnt.fillChips(betGame);
					prnt.tfMyBet.setText(betGame/valToken);
				}
			}
		}
	} else if(command == "getSplitBet"){
		if(!options_speedgame){
			betSplitGame = Number(hexToNum(value));
			if(betGame > 0 && betSplitGame > 0 && 
			(prnt._arMySplitCards.length > 0 || !prnt.bBetLoad)){
				prnt.fillChips(betSplitGame, "split");
				prnt.tfSplitBet.setText(betSplitGame/valToken);
			}
		}
	} else if(command == "isInsuranceAvailable"){
		if((stateNow == S_IN_PROGRESS ||
		stateNow == S_IN_PROGRESS_SPLIT) && 
		prnt.bInsurance == -1 && prnt._arMyCards.length == 2 &&
		hexToNum(value) && valInsurance == 0 && obj_game["balance"] > 0){
			prnt.showInsurance();
		}
	} else if(command == "getHouseScore"){
		houseScore = Number(hexToNum(value));
	} else if(command == "getPlayerSplitScore"){
		var point = Number(hexToNum(value));
		var bet = betSplitGame/valToken;
		var strResult = "";
		prnt.valSplitScore = point;
		switch (stateSplit){
			case S_BLACKJACK:
			case S_PLAYER_WON:
				if(point == 21 && prnt.countPlayerSplitCard == 2){
					bet = bet * 2.5;
				} else {
					bet = bet * 2;
				}
				strResult = "+"+String(bet);
				break;
			case S_HOUSE_WON:
				strResult = "-"+String(bet);
				break;
			case S_TIE:
				strResult = "+"+String(bet);
				break;
		}
		
		prnt.tfSplitBet.setText(strResult);
	} else if(command == "getPlayerScore"){
		var point = Number(hexToNum(value));
		var bet = betGame/valToken;
		var strResult = "";
		prnt.valPlayerScore = point;
		if(!prnt._gameEnd){
			switch (stateNow){
				case S_BLACKJACK:
				case S_PLAYER_WON:
					if(point == 21 && prnt.countPlayerCard == 2){
						bet = bet * 2.5;
					} else {
						bet = bet * 2;
					}
					strResult = "+"+String(bet);
					break;
				case S_HOUSE_WON:
					if(prnt.bInsurance == 2 && houseScore == 21){
						bet = bet/2;
					}
					strResult = "-"+String(bet);
					break;
				case S_TIE:
					strResult = "+"+String(bet);
					break;
			}
		
			prnt.tfMyBet.setText(strResult);
		}
	} else if(command == "getSplitState"){
		if(value != "0x" && !options_speedgame){
			stateSplit = hexToNum(value);
			if(!prnt.bShowResult){
				var _x = _W/2 + 200-75;
				var _y = _H/2 - 35;
				switch (stateSplit){
					case S_PLAYER_WON:
							prnt.showResult("tfWin", _x, _y);
						break;
					case S_BLACKJACK:
							if(prnt.countPlayerSplitCard == 2){
								prnt.showResult("tfBlackjack", _x, _y);
							} else {
								prnt.showResult("tfWin", _x, _y);
							}
						break;
					case S_HOUSE_WON:
						// if(prnt.mySplitPoints > 21){
							// prnt.showResult("tfBust", _x, _y);
						// } else {
							prnt.showResult("tfLose", _x, _y);
						// }
						break;
					case S_TIE:
						prnt.showResult("tfPush", _x, _y);
						break;
				}
			}
		}
	} else if(command == "getGameState"){
		if(value != "0x"){
			stateNow = hexToNum(value);
		}
		
		if(!prnt.bApprove || options_debug || (options_speedgame/*&& !options_rpc*/)){
			return false;
		}
		prnt.getGameId();
		if(!prnt.bBetLoad && !options_speedgame){
			prnt.bWait = true;
			prnt.showButtons(false);
			prnt.getBet(true);
			prnt.getBet(false); // todo fixed load bet
			return false;
		}
		// console.log("state|idGame:", stateNow, idGame, idOldGame, prnt.startGame);
		
		prnt.getBalancePlayer();
		
		if(value != "0x"){
			if(stateNow == S_IN_PROGRESS && betGame == 0){
				if(!prnt.bClickStart){
					prnt.bWait = false;
					prnt.startGame = false;
					prnt.showChips(true);
				}
			} else if((stateNow == S_IN_PROGRESS ||
			stateNow == S_IN_PROGRESS_SPLIT) && prnt.startGame){
				if(stateNow == S_IN_PROGRESS_SPLIT && !prnt.bStandSplit){
					prnt.bSplit = true;
				}
				if(stateNow == S_IN_PROGRESS && stateOld == S_IN_PROGRESS_SPLIT){
					prnt.bWait = false;
					prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
					prnt.darkCards(prnt._arMyCards, false);
					prnt.darkCards(prnt._arMySplitCards, true);
				}
				if(stateOld == -1){
					prnt.timeShowButtons = TIME_SHOW_BTN + prnt._arNewCards.length*1000;
					
					if(prnt.bSplit){
						prnt.darkCards(prnt._arMyCards, true);
						prnt.darkCards(prnt._arMySplitCards, false);
					}
				}
				prnt.btnStart.alpha = 0.5;
				prnt.btnClear.alpha = 0.5;
				prnt.showChips(false);
				prnt.getSplitCardsNumber();
				prnt.getPlayerCardsNumber();
				prnt.getHouseCardsNumber();
				prnt.getInsurance(true);
				prnt.isInsuranceAvailable();
				if(prnt.tfStatus.getText() != _strWaitBlockchain){
					prnt.tfStatus.setText("");
				}
			} else if(prnt.startGame && idGame > idOldGame){
				idOldGame = idGame;
				prnt.showMyPoints();
				prnt.showMySplitPoints();
				var _x = _W/2 - 80-75;
				var _y = _H/2 - 35;
				if(prnt.mySplitPoints > 0){
					_x = _W/2 - 200-75;
				}
				prnt.clearText();
				prnt.getBet(false);
				prnt.getBet(true);
				prnt.getSplitCardsNumber();
				prnt.getPlayerCardsNumber();
				prnt.getHouseCardsNumber();
				prnt.getHouseScore();
				prnt.getPlayerScore(true);
				
				if(prnt._arMySplitCards.length > 0){
					prnt.checkGameState(false);
					prnt.getPlayerScore(false);	
				}
				betGame = 0;
				betSplitGame = 0;
				betGameOld = 0;
				valInsurance = 0;
				prnt.timeWaitResponse = 0;
				// prnt.clearChips();
				// prnt.clearSplitChips();
				if(!prnt._gameEnd && !prnt.bShowResult){ 
					switch (stateNow){
						case S_BLACKJACK:
							console.log("BLACKJACK:", prnt.valPlayerScore);
							if(prnt.countPlayerCard == 2){
								prnt.showResult("tfBlackjack", _x, _y);
							} else {
								prnt.showResult("tfWin", _x, _y);
							}
							break;
						case S_PLAYER_WON:
							prnt.showResult("tfWin", _x, _y);
							break;
						case S_HOUSE_WON:
							// if((_x > _W/2 && prnt.mySplitPoints > 21) ||
							// (_x < _W/2 && prnt.myPoints > 21)){
								// prnt.showResult("tfBust", _x, _y);
							// } else {
								prnt.showResult("tfLose", _x, _y);
							// }
							break;
						case S_TIE:
							prnt.showResult("tfPush", _x, _y);
							break;
					}
				}
				
				prnt.bClickStart = false;
				prnt.bWait = false;
				prnt.startGame = false;
				// prnt.showChips(true);
				prnt.timeShowBtnChips = TIME_SHOW_BTN_CHIPS + prnt._arNewCards.length*1000;
				prnt.getBalanceBank();
				prnt.showButtons(false);
			} else if(!prnt.bClear && !prnt.startGame && idGame == idOldGame){
				prnt.bClickStart = false;
				prnt.bWait = false;
				prnt.startGame = false;
				prnt.showChips(true);
				prnt.getBalanceBank();
				prnt.showButtons(false);
			}
			
			stateOld = stateNow;
		} else {
			if(!prnt.bClickStart){
				prnt.bWait = false;
				prnt.startGame = false;
				prnt.showChips(true);
			}
		}
	} else if(command == "deal" ||
			command == "hit" ||
			command == "stand" ||
			command == "split" ||
			command == "double" ||
			command == "confirm" ||
			command == "requestInsurance"){
		prnt.responseTransaction(command, value);
	} else if(command == "getInsurance"){
		if(valInsurance == 0){
			valInsurance = hexToNum(value);
			if(valInsurance > 0){
				prnt.bWait = false;
				prnt.showButtons(true);
				prnt.createWndInfo("The insurance was successful.", undefined, "OK");
			}
		}
	} else if(command == "getAllowance"){
		if(hexToNum(value)){
			_allowance = hexToNum(value);
			prnt.bApprove = true;
			prnt.tfApprove.visible = false;
			if(prnt.bClickApprove){
				prnt.getBankrolls();
				prnt.createWndInfo("The approval was completed successfully.", undefined, "OK");
			}
		}
	} else if(command == "responseServer"){
		prnt.sendSeed(value);
	} else if(command == "sendRaw"){
		prnt.timeWaitResponse = 0;
		prnt.getBalancePlayer();
	}
}

ScrGame.prototype.resetTimer  = function(){
	this.timeGetState = TIME_GET_STATE;
}

ScrGame.prototype.update = function(diffTime){
	if(options_pause){
		return false;
	}
	
	if(this.startGame){
		this.timeTotal += diffTime;
		this.tfTotalTime.setText(Math.round(this.timeTotal/1000));
	}
	
	this.timeGetState += diffTime;
	if(this.timeGetState >= TIME_GET_STATE){
		this.timeGetState = 0;
		this.checkGameState(true);
		if(obj_game["balance"]==0){
			this.getBalancePlayer();
		}
		
		if(login_obj["allowance"] && !this.bApprove){
			this.getAllowance();
		}
	}
	
	this.timeNewCard -= diffTime;
	if(this._arNewCards.length > 0 && this.timeNewCard < 1){
		this.timeNewCard = 1000;
		this.sendCard(this._arNewCards[0]);
		this._arNewCards.shift();
	}
	
	if(this.timeWaitResponse > 0 && this.bWait){
		this.timeWaitResponse -= diffTime;
		if(this.timeWaitResponse <= 0){
			this.bWait = false;
			this.showError(ERROR_DEAL);
		}
	}
	
	if(this.timeCloseWnd > 0 && this.curWindow){
		this.timeCloseWnd -= diffTime;
		if(this.timeCloseWnd < 100){
			this.timeCloseWnd = 0;
			this.curWindow.visible = false;
			this.curWindow = undefined;
			this.bWindow = false;
		}
	}
	
	if(this.timeShowBtnChips > 0){
		this.timeShowBtnChips -= diffTime;
		if(this.timeShowBtnChips <= 0){
			this.showChips(true);
		}
	}
	
	if(this.timeShowButtons > 0){
		this.timeShowButtons -= diffTime;
		if(this.timeShowButtons <= 0){
			this.showButtons(true);
		}
	}
	
	this.mixingCard.visible = this.bWait;
	this.mixingCard.update(diffTime);
	
	if(this.bWait){
		this.timeWait += diffTime;
		if(this.timeWait >= TIME_WAIT){
			this.timeWait = 0;
			var str = "";
			for (var i = 0; i < this.countWait; i++) {
				str += ".";
			}
			this.tfStatus.setText("Wait"+str);
			this.countWait ++;
			if(this.countWait > 3){
				this.countWait = 0;
			}
		}
	}
}

ScrGame.prototype.clickCell = function(item_mc) {
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
		if((betGame >= minBet && 
		obj_game["balanceBank"] >= (betGame/valToken)*3) || 
		_countBankrollers > 0){
			if(obj_game["balancePlEth"] > 0){
				item_mc.alpha = 0.5;
				this.btnClear.alpha = 0.5;
				this.bWait = true;
				this.showChips(false);
				this.startGameEth();
			} else {
				obj_game["game"].showError(ERROR_BALANCE);
				obj_game["game"].clearBet();
				obj_game["game"].bWait = false;
				obj_game["game"].showChips(true);
			}
		} else {
			if(_countBankrollers > 0){
				obj_game["game"].showError(ERROR_BANK);
			} else {
				obj_game["game"].showError(ERROR_BANKROLLER);
			}
			obj_game["game"].clearBet();
			obj_game["game"].bWait = false;
			obj_game["game"].showChips(true);
		}
	} else if(item_mc.name == "btnSmart"){
		this.showSmartContract();
	} else if(item_mc.name == "btnDao"){
		this.removeAllListener();
		// var url = "https://platform.dao.casino/";
		var url = "/";
		window.open(url, "_self");
	} else if(item_mc.name == "btnHit"){
		this.clickHit();
	} else if(item_mc.name == "btnStand"){
		this.clickStand();
	} else if(item_mc.name == "btnSplit"){
		this.clickSplit();
	} else if(item_mc.name == "btnDouble"){
		this.clickDouble();
	} else if(item_mc.name.search("chip") != -1){
		this.clickChip(item_mc);
	} else if(item_mc.name == "btnShare"){
		this.shareFB();
	} else if(item_mc.name == "btnTweet"){
		this.shareTwitter();
	} else if(item_mc.name == "btnClearBets"){
		this.clearBet();
	} else if(item_mc.name == "btnKey" || item_mc.name == "icoKey"){
		copyToClipboard(openkey);
	} else if(item_mc.name == "btnFullscreen"){
		this.fullscreen();
	} else if(item_mc.name == "btnConfirm"){
		this.confirmSeed();
	} else if(item_mc.name == "btnLog"){
		this.getLogs();
	}
}

ScrGame.prototype.checkButtons = function(evt){
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

ScrGame.prototype.touchHandler = function(evt){
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

ScrGame.prototype.removeAllListener = function(){
	if(this.wndInfo){
		this.wndInfo.removeAllListener();
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
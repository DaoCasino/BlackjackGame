/**
 * Created by DAO.casino
 * BlackJack
 * v 1.0.0
 */

var ScrGame = function(){
	PIXI.Container.call( this );
	
	var TIME_SHOW_BTN  = 300;
	var TIME_NEW_CARD  = 600;
	var TIME_GET_STATE = 10000;
	var R_WIN          = "WIN!";
	var R_LOSE         = "LOSE...";
	var R_BUST         = "BUST!";
	var R_PUSH         = "PUSH";
	var R_BLACKJACK    = "BLACKJACK";
	var DEAL			= 0;
	var HIT				= 1;
	var STAND			= 2;
	var SPLIT			= 3;
	var DOUBLE			= 4;
	var INSURANCE		= 5;
	var NEWCHANNEL		= 6;
	var CLOSECHANNEL	= 7;
	var DEALER			= 8;
	var BLACKJACK		= 21;
	
	var _self = this;
	var _logic, _room;
	var _mouseX, _mouseY;
	var _users;
	var _curWindow;
	// windows
	var _wndInfo, _wndInsurance, _wndBank, _wndWarning, _wndHistory, _wndList;
	var _callback;
	var _cardSuit, _mixingCard;
	var _objSpeedGame, _objResult;
	// layers
	var back_mc, game_mc, face_mc, chips_mc, cards_mc, gfx_mc, warning_mc, wnd_mc;
	// arrays
	var _arButtons, _arBtnChips, _arChips, _arSplitChips, _arWinChips, _arWinSplitChips,
		_arMyCards, _arMySplitCards, _arHouseCards, _arMyPoints, _arMySplitPoints, _arHousePoints,
		_arHolder, _arNewCards, _arHideCards, _arHistory, _arUsersResult, _arUsersCoord,
		_dealedCards, _arBankrollers, _arMethodsName, _arCoords;
	// booleans
	var _startGame, _bClear, _bStand, _bSplit, _bWindow, _bClickApprove,_bStandSplit,
		_bEndTurnSplit, _bGameOver, _bCloseChannel, _bWaitBet;
	
	var urlEtherscan = "https://api.etherscan.io/";
	
	var scaleBack = 1;
	var _minBet = 5000000;
	var _maxBet = 500000000;

	var _countBankrollers = 0;
	var _countPlayers = 1;
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
	var _idTurnUser = 0;
	var _myIdMult = 0;
	var _idTutor = 0;
	
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

	// INIT
	_self.init = function(){
		var bg = addObj("bgGame"+rndBg, _W/2, _H/2);
		scaleBack = _W/bg.w;
		bg.scale.x = scaleBack;
		bg.scale.y = scaleBack;
		_self.addChild(bg);
		
		_callback = _self.response;
		_self.resetObjGame();
		
		_self.createLayers();
		_self.createArrays();
		_self.createBooleans();
		_self.createGUI();
		_self.createText();
		_self.createBtn();
		
		if(options_multiplayer){
			_arCoords["ofssSC"] = 120;
			_users = new ItemUsers(_self);
			game_mc.addChild(_users);
		}
		
		if(options_rpc){
			urlEtherscan = "https://ropsten.etherscan.io/";
			addressContract = addressRpcContract;
		}else if(options_testnet){
			urlEtherscan = "https://ropsten.etherscan.io/";
			addressContract = addressChannel;
		}
		
		infura.sendRequest("getBalance", openkey, _callback);
		this.getBalanceBank();
		this.getBalanceErc();
		Casino.Account.getBetsBalance(
			function(value){
				_self.getBalancePlayer(value);
				_self.getBankrolls();
			}
		);
		
		if(openkey){} else {
			this.showError(ERROR_KEY, showHome);
		}
	
		this.interactive = true;
		this.on('mouseup', this.touchHandler);
		this.on('mousedown', this.touchHandler);
		this.on('mousemove', this.touchHandler);
		this.on('touchstart', this.touchHandler);
		this.on('touchmove', this.touchHandler);
		this.on('touchend', this.touchHandler);
	}
	
	// CREATE
	_self.createLayers = function(){
		face_mc = new PIXI.Container();
		back_mc = new PIXI.Container();
		game_mc = new PIXI.Container();
		chips_mc = new PIXI.Container();
		cards_mc = new PIXI.Container();
		gfx_mc = new PIXI.Container();
		warning_mc = new PIXI.Container();
		wnd_mc = new PIXI.Container();
		
		game_mc.addChild(chips_mc);
		game_mc.addChild(cards_mc);
		_self.addChild(back_mc);
		_self.addChild(game_mc);
		_self.addChild(gfx_mc);
		_self.addChild(face_mc);
		_self.addChild(warning_mc);
		_self.addChild(wnd_mc);
	}
	
	_self.createArrays = function(){
		_arButtons = [];
		_arBtnChips = [];
		_arChips = [];
		_arSplitChips = [];
		_arWinChips = [];
		_arWinSplitChips = [];
		_arMyCards = [];
		_arMySplitCards = [];
		_arHouseCards = [];
		_arMyPoints = [];
		_arMySplitPoints = [];
		_arHousePoints = [];
		_arHolder = [];
		_arNewCards = [];
		_arHideCards = [];
		_arHistory = [];
		_arUsersResult = [];
		_arUsersCoord = [];
		
		_arMethodsName = [];
		_arMethodsName[INSURANCE] = "insurance";
		_arMethodsName[DEAL] = "deal";
		_arMethodsName[HIT] = "hit";
		_arMethodsName[STAND] = "stand";
		_arMethodsName[SPLIT] = "split";
		_arMethodsName[DOUBLE] = "double";
		_arMethodsName[DEALER] = "dealer";
		_arMethodsName[NEWCHANNEL] = "start_game";
		_arMethodsName[CLOSECHANNEL] = "end_game";
		
		_arCoords = [];
		_arCoords["ofsC"] = 30;
		_arCoords["ofssSC"] = 200;
		_arCoords["ofssPH"] = 35;
	}
	
	_self.createBooleans = function(){
		_startGame = false;
		_bClear = false;
		_bStand = false;
		_bSplit = false;
		_bWindow = false;
		_bClickApprove = false;
		_bStandSplit = false;
		_bEndTurnSplit = false;
		_bGameOver = false;
		_bCloseChannel = false;
		_bWaitBet = false;
	}
	
	_self.createGUI = function(){
		var scGui = 0.5;
		var stepY = 50;	
		var icoKey = addObj("icoKey", 40, 40, scGui);
		icoKey.interactive = true;
		icoKey.buttonMode=true;
		icoKey._selected=false;
		face_mc.addChild(icoKey);
		_arButtons.push(icoKey);
		var icoEthereum = addObj("icoEthereum", 40, 40+stepY*1, scGui);
		icoEthereum.interactive = true;
		icoEthereum._selected=false;
		icoEthereum.disabled=false;
		icoEthereum.hint2 = '0 BET';
		this.icoEthereum = icoEthereum;
		_arButtons.push(icoEthereum);
		face_mc.addChild(icoEthereum);
		
		if(options_multiplayer){
			this.icoCurUser = addObj("icoCurUser", _W/2, _H/2);
			face_mc.addChild(this.icoCurUser);
			this.icoCurUser.visible = false;
		}
		
		this.seat = addObj("seat", _W/2+7, _H/2+220);
		this.seat.visible = false;
		back_mc.addChild(this.seat);
		var metal = addObj("metal", 566, 40, scaleBack);
		back_mc.addChild(metal);
		var descBet = addObj("descBet", 500, 170, scaleBack);
		back_mc.addChild(descBet);
		var cardsLeft = addObj("cardsLeft", 280, 340, scaleBack);
		back_mc.addChild(cardsLeft);
		var cardsRight = addObj("cardsRight", 1650, 205, scaleBack);
		back_mc.addChild(cardsRight);
		
		_mixingCard = new ItemMixing(this);
		_mixingCard.x = _W/2 + 400;
		_mixingCard.y = _H/2 - 150;
		_mixingCard.visible = false;
		gfx_mc.addChild(_mixingCard);
		
		var strUser = 'id'
		var fontSize = 24;
		this.tfIdUser = addText(strUser, fontSize, "#ffffff", "#000000", "left", 1000, 4)
		this.tfIdUser.x = icoKey.x + 30;
		this.tfIdUser.y = icoKey.y - 12;
		face_mc.addChild(this.tfIdUser);
		this.tfBalance = addText(String(_balanceSession) + " (" + String(_balance) + ")" + " BET", 
						fontSize, "#ffffff", "#000000", "left", 400, 4)
		this.tfBalance.x = icoEthereum.x + 30;
		this.tfBalance.y = icoEthereum.y - 12;
		face_mc.addChild(this.tfBalance);
		this.tfBankrollers = addText("", fontSize, "#ffffff", "#000000", "left", 400, 4)
		this.tfBankrollers.x = icoKey.x - 10;
		this.tfBankrollers.y = 40+stepY*1 + 38;
		face_mc.addChild(this.tfBankrollers);
		this.tfVers= addText(version, fontSize, "#ffffff", "#000000", "right", 400, 4)
		this.tfVers.x = _W - 10;
		this.tfVers.y = _H - this.tfVers.height/2 - 10;
		face_mc.addChild(this.tfVers);
		var strVer = "beta version";
		if(options_multiplayer){
			strVer = "alpha version";
		}
		if(openkey){
			this.tfIdUser.setText(openkey);
		}
		this.tfVers2= addText(strVer, fontSize, "#ffffff", "#000000", "left", 400, 4)
		this.tfVers2.x = icoKey.x - 10;
		this.tfVers2.y = _H - this.tfVers2.height;
		face_mc.addChild(this.tfVers2);
		
		var btnFrame = new PIXI.Graphics();
		btnFrame.lineStyle(3, 0xFFCC00, 1);
		btnFrame.drawRect(-this.tfIdUser.width/2, -16, this.tfIdUser.width, 32);
		btnFrame.w = btnFrame.width;
		btnFrame.h = btnFrame.height;
		btnFrame.x = this.tfIdUser.x + btnFrame.w/2 - 2;
		btnFrame.y = this.tfIdUser.y + btnFrame.h/2 - 6;
		btnFrame.name = "btnKey";
		btnFrame.interactive = true;
		btnFrame.buttonMode=true;
		btnFrame.visible = false;
		btnFrame._selected = false;
		face_mc.addChild(btnFrame);
		_arButtons.push(btnFrame);
		this.btnFrame = btnFrame;
		
		// desc text
		this.tfYourBet = addText(getText("your_bet") + " 0", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
		this.tfYourBet.x = -70;
		this.tfYourBet.y = 0;
		descBet.addChild(this.tfYourBet);
		var tfMinBet = addText(getText("min_bet") + " 0.05", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
		tfMinBet.x = -100;
		tfMinBet.y = -100;
		descBet.addChild(tfMinBet);
		var tfMaxBet = addText(getText("max_bet") + " 5", 40, "#ffde00", undefined, "left", 300, 4, fontDigital)
		tfMaxBet.x = -90;
		tfMaxBet.y = -60;
		descBet.addChild(tfMaxBet);
	}
	
	_self.createText = function(){
		var fontSize = 28;
		this.tfStatus = addText(getText("select_bet"), 40, "#ffde00", "#000000", "center", 400, 4, fontDigital)
		this.tfStatus.x = _W/2;
		this.tfStatus.y = _H/2+310;
		face_mc.addChild(this.tfStatus);
		this.tfMyBet = addText("", 30, "#ffde00", "#000000", "center", 400, 4, fontDigital)
		this.tfMyBet.x = _W/2;
		this.tfMyBet.y = _H/2+260;
		face_mc.addChild(this.tfMyBet);
		this.tfSplitBet = addText("", 30, "#ffde00", "#000000", "center", 400, 4, fontDigital)
		this.tfSplitBet.x = this.tfMyBet.x+_arCoords["ofssSC"];
		this.tfSplitBet.y = this.tfMyBet.y;
		face_mc.addChild(this.tfSplitBet);
		this.tfMyPoints = addText("", fontSize, "#ffde00", "#000000", "right", 200, 4)
		this.tfMyPoints.x = _W/2;
		this.tfMyPoints.y = _H/2-this.tfMyPoints.height/2 - _arCoords["ofssPH"];
		face_mc.addChild(this.tfMyPoints);
		this.tfMySplitPoints = addText("", fontSize, "#ffde00", "#000000", "right", 200, 4)
		this.tfMySplitPoints.x = this.tfMyPoints.x+_arCoords["ofssSC"];
		this.tfMySplitPoints.y = this.tfMyPoints.y;
		face_mc.addChild(this.tfMySplitPoints);
		this.tfHousePoints = addText("", fontSize, "#ffde00", "#000000", "right", 200, 4)
		this.tfHousePoints.x = this.tfMyPoints.x;
		this.tfHousePoints.y = _H/2-this.tfHousePoints.height/2- _arCoords["ofssPH"] - 270;
		face_mc.addChild(this.tfHousePoints);
	}
	
	_self.createBtn = function(){
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
		var btnDeal = this.createButton("btnDeal", "deal", _W/2+90, 950, scGui);
		this.btnDeal = btnDeal;
		var btnClear = this.createButton("btnClearBets", "remove_bet", _W/2-90, 950, scGui);
		this.btnClear = btnClear;
		var btnHit = this.createButton("btnHit", "hit", _W/2+90, 950, scGui);
		this.btnHit = btnHit;
		var btnStand = this.createButton("btnStand", "stand", _W/2-90, 950, scGui);
		this.btnStand = btnStand;
		btnDeal.alpha = 0.5;
		btnClear.alpha = 0.5;
		btnHit.alpha = 0.5;
		btnHit.alpha = 0.5;
		btnStand.alpha = 0.5;
		btnHit.visible = false;
		btnStand.visible = false;
		btnDeal.hint = getText("hint_deal");
		btnClear.hint = getText("hint_remove");
		
		if(options_split){
			var btnSplit = this.createButton("btnSplit", "split", 1650, 800, scGui);
			this.btnSplit = btnSplit;
			btnSplit.alpha = 0.5;
			btnSplit.hint = getText("hint_split");
		}
		if(options_double){
			var btnDouble = this.createButton("btnDouble", "double", 1500, 890, scGui);
			this.btnDouble = btnDouble;
			btnDouble.alpha = 0.5;
			btnDouble.hint = getText("hint_double");
		}
		
		if(!options_rpc && !options_debug){
			var btnContract = addButton("btnContract", 80, _H - 80);
			btnContract.name = "btnSmart";
			btnContract.interactive = true;
			btnContract.buttonMode=true;
			btnContract.overSc = true;
			btnContract.hint2 = getText("hint_contract");
			this.addChild(btnContract);
			_arButtons.push(btnContract);
		}
		
		var startY = _H - 80;
		var offsetY = 110;
		var btnDao = addButton("btnDao", _W - 80, startY);
		btnDao.interactive = true;
		btnDao.buttonMode=true;
		btnDao.overSc = true;
		this.addChild(btnDao);
		_arButtons.push(btnDao);
		var btnFullscreen = addButton("btnFullscreen", _W - 80, startY - offsetY*1);
		btnFullscreen.interactive = true;
		btnFullscreen.buttonMode=true;
		btnFullscreen.overSc = true;
		this.addChild(btnFullscreen);
		_arButtons.push(btnFullscreen);
		var btnReset = addButton("btnReset", _W - 80, startY - offsetY*2);
		btnReset.interactive = true;
		btnReset.buttonMode=true;
		btnReset.overSc = true;
		this.addChild(btnReset);
		_arButtons.push(btnReset);
		var btnExit = addButton("btnCashout", _W - 80, startY - offsetY*3);
		btnExit.interactive = true;
		btnExit.buttonMode=true;
		btnExit.overSc = true;
		this.btnExit = btnExit;
		this.addChild(btnExit);
		_arButtons.push(btnExit);
		var btnHistory = addButton("btnHistory", _W - 80, startY - offsetY*4);
		btnHistory.name = "btnHistory";
		btnHistory.interactive = true;
		btnHistory.buttonMode=true;
		btnHistory.overSc = true;
		this.btnHistory = btnHistory;
		this.addChild(btnHistory);
		_arButtons.push(btnHistory);
		var btnFB = addButton("btnFacebookShare", _W - 80, 70, 0.35);
		btnFB.name = "btnShare";
		btnFB.interactive = true;
		btnFB.buttonMode=true;
		btnFB.overSc = true;
		this.addChild(btnFB);
		_arButtons.push(btnFB);
		var btnTweet = addButton("btnTweetShare", _W - 80, 180, 0.35);
		btnTweet.name = "btnTweet";
		btnTweet.interactive = true;
		btnTweet.buttonMode=true;
		btnTweet.overSc = true;
		this.addChild(btnTweet);
		_arButtons.push(btnTweet);
		
		btnFB.hint2 = getText("share_facebook");
		btnTweet.hint2 = getText("tweet");
		btnDao.hint2 = getText("home");
		btnFullscreen.hint2 = getText("fullscreen");
		btnExit.hint2 = getText("cash_out");
		btnReset.hint2 = getText("reset_data");
		btnHistory.hint2 = getText("history_game");
		
		if(options_debug){
			btnExit.visible = false;
			btnReset.visible = false;
		}
		
		var posX = _W/2-680;
		var posY = _H/2+180+offsetY;
		var stepX = 90;
		var stepY = 50;
		var indexX = 1;
		
		for (var i = 1; i < 7; i++) {
			_self.addBtnChip("chip_"+i, posX+stepX*(indexX-1), posY+stepY*(i-1));
			
			indexX++;
			if(i%3==0){
				indexX = 0;
				posX = _W/2-640;
				posY = _H/2+100+offsetY;
			}
		}
		_self.showChips(false);
		_self.isCashoutAvailable();
	}
	
	_self.addBtnChip = function(name, x, y) {	
		var chip = addButton(name, x, y, _scaleChip);
		chip.interactive = true;
		chip.buttonMode=true;
		chip.overSc=true;
		face_mc.addChild(chip);
		_arButtons.push(chip);
		_arBtnChips.push(chip);
	}

	_self.createButton = function(name, title, x, y, sc){
		if(sc){}else{sc=1}
		
		var btn = addButton(name, x, y, sc);
		btn.interactive = true;
		btn.buttonMode=true;
		btn.overSc=true;
		btn.disabled=false;
		face_mc.addChild(btn);
		_arButtons.push(btn);
		
		var tf = addText(getText(title), 46, "#FFFFFF", "#000000", "center", 200, 6)
		tf.x = 0;
		tf.y = 120;
		btn.addChild(tf);
		
		return btn;
	}
	
	_self.createWndInfo = function(str, callback, addStr) {
		if(_bWindow){
			return false;
		}
		if(_wndInfo == undefined){
			_wndInfo = new WndInfo(this);
			_wndInfo.x = _W/2;
			_wndInfo.y = _H/2;
			wnd_mc.addChild(_wndInfo);
		}
		
		_bWindow = true;
		
		_wndInfo.show(str, callback, addStr)
		_wndInfo.visible = true;
		_curWindow = _wndInfo;
	}
	
	_self.createObj = function(point, name, sc) {	
		if(sc){}else{sc = 1};
		var mc = undefined;
		var newObj = true;
		
		for (var i = 0; i < _arHolder.length; i++ ) {
			mc = _arHolder[i];
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
				mc = addText(R_BLACKJACK, 50, "#FCB70F", "#4F3904", "center", 300, 4);
				mc.name = "blackjack";
				mc.w = mc.width;
			} else if(name == "win"){
				mc = addText(R_WIN, 50, "#FCB70F", "#4F3904", "center", 300, 4);
				mc.name = "win";
				mc.w = mc.width;
			} else if(name == "bust"){
				mc = addText(R_BUST, 50, "#EC8018", "#3F2307", "center", 300, 4);
				mc.name = "bust";
				mc.w = mc.width;
			} else if(name == "lose"){
				mc = addText(R_LOSE, 50, "#D72319", "#64100B", "center", 300, 4);
				mc.name = "lose";
				mc.w = mc.width;
			} else if(name == "push"){
				mc = addText(R_PUSH, 50, "#999999", "#333333", "center", 300, 4);
				mc.name = "tfPush";
				mc.w = mc.width;
			} else {
				mc = addObj(name, 0, 0, sc);
			}
			if(mc == undefined){
				return false;
			}
			gfx_mc.addChild(mc);
			_arHolder.push(mc);
		}
		
		mc.x = point.x;
		mc.y = point.y;
		mc.width = mc.w;
		mc.dead = false;
		
		return mc;
	}
	
	_self.addChip = function(name, x, y, type) {
		var array = _arChips;
		if(type == "split"){
			array = _arSplitChips;
		} else if(type == "mainWin"){
			array = _arWinChips;
		} else if(type == "splitWin"){
			array = _arWinSplitChips;
		}
		var chip = addObj(name, x, y, _scaleChip);
		chips_mc.addChild(chip);
		array.push(chip);
	}
	
	_self.addHolderObj = function(obj){
		obj.visible = false;
		obj.dead = true;
		obj.x = _W + 150;
		obj.y = _H + 50;
	}

	_self.addCard = function(name, loadCard, countCard, array){
		var ar = [];
		for (var i = loadCard; i < countCard; i++) {
			var cardIndex = array[i];
			_timeNewCard = 1000;
			ar.push(_self.getNameCard(cardIndex));
			
			if(name == "arMyCards"){
				_loadPlayerCard++;
				_arNewCards.push({type:"player", id:cardIndex});
			} else if(name == "arMySplitCards"){
				_loadSplitCard++;
				_arNewCards.push({type:"split", id:cardIndex});
			} else if(name == "arHouseCards"){
				_loadHouseCard ++;
				_arNewCards.push({type:"house", id:cardIndex});
			}
		}
		
		return ar;
	}

	// CLEAR
	_self.resetObjGame = function(){
		_objSpeedGame = {result:false, 
							idGame:-1, 
							curGame:{}, 
							betGame:0, 
							betSplitGame:0, 
							money:0,
							insurance:false};
	}

	_self.resetGame = function(){
		_self.tfStatus.setText("");
		_self.tfMyPoints.setText("");
		_self.tfMySplitPoints.setText("");
		_self.tfHousePoints.setText("");
		_arMyPoints = [];
		_arMySplitPoints = [];
		_arHousePoints = [];
		_arMyCards = [];
		_arMySplitCards = [];
		_arHouseCards = [];
		_arNewCards = [];
		_bClear = true;
		_balanceSession = 0;
		_self.clearBet();
		_self.clearGame();
	}

	_self.clearGame = function(){
		_startGame = false;
		_bStand = false;
		_bSplit = false;
		_bStandSplit = false;
		_bEndTurnSplit = false;
		_bGameOver = false;
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
		_valInsurance = 0;
		_idTurnUser = 0;
		_arUsersResult = [];
		
		var i = 0;
		
		if (_dealedCards) {
			for (i = 0; i < _dealedCards.length; i++) {
				var card = _dealedCards[i];
				_arHideCards.push({id:card.id, x:card.x, y:card.y});
				cards_mc.removeChild(card);
			}
		}
		for (i = 0; i < _arHolder.length; i++) {
			var mc = _arHolder[i];
			this.addHolderObj(mc);
		}
		
		this.hideCards();
		_dealedCards = [];
		if(_cardSuit){
			_cardSuit.width = _cardSuit.w;
			_cardSuit.visible = false;
		}
	}

	_self.clearBet = function(){
		_betGame = 0;
		_betSplitGame = 0;
		_betGameOld = 0;
		_valInsurance = 0;
		this.clearChips();
		this.clearSplitChips();
		this.clearText();
	}

	_self.clearChips = function(){	
		for (var i = 0; i < _arChips.length; i++) {
			var chip = _arChips[i];
			chips_mc.removeChild(chip);
		}
		_arChips = [];
		for (var i = 0; i < _arWinChips.length; i++) {
			var chip = _arWinChips[i];
			chips_mc.removeChild(chip);
		}
		_arWinChips = [];
	}

	_self.clearSplitChips = function(){	
		for (var i = 0; i < _arSplitChips.length; i++) {
			var chip = _arSplitChips[i];
			chips_mc.removeChild(chip);
		}
		_arSplitChips = [];
		for (var i = 0; i < _arWinSplitChips.length; i++) {
			var chip = _arWinSplitChips[i];
			chips_mc.removeChild(chip);
		}
		_arWinSplitChips = [];
	}

	_self.clearText = function(){
		if(this.btnClear){
			this.btnClear.alpha = 0.5;
			this.btnDeal.alpha = 0.5;
			this.tfStatus.setText("Select bet");
			this.tfYourBet.setText("Your bet: 0");
			this.tfMyBet.setText("");
			this.tfSplitBet.setText("");
		}
	}

	// CLOSE
	_self.closeWindow = function(wnd) {
		_curWindow = wnd;
		_timeCloseWnd = 100;
	}
	
	_self.closeBankrolls = function(){
		_bWindow = false;
		_wndList.visible = false;
		_countBankrollers = _wndList._arBankrollers.length;
		_self.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
		_self.showWndBank();
	}
	
	// SHOW
	_self.showTutorial = function() {
		if(login_obj["tutor_bet"] != true){
			_idTutor = 1;
			_self.showTooltip(undefined, getText("tutor_bet"), _W/2-550, _H/2+270);
		} else if(login_obj["tutor_deal"] != true){
			_idTutor = 2;
			_self.showTooltip(_self.btnDeal, getText("tutor_deal"), _self.btnDeal.x, _self.btnDeal.y);
		} else if(login_obj["tutor_nextgame"] != true && _balanceSession >= _minBet && !_startGame){
			_idTutor = 3;
			_self.showTooltip(undefined, getText("tutor_nextgame"), _W/2-550, _H/2+270);
		} else if(login_obj["tutor_closechannel"] != true && _balanceSession >= 0 && 
		!_startGame && _self.btnExit.alpha == 1){
			_idTutor = 4;
			_self.showTooltip(_self.btnExit, getText("tutor_closechannel"), _self.btnExit.x, _self.btnExit.y);
		}
	}

	_self.showWndInsurance = function(str, callback) {
		if(_bWindow){
			return false;
		}
		if(_wndInsurance == undefined){
			_wndInsurance = new WndInsurance(_self);
			_wndInsurance.x = _W/2;
			_wndInsurance.y = _H/2;
			wnd_mc.addChild(_wndInsurance);
		}
		
		_bWindow = true;
		_wndInsurance.show(str, callback)
		_wndInsurance.visible = true;
		_curWindow = _wndInsurance;
	}

	_self.showWndBank = function() {
		if(_balancePlEth < 0.01){
			_self.showError(ERROR_BALANCE);
			infura.sendRequest("getBalance", openkey, _callback);
			return;
		}
		if(_wndBank == undefined){
			_wndBank = new WndBank(_self);
			_wndBank.x = _W/2;
			_wndBank.y = _H/2;
			wnd_mc.addChild(_wndBank);
		}
		
		Casino.Account.getBetsBalance(_self.getBalancePlayer);
		var str = "Select the amount of BET \n you are ready to play.";
		_bWindow = true;
		_wndBank.show(str, function(value){
					_balanceSession = value;
					_self.refreshBalance();
					_self.openChannel();
					if(options_debug){
						login_obj["openChannel"] = true;
						sessionIsOver = false;
						_self.showChips(true);
					}
				}, _balance)
		_timeCloseWnd = 0;
		_wndBank.visible = true;
		_curWindow = _wndBank;
	}

	_self.showWndWarning = function(str) {
		if(_wndWarning == undefined){
			_wndWarning = new PIXI.Container();
			_wndWarning.x = _W/2;
			_wndWarning.y = _H/2;
			warning_mc.addChild(_wndWarning);
			
			var bg = addObj("wndInfo",0,0,1, 0.3, 0.15);
			_wndWarning.addChild(bg);
			var tf = addText("", 26, "#FFCC00", "#000000", "center", 500, 3)
			_wndWarning.addChild(tf);
			
			var loading = new ItemLoading(this);
			loading.x = 0;
			loading.y = 70;
			_wndWarning.addChild(loading);
			
			_wndWarning.tf = tf;
			_wndWarning.loading = loading;
		}
		
		_wndWarning.tf.setText(str);
		_wndWarning.tf.y = -_wndWarning.tf.height/2;
		_wndWarning.visible = true;
	}
	
	_self.showTooltip = function(item, str, _x, _y) {
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
			if(item && hit_test_rec(item, w, h, this.tooltip.x, this.tooltip.y)){
				this.tooltip.y += this.tooltip.height;
			}
		} else if(this.tooltip.y + h/2 > _H-20){
			this.tooltip.y = _W-20 - h/2;
			if(item && hit_test_rec(item, w, h, this.tooltip.x, this.tooltip.y)){
				this.tooltip.y -= this.tooltip.height;
			}
		}
		this.tooltip.show(str);
		this.tooltip.visible = true;
	}
	
	_self.showChips = function(value) {
		var a = 0.5;
		var alpha = a;
		
		if(value){
			alpha = 1;
		}
		if(_startGame || _countBankrollers == 0){
			alpha = a;
		}
		
		for (var i = 0; i < _arBtnChips.length; i++) {
			var obj = _arBtnChips[i];
			obj.alpha = alpha;
		}
		
		if(value && _betGame == 0 && _countBankrollers > 0){
			_bClear = false;
			_self.tfStatus.setText("Select bet");
		}
	}

	_self.showButtons = function(value) {
		var a = 0.5;
		var alpha = a;
		
		if(value && (!_objSpeedGame.result)){
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
		if(options_split){
			if(value && this.isSplitAvailable()){
				this.btnSplit.alpha = 1;
			} else {
				this.btnSplit.alpha = a;
			}
		}
		if(options_double){
			if(value && this.isDoubleAvailable()){
				this.btnDouble.alpha = 1;
			} else {
				this.btnDouble.alpha = a;
			}
		}
		if(!options_multiplayer){
			this.isCashoutAvailable();
		}
	}
	
	_self.showPlayerCard = function(card){
		if(card){
			var left = false;
			if(_objSpeedGame){
				if(_objSpeedGame.betSplitGame > 0){
					left = true;
				}
			}
			if(_mySplitPoints > 0){
				left = true;
			}
			
			if(left){
				card.x = _W/2 - _arCoords["ofssSC"] + _lastPlayerCard*_arCoords["ofsC"];
				this.tfMyPoints.x = _W/2-_arCoords["ofssSC"];
			} else {
				card.x = _W/2 + _lastPlayerCard*_arCoords["ofsC"];
				this.tfMyPoints.x = _W/2;
			}
			if(_bSplit){
				card.img.tint = 0x999999;
			}
			card.y = _H/2 + 70;
			cards_mc.addChild(card);
			_lastPlayerCard++;
			_dealedCards.push(card);
			_arMyCards.push(card);
			_arMyPoints.push(card.point);
			
			_self.showMyPoints();
			
			return {x:card.x, y:card.y}
		}
		
		return {x:0, y:0}
	}

	_self.showPlayerSplitCard = function(card){
		if(card){
			card.x = _W/2 + _arCoords["ofssSC"] + _lastSplitCard*_arCoords["ofsC"];
			card.y = _H/2 + 70;
			if(!_bSplit){
				card.img.tint = 0x999999;
			}
			cards_mc.addChild(card);
			_lastSplitCard++;
			_dealedCards.push(card);
			_arMySplitCards.push(card);
			_arMySplitPoints.push(card.point);
			_self.showMySplitPoints();
			return {x:card.x, y:card.y}
		}
		
		return {x:0, y:0}
	}

	_self.showHouseCard = function(card){
		if(card){
			card.x = _W/2 + _lastHouseCard*_arCoords["ofsC"];
			card.y = _H/2 - 200;
			cards_mc.addChild(card);
			_lastHouseCard++;
			_dealedCards.push(card);
			_arHouseCards.push(card);
			_arHousePoints.push(card.point);
			
			_self.showHousePoints();
			return {x:card.x, y:card.y}
		}
		
		return {x:0, y:0}
	}

	_self.showMyPoints = function(){
		_myPoints = _self.getMyPoints();
		if(_myPoints > 0){
			_self.tfMyPoints.setText(_myPoints);
			if(_myPoints >= BLACKJACK && options_multiplayer 
			&& !_bSplit && !_bStand){
				_self.clickStand();
				_self.showButtons(false);
			}
		} else {
			_self.tfMyPoints.setText("");
		}
	}

	_self.showMySplitPoints = function(){
		_mySplitPoints = _self.getMySplitPoints();
		if(_mySplitPoints > 0){
			_self.tfMySplitPoints.setText(_mySplitPoints);
			if(!_bEndTurnSplit){
				if(_mySplitPoints >= BLACKJACK){
					_self.autoSplitStand();
				}
			}
		} else {
			_self.tfMySplitPoints.setText("");
		}
	}

	_self.showHousePoints = function(){
		_housePoints = this.getHousePoints();
		if(_housePoints > 0){
			this.tfHousePoints.setText(_housePoints);
		} else {
			this.tfHousePoints.setText("");
		}
	}
	
	_self.showSmartContract = function() {
		var url = urlEtherscan + "address/" + addressContract;
		if(options_mainet){
			url = "https://etherscan.io/" + "address/" + addressContract;
		}
		window.open(url, "_blank"); 
	}

	_self.showError = function(value, callback) {
		var str = "ERR"
		switch(value){
			case ERROR_BUF:
				str = "OOOPS! \n Transaction failed."
				_self.resetGame();
				break;
			case ERROR_KEY:
				str = "OOOPS! \n " + getText("error_key");
				break;
			case ERROR_BANK:
				str = "OOOPS! \n " + getText("error_bank");
				break;
			case ERROR_CONTRACT:
				str = "OOOPS! \n " + getText("error_transaction");
				break;
			case ERROR_BALANCE:
				str = "OOOPS! \n " + getText("error_balance");
				break;
			case ERROR_BALANCE_BET:
				str = "OOOPS! \n " + getText("error_balance_bet");
				break;
			case ERROR_MAX_BET:
				var desc = getText("error_max_bet");
				str = "OOOPS! \n " + desc.replace(new RegExp("NUM"), _maxBet/valToken);
				break;
			case ERROR_BANKROLLER:
				str = "OOOPS! \n " + getText("error_bankrollers_offline");
				break;
			default:
				str = "ERROR! \n\n " + value + " \n\n " + getText("contact_support");
				break;
		}
		if(_wndWarning){
			_wndWarning.visible = false;
		}
		_self.createWndInfo(str, callback);
	}

	_self.showInsurance = function() {
		var price = _betGame/2;
		_bInsurance = 0;
		if(_balanceSession >= price && !_objSpeedGame.insurance){
			price = toFixed((convertToken(price)), 4);
			var str = "Do you want Insurance? \n " + price + " BET.";
			_self.showWndInsurance(str, _self.clickInsurance);
		}
	}

	_self.showReset = function() {
		_self.showWndInsurance(getText("reset_desc"), _self.clickReset);
	}

	_self.showHistory = function() {
		if(_bWindow){
			return false;
		}
		if(_wndHistory == undefined){
			_wndHistory = new WndHistory(this);
			_wndHistory.x = _W/2;
			_wndHistory.y = _H/2;
			wnd_mc.addChild(_wndHistory);
		}
		_timeCloseWnd = 0;
		_bWindow = true;
		_wndHistory.show(_arHistory)
		_wndHistory.visible = true;
		_curWindow = _wndHistory;
	}

	_self.showBankrolls = function showBankrolls(){
		if(_bWindow){
			return false;
		}
		if(_wndList == undefined){
			_wndList = new WndBankrolls(_self, _self.closeBankrolls);
			_wndList.x = _W/2;
			_wndList.y = _H/2;
			wnd_mc.addChild(_wndList);
		}
		_timeCloseWnd = 0;
		_bWindow = true;
		_wndList.show();
		_wndList.visible = true;
	}
	
	_self.showTextResult = function(_name, _x, _y) {
		var delay = _arNewCards.length+1;
		var tf = _self.createObj({x:_x, y:_y}, _name);
		tf.alpha = 0;
		createjs.Tween.get(tf).wait(1000*delay).to({y:_y, alpha:1},300).to({y:_y-50},500);
	}

	_self.showResult = function(_name, _x, _y, type, bet) {
		_self.showTextResult(_name, _x, _y);
		
		var array = _arChips;
		if(type == "split"){
			array = _arSplitChips;
		}
		
		var _x = 0;
		var _y = 0;
		var speed = 500;
		if(_name == "win" || _name == "blackjack"){
			_self.fillChips(bet/2, type+"Win", 150);
			var array2 = _arWinChips;
			if(type == "split"){
				array2 = _arWinSplitChips;
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
				if(type == "main" && 
				_objSpeedGame.insurance && 
				_mySplitPoints == BLACKJACK &&
				_arHouseCards.length == 2){
					_y = _H + 100+i*12;
				}
				createjs.Tween.get(chip).to({x:_x, y:_y, alpha:0},speed*2);
			} else if(_name == "push"){
				createjs.Tween.get(chip).to({x:_x, y:_y},speed*2);
			} else {
				createjs.Tween.get(chip).wait(speed).to({x:_x, y:_y},speed);
			}
		}
	}
	
	_self.showSuitCard = function(){
		if(_cardSuit){} else {
			_cardSuit = addObj("suit", 0, 0, _scaleCard);
			gfx_mc.addChild(_cardSuit);
		}
		_cardSuit.width = _cardSuit.w;
		_cardSuit.x = _W/2 + _lastHouseCard*_arCoords["ofsC"];
		_cardSuit.y = _H/2 - 200;
		if(_bStand){
			_cardSuit.visible = false;
		} else {
			_cardSuit.visible = true;
		}
		
		return {x:_cardSuit.x, y:_cardSuit.y};
	}
	
	// ACTION
	_self.fullscreen = function() {
		 if(options_fullscreen) { 
			this._fCancelFullScreen.call(window.document);
			options_fullscreen = false;
		}else{
			this._fRequestFullScreen.call(window.document.documentElement);
			options_fullscreen = true;
		}
	}
	
	_self.shareTwitter = function() {
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

	_self.shareFB = function() {
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
	
	_self.fillChips = function(value, type, _y){
		if(_y == undefined){_y = this.seat.y}
		var setBet = value;
		var countChip = 0;
		var posX = this.seat.x;
		var left = false;
		if(_objSpeedGame){
			if(_objSpeedGame.betSplitGame > 0){
				left = true;
			}
		}
		if(type == "split"){
			this.clearSplitChips();
			posX += _arCoords["ofssSC"];
		} else if(type == "mainWin"){
			if(_bSplit || this.countPlayerSplitCard > 0){
				left = true;
			}
			if(left){
				posX -= _arCoords["ofssSC"];
			}
		} else if(type == "splitWin"){
			posX += _arCoords["ofssSC"];
		} else if(_bSplit || 
		this.countPlayerSplitCard > 0 || 
		type == "main" || left){
			this.clearChips();
			posX -= _arCoords["ofssSC"];
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
		
		if(_idTutor == 1){
			login_obj["tutor_bet"] = true;
			_self.showTutorial();
		}
	}

	_self.sendChip = function(item_mc, betGame, type){
		var chip = _self.createObj(item_mc, item_mc.name, _scaleChip);
		if(chip == undefined){
			_self.fillChips(betGame);
			return false;
		}
		var _x = _self.seat.x;
		var _y = _self.seat.y;
		if(type == "split"){
			_x += 200;
		} else if(_bSplit){
			_x -= 200;
		}
		createjs.Tween.get(chip).to({x:_x, y:_y},500)
								.call(function(){
									_self.addHolderObj(chip);
									_self.fillChips(betGame);
								});
	}

	_self.sendCard = function(obj){
		var type = obj.type;
		var cardIndex = obj.id;
		var card = undefined;
		var suit = _self.createObj({x:1487, y:298}, "suit", _scaleCard);
		var _x = 0;
		var _y = 0;
		var coord = {x:_x, y:_y};
		
		if(type != "suit"){
			card = _self.getCard(cardIndex);
		}
		
		if(type == "player"){
			coord = _self.showPlayerCard(card);
		} else if(type == "split"){
			coord = _self.showPlayerSplitCard(card);
		} else if(type == "house"){
			coord = _self.showHouseCard(card);
			
			if(_loadHouseCard==1){
				_arNewCards.push({type:"suit", id:0});
				if(_valInsurance == 0 && card.point == 11 && 
				_myPoints != BLACKJACK && _mySplitPoints == 0){
					_self.showInsurance();
				}
			}
		} else if(type == "suit"){
			coord = _self.showSuitCard();
			card = _cardSuit;
		}
		
		if(card){
			card.visible = false;
			if(type == "suit"){
				createjs.Tween.get(suit).to({x:coord.x, y:coord.y},400)
									.call(function(){
										_self.addHolderObj(suit);
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
					_self.addHolderObj(suit);
					createjs.Tween.get(_cardSuit).to({width:10},150)
									.call(function(){
										_cardSuit.visible = false;
										card.visible = true;
									});
				} else {
					createjs.Tween.get(suit).to({x:coord.x, y:coord.y},400).to({width:10},150)
									.call(function(){
										_self.addHolderObj(suit);
										card.visible = true;
									});
				}
				
				if(_betGame > 0 && (type == "player" || type == "split")){
					if(options_multiplayer){
						if(_myIdMult == _idTurnUser && _myPoints < BLACKJACK /*&& !_bSplit*/){
							_timeShowButtons = TIME_SHOW_BTN + _arNewCards.length*TIME_NEW_CARD;
						}
					} else {
						_timeShowButtons = TIME_SHOW_BTN + _arNewCards.length*TIME_NEW_CARD;
					}
				}
			}
			// switch to maingame
			if(_bSplit){
				if(_arNewCards.length == 1 &&
				(_currentMethod == DOUBLE || _mySplitPoints >= BLACKJACK)){
					_bSplit = false;
					login_obj["bSplit"] = _bSplit;
					saveData();
					_timeShowButtons = TIME_SHOW_BTN + _arNewCards.length*TIME_NEW_CARD;
					_self.darkCards(_arMyCards, false);
					_self.darkCards(_arMySplitCards, true);
				}
			}
		} else {
			console.log("card: null");
		}
	}
	
	_self.hideCards = function(){
		var i = 0;
		var j = 0;
		var index = 0;
		
		if(_arHideCards.length > 0){
			var ar = [];
			for (i = 0; i < _arHideCards.length; i++) {
				var obj = _arHideCards[i];
				var card = _self.getCard(obj.id);
				card.x = obj.x;
				card.y = obj.y;
				cards_mc.addChild(card);
				ar.push(card);
				createjs.Tween.get(card).to({x:320, y:300},400).to({alpha:0},100)
									.call(function(){
										index ++;
										if(index == ar.length){
											for (j = 0; j < ar.length; j++) {
												cards_mc.removeChild(ar[j]);
											}
										}
									});
			}
			
			_arHideCards = [];
		}
	}
	
	_self.darkCards = function(array, value) {
		for (var i = 0; i < array.length; i++) {
			var card = array[i];
			if(value){
				card.img.tint = 0x999999;
			} else {
				card.img.tint = 0xffffff;
			}
		}
	}

	_self.autoSplitStand = function(){
		_bEndTurnSplit = true;
		if(_bSplit && !_bStandSplit){
			_bStandSplit = true;
			if(_currentMethod == HIT){
				_bSplit = false;
				login_obj["bSplit"] = _bSplit;
				saveData();
				
				if(_myPoints >= BLACKJACK){
					this.clickStand();
				}
			}
		}
		
		this.showButtons(false);
		this.darkCards(_arMyCards, false);
		this.darkCards(_arMySplitCards, true);
	}
	
	_self.signSeed = function(seed, callback){
		Casino.getFastRandom(seed, function (res) {
			if(res.error){
				_self.showError(res.error);
				_self.closeChannel();
			} else {
				callback(res.random)
			}
		})
	}
	
	_self.updateShowBtn = function(timeShowButtons) {
		if(_idTurnUser == _myIdMult && _myPoints < BLACKJACK && !_bSplit){
			_timeShowButtons = timeShowButtons;
			var it = new LevelInfo()
			face_mc.addChild(it);
		}
	}

	// CHECK
	_self.isCashoutAvailable = function() {
		if(login_obj["openChannel"] && _objSpeedGame.result){
			this.btnExit.alpha = 1;
		} else {
			this.btnExit.alpha = 0.5;
		}
	}

	_self.isSplitAvailable = function() {
		var value = false;
		if(_arMyCards.length == 2 &&
		_balanceSession >= _betGame &&
		_bSplit == false &&
		_betGame > 0 &&
		_arMySplitCards.length == 0 &&
		((_arMyPoints[0] == _arMyPoints[1]) ||
		(_arMyCards[0].ace && _arMyCards[1].ace))){
			value = true;
		}
		
		return value;
	}

	_self.isDoubleAvailable = function() {
		if(((!_bSplit && _arMyCards.length == 2 && 
		_myPoints > 8 && _myPoints < 12) ||
		(_bSplit && _arMySplitCards.length == 2 &&
		_mySplitPoints > 8 && _mySplitPoints < 12)) &&
		_balanceSession >= _betGame){
			return true;
		}
		
		return false;
	}
	
	// RESULT
	_self.checkResult = function(objResult){
		if(_arUsersResult[_myIdMult] && options_multiplayer){
			return false;
		}
		_arUsersResult[_myIdMult] = true;
		if(_room.getUsersArr().length > 1){
			_self.showUsers();
		}

		var _xM = _W/2;
		var _xS = _W/2 + _arCoords["ofssSC"];
		var _y = _H/2 - 50;
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
			_xM = _W/2 - _arCoords["ofssSC"];
		}
		_self.showResult(objResult.main, _xM, _y, "main", objResult.betMain);
		_self.tfMyBet.setText(strResultM);
		if(_mySplitPoints > 0){
			_self.showResult(objResult.split, _xS, _y, "split", objResult.betSplit);
			_self.tfSplitBet.setText(strResultS);
		}
		
		if(_countPlayers > 1){
			_idTurnUser ++;
			var delay = (_arNewCards.length+1)*TIME_NEW_CARD;
			_self.updateShowBtn(delay);
			// if(_idTurnUser >= _room.getUsersArr().length){
			if(_idTurnUser >= _countPlayers){
				_self.clickDealerStand();
			}
		} else {
			_self.showChips(true);
			_self.showButtons(false);
			_self.isCashoutAvailable();
			_self.showTutorial();
		}
		
		if(objResult.mixing && _balanceSession > 0){
			_mixingCard.visible = true;
			_timeMixing = 3000;
			var str = getText("mixed_decks").replace(new RegExp("SPL"), "\n");
			_self.showWndWarning(str);
		}
		
		if(_balanceSession == 0){
			_self.closeChannel();
			_self.showChips(false);
		}
	}
	
	_self.checkUserResult = function(curUser){
		if(_arUsersResult[curUser.id]){
			return false;
		}
		_arUsersResult[curUser.id] = true;
		
		var objResult = curUser.logic.getResult();
		var userMc    = _users.getUser(curUser.id);
		
		var _xM = userMc.x;
		var _xS = _xM + userMc._ofssSC;
		var _y  = userMc.y - 100;
		
		if(userMc._mySplitPoints > 0){
			_xM = _xM - userMc._ofssSC;
		}
		_self.showTextResult(objResult.main, _xM, _y);
		if(userMc._mySplitPoints > 0){
			_self.showTextResult(objResult.split, _xS, _y);
		}
	}
	
	// GET
	_self.getMyPoints = function(){
		var myPoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arMyPoints.length; i++) {
			var curPoint = _arMyPoints[i];
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

	_self.getMySplitPoints = function(){
		var mySplitPoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arMySplitPoints.length; i++) {
			var curPoint = _arMySplitPoints[i];
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

	_self.getHousePoints = function(){
		var housePoints = 0;
		var countAce = 0;
		for (var i = 0; i < _arHousePoints.length; i++) {
			var curPoint = _arHousePoints[i];
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
	
	_self.getCard = function(cardIndex){
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

	_self.getNameCard = function(cardIndex){
		var cardType = Math.floor(cardIndex / 4);
		var cardSymbol = String(cardType);
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
		
		return cardSymbol;
	}

	// CHANNEL
	_self.initRoom = function(roomFullCallback){
		_room = new RoomJS();
		
		var countLast = _room.getMaxUsers() - _room.getUsersArr().length;
		var str = getText("wait_players").replace(new RegExp("NUM"), countLast);

		var room_game_wait = false;
		var prev_room_game_wait = 'none';
		Casino.onGameStateChange(function(data){
			if (data.action=='room_users') {
				var data_users = {}
				room_game_wait = false;
				for(var k in data.users){
					data_users[data.users[k].address] = data.users[k];
					
					if (data.users[k].play && data.users[k].address!=openkey) {
						room_game_wait = true;
					}

					_room.addUser(data.users[k].address, 
									data.users[k].deposit, 
									data.users[k].id, 
									_self.responseServer);
				}
				
				if (data_users[openkey]) {
					if (data_users[openkey].betGame > 0) {
						room_game_wait = false
					}
				}
				
				if (prev_room_game_wait == room_game_wait) {
					return
				}
				
				prev_room_game_wait = room_game_wait;
				
				if (room_game_wait) {
					str = getText("Wait, the new game will open soon.");
					_self.showWndWarning(str);
					return;
				} else {
					roomFullCallback(_room.getUsersArr())
				}
			}
			
			var curUser = _room.getTagUser(data.user_id);
			if (data.action=='call_game_function') {
				if (data.name=='closeAllChannels' && !_bCloseChannel) {
					_self.closeChannel();
					_self.showChips(false);
					return;
				}
				
				if (curUser) {
					_self.refreshLogic(curUser.id);
					_room.callFunction(data.user_id, data.name, data.args)
				} else {
					str = getText("error_user_offline").replace(new RegExp("VALUE"), data.user_id);
					_self.showError(str);
				}
			}
		})
	}

	_self.initLogic = function(){
		// init logic
		var params = {prnt:_self, 
					balance:login_obj["deposit"], 
					address:openkey, 
					callback:_self.responseServer, 
					bMultiplayer:false};
		
		_logic = new LogicMultJS(params);
	}

	_self.initGame = function() {
		console.log("initGame");
	}
	
	_self.refreshLogic = function(id){
		if(_room && options_multiplayer && id >= 0){
			var ar = _room.getUsersArr();
			if(ar.length>0){
				_logic = ar[id].logic;
			}
		}
	}

	_self.getAdrBankroll = function(){
		addressContract = addressChannel;
	}
	
	_self.getBankrolls = function(){
		if(options_debug){
			_countBankrollers = 1;
			_balanceSession = 10*valToken;
			_balance = 0;
			_self.refreshBalance();
			login_obj["openChannel"] = true;
			login_obj["deposit"] = _balanceSession;
			if(options_multiplayer){
				_self.initRoom();
			} else {
				_self.initLogic();
			}
			sessionIsOver = false;
			_self.showChips(true);
			_self.showTutorial();
			return false;
		}
		_arBankrollers = Object.keys(Casino.getBankrollers(gameCode));
		_countBankrollers = _arBankrollers.length;
		_self.tfBankrollers.setText("Bankrollers: " + _countBankrollers);
		
		if (_countBankrollers > 0) {
			_self.getAdrBankroll();
			_self.showWndBank();
		} else {
			_self.showBankrolls();
		}
	}
	
	_self.showUsers = function() {
		var users = _room.getUsers()
		var user = users[openkey];
		var pt;
		
		_myIdMult   = user.id
		_idTurnUser = 0

		_self.refreshLogic(_myIdMult);
		
		for(var k in users){
			if (user.id!=users[k].id) {
				if(_users.getTagUser(users[k].address)){
				}else{
					pt = _users.addUser(users[k].address, users[k].id);
					pt.y += 120;
					_arUsersCoord[users[k].id] = {x:pt.x, y:pt.y};
				}
			} else {
				_arUsersCoord[users[k].id] = {x:_W/2, y:_self.seat.y+90};
			}
		}
		
		_self.showChips(true);
	}

	_self.setUserData = function() {
		sessionIsOver       = false;
		_arHistory    = [];
		_wndWarning.visible = false;
		
		_arHistory.push({name:"open_channel", deposit:_balanceSession});
		
		login_obj["openChannel"]       = true;
		login_obj["addressBankroller"] = addressContract;
		login_obj["balanceSession"]    = _balanceSession;
		login_obj["deposit"]           = _balanceSession;
		login_obj["arHistory"]         = _arHistory;
		
		_self.initLogic();
		_self.isCashoutAvailable();
		
		Casino.Account.getBetsBalance(_self.getBalancePlayer);
		
		saveData();	
	}
	
	_self.openChannel = function() {
		_bWindow = false;
		_bCloseChannel = false;
		var str = getText("open_channel_start").replace(new RegExp("SPL"), "\n");
		_self.showWndWarning(str);
		
		Casino.startGame(gameCode, addressContract, _balanceSession, function(obj){
			if(obj == true){
				if (options_multiplayer) {
					_self.initRoom(function(arUsers){
						_self.setUserData();
						_self.showUsers();
						_self.showTutorial();
					});
				} else {
					_self.setUserData();
					_self.showChips(true);
					_self.showTutorial();
				}
			} else {
				_self.showChips(true);
				_balanceSession = 0;
				Casino.Account.getBetsBalance(_self.getBalancePlayer);
				if(obj.error){
					str = getText("error_"+obj.error).replace(new RegExp("VALUE"), addressContract);
					console.log("error:", obj.error);
					_self.showError(str, _self.showBankrolls);
					sessionIsOver = false;
					_objSpeedGame.result = true;
					_self.isCashoutAvailable();
				} else {
					_self.showError(getText("timeout"));
				}
			}
		});
	}
	
	_self.closeChannel = function() {
		if(_bCloseChannel){
			return false;
		}
		
		if(options_debug){
			var deposit = _balanceSession - login_obj["deposit"];
			sessionIsOver = true;
			login_obj["openChannel"] = false;
			login_obj["deposit"] = 0;
			_self.resetObjGame();
			_self.resetGame();
			_self.showChips(true);
			_bCloseChannel = true;
			_arHistory.push({name:"end_channel", profit:deposit});
			login_obj["arHistory"] = _arHistory;
			saveData();
		} else if(login_obj["openChannel"] && _objSpeedGame.result && _logic){
			_self.refreshLogic(_myIdMult);
			if(_logic.getResult()){
				var deposit = _balanceSession - login_obj["deposit"];
				_self.showButtons(false);
				_self.showChips(false);
				_self.btnExit.alpha = 0.5;
				_bCloseChannel = true;
				var str = getText("close_channel_start").replace(new RegExp("SPL"), "\n");
				_self.showWndWarning(str);
				
				// if(options_multiplayer){
					// Casino.callGameFunction(_idGame, msgID(), 
						// 'closeAllChannels', []
					// );
				// }
				Casino.endGame(deposit, function(obj){
					_wndWarning.visible = false;
					if(obj == true){
						sessionIsOver = true;
						login_obj["openChannel"] = false;
						login_obj["deposit"] = 0;
						_self.resetObjGame();
						_self.resetGame();
						_self.isCashoutAvailable();
						_self.createWndInfo(getText("close_channel_end"), function(){
							// if(options_multiplayer){
								// window.location.reload();
								// return;
							// }
						}, "OK");
						
						_self.showChips(true);
						_arHistory.push({name:"end_channel", profit:deposit});
						infura.sendRequest("getBalance", openkey, _callback);
						Casino.Account.getBetsBalance(_self.getBalancePlayer);
						login_obj["arHistory"] = _arHistory;
						saveData();
					} else {
						console.log("error:", obj.error);
						var str = getText("error_"+obj.error) + 
									String(deposit/valToken) + " != " + String(obj.profit/valToken);
						if(obj.error == "invalid_profit"){
							str += "\n" + getText("click_reset");
						}
						_self.showError(str);
						_self.btnExit.alpha = 1;
						_bCloseChannel = false;
					}
				})
			} else {
				_self.showError(getText("error_invalid_profit"));
				_self.btnExit.alpha = 1;
				_bCloseChannel = false;
				return false;
			}
		}
		
		if(_self.tooltip && (_idTutor == 3 || _idTutor == 4)){
			_idTutor = 0;
			_self.tooltip.visible = false;
			if(_idTutor == 3){
				login_obj["tutor_nextgame"] = true;
			} else if(_idTutor == 4){
				login_obj["tutor_closechannel"] = true;
			}
		}
	}

	// BLOCKCHAIN
	_self.getBalancePlayer = function(value){
		_balance = Number(value)*valToken;
		_self.refreshBalance();
	}

	_self.refreshBalance = function(){
		var str = toFixed(convertToken(_balanceSession), 3) + " (" +
							toFixed(convertToken(_balance), 3) + ")" + " BET";
		var str2 = "Session balance: " + toFixed(convertToken(_balanceSession), 3) + " \n Player balance: " +
							toFixed(convertToken(_balance), 3) + " \n BET";
		_self.tfBalance.setText(str);
		_self.icoEthereum.hint2 = str2;
	}

	_self.getBalanceBank = function(){
		var value = callERC20("balanceOf", addressContract);
		_balanceBank = Number(value);
	}

	_self.getBalanceErc = function(){
		var value = callERC20("balanceOf", addressCurErc);
		_balanceErc = Number(value);
	}

	_self.responseTransaction = function(name, value) {
		var args = [];
		var price = 0;
		var nameRequest = "sendRaw";
		var gasPrice="0x"+numToHex(40000000000);
		var gasLimit=0x927c0; //web3.toHex('600000');
		if(name == "newChannel"){
			price = _balanceSession;
			args = [price];
		} else if(name == "closeChannel"){
			if(_logic.getResult()){
				price = _objSpeedGame.money;
				// price = _logic.getResult().profit;
				var add = price > 0;
				args = [openkey, Math.abs(price), add];
			} else {
				_self.showError("Profit is undefined.");
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
					_self.showError(ERROR_BUF);
					return false;
				}
				
				var registerTx = lightwallet.txutils.functionTx(abi, name, args, options);
				var params = "0x"+lightwallet.signing.signTx(ks, pwDerivedKey, registerTx, sendingAddr);
				infura.sendRequest(nameRequest, params, _callback, undefined, _currentMethod);
			})
		} else {
			_self.showError(ERROR_BUF);
			if(_self.countPlayerCard == 0){
				_self.clearBet();
				_self.tfStatus.setText("");
				_self.showChips(true);
				_self.bClickStart = false;
			}
			_self.bWait = false;
		}
	}

	_self.response = function(command, value, error) {
		if(value == undefined || error){
			if((command == "sendRaw" || command == "gameTxHash")){
				if(error){
					// OUT OF GAS - error client (wrong arguments from the client)
					// invalid JUMP - throw contract
					console.log("response:", error);
					_self.showError(error.message);
				} else {
					_self.showError(ERROR_CONTRACT);
				}
			}
			return false;
		}
		
		if(command == "getBalance"){
			_balancePlEth = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
		} else if(command == "getBalanceBank"){
			_balanceBank = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
		} else if(command == "newChannel"){
			_self.responseTransaction(command, value);
			login_obj["openChannel"] = true;
		} else if(command == "closeChannel"){
			_self.responseTransaction(command, value);
			login_obj["openChannel"] = false;
		} else if(command == "sendRaw"){
		}
	}

	// SERVER
	_self.responseServer = function(address, objGame) {
		// show action
		if(address == openkey){
			var balanceSession = _balanceSession;
			var arMy = [];
			var arSplit = [];
			var arHouse = [];
			_self.tfStatus.setText("");
			_self.refreshLogic(_myIdMult);
			_objSpeedGame = objGame;
			_objSpeedGame.curGame = objGame.curGame;
			_balanceSession = _logic.getBalance();
			login_obj["objGame"] = _objSpeedGame;
			login_obj["objResult"] = _logic.getResult();
			login_obj["balanceSession"] = _balanceSession;
			login_obj["bSplit"] = _bSplit;

			for(var name in _objSpeedGame.curGame){
				var obj = _objSpeedGame.curGame[name];
				switch(name){
					case "arMyCards":
						_countPlayerCard = obj.length;
						arMy = _self.addCard(name, _loadPlayerCard, _countPlayerCard, obj);
						break;
					case "arMySplitCards":
						_countSplitCard = obj.length;
						arSplit = _self.addCard(name, _loadSplitCard, _countSplitCard, obj);
						break;
					case "arHouseCards":
						_countHouseCard = obj.length;
						arHouse = _self.addCard(name, _loadHouseCard, _countHouseCard, obj);
						break;
				}
			}
			
			var name = _arMethodsName[_currentMethod];
			var transaction = _balanceSession - balanceSession;
			
			if(name != undefined){
				if(options_multiplayer && arHouse.length > 0){
					name = _arMethodsName[DEALER];
				}
				_arHistory.push({name:name, transaction:transaction, 
								my:arMy, split:arSplit, house:arHouse});
			}
			
			if(_objSpeedGame.result && _objSpeedGame.betGame > 0){
				if(_countPlayers == 1){
					_arHistory.push({name:"end_game", balance:_balanceSession});
				}
				var delay = (_arNewCards.length+1)*TIME_NEW_CARD;
				createjs.Tween.get({}).wait(delay).call(function(){
										if(!_bGameOver){
											_self.checkResult(_logic.getResult());
											_self.refreshBalance();
											_objSpeedGame.betGame = 0;
											_objSpeedGame.betSplitGame = 0;
										}
									});
			} else {
				_self.refreshBalance();
			}

			login_obj["arHistory"] = _arHistory;

			saveData();
			
			if(objGame.method == "bjDealerStand"){
				_self.updateDealer(objGame, true);
				_self.gameOver();
			}
		} else {
			if(!options_multiplayer){
				return;
			}
			var curUser = _room.getTagUser(address);
			var userMc = _users.getUser(curUser.id);
			
			switch(objGame.method){
				case "bjBet":
					if(userMc){
						userMc.clearGame();
						userMc.fillChips(curUser.logic.getGame().betGame);
					}
					break;
				case "bjDealer":
					_self.updateDealer(objGame, false);
					for(var name in objGame.curGame){
						var obj = objGame.curGame[name];
						if(name=="arHouseCards"){ 
							_countHouseCard = obj.length;
							arHouse = _self.addCard(name, _loadHouseCard, _countHouseCard, obj);
							_arHistory.push({name:"dealer", transaction:0, house:arHouse});
							break;
						}
					}
					break;
				case "bjMultStand":
					_idTurnUser ++;
					// if(_idTurnUser >= _room.getUsersArr().length){
					if(_idTurnUser >= _countPlayers){
						_self.clickDealerStand();
					} else {
						if(_idTurnUser == _myIdMult){
							if(_myPoints < BLACKJACK){
								_self.updateShowBtn(1);
							} else {
								_self.clickStand();
							}
						}
					}
					break;
				case "bjDealerStand":
					_self.updateDealer(objGame, true);
					for(var name in objGame.curGame){
						var obj = objGame.curGame[name];
						if(name=="arHouseCards"){ 
							_countHouseCard = obj.length;
							arHouse = _self.addCard(name, _loadHouseCard, _countHouseCard, obj);
							if(arHouse.length > 0){
								_arHistory.push({name:"dealer", transaction:0, house:arHouse});
							}
							break;
						}
					}
					
					_self.gameOver();
					return;
					break;
			}
			
			if (userMc) {
				userMc.responseServer(objGame.curGame);
			}
			
			if(objGame.result && objGame.betGame > 0){
				var delay = (_arNewCards.length+1)*TIME_NEW_CARD;
				_idTurnUser ++;
				// if(_idTurnUser >= _room.getUsersArr().length){
				if(_idTurnUser >= _countPlayers){
					_self.clickDealerStand();
				}
				
				_self.updateShowBtn(delay);
				createjs.Tween.get({}).wait(delay).call(function(){
										_self.checkUserResult(curUser);
										objGame.betGame = 0;
										objGame.betSplitGame = 0;
									});
			}
		}
		
		// All users set bet
		if(!_startGame && objGame.method == "bjBet"){
			var betCnt = 0
			var countUsers = 0;
			_room.getUsersArr().forEach( function(user) {
				if (user.logic.getGame().betGame) {
					betCnt++;
				}
				if (user.logic.getGame().play != true) {
					countUsers++;
				}
			}) 
				
			// if (betCnt >= _room.getMaxUsers()) {
			if (betCnt >= countUsers) {
				_self.clickGeneralDeal()
			}
		}
	}

	_self.updateDealer = function(objGame, value) {
		_room.getUsersArr().forEach( function(user) {
			user.logic.setDealerCards(objGame.curGame.arHouseCards, value);
		}) 
	}

	_self.gameOver = function(){
		if(!_bGameOver){
			_bGameOver = true;
			_self.showChips(true);
			_self.showButtons(false);
			
			 Casino.callGameFunction(_idGame, msgID(), 
				'refreshGame', []
			);
			
			_room.getUsersArr().forEach( function(user) {
				user.logic.refreshGame();
				if(user.address == openkey){
					if(_objSpeedGame.betGame > 0){
						createjs.Tween.get({}).call(function(){
										_self.checkResult(user.logic.getResult());
										_self.refreshBalance();
										_objSpeedGame.betGame = 0;
										_objSpeedGame.betSplitGame = 0;
									});
					}
					_self.isCashoutAvailable();
				} else {
					createjs.Tween.get({}).call(function(){
										_self.checkUserResult(user);
									});
				}
			})
			_arHistory.push({name:"end_game", balance:_balanceSession});
		}
	}
	
	// UPDATE
	_self.update = function(diffTime){
		if(options_pause){
			return false;
		}
		
		_mixingCard.update(diffTime);
		if(_timeMixing > 0 && _mixingCard.visible){
			_timeMixing -= diffTime;
			if(_timeMixing < 100){
				_timeMixing = 0;
				_mixingCard.visible = false;
				_wndWarning.visible = false;
			}
		}
		if(_bWaitBet && _balance > 0){
			_bWaitBet = false;
			_wndWarning.visible = false;
			_self.showChips();
		}
		
		if(_wndWarning){
			if(_wndWarning.visible){
				_wndWarning.loading.update(diffTime);
			}
		}
		if(_wndList){
			if(_wndList.visible){
				_wndList.update(diffTime);
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
		if(_arNewCards.length > 0 && _timeNewCard < 1){
			_timeNewCard = TIME_NEW_CARD;
			this.sendCard(_arNewCards[0]);
			_arNewCards.shift();
		}
		if(_timeShowButtons > 0){
			_timeShowButtons -= diffTime;
			if(_timeShowButtons <= 0){
				this.showButtons(true);
			}
		}
		
		_timeGetState += diffTime;
		if(_timeGetState >= TIME_GET_STATE){
			_timeGetState = 0;
			if(!login_obj["openChannel"]){
				Casino.Account.getBetsBalance(_self.getBalancePlayer);
			}
			if(_wndList){
				if(_wndList.visible){
					_wndList.show();
				}
			}
		}
		
		if(_users){
			_users.update(diffTime);
		}
		if(_self.icoCurUser && _arUsersCoord[_idTurnUser]){
			_self.icoCurUser.x = _arUsersCoord[_idTurnUser].x;
			_self.icoCurUser.y = _arUsersCoord[_idTurnUser].y;
			if(_self.icoCurUser.x != _W/2){
				_self.btnHit.alpha = 0.5;
				_self.btnStand.alpha = 0.5;
				if(options_split){
					_self.btnSplit.alpha = 0.5;
				}
				if(options_double){
					_self.btnDouble.alpha = 0.5;
				}
			}
		}
	}
	
	// CLICK
	_self.clickBet = function(){
		_self.showChips(false)
		_self.showButtons(false)
		_self.btnDeal.alpha = 0.5;
		_self.btnClear.alpha = 0.5;
		_self.btnExit.alpha = 0.5;
		_self.refreshLogic(_myIdMult);
		
		if(options_debug){
			_logic.bjBet(_betGame);
		} else {
			Casino.callGameFunction(_idGame, msgID(), 
				'bjBet', [_betGame]
			);
			_logic.bjBet(_betGame);
		}
	}

	_self.clickGeneralDeal = function(){
		_startGame = true;
		_idTurnUser = 0

		_idGame ++;
		_arUsersResult = [];
		_self.icoCurUser.visible = true;
		
		var curUser = _room.getTagUser(openkey);
		_self.clickHit();
		_self.clickHit();
		
		if (curUser.id==0) {
			var seed = makeID();
			Casino.callGameFunction(_idGame, msgID(), 'bjDealer', [seed]);
			curUser.logic.bjDealer(seed);
		}
	}

	_self.clickDealerStand = function(){
		if(!_startGame){
			return;
		}
		
		_startGame = false;
		_self.icoCurUser.visible = false;
		
		var curUser = _room.getTagUser(openkey);
		if (curUser.id==0) {
			var seed = makeID();
			Casino.callGameFunction(_idGame, msgID(), 'bjDealerStand', [seed]);
			curUser.logic.bjDealerStand(seed);
		}
	}

	_self.clickDeal = function(){
		if(_bWindow){
			return false;
		}
		
		var seed = makeID();
		_currentMethod = DEAL;
		_idGame ++;
		localStorage._idGame = _idGame;
		if((_betGame >= _minBet && 
		_balanceBank >= (_betGame/valToken)*3) && 
		_countBankrollers > 0){
			if(_balancePlEth > 0){
				_arHistory.push({name:"start_game"});
				_countPlayers = _room.getUsersArr().length;
				if(_countPlayers > 1){
					this.clickBet();
				} else {
					this.btnDeal.alpha = 0.5;
					this.btnClear.alpha = 0.5;
					this.btnExit.alpha = 0.5;
					this.showChips(false);
					_startGame = true;
					_idTurnUser = 0;
					_arUsersResult = [];
					if(options_debug){
						_logic.bjDeal(seed, _betGame);
					} else {
						Casino.callGameFunction(_idGame, msgID(), 
							'bjDeal', ['confirm('+seed+')', _betGame]
						);
						_self.signSeed(seed, function(result){
							_logic.bjDeal(result, _betGame);
						});
					}
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
				_self.showBankrolls();
			}
			this.clearBet();
			this.showChips(true);
		}
		
		if(this.tooltip && _idTutor == 2){
			this.tooltip.visible = false;
			login_obj["tutor_deal"] = true;
			_idTutor = 0;
		}
	}

	_self.clickHit = function(){
		if(_bWindow){
			return false;
		}
		
		var seed = makeID();
		var isMain = !_bSplit;
		_currentMethod = HIT;
		if(options_debug){
			_logic.bjHit(seed, isMain);
		} else {
			_self.signSeed(seed, function(result){
				var arParams = ['confirm('+seed+')', isMain];
				if(options_multiplayer){
					var curUser = _room.getTagUser(openkey);
					arParams = [result, isMain];
					_logic = curUser.logic;
				}
				
				Casino.callGameFunction(_idGame, msgID(), 'bjHit', arParams);
				_logic.bjHit(result, isMain);
			});
		}
		_self.showButtons(false);
	}

	_self.clickStand = function(){
		if(_bWindow){
			return false;
		}
		
		if(_countPlayers > 1){
			_self.clickMultStand();
			return false;
		}
		
		var seed = makeID();
		var isMain = !_bSplit;
		_currentMethod = STAND;
		
		if(options_debug){
			_logic.bjStand(seed, isMain);
		} else {
			_self.signSeed(seed, function(result){
				var arParams = ['confirm('+seed+')', isMain];
				Casino.callGameFunction(_idGame, msgID(), 'bjStand', arParams);
				_logic.bjStand(result, isMain);
			});
		}
		
		if(_bSplit){
			_bSplit = false;
			login_obj["bSplit"] = _bSplit;
			saveData();
			_self.darkCards(_arMyCards, false);
			_self.darkCards(_arMySplitCards, true);
			if(_myPoints >= BLACKJACK){
				_self.showButtons(false);
				_self.clickStand();
			}
			if(options_double){
				if(_self.isDoubleAvailable()){
					_self.btnDouble.alpha = 1;
				}
			}
		} else {
			_self.showButtons(false);
		}
	}

	_self.clickMultStand = function(){
		if(_bWindow){
			return false;
		}
		if(_myIdMult != _idTurnUser){
			return false;
		}
		
		var seed = makeID();
		var isMain = !_bSplit;
		_currentMethod = STAND;
		
		if(options_debug){
			_logic.bjMultStand(seed, isMain);
		} else {
			_self.signSeed(seed, function(result){
				var arParams = [result, isMain];
				var curUser = _room.getTagUser(openkey);
				_logic = curUser.logic;
				Casino.callGameFunction(_idGame, msgID(), 'bjMultStand', arParams);
				_logic.bjMultStand(result, isMain);
				
				if(isMain){
					_self.showButtons(false);
					_idTurnUser ++;
					// if(_idTurnUser >= _room.getUsersArr().length){
					if(_idTurnUser >= _countPlayers){
						_self.clickDealerStand();
					}
				} else {
					if(_bSplit){
						_bSplit = false;
						login_obj["bSplit"] = _bSplit;
						saveData();
						_self.darkCards(_arMyCards, false);
						_self.darkCards(_arMySplitCards, true);
						if(_myPoints >= BLACKJACK){
							_self.showButtons(false);
							_self.clickStand();
						}
						if(options_double){
							if(_self.isDoubleAvailable()){
								_self.btnDouble.alpha = 1;
							}
						}
					} else {
						_self.showButtons(false);
					}
				}
			});
		}
	}

	_self.clickDouble = function(){
		if(_bWindow){
			return false;
		}
		if(_countPlayers > 1){
			_self.clickMultDouble();
			return false;
		}
		
		var seed = makeID();
		var isMain = !_bSplit;
		_currentMethod = DOUBLE;
		if(options_debug){
			_logic.bjDouble(seed, isMain);
		} else {
			Casino.callGameFunction(_idGame, msgID(), 
				'bjDouble', ['confirm('+seed+')', isMain]
			);
			_self.signSeed(seed, function(result){_logic.bjDouble(result, isMain);});	
		}
		this.showButtons(false);
		
		if(_bSplit){
			_betSplitGame *= 2;
			this.fillChips(_betSplitGame, "split");
			var str = String(convertToken(_betSplitGame));
			this.tfSplitBet.setText(str);
		} else {
			_betGame *= 2;
			if(_arMySplitCards.length > 0){
				this.fillChips(_betGame, "main");
			} else {
				this.fillChips(_betGame);
			}
			var str = String(convertToken(_betGame));
			this.tfMyBet.setText(str);
		}
	}

	_self.clickMultDouble = function(){
		if(_bWindow){
			return false;
		}
		
		var seed = makeID();
		var isMain = !_bSplit;
		_currentMethod = DOUBLE;
		if(options_debug){
			_logic.bjMultDouble(seed, isMain);
		} else {
			Casino.callGameFunction(_idGame, msgID(), 
				'bjMultDouble', ['confirm('+seed+')', isMain]
			);
			_self.signSeed(seed, function(result){_logic.bjMultDouble(result, isMain);});	
		}
		this.showButtons(false);
		
		if(_bSplit){
			_betSplitGame *= 2;
			this.fillChips(_betSplitGame, "split");
			var str = String(convertToken(_betSplitGame));
			this.tfSplitBet.setText(str);
		} else {
			_betGame *= 2;
			if(_arMySplitCards.length > 0){
				this.fillChips(_betGame, "main");
			} else {
				this.fillChips(_betGame);
			}
			var str = String(convertToken(_betGame));
			this.tfMyBet.setText(str);
		}
	}

	_self.clickSplit = function(){
		if(_bWindow){
			return false;
		}
		
		if(_balanceSession < _betGame){
			_self.showError(ERROR_BALANCE_BET, _self.faucet);
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
			_self.signSeed(seed, function(result){_logic.bjSplit(result);});	
		}
		_self.showButtons(false);
		
		_bSplit = true;
		login_obj["bSplit"] = _bSplit;
		saveData();
		_betSplitGame = _betGame;
		_self.fillChips(_betGame);
		_self.fillChips(_betGame, "split");
		var str = String(convertToken(_betGame));
		_self.tfMyBet.setText(str);
		_self.tfMyBet.x = _W/2 - _arCoords["ofssSC"];
		_self.tfSplitBet.setText(str);
		
		_arMySplitCards = [_arMyCards[1]];
		_arMyCards = [_arMyCards[0]];
		
		_arMyCards[0].x = _W/2 - _arCoords["ofssSC"];
		_arMySplitCards[0].x = _W/2 + _arCoords["ofssSC"];
		_self.tfMyPoints.x = _W/2-_arCoords["ofssSC"];
		_arMyPoints = [_arMyCards[0].point];
		_arMySplitPoints = [_arMySplitCards[0].point];
		_self.showMyPoints();
		_self.showMySplitPoints();
		_self.darkCards(_arMyCards, true);
		_self.darkCards(_arMySplitCards, false);
	}

	_self.clickInsurance = function(){
		_currentMethod = INSURANCE;
		_valInsurance = _betGame/2;
		_bWindow = false;
		if(!options_debug){
			var name = _arMethodsName[_currentMethod];
			var transaction = -_valInsurance;
			_arHistory.push({name:name, transaction:transaction});
			Casino.callGameFunction(_idGame, msgID(), 
				'bjInsurance', [_valInsurance]
			);
		}
		_bInsurance = 1;
		_logic.bjInsurance(_valInsurance);
		_balanceSession = _logic.getBalance();
		_self.refreshBalance();
		saveData();
	}

	_self.clickReset = function(){
		_balanceSession = 0;
		_self.refreshBalance();
		_self.resetGame();
		_self.resetObjGame();
		_self.showChips(true);
		_self.removeAllListener();
		localStorage.removeItem('channel_id');
		localStorage.removeItem('contract_address');
		if(_wndWarning){
			_wndWarning.visible = false;
		}
		resetData();
		window.location.reload();
	}

	_self.clickChip = function(item_mc){
		if(!login_obj["openChannel"]){
			_self.showWndBank();
			return false;
		}
		_self.isCashoutAvailable();
		
		if(_betGame == 0){
			_self.clearChips();
			_self.clearSplitChips();
		}
		
		var name = item_mc.name;
		var value = chipVale[Number(name.substr(5))]*valToken;
		var oldBet = _betGame;
		_betGame += value;
		_betGame = toFixed(_betGame, 2);
		
		if(_balanceSession == 0){
			_self.showWndBank();
			_betGame = oldBet;
			return false;
		} else if(_balancePlEth < 0.01){
			_self.showError(ERROR_BALANCE);
			_betGame = oldBet;
		} else if(_betGame > _balanceSession){
			_self.showError(ERROR_BALANCE_BET, _self.faucet);
			_betGame = oldBet;
		} else if(_betGame > _maxBet){
			_self.showError(ERROR_MAX_BET);
			_betGame = oldBet;
		} else {
			var str = "Your bet: " + String(convertToken(_betGame));
			_self.tfYourBet.setText(str);
			_self.tfSplitBet.setText("");
			_self.tfMyBet.setText(convertToken(_betGame));
			_self.tfMyBet.x = _W/2;
		}
		if(_betGame > 0){
			_self.btnDeal.alpha = 1;
			_self.btnClear.alpha = 1;
			if(!_bClear){
				_self.tfStatus.setText("");
				_self.tfMyPoints.setText("");
				_self.tfMySplitPoints.setText("");
				_self.tfHousePoints.setText("");
				_arMyPoints = [];
				_arMySplitPoints = [];
				_arHousePoints = [];
				_arMyCards = [];
				_arMySplitCards = [];
				_arHouseCards = [];
				_bClear = true;
				_self.clearGame();
				_self.showButtons(true);
			}
		}
		
		if(_betGameOld == _betGame){
			return false;
		}
		_betGameOld = _betGame;
		_self.sendChip(item_mc, _betGame);
		
		if(_self.tooltip && (_idTutor == 1 || _idTutor == 3 || _idTutor == 4)){
			_self.tooltip.visible = false;
			if(_idTutor == 3){
				login_obj["tutor_nextgame"] = true;
				_idTutor = 0;
			}
			if(_idTutor == 4){
				login_obj["tutor_closechannel"] = true;
				_idTutor = 0;
			}
		}
	}
	
	_self.clickCell = function(item_mc) {
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
		
		this.refreshLogic(_myIdMult);
		
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
			this.btnFrame._selected = false;
			this.btnFrame.visible = false;
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
		} else if(item_mc.name == "btnReset"){
			this.showReset();
		} else if(item_mc.name == "btnHistory"){
			this.showHistory();
		} else if(item_mc.name == "btnDao"){
			this.removeAllListener();
			// var url = "https://platform.dao.casino/";
			var url = "/";
			window.open(url, "_self");
		} else if(item_mc.name.search("chip") != -1){
			this.clickChip(item_mc);
		}
	}

	_self.checkButtons = function(evt){
		_mouseX = evt.data.global.x;
		_mouseY = evt.data.global.y;
		if(this.tooltip && !_idTutor){
			this.tooltip.visible = false;
		}
		
		for (var i = 0; i < _arButtons.length; i++) {
			var item_mc = _arButtons[i];
			if(hit_test_rec(item_mc, item_mc.w, item_mc.h, _mouseX, _mouseY) &&
			((item_mc.visible && item_mc.dead != true) || item_mc.name == "btnKey")){
				if(item_mc.disabled != true && item_mc.alpha == 1){
					if(item_mc._selected == false){
						item_mc._selected = true;
						if(item_mc.name == "btnKey"){
							item_mc.visible = true;
						}
						if(item_mc.over){
							item_mc.over.visible = true;
						} else if(item_mc.overSc){
							item_mc.scale.x = 1.1*item_mc.sc;
							item_mc.scale.y = 1.1*item_mc.sc;
						}
						if(item_mc.name == "icoKey"){
							this.btnFrame.visible = true;
						}
					}
					if(item_mc.hint2 && !_idTutor){
						this.showTooltip(item_mc, item_mc.hint2, item_mc.x, item_mc.y);
					}
				} else if(item_mc.hint && !_idTutor){
					this.showTooltip(item_mc, item_mc.hint, item_mc.x, item_mc.y);
				}
			} else {
				if(item_mc._selected){
					item_mc._selected = false;
					if(item_mc.name == "btnKey"){
						item_mc.visible = false;
					}
					if(item_mc.over){
						item_mc.over.visible = false;
					} else if(item_mc.overSc){
						item_mc.scale.x = 1*item_mc.sc;
						item_mc.scale.y = 1*item_mc.sc;
					}
					if(item_mc.name == "icoKey"){
						this.btnFrame.visible = false;
					}
				}
			}
		}
	}

	_self.touchHandler = function(evt){
		if(this.bWindow){
			return false;
		}
		var phase = evt.type;
		
		if(phase=='mousemove' || phase == 'touchmove' || phase == 'touchstart' || phase == "mousedown"){
			this.checkButtons(evt);
		} else if (phase == 'mouseup' || phase == 'touchend') {
			for (var i = 0; i < _arButtons.length; i++) {
				var item_mc = _arButtons[i];
				if(item_mc._selected){
					this.clickCell(item_mc);
					return;
				}
			}
		}
	}

	_self.removeAllListener = function(){
		if(_wndInfo){
			_wndInfo.removeAllListener();
		}
		if(_wndInsurance){
			_wndInsurance.removeAllListener();
		}
		if(_wndBank){
			_wndBank.removeAllListener();
		}
		if(_wndList){
			_wndList.removeAllListener();
		}
		clearClips();
		this.interactive = false;
		this.off('mouseup', this.touchHandler);
		this.off('mousedown', this.touchHandler);
		this.off('mousemove', this.touchHandler);
		this.off('touchstart', this.touchHandler);
		this.off('touchmove', this.touchHandler);
		this.off('touchend', this.touchHandler);
	}

	_self.init();
	
	return _self;
}

ScrGame.prototype = Object.create(PIXI.Container.prototype);
ScrGame.prototype.constructor = ScrGame;
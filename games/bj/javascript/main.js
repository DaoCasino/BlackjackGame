var _W = 1920;
var _H = 1080;
var version = "v. 1.1.14";
var metaCode = "blackjack_v1";
var gameCode = "BJ_m";
var login_obj = {};
var arClips = [];
var language;
var dataAnima = [];
var dataMovie = [];
var openkey, privkey, mainet;
var currentScreen, scrContainer;
var ScreenMenu, ScreenGame, ScreenSpeedGame, ScreenTest;
var LoadPercent = null;
var startTime;
var renderer, stage, preloader; // pixi;
var sprites_loaded = false;
var sessionIsOver = true;
var infura, soundManager, ks, sendingAddr;
var passwordUser = "1234";
var fontMain = "Arial";
var fontDigital = "Digital-7";
var fontArchivo = "Archivo Black";
var stats; //для вывода статистики справа
var valToken = 100000000; // 1 token
var rndBg = String(Math.ceil(Math.random()*2));
var abi = [{"constant":false,"inputs":[{"name":"value","type":"uint256"}],"name":"requestInsurance","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"}],"name":"setTokenAddress","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"amountInWei","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"value","type":"uint256"},{"name":"seed","type":"bytes32"}],"name":"split","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getBank","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"seed","type":"bytes32"}],"name":"stand","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"seed","type":"bytes32"}],"name":"hit","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"idSeed","type":"bytes32"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"confirm","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"usedRandom","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"value","type":"uint256"},{"name":"seed","type":"bytes32"}],"name":"deal","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"value","type":"uint256"},{"name":"seed","type":"bytes32"}],"name":"double","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"deckAddress","type":"address"},{"name":"storageAddress","type":"address"},{"name":"seedAddress","type":"address"},{"name":"tokenAddress","type":"address"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_type","type":"uint8"},{"indexed":false,"name":"_card","type":"uint8"}],"name":"Deal","type":"event"}]
// main
var addressErc = "";
var addressStorage = "";
var addressContract = "0xae4153acc4621d9475daded912d075e6de0bf718";
// testrpc
var	addressRpcErc      = "0x084294104f8078b27e50f3292132f33d3fb8921b";
var	addressRpcStorage  = "0x6bba6649113f534578ac735c5b3942bb09a2cb08";
var	addressRpcContract = "0x2e44b198a44b434cae540d8b8f3e93dd56009da7";
// channel
var addressChannel		= "0xe26b3678fef015f3122e78f9d85b292ce45975b1"; // server
// testnet
var addressTestErc = "0x95a48dca999c89e4e284930d9b9af973a7481287"; // 0x95a48dca999c89e4e284930d9b9af973a7481287 !!!
// work (slow game)
var addressTestDeck     = "0x978bcd2ac501366f61f2f6264b4ee913435ca385";
var addressTestSeed     = "0x1b50ff6735fc8a0e3635d9265e799f3e1722e753";
var addressTestStorage  = "0xaee32ec2e9f50d82092c501533ba64b9061bd885";
var addressTestContract = "0xeb131eef1a58223802d1c572ee39ebfe2dcb2a67";
// alpha (speed game)
var	addressSpeedDeck     = "0xa5ce8364091a8582c8d19dee5f77bca05f586b2c";
var	addressSpeedSeed     = "0x4d785a5f76132cd6a351ca489d43405e9140d9de";
var	addressSpeedStorage  = "0xaa7faa3da6a58f59e4af8a7343f44680212cae9f";
var	addressSpeedContract = "0x201e9af94fdfd81cb5d387960cc270c5a8c0c698";

var addressCurErc = "";

var options_debug       = false;
var options_test        = false;
var options_ethereum    = true;
var options_mainet      = false;
var options_ropsten     = true;
var options_rinkeby     = false;
var options_testnet     = options_ropsten || options_rinkeby;
var options_rpc         = false;
var options_music       = true;
var options_sound       = true;
var options_mobile      = true;
var options_pause       = false;
var options_fullscreen  = false;
var options_speedgame   = false;
var options_splitdouble = true;
var options_split = true;
var options_double = true;
var options_save = false;
var options_multiplayer = true;

var ERROR_CONNECTION = 0;
var ERROR_KEYTHEREUM = 1;
var ERROR_BUF = 2;
var ERROR_KEY = 3;
var ERROR_BANK = 4;
var ERROR_CONTRACT = 5;
var ERROR_BALANCE = 6;
var ERROR_DEAL = 7;
var ERROR_MAX_BET = 8;
var ERROR_BANKROLLER = 9;
var ERROR_BALANCE_BET = 10;

var TIME_NEW_CARD  = 600;
var TIME_SHOW_BTN  = 300;

if(options_rpc){
	addressCurErc = addressRpcErc;
} else {
	addressCurErc = addressTestErc;
	if(addressTestErc != "0x95a48dca999c89e4e284930d9b9af973a7481287"){
		console.log("warning: change addressTestErc");
		addressCurErc = "0x95a48dca999c89e4e284930d9b9af973a7481287";
	}
}

var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(callback) { return window.setTimeout(callback, 1000 / 60); };
	
function initGame() {
	if(window.orientation == undefined){
		options_mobile = false;
	} else {
		options_mobile = true;
		options_orientation = window.orientation;
	}
	
    var ua = navigator.userAgent;
    if (ua.search(/Safari/) > -1) {
        options_browser = "safari";
    }
	
	if(typeof console === "undefined"){ console = {}; }
	
	fontMain = fontArchivo;
	
    //initialize the stage
    renderer = PIXI.autoDetectRenderer(_W, _H);
    stage = new PIXI.Container();
    document.body.appendChild(renderer.view);
    preloader = new PIXI.loaders.Loader();

    window.addEventListener("resize", onResize, false);
	
	startTime = getTimer();
    onResize();
    update();
	
	language = new daoLang();
	language.add_lang_xml('en');
	language.loadSettings();
	
	// soundManager = new SoundManager();
	// soundManager.currentMusic = "none";
	
	LoadBack = new PIXI.Container();
	stage.addChild(LoadBack);
	scrContainer = new PIXI.Container();
	stage.addChild(scrContainer);
	var w = 400;
	LoadPercent = addText("Game loading", 30, "#FFFFFF", "#000000", "center", w, 2.5);
	LoadPercent.x = _W/2;
	LoadPercent.y = _H/2 + 120;
	LoadBack.addChild(LoadPercent);
	var tfVersion = addText(version, 16, "#000000", undefined, "right", 400)
	tfVersion.x = _W-20;
	tfVersion.y = _H-24;
	LoadBack.addChild(tfVersion);
	var loading = new ItemLoading(this);
	loading.x = LoadPercent.x;
	loading.y = LoadPercent.y + 50;
	LoadBack.addChild(loading);
	LoadBack.loading = loading;
	
	loadManifest();
}

function loadManifest(){
	preloader = new PIXI.loaders.Loader();
	
	preloader.add("bgMenu", "images/bg/bgMenu.jpg");
	preloader.add("bgGame1", "images/bg/bgGame1.jpg");
	preloader.add("bgGame2", "images/bg/bgGame2.jpg");
	preloader.add("wndInfo", "images/bg/wndInfo.png");
	
	preloader.add("images/texture/ItemsTexure.json");
	
	//сохраняем счетчик кол-ва файлов для загрузки
	preloader.on("progress", handleProgress);
	preloader.load(handleComplete);
}

function spritesLoad() {
	if(sprites_loaded){
		return true;
	}
	sprites_loaded = true;
	
	var img, data;
	
	// var base = PIXI.utils.TextureCache["images/icons.png"];
	// var texture0 = new PIXI.Texture(base);
	// texture0.frame = new PIXI.Rectangle(0, 0, 100, 100);
	// var texture1 = new PIXI.Texture(base);
	// texture1.frame = new PIXI.Rectangle(100, 0, 100, 100);
	// var texture2 = new PIXI.Texture(base);
	// texture2.frame = new PIXI.Rectangle(200, 0, 100, 100);
	// data = [texture0, texture1, texture2];
	// dataMovie["icons"] = data;
}

function textureLoad() {
	if(!options_test){
		// iniSet("images/texture/AnimaTexture.json");
		iniSetArt("images/texture/ItemsTexure.json");
	}
}

function iniSet(set_name) {
	var json = preloader.resources[set_name]
	if(json){}else{
		console.log("ERROR: " + set_name + " is undefined");
		return;
	}
	json = json.data;
	
	var jFrames = json.frames;
	var data = preloader.resources[set_name].textures; 
	var dataTexture = [];
	var animOld = "";
	// console.log("set_name:", set_name);
	
	if(data && jFrames){
		for (var namePng in jFrames) {
			var index = namePng.indexOf(".png");
			var nameFrame = namePng;
			if (index > 1) {
				nameFrame = namePng.slice(0, index);
			}
			// console.log("nameFrame:", nameFrame, index2);
			
			var index2 = nameFrame.indexOf("/");
			if (index2 > 1) {
				var type = nameFrame.slice(0, index2); // тип анимации
				var anim = type; // имя сета
				if(anim != animOld){
					animOld = anim;
					dataTexture[anim] = [];
				}
				dataTexture[anim].push(PIXI.Texture.fromFrame(namePng));
				// console.log(nameFrame + ": ", anim, namePng);
			}
		}
		
		for (var name in dataTexture) {
			var arrayFrames = dataTexture[name]; // какие кадры используются в сети
			dataMovie[name] = arrayFrames;
			// console.log(name + ": ", arrayFrames);
			// console.log(name);
		}
	}
}

function iniSetArt(set_name) {	
	var json = preloader.resources[set_name]
	if(json){}else{
		console.log("ERROR: " + set_name + " is undefined");
		return;
	}
	json = json.data;
	
	var frames = json.frames;
	var data = preloader.resources[set_name].textures; 
	// console.log("set_name:", set_name);
	
	if(data && frames){
		for (var namePng in frames) {
			var index = namePng.indexOf(".png");
			var nameFrame = namePng;
			if (index > 1) {
				nameFrame = namePng.slice(0, index);
			}
			dataAnima[nameFrame] = data[namePng];
			// console.log("nameFrame:", nameFrame);
		}
	}
}

function handleProgress(){
	var percent = Math.ceil(preloader.progress)
	if(LoadPercent){
		LoadPercent.setText("Game loading: " + percent + "%");
	}
}

function handleComplete(evt) {
	loadData();
	spritesLoad();
	textureLoad();
    onResize();
	
	if(document.location.hash == "#testnet"){
		options_testnet = true;
	}
	if(mainet){
		if(mainet == "on"){
			options_mainet = true;
		} else {
			options_mainet = false;
		}
	} else {
		options_mainet = false;
	}
	options_testnet = !options_mainet;
	if(options_debug){
		version = version + " arcade"
		options_save = false;
		options_multiplayer = false;
	} else if(options_rpc){
		version = version + " testrpc"
	} else if(options_testnet){
		version = version + " testnet"
	}
	
	// remove tile cub
	// addCSSRule(document.styleSheets[2], "#preloadko", "background-image: none", 1);
	
	infura = new Infura();
	
	start();
}

function addCSSRule(sheet, selector, rules, index) {
	if(sheet.insertRule) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else {
		sheet.addRule(selector, rules, index);
	}
}

function getTimer(){
	var d = new Date();
	var n = d.getTime();
	return n;
}

function refreshTime(){
	startTime = getTimer();
}

function get_normal_time(ms){
	if (ms<0) {
		return "00:00";
	}
	var s = Math.round(ms/1000);
	var m = Math.floor(s / 60);
	s = s - m * 60;
	var tS = String(s);
	var tM = String(m);
	
	if (s<10 && s>=0) {
		tS = "0" + String(s);
	}
	if (m<10 && m>=0) {
		tM = "0" + String(m);
	}
	return tM + ":" + tS;
}

/*
* value - Дробное число.
* precision - Количество знаков после запятой.
*/
function toFixed(value, precision){
	precision = Math.pow(10, precision);
	return Math.floor(value * precision) / precision;
}

function numToHex(num) {
	return num.toString(16);
}
function hexToNum(str) {
	return parseInt(str, 16);
}
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function string2Bin(str) {
	var result = [];
	for (var i = 0; i < str.length; i++) {
		result.push(str.charCodeAt(i));
	}
	return result;
}
function bin2String(array) {
	return String.fromCharCode.apply(String, array);
}
function copyToClipboard(value) {
  window.prompt("Copy to clipboard: Ctrl+C", value);
}

function makeID(){
	var count = 64;
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

function msgID(){
	return makeID();
}

function removeAllScreens() {
	if(ScreenGame){
		scrContainer.removeChild(ScreenGame);
		ScreenGame = null;
	}
	if(ScreenSpeedGame){
		scrContainer.removeChild(ScreenSpeedGame);
		ScreenSpeedGame = null;
	}
	if(ScreenMenu){
		scrContainer.removeChild(ScreenMenu);
		ScreenMenu = null;
	}
	if(ScreenTest){
		scrContainer.removeChild(ScreenTest);
		ScreenTest = null;
	}
	if(currentScreen){
		scrContainer.removeChild(currentScreen);
		currentScreen = null;
	}
}

function update() {
	raf(update);
	renderer.render(stage);
	if(options_pause){
		return;
	}
	var diffTime = getTimer() - startTime;
	if(diffTime > 29){
		if (ScreenMenu) {
			ScreenMenu.update(diffTime);
		}
		if (ScreenGame) {
			ScreenGame.update(diffTime);
		}
		if (ScreenSpeedGame) {
			ScreenSpeedGame.update(diffTime);
		}
		if (ScreenTest) {
			ScreenTest.update(diffTime);
		}
		
		if(LoadBack){
			LoadBack.loading.update(diffTime);
		}
		
		for (var i = 0; i < arClips.length; i++) {
			var clip = arClips[i];
			if(clip){
				clip.enter_frame();
			}
		}
		
		startTime = getTimer();
	}
}

function clearClips() {
	for (var i = 0; i < arClips.length; i++) {
		var clip = arClips[i];
		if(clip){
			clip.removed_from_stage();
			clip.die();
		}
	}
	
	arClips = [];
}

function saveData() {
	if(!options_save){
		return false;
	}
	if(isLocalStorageAvailable() && !options_rpc){
		var login_str = JSON.stringify(login_obj);
		localStorage.setItem('daocasino_blackjack', login_str);
		localStorage.setItem('options_music', options_music);
		localStorage.setItem('options_sound', options_sound);
		// console.log("Saving: ok!");
	}
}

function loadData() {
	if(isLocalStorageAvailable()){
		localStorage.removeItem('channel_id');
		localStorage.removeItem('contract_address');
		
		if(options_rpc){
			// openkey = "0xf1f42f995046e67b79dd5ebafd224ce964740da3";
			// privkey = "d3b6b98613ce7bd4636c5c98cc17afb0403d690f9c2b646726e08334583de101";
			openkey = "0x39b3da1a4343d68f7e2b2bf69e2cd2652256b942"; // LW
			privkey = "302a13fad862f88fe13794b1c5e7895f3d00ebd48ff86a975bd3a0193b5ab57e"; // LW
		} else {
			openkey = Casino.Account.get().openkey;
			// privkey = localStorage.getItem('privkey')
			// openkey = localStorage.getItem('openkey')
		}
		mainet = localStorage.getItem('mainnet')
		if(openkey){
			sendingAddr = openkey.substr(2);
		}
		var keystore = Casino.Account.get().keystorage
		// if(keystore){}else{
		// 	alert("This account does not support tokens. Create a new account.");
		// }
		if(keystore && lightwallet){
			ks = lightwallet.keystore.deserialize(keystore);
		}
		if (localStorage.getItem('daocasino_blackjack')){
			var login_str = localStorage.getItem('daocasino_blackjack')
			login_obj = JSON.parse(login_str);
			options_music = localStorage.getItem('options_music')=='true';
			options_sound = localStorage.getItem('options_sound')=='true';
			checkData();
			// console.log("Loading: ok!");
		} else {
			checkData();
			// console.log("Loading: fail!");
		}
	}
}

function checkData() {
	
}

function resetData() {
	login_obj = {};
	saveData();
}

function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
		console.log("localStorage_failed:",e);
        return false;
    }
}

function getArTh(objData, thId) {
    var array = [];
	if(objData.result == undefined){
		return undefined;
	}
    var mainObj = objData.result;
    for (var i = 0; i < objData.result.length; i++){
        var obj = objData.result[i];
        if(thId == obj.transactionHash){
			console.log(i, obj)
            array.push(obj.transactionHash);
        }
    }
    
    return array;
}

function parseData(objData) {
    var arGame = [];
    var thId = ""
	var len = objData.result.length;
	var index = 0;
	if(len > 5){
		index = len-5;
	}
    for (var i = index; i < len; i++){
        var obj = objData.result[i];
        if(thId != obj.transactionHash){
            thId = obj.transactionHash;
            var ar = getArTh(objData, thId);
			if(ar){
				arGame[thId] = ar;
			}
        }
    }
}

function getFnName(fn) {
	var f = typeof fn == 'function';
	var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
	return (!f && 'not a function') || (s && s[1] || 'anonymous');
}

function removeSelf(obj) {
	if (obj) {
		if (obj.parent.contains(obj)) {
			obj.parent.removeChild(obj);
		}
	}
}

function start() {
	if(LoadBack){
		stage.removeChild(LoadBack);
		LoadBack = undefined;
	}
	addScreen("menu");
}

function showMenu() {
	addScreen("menu");
}
function showGame() {
	addScreen("game");
}
function showSpeedGame() {
	addScreen("speedgame");
}
function showLevels() {
	addScreen("levels");
}
function showTest() {
	addScreen("test");
}
function showHome() {
	var url = "/";
	window.open(url, "_self"); // "_blank",  "_self"
}

function addScreen(name) {
	removeAllScreens();
	
	if(name == "game"){
		ScreenGame = new ScrGame();
		scrContainer.addChild(ScreenGame);
		currentScreen = ScreenGame;
	} else if(name == "speedgame"){
		ScreenSpeedGame = new ScrSpeedGame();
		scrContainer.addChild(ScreenSpeedGame);
		currentScreen = ScreenSpeedGame;
	} else if(name == "menu"){
		ScreenMenu = new ScrMenu();
		scrContainer.addChild(ScreenMenu);
		currentScreen = ScreenMenu;
	} else if(name == "test"){
		ScreenTest = new ScrTest();
		scrContainer.addChild(ScreenTest);
		currentScreen = ScreenTest;
	}
	currentScreen.name = name;
}

function addButton(name, _x, _y, _scGr, _scaleX, _scaleY) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	if(_scaleX){}else{_scaleX = 1};
	if(_scaleY){}else{_scaleY = 1};
	var obj = new PIXI.Container();
	
	var objImg = null;
	obj.setImg = function(name){
		objImg = addObj(name);
		obj.addChild(objImg);
		obj.over = addObj(name + "Over");
		if(obj.over){
			obj.over.visible = false;
			obj.addChild(obj.over);
		} else {
			obj.over = null;
		}
		obj.lock = addObj(name + "Lock");
		if(obj.lock){
			obj.lock.visible = false;
			obj.addChild(obj.lock);
		} else {
			obj.lock = null;
		}
		
		obj.sc = _scGr;
		obj.scale.x = _scGr*_scaleX;
		obj.scale.y = _scGr*_scaleY;
		obj.vX = _scaleX;
		obj.vY = _scaleY;
		obj.x = _x;
		obj.y = _y;
		obj.w = objImg.width*_scGr;
		obj.h = objImg.height*_scGr;
		obj.r = obj.w/2;
		obj.rr = obj.r*obj.r;
		obj.name = name;
		obj._selected = false;
		if(obj.w < 50){
			obj.w = 50;
		}
		if(obj.h < 50){
			obj.h = 50;
		}
	}
	
	obj.setImg(name);
	
	return obj;
}

function addButton2(name, _x, _y, _scGr, _scaleX, _scaleY) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	if(_scaleX){}else{_scaleX = 1};
	if(_scaleY){}else{_scaleY = 1};
	var obj = new PIXI.Container();
	
	var data = preloader.resources[name];
	var objImg = null;
	if(data){
		objImg = new PIXI.Sprite(data.texture);
		objImg.anchor.x = 0.5;
		objImg.anchor.y = 0.5;
		obj.addChild(objImg);
	} else {
		return null;
	}
	
	data = preloader.resources[name + "Over"];
	if(data){
		obj.over = new PIXI.Sprite(data.texture);
		obj.over.anchor.x = 0.5;
		obj.over.anchor.y = 0.5;
		obj.over.visible = false;
		obj.addChild(obj.over);
	} else {
		obj.over = null;
	}
	
	data = preloader.resources[name + "Lock"];
	if(data){
		obj.lock = new PIXI.Sprite(data.texture);
		obj.lock.anchor.x = 0.5;
		obj.lock.anchor.y = 0.5;
		obj.lock.visible = false;
		obj.addChild(obj.lock);
	} else {
		obj.lock = null;
	}
	obj.sc = _scGr;
	obj.scale.x = _scGr*_scaleX;
	obj.scale.y = _scGr*_scaleY;
	obj.vX = _scaleX;
	obj.vY = _scaleY;
	obj.x = _x;
	obj.y = _y;
	obj.w = objImg.width*_scGr;
	obj.h = objImg.height*_scGr;
	obj.r = obj.w/2;
	obj.rr = obj.r*obj.r;
	obj.name = name;
	obj._selected = false;
	if(obj.w < 50){
		obj.w = 50;
	}
	if(obj.h < 50){
		obj.h = 50;
	}
	
	return obj;
}

function addObj(name, _x, _y, _scGr, _scaleX, _scaleY, _anchor) {
	if(_x){}else{_x = 0};
	if(_y){}else{_y = 0};
	if(_scGr){}else{_scGr = 1};
	if(_scaleX){}else{_scaleX = 1};
	if(_scaleY){}else{_scaleY = 1};
	if(_anchor){}else{_anchor = 0.5};
	var obj = new PIXI.Container();
	obj.scale.x = _scGr*_scaleX;
	obj.scale.y = _scGr*_scaleY;
	
	var objImg = null;
	if(dataAnima[name]){
		objImg = new PIXI.Sprite(dataAnima[name]);
	} else if(dataMovie[name]){
		objImg = new PIXI.extras.MovieClip(dataMovie[name]);
		objImg.stop();
	}else{
		var data = preloader.resources[name];
		if(data){
			objImg = new PIXI.Sprite(data.texture);
		} else {
			return null;
		}
	}
	obj.sc = _scGr;
	objImg.anchor.x = _anchor;
	objImg.anchor.y = _anchor;
	obj.w = objImg.width*obj.scale.x;
	obj.h = objImg.height*obj.scale.y;
	obj.addChild(objImg);
	obj.x = _x;
	obj.y = _y;
	obj.name = name;
	obj.img = objImg;
	obj.r = obj.w/2;
	obj.rr = obj.r*obj.r;
    //установим точку регистрации в 0 0
    obj.setReg0 = function () {
        objImg.anchor.x = 0;
        objImg.anchor.y = 0;
    }
    obj.setRegX = function (procx) {
        objImg.anchor.x = procx;
    }
    obj.setRegY = function (procy) {
        objImg.anchor.y = procy;
    }
	
	return obj;
}

function addText(text, size, color, glow, _align, width, px, font){
	if(size){}else{size = 24};
	if(color){}else{color = "#FFFFFF"};
	if(glow){}else{glow = undefined};
	if(_align){}else{_align = "center"};
	if(width){}else{width = 600};
	if(px){}else{px = 2};
	if(font){}else{font = fontMain};
	
	var style;
	
	if(glow){
		style = {
			font : size + "px " + font,
			fill : color,
			align : _align,
			stroke : glow,
			strokeThickness : px,
			wordWrap : true,
			wordWrapWidth : width
		};
	} else {
		style = {
			font : size + "px " + font,
			fill : color,
			align : _align,
			wordWrap : true,
			wordWrapWidth : width
		};
	}
	
	var obj = new PIXI.Container();
	
	var tfMain = new PIXI.Text(text, style);
	tfMain.y = 0;
	obj.addChild(tfMain);
	if(_align == "left"){
		tfMain.x = 0;
	} else if(_align == "right"){
		tfMain.x = -tfMain.width;
	} else {
		tfMain.x = - tfMain.width/2;
	}
	
	obj.width = Math.ceil(tfMain.width);
	obj.height = Math.ceil(tfMain.height);
	
	obj.setText = function(value){
		tfMain.text = value;
		if(_align == "left"){
			tfMain.x = 0;
		} else if(_align == "right"){
			tfMain.x = -tfMain.width;
		} else {
			tfMain.x = - tfMain.width/2;
		}
	}
	
	obj.getText = function(){
		return tfMain.text;
	}
	
	return obj;
}

function getText(txt) {
	return language.get_txt(txt);
}

function getXMLDocument(url){  
    var xml;  
    if(window.XMLHttpRequest){   
        xml=new XMLHttpRequest();  
        xml.open("GET", url, false);  
        xml.send(null);  
        return xml.responseXML;  
    } else {
        if(window.ActiveXObject){
            xml=new ActiveXObject("Microsoft.XMLDOM");  
            xml.async=false;  
            xml.load(url);  
            return xml;  
        } else {  
            console.log("Loading XML is not supported by the browser");  
            return null;  
        } 
	}
}

function initjiggle(t, startvalue, finishvalue, div, step){
	if(startvalue){}else{startvalue = 2};
	if(finishvalue){}else{finishvalue = 1};
	if(div){}else{div =  0.7};
	if(step){}else{step =  0.5};
	
	t.scale.x = startvalue
	t.scale.y = t.scale.x
	t.jska = finishvalue
	t.jdx = 0
	t.jdv = div
	t.jdvstep = step
}

function jiggle(t){
	t.jdx = t.jdx * t.jdvstep + (t.jska - t.scale.x) * t.jdv
	t.scale.x = Math.max(0.1, t.scale.x + t.jdx)
	t.scale.y = t.scale.x
}

// remove value from array
function removevalue(value, arr){
	for (var i = 0; i < arr.length; i++){
		arr[i] == value ? (arr = arr.splice(i, 1)) : (undefined);
	}
}

function convertToken(value){
	var val = value/valToken;
	return val;
}
function roundBet(a){
	var b = a % 5;
	b && (a = a - b);
	return (a/100).toFixed(2)
}
function rad(qdeg){
	return qdeg * (Math.PI / 180);
}
function deg(qrad){
	return qrad * (180 / Math.PI);
}
function get_dd(p1, p2) {
	var dx=p2.x-p1.x;
	var dy=p2.y-p1.y;
	return dx*dx+dy*dy;
}
function getDD(x1, y1, x2, y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	return dx*dx+dy*dy;
}
function hit_test(mc,rr,tx,ty) {
	var dx = mc.x - tx;
	var dy = mc.y - ty;
	var dd = dx*dx+dy*dy;
	if(dd<rr){
		return true
	}
	return false
}
function hit_test_rec(mc, w, h, tx, ty) {
	if(tx>mc.x-w/2 && tx<mc.x+w/2){
		if(ty>mc.y-h/2 && ty<mc.y+h/2){
			return true;
		}
	}
	return false;
}
function hitTestObject(mc1, mc2) {
	if (mc1.x < mc2.x + mc2.w &&
	   mc1.x + mc1.w > mc2.x &&
	   mc1.y < mc2.y + mc2.h &&
	   mc1.h + mc1.y > mc2.y) {
		return true;
	}
	return false;
}
function intersects(a, b) {
  return ( a.y1 < b.y2 || a.y2 > b.y1 || a.x2 < b.x1 || a.x1 > b.x2 );
}
function compare(a,b) {
	if (a.val < b.val)
		return -1;
	if (a.val > b.val)
		return 1;
	return 0;
}
function compareInvers(a,b) {
	if (a.val > b.val)
		return -1;
	if (a.val < b.val)
		return 1;
	return 0;
}

function visGame() {
	//play
	options_pause = false;
	refreshTime();
	
	if(currentScreen){
		if(ScreenGame){
			// ScreenGame.resetTimer();
		}
	}
}

function hideGame() {
	//pause
	options_pause = true;
	// music_stop();
	refreshTime();
}

visibly.onVisible(visGame)
visibly.onHidden(hideGame)

function rndSHA3(cardNumber) {
	var hash = ABI.soliditySHA3(['bytes32'],[ cardNumber ]).toString('hex');
	var rand = bigInt(hash,16).divmod(52).remainder.value;
	
	return rand;
}

// window.onbeforeunload = function() {
	// if(!sessionIsOver){
		// if(currentScreen.name == "speedgame"){
			// currentScreen.closeChannel();
			// return "The gaming session is closed";
		// }
		// return "Data may not be saved. Are you sure you want to reload the page?";
	// }
// };
/**
 * Created by Sergey Pomorin on 07.03.2017.
 * v 1.0.3
 */
 
var urlInfura = "https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl";
var gThis;
var repeatRequest = 0;

var C_DEAL = "c959c42b";
var C_HIT = "2ae3594a";
var C_SPLIT = "dbceb005";
var C_STAND = "c2897b10";
var C_INSURANCE = "262b497d";
var C_DOUBLE = "eee97206";

var C_GET_BET = "f8aec9f5";
var C_HOUSE_CARD = "792cc6be";
var C_HOUSE_CARDS = "2594df3f";
var C_HOUSE_SCORE = "ab44355d";
var C_GAME_ID = "b2446968";
var C_GET_INSURANCE = "dc3af6bc";
var C_PLAYER_CARD = "0a113e84";
var C_PLAYER_CARDS = "f3f4294b";
var C_PLAYER_SCORE = "f3e1363e";
var C_SPLIT_CARD = "58927d1b";
var C_SPLIT_CARDS = "f61849d8";
var C_GAME_STATE = "fcc19d69";
var C_DOUBLE_AVAILABLE = "9b2f2e86";
var C_INSURANCE_AVAILABLE = "715c07b6";
var C_ALLOWANCE = "dd62ed3e";

var Infura = function() {
	gThis = this;
	if(options_rpc){
		urlInfura = "http://46.101.244.101:8545";
    } else if(options_ropsten){
		urlInfura = "https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl";
    } else if(options_rinkeby){
		urlInfura = "https://rinkeby.infura.io/JCnK5ifEPH9qcQkX0Ahl";
	}
};

Infura.prototype.sendRequest = function(name, params, callback){
	if(options_ethereum && openkey){
		var method = name;
		var arParams = [params, "latest"]; // latest, pending
		
		switch(name){
			case "deal":
			case "hit":
			case "stand":
			case "split":
			case "requestInsurance":
			case "double":
				method = "eth_getTransactionCount";
				break;
			case "gameTxHash":
			case "sendRaw":
				method = "eth_sendRawTransaction";
				arParams = [params];
				break;
			case "getBalance":
			case "getBalanceBank":
				method = "eth_getBalance";
				break;
			case "getBlockNumber":
				method = "eth_blockNumber";
				arParams = [];
				break;
			case "getLogs":
				method = "eth_getLogs";
				arParams = [params];
				break;
			default:
				method = "eth_call";
				break;
		}
		
		$.ajax({
			url: urlInfura,
			type: "POST",
			async: false,
			dataType: 'json',
			data: JSON.stringify({"jsonrpc":'2.0',
									"method":method,
									"params":arParams,
									"id":1}),
			success: function (d) {
				if(method == "eth_sendRawTransaction"){
					gThis.sendRequestServer("responseServer", d.result, callback);
				}
				callback(name, d.result);
			},
			error: function(jQXHR, textStatus, errorThrown)
			{
				alert("An error occurred whilst trying to contact the server: " + 
						jQXHR.status + " " + textStatus + " " + errorThrown);
			}
		})
	}
};

Infura.prototype.ethCall = function(name, callback, type, val){
	if(type){} else {type = "latest"};
	
	if(openkey == undefined){
		return false;
	}
	
	if(openkey){
		var method = "eth_call";
		var data = "";
		
		switch (name) {
			case "getPlayerBet":
			case "getSplitBet":
				data = C_GET_BET
				break;
			case "getHouseCard":
				data = C_HOUSE_CARD;
				break;
			case "getHouseCardsNumber":
				data = C_HOUSE_CARDS;
				break;
			case "getHouseScore":
				data = C_HOUSE_SCORE;
				break;
			case "getGameId":
				data = C_GAME_ID;
				break;
			case "getInsurance":
				data = C_GET_INSURANCE;
				break;
			case "getPlayerCard":
				data = C_PLAYER_CARD;
				break;
			case "getPlayerCardsNumber":
				data = C_PLAYER_CARDS;
				break;
			case "getPlayerScore":
			case "getPlayerSplitScore":
				data = C_PLAYER_SCORE;
				break;
			case "getSplitCard":
				data = C_SPLIT_CARD;
				break;
			case "getSplitCardsNumber":
				data = C_SPLIT_CARDS;
				break;
			case "getGameState":
			case "getSplitState":
				data = C_GAME_STATE;
				break;
			case "isInsuranceAvailable":
				data = C_INSURANCE_AVAILABLE;
				break;
			case "getAllowance":
				data = C_ALLOWANCE;
				break;
		}
		
		var key = openkey.substr(2);
		if(val != undefined){
			data = "0x" + data + pad(numToHex(val), 64) + pad(key, 64);
		} else {
			data = "0x" + data + pad(key, 64);
		}
		
		var params = {"from":openkey,
				"to":addressStorage,
				"data":data};
		var arParams = [params, type]; // latest, pending
		
		$.ajax({
			url: urlInfura,
			type: "POST",
			async: false,
			dataType: 'json',
			data: JSON.stringify({"jsonrpc":'2.0',
									"method":method,
									"params":arParams,
									"id":1}),
			success: function (d) {
				callback(name, d.result);
			},
			error: function(jQXHR, textStatus, errorThrown)
			{
				alert("An error occurred whilst trying to contact the server: " + 
						jQXHR.status + " " + textStatus + " " + errorThrown);
			}
		})
	}
}

Infura.prototype.sendRequestServer = function(name, txid, callback){
	// console.log("success gameTxHash:", txid);
	/*repeatRequest = 0;
	var seed = this.makeID();
	var url = "https://platform.dao.casino/api/proxy.php?a=roll&";
	$.get(url+"txid="+txid+"&vconcat="+seed, 
		function(d){
			gThis.checkJson(name, seed, callback);
		}
	);*/
}

Infura.prototype.checkJson = function(name, seed, callback){
	$.ajax({
		url: "https://platform.dao.casino/api/proxy.php?a=get&vconcat="+seed,
		type: "POST",
		async: false,
		dataType: 'json',
		success: function (obj) {
			if(obj){
				if(obj.arMyCards){
					repeatRequest = 0;
					// console.log("checkJson:", seed);
					// callback(name, obj);
				} else {
					setTimeout(function () {
						if(repeatRequest < 20){
							repeatRequest++;
							gThis.checkJson(name, seed);
						}
					}, 1000);
				}
			} else {
				setTimeout(function () {
					if(repeatRequest < 20){
						repeatRequest++;
						gThis.checkJson(name, seed);
					}
				}, 1000);
			}
		}
	})
}
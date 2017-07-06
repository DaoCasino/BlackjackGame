/**
 * Created by Sergey Pomorin on 07.03.2017.
 * v 1.0.3
 */
 
var urlInfura = "https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl";
var gThis;
var repeatRequest = 0;
var INSURANCE = -1;
var CONFIRM = 5;

var nameCall = {getPlayerBet:"f8aec9f5",
				getSplitBet:"f8aec9f5",
				getHouseCard:"792cc6be",
				getHouseCardsNumber:"2594df3f",
				getHouseScore:"ab44355d",
				getGameId:"b2446968",
				getInsurance:"dc3af6bc",
				getPlayerCard:"0a113e84",
				getPlayerCardsNumber:"f3f4294b",
				getPlayerScore:"f3e1363e",
				getPlayerSplitScore:"f3e1363e",
				getSplitCard:"58927d1b",
				getSplitCardsNumber:"f61849d8",
				getGameState:"fcc19d69",
				getSplitState:"fcc19d69",
				isInsuranceAvailable:"715c07b6",
				getAllowance:"dd62ed3e"}

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

Infura.prototype.sendRequest = function(name, params, callback, seed, currentMethod){
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
			case "confirm":
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
				if(method == "eth_sendRawTransaction" && d.result && 
				currentMethod != INSURANCE && currentMethod != CONFIRM){
					gThis.sendRequestServer("responseServer", d.result, callback, seed);
				}
				callback(name, d.result, d.error);
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
		var data = nameCall[name];
		
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

Infura.prototype.sendRequestServer = function(name, txid, callback, seed){
	if(txid == undefined || !options_speedgame){
		return false;
	}
	repeatRequest = 0;
	if(options_rpc){
		console.log(name, seed);
		callback(name, seed);
	} else {
		var url = "https://platform.dao.casino/api/proxy.php?a=roll&";
		$.get(url+"txid="+txid+"&vconcat="+seed+"&address="+addressContract, 
			function(d){
				gThis.speedGame(name, seed, callback);
			}
		);
	}
}

Infura.prototype.speedGame = function(name, seed, callback){
	$.ajax({
		url: "https://platform.dao.casino/api/proxy.php?a=get&vconcat="+seed+"&address="+addressContract,
		type: "POST",
		async: false,
		//dataType: 'json',
		success: function (obj) {
			if(obj && (''+obj).substr(0,2)=='0x'){
				repeatRequest = 0;
				callback(name, obj);
			} else {
				setTimeout(function () {
					if(repeatRequest < 20){
						repeatRequest++;
						gThis.speedGame(name, seed, callback);
					}
				}, 1000);
			}
		}
	})
}
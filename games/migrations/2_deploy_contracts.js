var BlackJack = artifacts.require("BlackJack.sol");
var BlackJackStorage = artifacts.require("BlackJackStorage.sol");
var BlackJackSeed = artifacts.require("BlackJackSeed.sol");
var Deck = artifacts.require("Deck.sol");
var ERC20 = artifacts.require("ERC20.sol");

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}
function numToHex(num) {
	return num.toString(16);
}

module.exports = function(deployer, network) {
    if (network == "development") {
        var owner = "0xaec3ae5d2be00bfc91597d7a1b2c43818d84396a";
        var player = "0xf1f42f995046e67b79dd5ebafd224ce964740da3";
        var playerLW = "0x39b3da1a4343d68f7e2b2bf69e2cd2652256b942"; // lightwalet
        var bankroller = "0x661b656e16e5b9b641d5899cf0fd79bf2fdd5c1c";
        var tokenContract;
		deployer.deploy(ERC20, owner).then(function() { // deploy token contract
            return deployer.deploy(Deck, owner); // deploy deck
        }).then(function() {
			return deployer.deploy(BlackJackSeed, Deck.address);  // deploy seed BJ contract
        }).then(function() {
			return deployer.deploy(BlackJackStorage, Deck.address);  // deploy main BJ contract
		}).then(function() {
			// deploy storage contract
			return deployer.deploy(BlackJack, 
									Deck.address, 
									BlackJackStorage.address, 
									BlackJackSeed.address, 
									ERC20.address);
		}).then(function() {
            return ERC20.deployed(); // get deplyed instance of the token contract
        }).then(function(instance) {
			 // issue 1000 tokens to the player
            tokenContract = instance;
            console.log(" - Send 1000 tokens to the player");
			return tokenContract.issueTokens(playerLW, 1000, { from: owner });
        }).then(function(instance) {
			 // issue 1000 tokens to the player
            console.log(" - Send 1000 tokens to the bankroller");
			return tokenContract.issueTokens(bankroller, 1000, { from: owner });
		}).then(function(tx) {
			// issue 1000 tokens to the BJ contract
            console.log(" - Send 1000 tokens to the BJ contract");
            return tokenContract.issueTokens(BlackJack.address, 1000, { from: owner }); 
        }).then(function(tx) {
            return tokenContract.balanceOf.call(BlackJack.address, { from: owner });
        }).then(function(balance) {
            return tokenContract.balanceOf.call(BlackJack.address, { from: owner });
        }).then(function(balance) {
            console.log(" - BlackJack contract has " + (balance.toNumber() / 100000000) + " tokens");
            return tokenContract.balanceOf.call(playerLW, { from: owner });
        }).then(function(balance) {
            console.log(" - Player has " + (balance.toNumber() / 100000000) + " tokens");
        }).then(function() {
            web3.eth.sendTransaction({
                from: player,
                to: playerLW,
                value: web3.toWei(2, "ether"),
                gas: 400000,
            });
			console.log(" - Player has 2 eth");
        }).then(function() {
            web3.eth.sendTransaction({
                from: player,
                to: bankroller,
                value: web3.toWei(2, "ether"),
                gas: 400000,
            });
			console.log(" - Bankroller has 2 eth");
        });
    } else if (network == "testnet") {
		var owner = "0x7e1952131872feee40061360d7ccaf0a72964f9c";
		var erc20 = "0x95a48dca999c89e4e284930d9b9af973a7481287";
        var tokenContract = ERC20.at(erc20);
		deployer.deploy(Deck, owner).then(function() { // deploy deck
			return deployer.deploy(BlackJackSeed, Deck.address);  // deploy seed BJ contract
		}).then(function() {
			return deployer.deploy(BlackJackStorage, Deck.address);  // deploy storage BJ contract
		}).then(function() {
			// deploy main contract
			return deployer.deploy(BlackJack, Deck.address, BlackJackStorage.address, BlackJackSeed.address, erc20);
		}).then(function(tx) {
            console.log(" - Send 15 tokens to the BJ contract");
			return tokenContract.transfer(BlackJack.address, 2500000000, { from: owner });
        });
        
    }
};

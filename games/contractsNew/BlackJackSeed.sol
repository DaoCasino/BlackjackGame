pragma solidity ^0.4.2;
import "./Types.sol";
import "./Deck.sol";

contract BlackJackSeed {
    using Types for *;

    /*
        CONTRACTS
    */

    Deck deck;

    /*
        CONSTANTS
    */

    uint8 BLACKJACK = 21;

    /*
        STORAGE
    */
	
	mapping (bytes32 => Types.Seed) public listGames;

    /*
        CONSTRUCTOR
    */
	
    function BlackJackSeed(address deckAddress) {
        deck = Deck(deckAddress);
    }

    /*
        PUBLIC FUNCTIONS
    */
	
    function createNewSeed(address _player, bytes32 seed, bool isMain, Types.SeedMethod method)
        external
    {
        listGames[seed] = Types.Seed({
            player: _player,
            id: seed,
            confirmed: false,
            isMain: isMain,
            method: method
        });
    }
	
	function updateSeedConfimed(bytes32 seed, bool value)
        external
    {
        listGames[seed].confirmed = value;
    }
	
    /*
        PUBLIC GETTERS
    */
	
	function getConfirmed(bytes32 id)
        public
        constant
        returns (bool)
    {
        return listGames[id].confirmed;
    }
	
	function getSeedIsMain(bytes32 id)
        public
        constant
        returns (bool)
    {
        return listGames[id].isMain;
    }
	
	function getSeedPlayer(bytes32 id)
        public
        constant
        returns (address)
    {
        return listGames[id].player;
    }
	
	function getMethod(bytes32 id)
        public
        constant
        returns (Types.SeedMethod)
    {
        return listGames[id].method;
    }
}

pragma solidity ^0.4.2;
import "./Deck.sol";
import "./BlackJackStorage.sol";
import "./BlackJackSeed.sol";
import "./ERC20.sol";
import "./Types.sol";
import "./owned.sol";

contract BlackJack is owned {
    using Types for *;

    /*
        Contracts
    */

    // Stores tokens
    ERC20 token;

    Deck deck;

    // Stores all data
    BlackJackStorage storageContract;
    BlackJackSeed seedContract;

    /*
        CONSTANTS
    */
	
    uint public minBet = 5000000;
    uint public maxBet = 500000000;

    uint32 lastGameId;

    uint8 BLACKJACK = 21;
	
	mapping(bytes32 => bool) public usedRandom;

    /*
        EVENTS
    */

    event Deal(
        uint8 _type, // 0 - player, 1 - house, 2 - split player
        uint8 _card
    );

    /*
        MODIFIERS
    */

    modifier gameFinished() {
        if (storageContract.isMainGameInProgress(msg.sender) || storageContract.isSplitGameInProgress(msg.sender)) {
            throw;
        }
        _;
    }

    modifier gameIsGoingOn() {
        if (!storageContract.isMainGameInProgress(msg.sender) && !storageContract.isSplitGameInProgress(msg.sender)) {
            throw;
        }
        _;
    }
	
	modifier betIsSuitable(uint value) {
        if (value < minBet || value > maxBet) {
            throw; // incorrect bet
        }
        if (value * 5 > getBank() * 2) {
            // Not enough money on the contract to pay the player.
            throw;
        }
        _;
    }

    modifier insuranceAvailable() {
        if (!storageContract.isInsuranceAvailable(msg.sender)) {
            throw;
        }
        _;
    }

    modifier doubleAvailable() {
        if (!storageContract.isDoubleAvailable(msg.sender)) {
            throw;
        }
        _;
    }

    modifier splitAvailable() {
        if (!storageContract.isSplitAvailable(msg.sender)) {
            throw;
        }
        _;
    }

    modifier betIsDoubled(uint value) {
        if (storageContract.getBet(true, msg.sender) != value) {
            throw;
        }
        _;
    }
	
    modifier betIsInsurance(uint value) {
        if (storageContract.getBet(true, msg.sender) != value*2) {
            throw;
        }
        _;
    }

    modifier standIfNecessary(bool finishGame, bytes32 idSeed) {
        if (!finishGame) {
            stand(idSeed);
        } else {
            _;
        }
    }

    modifier payInsuranceIfNecessary(bool isMain) {
        if (storageContract.isInsurancePaymentRequired(isMain, msg.sender)) {
            // if (!msg.sender.send(storageContract.getInsurance(isMain, msg.sender) * 2)) throw; // send insurance to the player
           token.transfer(msg.sender, storageContract.getInsurance(isMain, msg.sender) * 2);  // send insurance to the player
        }
        _;
    }

	modifier usedSeed(bytes32 seed) {
        if (usedRandom[seed]) {
            throw;
        }
        _;
    }

    /*
        CONSTRUCTOR
    */

    function BlackJack(address deckAddress, address storageAddress, address seedAddress, address tokenAddress) {
        deck = Deck(deckAddress);
        storageContract = BlackJackStorage(storageAddress);
        seedContract = BlackJackSeed(seedAddress);
        token = ERC20(tokenAddress);
    }

    function () payable {

    }
	
    /*
        MAIN FUNCTIONS
    */

    function deal(uint value, bytes32 seed)
        public
        gameFinished
        betIsSuitable(value)
        usedSeed(seed)
    {
		if (!token.transferFrom(msg.sender, this, value)) {
            throw;
        }
		
        lastGameId = lastGameId + 1;
        storageContract.createNewGame(lastGameId, msg.sender, value);
        storageContract.deleteSplitGame(msg.sender);
        seedContract.createNewSeed(msg.sender, seed, true, Types.SeedMethod.Deal);
		
        // deal the cards
		// bytes32 seed1 = substring(seed, 1, 20);
		// bytes32 seed2 = substring(seed, 21, 40);
		// bytes32 seed3 = substring(seed, 41, 60);
        /*dealCard(true, true, seed1);
        dealCard(false, true, seed2);
        dealCard(true, true, seed3);

        if (deck.isAce(storageContract.getHouseCard(0, msg.sender))) {
            storageContract.setInsuranceAvailable(true, true, msg.sender);
        }

        checkGameResult(true, false);*/
    }
	
    function hit(bytes32 seed)
        public
        gameIsGoingOn
        usedSeed(seed)
    {
		bool isMain = storageContract.isMainGameInProgress(msg.sender);
        seedContract.createNewSeed(msg.sender, seed, isMain, Types.SeedMethod.Hit);
        /*
        dealCard(true, isMain, seed);
        storageContract.setInsuranceAvailable(false, isMain, msg.sender);

        checkGameResult(isMain, false);*/
    }
	
    function requestInsurance(uint value)
        public
        betIsInsurance(value)
        insuranceAvailable
    {
		if (!token.transferFrom(msg.sender, this, value)) {
            throw;
        }
		
        bool isMain = storageContract.isMainGameInProgress(msg.sender);
        storageContract.updateInsurance(value, isMain, msg.sender);
        storageContract.setInsuranceAvailable(false, isMain, msg.sender);
    }
	
    function stand(bytes32 seed)
        public
        gameIsGoingOn
		usedSeed(seed)
    {
        bool isMain = storageContract.isMainGameInProgress(msg.sender);
        seedContract.createNewSeed(msg.sender, seed, isMain, Types.SeedMethod.Stand);
		
        /*if (!isMain) {
            //switch focus to the main game
            storageContract.updateState(Types.GameState.InProgress, true, msg.sender);
            storageContract.updateState(Types.GameState.InProgressSplit, false, msg.sender);
            checkGameResult(true, false);
            return;
        }
		
		if(storageContract.getPlayerScore(true, msg.sender) >= BLACKJACK &&
		storageContract.getSplitCardsNumber(msg.sender) == 0){
			dealCard(false, true, seed);
		} else {
			while (storageContract.getHouseScore(msg.sender) < 17) {
				dealCard(false, true, seed);
			}
		}

        checkGameResult(true, true); // finish the main game
		
        if (storageContract.getState(false, msg.sender) == Types.GameState.InProgressSplit) { // split game exists
            storageContract.syncSplitDealerCards(msg.sender);
            checkGameResult(false, true); // finish the split game
        }*/
    }

    function split(uint value, bytes32 seed)
        public
        betIsDoubled(value)
        splitAvailable
		usedSeed(seed)
    {
		if (!token.transferFrom(msg.sender, this, value)) {
            throw;
        }
        storageContract.updateState(Types.GameState.InProgressSplit, true, msg.sender); // switch to the split game
        storageContract.createNewSplitGame(msg.sender, value);
		seedContract.createNewSeed(msg.sender, seed, true, Types.SeedMethod.Split);

        /*// Deal extra cards in each game.
        dealCard(true, true, seed);
        dealCard(true, false, seed);

        checkGameResult(false, false);

        if (deck.isAce(storageContract.getHouseCard(0, msg.sender))) {
            storageContract.setInsuranceAvailable(true, false, msg.sender);
        }*/
    }

    function double(uint value, bytes32 seed)
        public
        betIsDoubled(value)
        doubleAvailable
		usedSeed(seed)
    {
		if (!token.transferFrom(msg.sender, this, value)) {
            throw;
        }
        bool isMain = storageContract.isMainGameInProgress(msg.sender);

        storageContract.doubleBet(isMain, msg.sender);
		seedContract.createNewSeed(msg.sender, seed, isMain, Types.SeedMethod.Double);
        /*dealCard(true, isMain, seed);
        
        if (storageContract.getState(isMain, msg.sender) == Types.GameState.InProgress) {
            stand();
        }*/
    }
	
	function confirm(bytes32 idSeed, uint8 _v, bytes32 _r, bytes32 _s) 
		public
    {
		if (seedContract.getConfirmed(idSeed) == true) {
			throw;
		}
        
        if (ecrecover(idSeed, _v, _r, _s) != owner) {// owner
			usedRandom[idSeed] = true;
			address player = seedContract.getSeedPlayer(idSeed);
			bool isMain = seedContract.getSeedIsMain(idSeed);
			seedContract.updateSeedConfimed(idSeed, true);
			if (seedContract.getMethod(idSeed) == Types.SeedMethod.Deal) {
				// deal the cards
				dealCard(true, true, substring(_s, 1, 20));
				dealCard(false, true, substring(_s, 21, 40));
				dealCard(true, true, substring(_s, 41, 60));

				if (deck.isAce(storageContract.getHouseCard(0, player))) {
					storageContract.setInsuranceAvailable(true, true, player);
				}

				checkGameResult(true, false, idSeed);
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Hit) {
				dealCard(true, isMain, _s);
				storageContract.setInsuranceAvailable(false, isMain, player);

				checkGameResult(isMain, false, idSeed);
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Stand) {
				if (!isMain) {
					//switch focus to the main game
					storageContract.updateState(Types.GameState.InProgress, true, player);
					storageContract.updateState(Types.GameState.InProgressSplit, false, player);
					checkGameResult(true, false, idSeed);
					return;
				}
				
				if(storageContract.getPlayerScore(true, player) >= BLACKJACK &&
				storageContract.getSplitCardsNumber(player) == 0){
					dealCard(false, true, _s);
				} else {
					uint8 val = 1;
					while (storageContract.getHouseScore(player) < 17) {
						dealCard(false, true, substring(_s, val, val+4));
						val += 5;
					}
				}

				checkGameResult(true, true, idSeed); // finish the main game
				
				if (storageContract.getState(false, player) == Types.GameState.InProgressSplit) { // split game exists
					storageContract.syncSplitDealerCards(player);
					checkGameResult(false, true, idSeed); // finish the split game
				}
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Split) {
				// Deal extra cards in each game.
				dealCard(true, true, substring(_s, 1, 20));
				dealCard(true, false, substring(_s, 21, 40));

				checkGameResult(false, false, idSeed);

				if (deck.isAce(storageContract.getHouseCard(0, player))) {
					storageContract.setInsuranceAvailable(true, false, player);
				}
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Double) {
				dealCard(true, isMain, _s);
				
				if (storageContract.getState(isMain, player) == Types.GameState.InProgress) {
					stand(idSeed);
				}
			}
        }
    }
	
    function getBank() 
		public 
		constant 
		returns(uint) 
	{
        return token.balanceOf(this);
    }
	
    /*
        SUPPORT FUNCTIONS
    */
	
    function dealCard(bool player, bool isMain, bytes32 seed)
        private
    {
        usedRandom[seed] = true;
        uint8 newCard;
        if (isMain && player) {
            newCard = storageContract.dealMainCard(msg.sender, seed);
            Deal(0, newCard);
        }

        if (!isMain && player) {
            newCard = storageContract.dealSplitCard(msg.sender, seed);
            Deal(2, newCard);
        }

        if (!player) {
            newCard = storageContract.dealHouseCard(msg.sender, seed);
            Deal(1, newCard);
        }

        if (player) {
            uint8 playerScore = recalculateScore(newCard, storageContract.getPlayerSmallScore(isMain, msg.sender), false);
            uint8 playerBigScore = recalculateScore(newCard, storageContract.getPlayerBigScore(isMain, msg.sender), true);
            if (isMain) {
                storageContract.updatePlayerScore(playerScore, playerBigScore, msg.sender);
            } else {
                storageContract.updatePlayerSplitScore(playerScore, playerBigScore, msg.sender);
            }
        } else {
            uint8 houseScore = recalculateScore(newCard, storageContract.getHouseSmallScore(msg.sender), false);
            uint8 houseBigScore = recalculateScore(newCard, storageContract.getHouseBigScore(msg.sender), true);
            storageContract.updateHouseScore(houseScore, houseBigScore, msg.sender);
        }
    }

    function recalculateScore(uint8 newCard, uint8 score, bool big)
        private
        constant
        returns (uint8)
    {
        uint8 value = deck.valueOf(newCard, big);
        if (big && deck.isAce(newCard)) {
            if (score + value > BLACKJACK) {
                return score + deck.valueOf(newCard, false);
            }
        }
        return score + value;
    }

    function checkGameResult(bool isMain, bool finishGame, bytes32 idSeed)
        private
    {
		address player = seedContract.getSeedPlayer(idSeed);
		
        if (storageContract.getHouseScore(player) == BLACKJACK && storageContract.getPlayerScore(isMain, player) == BLACKJACK) {
            onTie(isMain, finishGame, idSeed);
            return;
        }

        if (storageContract.getHouseScore(player) == BLACKJACK && storageContract.getPlayerScore(isMain, player) != BLACKJACK) {
            onHouseWon(isMain, finishGame, idSeed);
            return;
        }

        if (storageContract.getPlayerScore(isMain, player) == BLACKJACK) {
            onPlayerWon(isMain, finishGame, idSeed);
            return;
        }

        if (storageContract.getPlayerScore(isMain, player) > BLACKJACK) {
            onHouseWon(isMain, finishGame, idSeed);
            return;
        }

        if (!finishGame) return;

        uint8 playerShortage = BLACKJACK - storageContract.getPlayerScore(isMain, player);
        uint8 houseShortage = BLACKJACK - storageContract.getHouseScore(player);

        if (playerShortage == houseShortage) {
            onTie(isMain, finishGame, idSeed);
            return;
        }

        if (playerShortage > houseShortage) {
            onHouseWon(isMain, finishGame, idSeed);
            return;
        }

        onPlayerWon(isMain, finishGame, idSeed);
    }
	
	function substring(bytes32 str, uint8 val1, uint8 val2)
        private
		constant
		returns (bytes32)
    {
		// bytes32 newstr;
		// bytes memory newstr = new bytes(32);
		// uint8 charCount = 0;
		
		// for (uint8 i = val1; i < val2; i++) {
			// byte char = byte(bytes32(uint(str) * 2 ** (8 * i)));
			// if (char != 0) {
				// newstr[charCount] = char;
				// charCount++;
			// }
		// }
		
		// for (uint8 i = val1; i < val2; i++) {
			// bytes(newstr).push(str[i]);
		// }
		
		// return newstr;
		return str;
	}

    /*
        FUNCTIONS THAT FINISH THE GAME
    */

    function onTie(bool isMain, bool finishGame, bytes32 idSeed)
        private
        standIfNecessary(finishGame, idSeed)
    {
		address player = seedContract.getSeedPlayer(idSeed);
        // return bet to the player
        // if (!msg.sender.send(storageContract.getBet(isMain, msg.sender))) throw;
		token.transfer(player, storageContract.getBet(isMain, player));

        // set final state
        storageContract.updateState(Types.GameState.Tie, isMain, player);
    }

    function onHouseWon(bool isMain, bool finishGame, bytes32 idSeed)
        private
        standIfNecessary(finishGame, idSeed)
        payInsuranceIfNecessary(isMain)
    {
		address player = seedContract.getSeedPlayer(idSeed);
        // set final state
        storageContract.updateState(Types.GameState.HouseWon, isMain, player);
    }

    function onPlayerWon(bool isMain, bool finishGame, bytes32 idSeed)
        private
        standIfNecessary(finishGame, idSeed)
    {
		address player = seedContract.getSeedPlayer(idSeed);
		
        if (storageContract.getPlayerScore(isMain, player) != BLACKJACK) {
            // if (!msg.sender.send(storageContract.getBet(isMain, msg.sender) * 2)) throw;
            token.transfer(player, storageContract.getBet(isMain, player) * 2);
            // set final state
            storageContract.updateState(Types.GameState.PlayerWon, isMain, player);
            return;
        }

        if (storageContract.isNaturalBlackJack(isMain, player)) {
            // if (!msg.sender.send((storageContract.getBet(isMain, msg.sender) * 5) / 2)) throw;
			token.transfer(player, (storageContract.getBet(isMain, player) * 5) / 2);
        } else {
            // if (!msg.sender.send(storageContract.getBet(isMain, msg.sender) * 2)) throw;
			token.transfer(player, (storageContract.getBet(isMain, player) * 2));
        }

        // set final state
        storageContract.updateState(Types.GameState.PlayerBlackJack, isMain, player);
        return;
    }

    /*
        OWNER FUNCTIONS
    */
	
	function setTokenAddress(address tokenAddress) 
		onlyOwner
	{
        token = ERC20(tokenAddress);
    }
	
    function withdraw(uint amountInWei)
        onlyOwner
    {
        // if (!msg.sender.send(amountInWei)) throw;
		token.transfer(msg.sender, amountInWei);
    }

}

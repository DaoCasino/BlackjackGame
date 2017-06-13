pragma solidity ^0.4.2;
import "./Deck.sol";
import "./BlackJackStorage.sol";
import "./BlackJackSeed.sol";
import "./ERC20.sol";
import "./Types.sol";
import "./owned.sol";

contract BlackJack is owned {
	uint   public meta_version = 1;
    string public meta_code    = 'blackjack_v1';
    string public meta_name    = 'BlackjackGame';
    string public meta_link    = 'https://github.com/DaoCasino/BlackjackGame';
	
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
	
	bytes32 private s;

    uint8 BLACKJACK = 21;
	
	mapping(bytes32 => bool) public usedRandom;

    /*
        EVENTS
    */

    // event Deal(
        // uint8 _type, // 0 - player, 1 - house, 2 - split player
        // uint8 _card
    // );
	event logId(bytes32 Id);

    /*
        MODIFIERS
    */

    modifier gameFinished() {
        if (storageContract.isMainGameInProgress(msg.sender) || storageContract.isSplitGameInProgress(msg.sender)) {
            throw;
        }
        _;
    }

    modifier gameIsGoingOn(address player) {
        if (!storageContract.isMainGameInProgress(player) && !storageContract.isSplitGameInProgress(player)) {
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

    modifier standIfNecessary(bool isMain, bool finishGame, bytes32 idSeed) {
        if (!finishGame) {
			address player = seedContract.getSeedPlayer(idSeed);
            autoStand(isMain, idSeed, player);
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
		logId(seed);
    }
	
    function hit(bytes32 seed)
        public
        gameIsGoingOn(msg.sender)
        usedSeed(seed)
    {
		bool isMain = storageContract.isMainGameInProgress(msg.sender);
        seedContract.createNewSeed(msg.sender, seed, isMain, Types.SeedMethod.Hit);
		logId(seed);
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
        gameIsGoingOn(msg.sender)
		usedSeed(seed)
    {
        bool isMain = storageContract.isMainGameInProgress(msg.sender);
        seedContract.createNewSeed(msg.sender, seed, isMain, Types.SeedMethod.Stand);
		logId(seed);
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
		// switch to the split game
        storageContract.updateState(Types.GameState.InProgressSplit, true, msg.sender);
        storageContract.createNewSplitGame(msg.sender, value);
		seedContract.createNewSeed(msg.sender, seed, true, Types.SeedMethod.Split);
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
		logId(seed);
    }
	
    function autoStand(bool isMain, bytes32 idSeed, address player)
        public
        gameIsGoingOn(player)
    {
        if (!isMain) {
			//switch focus to the main game
			storageContract.updateState(Types.GameState.InProgress, true, player);
			storageContract.updateState(Types.GameState.InProgressSplit, false, player);
			checkGameResult(true, false, idSeed);
			return;
		}
		
		if(storageContract.getPlayerScore(true, player) > BLACKJACK &&
		(storageContract.getSplitCardsNumber(player) == 0 ||
		storageContract.getPlayerScore(false, player) > BLACKJACK)){
			dealCard(false, true, s[1], idSeed);
		} else {
			uint8 val = 1;
			while (storageContract.getHouseScore(player) < 17) {
				dealCard(false, true, s[val], idSeed);
				val += 1;
			}
		}

		checkGameResult(true, true, idSeed); // finish the main game
		
		// split game exists
		if (storageContract.getState(false, player) == Types.GameState.InProgressSplit) {
			storageContract.syncSplitDealerCards(player);
			checkGameResult(false, true, idSeed); // finish the split game
		}
    }
	
	function confirm(bytes32 idSeed, uint8 _v, bytes32 _r, bytes32 _s) 
		public
		// onlyOwner
    {
		if (seedContract.getConfirmed(idSeed) == true) {
			throw;
		}
		
        if (ecrecover(idSeed, _v, _r, _s) != owner) {// ==owner
			s = _s;
			usedRandom[idSeed] = true;
			address player = seedContract.getSeedPlayer(idSeed);
			bool isMain = seedContract.getSeedIsMain(idSeed);
			seedContract.updateSeedConfimed(idSeed, true);
			if (seedContract.getMethod(idSeed) == Types.SeedMethod.Deal) {
				// deal the cards
				dealCard(true, true, _s[1], idSeed);
				dealCard(false, true, _s[2], idSeed);
				dealCard(true, true, _s[3], idSeed);

				if (deck.isAce(storageContract.getHouseCard(0, player))) {
					storageContract.setInsuranceAvailable(true, true, player);
				}

				checkGameResult(true, false, idSeed);
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Hit) {
				dealCard(true, isMain, _s, idSeed);
				storageContract.setInsuranceAvailable(false, isMain, player);
				checkGameResult(isMain, false, idSeed);
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Stand) {
				autoStand(isMain, idSeed, player);
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Split) {
				// Deal extra cards in each game.
				dealCard(true, true, _s[1], idSeed);
				dealCard(true, false, _s[2], idSeed);

				checkGameResult(false, false, idSeed);

				if (deck.isAce(storageContract.getHouseCard(0, player))) {
					storageContract.setInsuranceAvailable(true, false, player);
				}
			} else if (seedContract.getMethod(idSeed) == Types.SeedMethod.Double) {
				dealCard(true, isMain, _s, idSeed);
				
				if (storageContract.getState(isMain, player) == Types.GameState.InProgress) {
					autoStand(isMain, idSeed, player);
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
	
    function dealCard(bool bPlayer, bool isMain, bytes32 seed, bytes32 idSeed)
        private
    {
        usedRandom[seed] = true;
        uint8 newCard;
		address player = seedContract.getSeedPlayer(idSeed);
        if (isMain && bPlayer) {
            newCard = storageContract.dealMainCard(player, seed);
            // Deal(0, newCard);
        }

        if (!isMain && bPlayer) {
            newCard = storageContract.dealSplitCard(player, seed);
            // Deal(2, newCard);
        }

        if (!bPlayer) {
            newCard = storageContract.dealHouseCard(player, seed);
            // Deal(1, newCard);
        }

        if (bPlayer) {
            uint8 playerScore = recalculateScore(newCard, storageContract.getPlayerSmallScore(isMain, player), false);
            uint8 playerBigScore = recalculateScore(newCard, storageContract.getPlayerBigScore(isMain, player), true);
            if (isMain) {
                storageContract.updatePlayerScore(playerScore, playerBigScore, player);
            } else {
                storageContract.updatePlayerSplitScore(playerScore, playerBigScore, player);
            }
        } else {
            uint8 houseScore = recalculateScore(newCard, storageContract.getHouseSmallScore(player), false);
            uint8 houseBigScore = recalculateScore(newCard, storageContract.getHouseBigScore(player), true);
            storageContract.updateHouseScore(houseScore, houseBigScore, player);
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

    /*
        FUNCTIONS THAT FINISH THE GAME
    */

    function onTie(bool isMain, bool finishGame, bytes32 idSeed)
        private
        standIfNecessary(isMain, finishGame, idSeed)
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
        standIfNecessary(isMain, finishGame, idSeed)
        payInsuranceIfNecessary(isMain)
    {
		address player = seedContract.getSeedPlayer(idSeed);
        // set final state
        storageContract.updateState(Types.GameState.HouseWon, isMain, player);
    }

    function onPlayerWon(bool isMain, bool finishGame, bytes32 idSeed)
        private
        standIfNecessary(isMain, finishGame, idSeed)
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

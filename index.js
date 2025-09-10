let playerHasBlackJack = false;
let playerIsAlive = false;
let dealerHasBlackJack = false;
let dealerIsAlive = false;
let gameOver = false;
let push = false;
let double = false;
let message = "";
let messageEl = document.getElementById("message-el");
let playerSumEl = document.getElementById("player-sum-el");
let dealerSumEl = document.getElementById("dealer-sum-el");
let startBtnEl = document.getElementById("start-btn");

//Betting states
let balance = 100;
let balanceEl = document.getElementById("balance-el");
let playerWon = false;
let bettingAmount = 0;

let dealerHand = [];
let dealerSum = 0;
let playerHand = [];
let playerSum = 0;

const ranks = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];
const suits = ["spades", "hearts", "clubs", "diamonds"];

const betInput = document.getElementById("bet-input");
betInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    startGame();
  }
});

function createDeck() {
  return suits.flatMap((suit) =>
    ranks.map((rank) => {
      let value;
      if (rank === "ace") {
        value = 11;
      } else if (["jack", "queen", "king"].includes(rank)) {
        value = 10;
      } else {
        value = Number(rank);
      }
      return { rank, suit, value };
    })
  );
}

function drawCard(deck) {
  let randomIndex = Math.floor(Math.random() * deck.length);
  let card = deck[randomIndex];
  let remainingDeck = deck.filter((_, i) => i !== randomIndex);
  return { card, remainingDeck };
}

let deck = [];

//Genererer et tilfeldig kort
function getRandomCard() {
  let rankIndex = Math.floor(Math.random() * ranks.length);
  let suitIndex = Math.floor(Math.random() * suits.length);

  let rank = ranks[rankIndex];
  let suit = suits[suitIndex];

  let value;
  if (rank == "ace") {
    value = 11;
  } else if (["jack", "queen", "king"].includes(rank)) {
    value = 10;
  } else {
    value = Number(rank);
  }

  return { rank, suit, value };
}

function adjustAceValue(hand, sum) {
  for (let card of hand) {
    if (card.rank === "ace" && sum > 21 && card.value === 11) {
      card.value = 1;
      sum -= 10;
    }
  }
  return sum;
}

function startGame() {
  bettingAmount = Number(betInput.value);
  console.log(bettingAmount);

  if (bettingAmount <= 0 || bettingAmount > balance) {
    alert("Invalid bet amount!");
    return;
  }

  console.log("Removing blink class");
  startBtnEl.classList.remove("blink-won");
  startBtnEl.classList.remove("blink-loss");
  startBtnEl.classList.remove("blink-loss");

  balance -= bettingAmount;
  updateBalance();
  gameOver = false;
  playerIsAlive = true;
  playerHasBlackJack = false;
  playerHand = [];
  playerSum = 0;
  double = false;

  dealerIsAlive = true;
  dealerHasBlackJack = false;
  dealerHand = [];
  dealerSum = 0;

  // nullstill kort container
  const playerCardsContainer = document.getElementById("player-cards");
  playerCardsContainer.innerHTML = "";

  startBtnEl.textContent = "NEW GAME";

  deck = createDeck();

  //trekk to kort
  let { card: playerFirstCard, remainingDeck: deckAfterFirst } = drawCard(deck);
  deck = deckAfterFirst;
  let { card: playerSecondCard, remainingDeck: deckAfterSecond } =
    drawCard(deck);
  deck = deckAfterSecond;

  playerHand.push(playerFirstCard, playerSecondCard);
  playerSum = playerFirstCard.value + playerSecondCard.value;

  //
  addCardToPlayer(playerFirstCard);
  addCardToPlayer(playerSecondCard);

  //dealer funskjonalitet
  const dealerCardsContainer = document.getElementById("dealer-cards");
  dealerCardsContainer.innerHTML = "";

  let { card: dealerFirstCard, remainingDeck: deckAfterDealer } =
    drawCard(deck);
  deck = deckAfterDealer;
  dealerHand.push(dealerFirstCard);
  dealerSum = dealerFirstCard.value;

  addCardToDealer(dealerFirstCard);

  let dealerSecondCard = document.createElement("img");
  dealerSecondCard.src = `./cards/card-back.png`;
  dealerCardsContainer.appendChild(dealerSecondCard);

  dealerSecondCard.classList.add("card");
  if (playerSum == 21) {
    balance += bettingAmount * 2.5;
    updateBalance();
    gameOver = true;
    playerWon = true;
  }

  renderGame();

  return;
}

function hit() {
  if (!gameOver && !double) {
    let { card: newCard, remainingDeck } = drawCard(deck);

    deck = remainingDeck;
    playerHand.push(newCard);
    playerSum += newCard.value;

    //legg til i dom
    addCardToPlayer(newCard);

    renderGame();
    return;
  }
}

function doubleDown() {
  if (!gameOver && !double) {
    if (balance < bettingAmount) {
      alert("Not enought money to double down");
      return;
    }

    balance -= bettingAmount;
    bettingAmount *= 2;
    updateBalance();

    let { card: newCard, remainingDeck } = drawCard(deck);
    deck = remainingDeck;
    playerHand.push(newCard);
    playerSum += newCard.value;

    addCardToPlayer(newCard);

    renderGame();

    double = true;
  }

  stand();
  return;
}

function stand() {
  if (!gameOver) {
    let { card: dealerSecondCardData, remainingDeck } = drawCard(deck);
    deck = remainingDeck;
    dealerHand.push(dealerSecondCardData);
    dealerSum += dealerSecondCardData.value;

    const dealerCardsContainer = document.getElementById("dealer-cards");
    const dealerSecondCardImg = dealerCardsContainer.children[1];
    dealerSecondCardImg.src = `./cards/${dealerSecondCardData.rank}_of_${dealerSecondCardData.suit}.png`;
    dealerSecondCardImg.alt = `${dealerSecondCardData.rank} of ${dealerSecondCardData.suit}`;

    while (dealerSum < 17 && dealerIsAlive) {
      let { card: newCard, remainingDeck } = drawCard(deck);
      deck = remainingDeck;
      dealerHand.push(newCard);
      dealerSum += newCard.value;

      addCardToDealer(newCard);
    }

    renderGame();

    if (dealerSum > 21) {
      message = "Dealer has gone bust";
      dealerIsAlive = false;
      playerWon = true;
    } else if (dealerSum == 21 && dealerSum > playerSum) {
      message = "Dealer has blackjack";
      playerWon = false;
    } else if (dealerSum > playerSum) {
      message = "Dealer won";
      playerWon = false;
    } else if (dealerSum == playerSum) {
      message = "Its a push";
      push = true;
    } else {
      message = "You won";
      dealerIsAlive = false;
      playerWon = true;
    }

    endGame();
    messageEl.textContent = message;
  }
}

function addCardToPlayer(card) {
  const playerCardsContainer = document.getElementById("player-cards");

  //nytt img element
  const cardImg = document.createElement("img");
  cardImg.src = `./cards/${card.rank}_of_${card.suit}.png`;
  cardImg.classList.add("card");

  playerCardsContainer.appendChild(cardImg);
}

function addCardToDealer(card) {
  const dealerCardsContainer = document.getElementById("dealer-cards");

  //nytt img element
  const cardImg = document.createElement("img");
  cardImg.src = `./cards/${card.rank}_of_${card.suit}.png`;
  cardImg.classList.add("card");

  dealerCardsContainer.appendChild(cardImg);
}

function renderGame() {
  playerSum = adjustAceValue(playerHand, playerSum);

  dealerSumEl.textContent = "Sum: " + dealerSum;
  playerSumEl.textContent = "Sum: " + playerSum;

  if (playerSum >= 22) {
    message = "Bust!";
    playerIsAlive = false;
    gameOver = true;
    playerWon = false;
  } else if (playerSum === 21) {
    message = "You got blackjack!";
    playerHasBlackJack = true;
    playerWon = true;
  } else {
    message = "Hit or stand?";
  }

  messageEl.textContent = message;
}

function endGame() {
  if ((dealerIsAlive = true)) {
    console.log(bettingAmount);

    balance += bettingAmount;

    dealerSum = adjustAceValue(dealerHand, dealerSum);

    if (dealerSum > playerSum && dealerSum < 22) {
      balance -= bettingAmount;
      console.log("1");
      playerWon = false;
    } else if (dealerSum > 21 && !playerHasBlackJack) {
      balance += bettingAmount;
      console.log("2");
      playerWon = true;
    } else if (dealerSum < playerSum && playerSum < 21) {
      balance += bettingAmount;
      console.log("3");
      playerWon = true;
    } else if (playerSum > 21) {
      balance -= bettingAmount;
      console.log("4");
      playerWon = false;
    } else {
      console.log("5");
      push = true;
    }
  }

  balanceEl.textContent = "Balance: $" + balance;
  gameOver = true;

  if (gameOver && playerWon) {
    console.log("Adding blink-won class endgame");
    startBtnEl.classList.add("blink-won");
  } else if (gameOver && push) {
    console.log("Adding blink-push class endgame");
    startBtnEl.classList.add("blink-push");
  } else if (gameOver && !playerWon) {
    console.log("Adding blink-loss class endgame");
    startBtnEl.classList.add("blink-loss");
  }
}

function updateBalance() {
  const balanceEl = document.getElementById("balance-el");
  balanceEl.textContent = "Balance: $" + balance;
}

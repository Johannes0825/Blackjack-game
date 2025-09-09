let playerHasBlackJack = false;
let playerIsAlive = false;
let dealerHasBlackJack = false;
let dealerIsAlive = false;
let gameOver = false;
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
let suits = ["spades", "hearts", "clubs", "diamonds"];

const betInput = document.getElementById("bet-input");
betInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    startGame();
  }
});

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

  if (bettingAmount <= 0 || bettingAmount > balance) {
    messageEl.textContent = "Invalid bet amount!";
    return;
  }

  balance -= bettingAmount;
  updateBalance();
  gameOver = false;
  playerIsAlive = true;
  playerHasBlackJack = false;
  playerHand = [];
  playerSum = 0;

  dealerIsAlive = true;
  dealerHasBlackJack = false;
  dealerHand = [];
  dealerSum = 0;

  // nullstill kort container
  const playerCardsContainer = document.getElementById("player-cards");
  playerCardsContainer.innerHTML = "";

  startBtnEl.textContent = "NEW GAME";

  //trekk to kort
  let playerFirstCard = getRandomCard();
  let playerSecondCard = getRandomCard();
  playerHand.push(playerFirstCard, playerSecondCard);
  playerSum = playerFirstCard.value + playerSecondCard.value;

  //
  addCardToPlayer(playerFirstCard);
  addCardToPlayer(playerSecondCard);

  //dealer funskjonalitet
  const dealerCardsContainer = document.getElementById("dealer-cards");
  dealerCardsContainer.innerHTML = "";

  let dealerFirstCard = getRandomCard();
  dealerHand.push(dealerFirstCard);
  dealerSum = dealerFirstCard.value;

  addCardToDealer(dealerFirstCard);

  let dealerSecondCard = document.createElement("img");
  dealerSecondCard.src = `./cards/card-back.png`;
  dealerCardsContainer.appendChild(dealerSecondCard);
  console.log(dealerSecondCard);

  dealerSecondCard.classList.add("card");
  console.log(gameOver);
  renderGame();
  return;
}

function hit() {
  if (!gameOver) {
    let newCard = getRandomCard();
    playerHand.push(newCard);
    playerSum += newCard.value;

    //legg til i dom
    addCardToPlayer(newCard);
    console.log(newCard);

    renderGame();
    console.log(playerSum);
    console.log(gameOver);
  }
}

function stand() {
  if (!gameOver) {
    let dealerSecondCardData = getRandomCard();
    dealerHand.push(dealerSecondCardData);
    dealerSum += dealerSecondCardData.value;

    const dealerCardsContainer = document.getElementById("dealer-cards");
    const dealerSecondCardImg = dealerCardsContainer.children[1];
    dealerSecondCardImg.src = `./cards/${dealerSecondCardData.rank}_of_${dealerSecondCardData.suit}.png`;
    dealerSecondCardImg.alt = `${dealerSecondCardData.rank} of ${dealerSecondCardData.suit}`;

    while (dealerSum < 17 && dealerIsAlive) {
      let newCard = getRandomCard();
      dealerHand.push(newCard);
      dealerSum += newCard.value;

      addCardToDealer(newCard);
      console.log(newCard);
    }

    renderGame();

    if (dealerSum > 21) {
      message = "Dealer has gone bust";
      dealerIsAlive = false;
    } else if (dealerSum == 21 && dealerSum > playerSum) {
      message = "Dealer has blackjack";
    } else if (dealerSum > playerSum) {
      message = "Dealer won";
    } else if (dealerSum == playerSum) {
      message = "Its a push";
    } else {
      message = "You won";
      dealerIsAlive = false;
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
  } else if (playerSum === 21) {
    message = "You got blackjack!";
    playerHasBlackJack = true;
  } else {
    message = "Hit or stand?";
  }

  messageEl.textContent = message;
}

function endGame() {
  if ((dealerIsAlive = true)) {
    balance += bettingAmount;

    dealerSum = adjustAceValue(dealerHand, dealerSum);

    if (dealerSum > playerSum && dealerSum < 22) {
      balance -= bettingAmount;
      console.log("1");
    } else if (dealerSum > 21 && !playerHasBlackJack) {
      balance += bettingAmount * 2;
      console.log("2");
    } else if (
      (dealerSum < playerSum && playerHasBlackJack) ||
      (playerHasBlackJack && !dealerIsAlive)
    ) {
      balance += bettingAmount * 2.5;
      console.log("3");
    } else if (dealerSum < playerSum && playerSum < 21) {
      balance += bettingAmount * 2;
      console.log("4");
    } else if (playerSum > 21) {
      balance -= bettingAmount;
      console.log("5");
    } else {
      console.log("6");
    }
  }

  balanceEl.textContent = "Balance: $" + balance;
  gameOver = true;
  return gameOver;
}

function updateBalance() {
  const balanceEl = document.getElementById("balance-el");
  balanceEl.textContent = "Balance: $" + balance;
}

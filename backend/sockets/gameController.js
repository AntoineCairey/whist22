const games = {};

/* let gameData = {
  roomId: "abc123",
  round: 7,
  startCardsNb : 3, 
  step: "startGame",
  activePlayer : 2, // id du joueur actif
  dealer: 0, // id du donneur
  board: [null, null, 5, 14], // null si pas encore joué ou éliminé
  previousTrick: [2, 4, 10, 6],
  players: [
    {
      index: 0, // nécessaire ?
      id: 1234, // null si bot ?
      name: "Bob",
      health: 3,
      bid: 1,
      tricks: 0,
      hand: [3, 7, 12],
      elimTurn: null, // null si joueur en vie
    },
  ],
}; */

function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function startGame() {
  /* 
  setup état initial
  définir un ordre aléatoire
  ...
  emit ?
  lancer distribution
   */
}

async function dealCards() {
  /* 
  next dealer
  init board, bids, tricks...
  draw cards
  emit
  await delay(1);
  launch bids
  */
}


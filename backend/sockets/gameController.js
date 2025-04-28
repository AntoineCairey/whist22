const games = {};

let gameData = {
  round: 1,
  cardsNb: 5,
  step: "startGame",
  activePlayer: 1, // index du joueur actif
  dealer: 0, // id du donneur
  board: [null, null, null, null], // null si pas encore joué ou éliminé
  previousTrick: [],
  players: [
    {
      index: 0, // nécessaire ?
      id: 1234, // null si bot ?
      name: "J1",
      health: 3,
      bid: null,
      tricks: null,
      hand: [3, 7, 12, 15, 19],
      elimTurn: null, // null si joueur en vie
    },
    {
      index: 1,
      id: 5678,
      name: "J2",
      health: 3,
      bid: null,
      tricks: null,
      hand: [3, 7, 12, 15, 19],
      elimTurn: null,
    },
    {
      index: 2,
      id: null,
      name: "B1",
      health: 3,
      bid: null,
      tricks: null,
      hand: [3, 7, 12, 15, 19],
      elimTurn: null,
    },
    {
      index: 3,
      id: null,
      name: "B2",
      health: 3,
      bid: null,
      tricks: null,
      hand: [3, 7, 12, 15, 19],
      elimTurn: null,
    },
  ],
};

function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function startGame(io, roomName) {
  /* 
  setup état initial
  définir un ordre aléatoire
  ...
  emit ?
  lancer distribution
   */
  console.log("hi");
  games[roomName] = gameData;
  io.to(roomName).emit("gameStarted");
  io.to(roomName).emit("gameUpdate", games[roomName]);
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

module.exports = { startGame };

const { rooms } = require("./roomController");

const games = {};

const gameInit = {
  roomName: "",
  round: 1,
  cardsNb: 5,
  step: "startGame",
  activePlayer: 1, // index du joueur actif
  dealer: 0, // id du donneur
  board: null, // null si pas encore joué ou éliminé
  previousTrick: null,
  players: null,
};

const playerInit = {
  id: null,
  name: null,
  health: 3,
  bid: null,
  tricks: null,
  hand: null,
  elimTurn: null,
};

function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function getGameState(socket, roomName) {
  socket.emit("gameUpdate", games[roomName])
}

/* 
ajouter les bots
définir un ordre aléatoire
setup état initial
...
emit ?
lancer distribution
 */
function startGame(io, roomName) {
  const game = { ...gameInit };
  game.roomName = roomName;
  game.players = [];
  game.board = [];
  
  console.log(rooms[roomName]);
  for (i = 0; i < 4; i++) {
    const playerData = { ...playerInit };
    const roomPlayer = rooms[roomName][i];
    playerData.hand = [];
    if (roomPlayer) {
      playerData.id = roomPlayer.id;
      playerData.name = roomPlayer.name;
    } else {
      playerData.name = "Bot";
    }
    game.players[i] = playerData;
  }
  game.players.sort(() => 0.5 - Math.random());
  games[roomName] = game;

  // problématique d'enchainer ces 2 events ?
  io.to(roomName).emit("gameStarted", roomName);
  //io.to(roomName).emit("gameUpdate", games[roomName]);
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

module.exports = { getGameState, startGame };

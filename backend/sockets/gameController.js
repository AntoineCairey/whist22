const { rooms } = require("./roomController");

const games = {};

const gameInit = {
  roomName: "",
  round: 1,
  cardsNb: 5,
  step: "startGame",
  activePlayer: 1, // index du joueur actif
  dealer: 0, // id du donneur
  firstPlayer: 1, // premier joueur du pli
  board: null, // null si pas encore joué ou éliminé
  previousTrick: null,
  previousAction: null,
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
  socket.emit("gameUpdate", games[roomName]);
}

function nextAlivePlayer(playerIndex, players) {
  let p = playerIndex;
  do {
    p = p >= 3 ? 0 : p + 1;
  } while (players[p].health <= 0);
  return p;
}

function sumArray(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

/* 
ajouter les bots
définir un ordre aléatoire
setup état initial
...
emit ?
lancer distribution
 */
async function startGame(io, roomName) {
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

  game.step = "dealCards";
  io.to(roomName).emit("gameStarted", roomName);
  // delay(1);
  dealCards(io, roomName);
}

async function dealCards(io, roomName) {
  /* 
  next dealer
  init board, bids, tricks...
  draw cards
  emit
  await delay(1);
  launch bids
  */
  const game = games[roomName];
  const players = game.players;

  game.dealer = nextAlivePlayer(game.dealer, players);
  game.firstPlayer = nextAlivePlayer(game.dealer, players);
  game.activePlayer = game.firstPlayer;

  game.previousAction = {
    step: "dealCards",
    player: game.dealer,
    value: game.cardsNb,
  };
  game.board = Array(4).fill(null);

  const deck = Array.from({ length: 21 }, (_, index) => index + 1);
  // on rajoute l'excuse sauf dans le tour à 1 carte
  if (game.cardsNb > 1) {
    deck.push(23);
  }

  for (i = 0; i < 4; i++) {
    players[i].bid = null;
    players[i].tricks = 0;
    players[i].hand = [];
    for (j = 0; j < game.cardsNb; j++) {
      const index = Math.floor(Math.random() * deck.length);
      players[i].hand.push(deck[index]);
      deck.splice(index, 1);
    }
    players[i].hand.sort((a, b) => a - b);
  }

  game.step = "playerBid";
  io.to(roomName).emit("gameUpdate", game);
  delay(1);
  // playerBid(io, roomName);
}

// Choix annonce (humain ou bot)
// Peut être appelé par serveur ou client
async function playerBid(io, roomName, { userIndex, bid } = {}) {
  const game = games[roomName];
  const players = game.players;

  // si joueur est mort -> on passe au suivant
  if (players[activePlayer].health <= 0) {
    game.activePlayer = nextAlivePlayer(game.activePlayer, players);
  }

  // si un joueur humain doit parler
  if (players[activePlayer].id) {
    if (userIndex !== activePlayer) {
      return;
    }
    // cas classique : le bot choisit son annonce
  } else {
    // si tour à 1 carte -> annonce basée sur les cartes des autres
    if (gameLoader.cardsNb === 1) {
      let maxOpponentCard = 0;
      players.forEach((p, i) => {
        if (i !== activePlayer && p.health > 0) {
          maxOpponentCard = Math.max(maxOpponentCard, p.hand[0]);
        }
      });
      bid = maxOpponentCard < 12 ? 1 : 0;

      // si tour à plus d'une carte
    } else {
      ////////// CONTINUER ICI


    }
  }

  // si fin des annonces -> début 1er pli
  if (
    game.activePlayer === game.firstPlayer &&
    players[activePlayer].bid !== null
  ) {
    game.step = "playerPlay";
    playerPlay(io, roomName);
  }
}

module.exports = { getGameState, startGame, dealCards, playerBid };

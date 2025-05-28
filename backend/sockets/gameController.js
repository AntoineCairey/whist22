const { rooms } = require("./roomController");

const games = {};

const gameInit = {
  roomId: "",
  round: 1,
  cardsNb: 5,
  step: "startGame",
  activePlayerIndex: 1, // index du joueur actif
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

function logGame() {
  console.info(games);
}

function delay(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

function getGameState(socket, roomId) {
  socket.emit("gameUpdate", games[roomId]);
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
async function startGame(io, roomId) {
  const game = { ...gameInit };
  game.roomId = roomId;
  game.players = [];
  game.board = [];

  console.log("startGame");
  console.log(rooms[roomId]);
  for (i = 0; i < 4; i++) {
    const playerData = { ...playerInit };
    const roomPlayer = rooms[roomId][i];
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
  games[roomId] = game;

  game.step = "dealCards";
  io.to(roomId).emit("gameStarted", roomId);
  // delay(1);
  dealCards(io, roomId);
}

async function dealCards(io, roomId) {
  /* 
  next dealer
  init board, bids, tricks...
  draw cards
  emit
  await delay(1);
  launch bids
  */
  const game = games[roomId];
  const players = game.players;
  console.log("dealCards");

  game.dealer = nextAlivePlayer(game.dealer, players);
  game.firstPlayer = nextAlivePlayer(game.dealer, players);
  game.activePlayerIndex = game.firstPlayer;

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
  io.to(roomId).emit("gameUpdate", game);
  await delay(5);
  playerBid(io, { roomId });
}

// Choix annonce (humain ou bot)
// Peut être appelé par serveur ou client
async function playerBid(io, { roomId, userIndex, userBid }) {
  const game = games[roomId];
  const players = game.players;
  const activePlayer = players[game.activePlayerIndex];
  let bid;

  console.log("start playerBid" + game.activePlayerIndex);
  console.log(userIndex != null ? userIndex + " , " + userBid : "rien");

  // si fin des annonces -> début 1er pli
  if (
    game.activePlayerIndex === game.firstPlayer &&
    activePlayer.bid !== null
  ) {
    game.step = "playerPlay";
    //playerPlay(io, { roomId });
    console.log("START PLAYING")
    return;
  }

  // si déclenché par clic d'un joueur humain
  if (userIndex != null) {
    // check si c'est son tour (ajouter d'autres vérifs plus tard ?)
    if (userIndex === game.activePlayerIndex) {
      bid = userBid;

      // si c'est pas son tour, on ne fait rien
    } else {
      return;
    }

    // si on arrive ici via l'algo (pas par un clic d'un joueur)
  } else {
    // si c'est au tour d'un joueur humain, on ne fait rien
    if (activePlayer.id) {
      console.log("en attente de " + activePlayer.name);
      return;

      // si c'est le tour d'un bot, il choisit son annonce
    } else {
      // si tour à 1 carte -> annonce basée sur les cartes des autres
      if (game.cardsNb === 1) {
        let maxOpponentCard = 0;
        players.forEach((p, i) => {
          if (i !== game.activePlayerIndex && p.health > 0) {
            maxOpponentCard = Math.max(maxOpponentCard, p.hand[0]);
          }
        });
        bid = maxOpponentCard < 12 ? 1 : 0;

        // si tour à plus d'une carte
      } else {
        const totalCards =
          game.cardsNb * players.filter((p) => p.health > 0).length;
        // on calcule une valeur seuil
        // toute carte supérieure à cette valeur est considérée comme gagnante
        const threshold = 10.5 + totalCards * 0.35;
        bid = activePlayer.hand.filter((c) => c >= threshold).length;

        // si dernier à parler -> on modifie la valeur de son annonce pour respecter la contrainte
        // le total des annonces ne doit pas etre égal au nombre de cartes en main
        if (
          game.activePlayerIndex === game.dealer &&
          players.reduce((acc, curr) => acc + curr.bid, 0) + bid ===
            game.cardsNb
        ) {
          bid === 0 ? bid++ : bid--;
        }
      }
    }
  }
  activePlayer.bid = bid;
  game.previousAction = {
    step: "playerBid",
    player: game.activePlayerIndex,
    value: bid,
  };
  game.activePlayerIndex = nextAlivePlayer(game.activePlayerIndex, players);

  game.step = "playerBid";
  console.log("emit");
  console.log(game);
  io.to(roomId).emit("gameUpdate", game);
  await delay(5);
  playerBid(io, { roomId });
}

module.exports = { getGameState, startGame, dealCards, playerBid };

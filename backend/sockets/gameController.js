const { createGameDb } = require("../managers/gameManager");
const { calcMatchPoints } = require("../scripts/calcMatchPoints");

const { rooms } = require("./roomController");
const namesList = require("../data/names.json");

const games = {};
const waitingTime = 2;
const startCardsNb = 5;
const startHealth = 3;

const gameInit = {
  roomId: "",
  round: 1,
  cardsNb: startCardsNb,
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
  health: startHealth,
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

function s(value) {
  return value >= 2 ? "s" : "";
}

function sumArray(arr) {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

async function startGame(io, roomId) {
  const game = { ...gameInit };
  game.roomId = roomId;
  game.players = [];
  game.board = [];

  rooms[roomId].status = "playing";
  io.emit("roomsUpdate", rooms);

  const botNames = namesList.sort(() => 0.5 - Math.random());

  console.log("startGame");
  console.log(rooms[roomId]);
  for (i = 0; i < 4; i++) {
    const playerData = { ...playerInit };
    const roomPlayer = rooms[roomId].players[i];
    playerData.hand = [];
    if (roomPlayer) {
      playerData.id = roomPlayer.id;
      playerData.name = roomPlayer.name;
    } else {
      playerData.name = "🤖 " + botNames.splice(0, 1);
    }
    game.players[i] = playerData;
  }
  game.players.sort(() => 0.5 - Math.random());
  games[roomId] = game;

  game.step = "dealCards";
  io.to(roomId).emit("gameStarted", roomId);
  // async delay(waitingTime);
  dealCards(io, roomId);
}

async function dealCards(io, roomId) {
  const game = games[roomId];
  const players = game.players;
  console.log("dealCards");

  game.dealer = nextAlivePlayer(game.dealer, players);
  game.firstPlayer = nextAlivePlayer(game.dealer, players);
  game.activePlayerIndex = game.firstPlayer;

  /* game.previousAction = {
    step: "dealCards",
    player: game.dealer,
    value: game.cardsNb,
  }; */
  game.infoText = `${players[game.dealer].name} distribue ${game.cardsNb} carte${s(game.cardsNb)}`;

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
  //await delay(waitingTime);
  playerBid(io, { roomId });
}

// Choix annonce (humain ou bot)
// Peut être appelé par serveur ou client
async function playerBid(io, { roomId, userIndex, userBid }) {
  const game = games[roomId];
  const players = game.players;
  const activePlayer = players[game.activePlayerIndex];
  let bid;

  console.log("playerBid joueur " + game.activePlayerIndex + " " + activePlayer.name);
  console.log(userIndex != null ? "via clic" : "via algo");

  // si fin des annonces -> début 1er pli
  if (
    game.activePlayerIndex === game.firstPlayer &&
    activePlayer.bid !== null
  ) {
    game.step = "playerPlay";
    io.to(roomId).emit("gameUpdate", game);
    playerPlay(io, { roomId });
    return;
  }

  // si déclenché par clic d'un joueur humain
  if (userIndex != null) {
    // check si c'est son tour (ajouter d'autres vérifs plus tard ?)
    if (userIndex === game.activePlayerIndex) {
      console.log("joueur " + userIndex + " annonce " + userBid);
      bid = userBid;

      // si c'est pas son tour, on ne fait rien
    } else {
      console.log(
        "annonce de " +
          userIndex +
          "refusee, c'est au tour de " +
          game.activePlayerIndex
      );
      return;
    }

    // si on arrive ici via l'algo (pas par un clic d'un joueur)
  } else {
    // si c'est au tour d'un joueur humain, on ne fait rien
    if (activePlayer.id) {
      console.log("en attente de " + activePlayer.name);
      game.infoText += `\nA ${activePlayer.name} de parler`;
      io.to(roomId).emit("gameUpdate", game);
      return;

      // si c'est le tour d'un bot, il choisit son annonce
    } else {
      await delay(waitingTime);
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
      console.log("joueur " + game.activePlayerIndex + " annonce " + bid);
    }
  }
  activePlayer.bid = bid;
  /* game.previousAction = {
    step: "playerBid",
    player: game.activePlayerIndex,
    value: bid,
  }; */
  game.infoText = `${activePlayer.name} annonce ${bid} pli${s(bid)}`;
  game.activePlayerIndex = nextAlivePlayer(game.activePlayerIndex, players);

  io.to(roomId).emit("gameUpdate", game);
  playerBid(io, { roomId });
}

async function playerPlay(io, { roomId, userIndex, userCard }) {
  const game = games[roomId];
  const players = game.players;
  const activePlayer = players[game.activePlayerIndex];
  let card;
  let cardIndex;

  console.log("playerPlay joueur " + game.activePlayerIndex);
  console.log(userIndex != null ? "via clic" : "via algo");

  // si fin du pli -> déterminer le gagnant
  if (
    game.activePlayerIndex === game.firstPlayer &&
    game.board[game.activePlayerIndex] != null
  ) {
    game.step = "finishTrick";
    io.to(roomId).emit("gameUpdate", game);
    finishTrick(io, roomId);
    return;
  }

  // si déclenché par clic d'un joueur humain
  if (userIndex != null) {
    // check si c'est son tour (ajouter d'autres vérifs plus tard ?)
    if (userIndex === game.activePlayerIndex) {
      console.log("joueur " + userIndex + " joue " + userCard);
      card = userCard;
      cardIndex = activePlayer.hand.indexOf(card);

      // si c'est pas son tour, on ne fait rien
    } else {
      console.log(
        "carte de " +
          userIndex +
          "refusee, c'est au tour de " +
          game.activePlayerIndex
      );
      return;
    }

    // si on arrive ici via l'algo (pas par un clic d'un joueur)
  } else {
    // si c'est au tour d'un joueur humain, on ne fait rien
    if (activePlayer.id) {
      console.log("en attente de " + activePlayer.name);
      game.infoText += `\nA ${activePlayer.name} de jouer`;
      io.to(roomId).emit("gameUpdate", game);
      return;

      // si c'est le tour d'un bot, il choisit sa carte
    } else {
      await delay(waitingTime);

      let biggestCardOnBoard = Math.max(...game.board, 0);
      let needsToScore = activePlayer.tricks < activePlayer.bid;
      let isLastPlayer =
        nextAlivePlayer(game.activePlayerIndex, players) === game.firstPlayer;
      let canWinTrick = activePlayer.hand.at(-1) > biggestCardOnBoard;
      let nextPlayersDontNeedToScore = !players
        .map(
          (p, i) =>
            i !== game.activePlayerIndex &&
            p.health > 0 &&
            game.board[i] === null &&
            p.tricks < p.bid
        )
        .includes(true);
      console.log(nextPlayersDontNeedToScore);

      if (!needsToScore) {
        // pas de pli à faire -> joue sa plus grande carte perdante
        cardIndex = activePlayer.hand.findLastIndex(
          (c) => c < biggestCardOnBoard
        );
        if (!isLastPlayer && cardIndex === -1) {
          // si pas de carte perdante
          // dernier joueur -> plus grande carte
          // pas dernier joueur -> plus petite carte
          cardIndex = 0;
        }
      } else {
        // encore au moins un pli à faire
        if (nextPlayersDontNeedToScore && canWinTrick) {
          // dernier joueur et peut gagner
          if (activePlayer.bid - activePlayer.tricks >= 2) {
            // doit faire plus d'un pli -> plus petite carte gagnante
            cardIndex = activePlayer.hand.findIndex(
              (c) => c > biggestCardOnBoard
            );
          } else {
            // doit faire un seul pli -> plus grande carte
            cardIndex = -1;
          }
        } else {
          // pas dernier joueur ou peut pas gagner -> plus petite carte
          cardIndex = 0;
        }
      }
      card = activePlayer.hand.at(cardIndex);

      // si carte choisie = excuse
      if (card === 23) {
        if (!needsToScore) {
          // si a fait ses plis -> excuse vaut 0
          card = 0;
        } else {
          if (activePlayer.hand.at(-2) > biggestCardOnBoard) {
            // si on peut gagner sans jouer l'excuse, on évite de jouer l'excuse
            cardIndex = -2;
            card = activePlayer.hand.at(-2);
          } else {
            // si a pas fait tous ses plis -> excuse vaut 22
            card = 22;
          }
        }
      }

      console.log("joueur " + game.activePlayerIndex + " joue " + card);
    }
  }
  game.board[game.activePlayerIndex] = card;
  activePlayer.hand.splice(cardIndex, 1);
  /* game.previousAction = {
    step: "playerPlay",
    player: game.activePlayerIndex,
    value: card,
  }; */
  game.infoText = `${activePlayer.name} joue ${card}`;
  game.activePlayerIndex = nextAlivePlayer(game.activePlayerIndex, players);

  io.to(roomId).emit("gameUpdate", game);
  playerPlay(io, { roomId });
}

async function finishTrick(io, roomId) {
  const game = games[roomId];
  const players = game.players;
  const activePlayer = players[game.activePlayerIndex];

  const winner = game.board.indexOf(Math.max(...game.board));
  console.log("finishTrick, winner : " + winner);

  players[winner].tricks++;
  /* game.previousAction = {
    step: "finishTrick",
    player: winner,
    value: null,
  }; */
  game.infoText = `${players[winner].name} gagne le pli`;
  await delay(waitingTime);

  if (activePlayer.hand.length === 0) {
    game.step = "finishRound";
    io.to(roomId).emit("gameUpdate", game);
    finishRound(io, roomId);
  } else {
    game.board = Array(4).fill(null);
    game.firstPlayer = winner;
    game.activePlayerIndex = winner;
    game.step = "playerPlay";
    io.to(roomId).emit("gameUpdate", game);
    playerPlay(io, { roomId });
  }
}

async function finishRound(io, roomId) {
  const game = games[roomId];
  const players = game.players;
  const activePlayer = players[game.activePlayerIndex];

  console.log("finishRound");
  game.infoText = "Fin de la manche";

  // calculer vies perdues et joueurs éliminés
  players.forEach((player, index) => {
    console.log("finish loop");
    if (player.health > 0) {
      const damage = Math.abs(player.bid - player.tricks);
      if (damage > 0) {
        player.health = Math.max(player.health - damage, 0);
        game.infoText += `\n${`${player.name} perd`} ${damage} vie${s(damage)}`;
        console.log(player.name + " perd " + damage + " vies");
        if (player.health === 0) {
          player.elimTurn = game.round;
          game.infoText += " → éliminé 💀";
          console.log(player.name + " est éliminé");
        }
      }
    }
  });

  // enregistrer scores joueurs humains éliminés
  players.forEach(async (player, index) => {
    if (player.elimTurn === game.round && player.id) {
      const { isVictory, totalPoints } = calcMatchPoints(players, index);
      const newGame = {
        userId: player.id,
        isVictory,
        points: totalPoints,
        score: null,
      };
      await createGameDb(newGame);
    }
  });

  // si partie finie (1 gagnant ou tous les joueurs humains éliminés)
  const alivePlayers = players.filter((p) => p.health > 0);
  if (
    alivePlayers.length <= 1 ||
    alivePlayers.filter((p) => p.id != null).length === 0
  ) {
    console.log("FINITO");
    // si joueur humain gagne, enregistrer son score
    // puis aller sur la page score
    if (alivePlayers[0] && alivePlayers[0].id) {
      const winnerIndex = players.findIndex((p) => p.id === alivePlayers[0].id);
      const { isVictory, totalPoints } = calcMatchPoints(players, winnerIndex);
      const newGame = {
        userId: alivePlayers[0].id,
        isVictory,
        points: totalPoints,
        score: null,
      };
      await createGameDb(newGame);
    }
    io.to(roomId).emit("gameUpdate", game);
    await delay(5);
    rooms[roomId].status = "waiting";
    io.emit("roomsUpdate", rooms);
    io.to(roomId).emit("endOfGame");
  } else {
    game.round++;
    game.cardsNb = 5 - ((game.round - 1 + (5 - startCardsNb)) % 5);
    game.step = "dealCards";
    io.to(roomId).emit("gameUpdate", game);
    await delay(5);
    dealCards(io, roomId);
  }
}

module.exports = { getGameState, startGame, playerBid, playerPlay };

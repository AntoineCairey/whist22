import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Player from "../components/Player";
import Card from "../components/Card";

export default function Game() {
  const navigate = useNavigate();
  const startPlayersNb = 4;
  const startPlayers = [0, 1, 2, 3];
  const names = ["Vous", "Bot 1", "Bot 2", "Bot 3"];
  const position = ["bottom", "left", "top", "right"];
  const { setScore } = useOutletContext();

  const [round, setRound] = useState(1); // numero de la manche
  const [dealer, setDealer] = useState(
    Math.floor(Math.random() * startPlayersNb)
  ); // donneur
  const [askBid, setAskBid] = useState(false); // demander mise ?
  const [cardsPlayed, setCardsPlayed] = useState(
    Array(startPlayersNb).fill(null)
  ); // cartes jouées
  const [firstPlayer, setFirstPlayer] = useState(null); // 1er joueur du pli
  const [player, setPlayer] = useState(null); //joueur actuel
  const [loading, setLoading] = useState(0);
  //statut du pli (0 = avant le 1er pli, 1 = avant que le PJ joue, 2 = après que le PJ ait joué)

  const [life, setLife] = useState(Array(startPlayersNb).fill(2)); // vies restantes
  const [bids, setBids] = useState(Array(startPlayersNb).fill(null)); // mises
  const [tricks, setTricks] = useState(Array(startPlayersNb).fill(0)); // plis gagnés
  const [cards, setCards] = useState(null); // cartes en main
  const [elimTurn, setElimTurn] = useState(Array(startPlayersNb).fill(null)); // tour élimination

  let cardsNb = 5 - ((round - 1) % 5); // nombre de cartes en main pour cette manche
  let players = life
    .map((value, index) => (value > 0 ? index : -1))
    .filter((value) => value >= 0); // liste des joueurs en vie
  let playersNb = players.length; // nombre de joueurs en vie

  const gameData = {
    names,
    players,
    dealer,
    player,
    life,
    bids,
    tricks,
    cards,
    elimTurn,
  };

  // fonction qui s'exécute à chaque tour (chaque fois que player change)
  // fait jouer une nouvelle carte au bot dont c'est le tour puis passe au suivant
  // si fin de pli, détermine le gagnant
  useEffect(() => {
    if (loading === 0 || (loading === 1 && player === 0)) {
      return;
    }
    if (loading === 2 && player === firstPlayer) {
      determineWinner(cardsPlayed);
      return;
    }
    const id = setInterval(() => {
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      console.log(`${names[player]} joue ${cards[player][cardIndex]}`);
      let newCardsPlayed = [...cardsPlayed];
      newCardsPlayed[player] = cards[player][cardIndex];
      setCardsPlayed(newCardsPlayed);

      let newCards = [...cards];
      newCards[player] = [...newCards[player]];
      newCards[player].splice(cardIndex, 1);
      setCards(newCards);
      setPlayer((p) => nextPlayer(p));
    }, 2000);
    return () => {
      clearInterval(id);
    };
  }, [loading, player]);

  const nextPlayer = (currentPlayer) => {
    return currentPlayer >= playersNb - 1 ? 0 : currentPlayer + 1;
  };

  const startGame = () => {
    setLife(Array(startPlayersNb).fill(2));
    let newDealer = Math.floor(Math.random() * startPlayersNb);
    setDealer(newDealer);
    setRound(1);
    distributeCards(newDealer, 5);
  };

  //s'exécute 1 fois, quand le jeu commence
  useEffect(startGame, []);

  const distributeCards = (theDealer, theCardsNb) => {
    console.log(`Distribution : ${theCardsNb} cartes par personne`);
    setCardsPlayed(Array(playersNb).fill(null));
    setTricks(Array(playersNb).fill(0));
    setFirstPlayer(nextPlayer(theDealer));
    const deck = Array.from({ length: 22 }, (_, index) => index + 1);
    let playersCards = [];
    for (let i = 0; i < playersNb; i++) {
      let playerCards = [];
      for (let j = 0; j < theCardsNb; j++) {
        const index = Math.floor(Math.random() * deck.length);
        playerCards.push(deck[index]);
        deck.splice(index, 1);
      }
      playerCards.sort((a, b) => a - b);
      playersCards.push(playerCards);
    }
    setCards(playersCards);
    startBids(nextPlayer(theDealer));
  };

  const startBids = (theFirstPlayer) => {
    let bidder = theFirstPlayer;
    let theBids = Array(playersNb).fill(null);
    while (bidder !== 0) {
      theBids[bidder] = Math.floor(Math.random() * 3);
      bidder = nextPlayer(bidder);
    }
    setBids(theBids);
    setAskBid(true);
  };

  const finishBids = (myBid) => {
    setAskBid(false);
    let theBids = [...bids];
    theBids[0] = myBid;
    let bidder = 1;
    while (bidder !== firstPlayer) {
      // faire une vraie fonction chooseBid
      theBids[bidder] = Math.floor(Math.random() * 3);
      bidder = nextPlayer(bidder);
    }
    setBids(theBids);
    startTrick(firstPlayer);
  };

  const startTrick = (theFirstPlayer) => {
    setCardsPlayed(Array(playersNb).fill(null));
    setFirstPlayer(theFirstPlayer);
    setPlayer(theFirstPlayer);
    setLoading(1);
  };

  const finishTrick = (myCard) => {
    console.log(`Vous jouez ${myCard}`);
    let theCardsPlayed = [...cardsPlayed];
    theCardsPlayed[0] = myCard;
    setCardsPlayed(theCardsPlayed);

    let newCards = [...cards];
    newCards[0] = [...newCards[0]];
    newCards[0].splice(cards[0].indexOf(myCard), 1);
    setCards(newCards);

    setPlayer(1);
    setLoading(2);
  };

  const determineWinner = (theCardsPlayed) => {
    let winner = theCardsPlayed.indexOf(Math.max(...theCardsPlayed));
    console.log(`${names[winner]} gagne le pli`);
    let theTricks = [...tricks];
    theTricks[winner]++;
    setTricks(theTricks);
    setTimeout(() => {
      if (cards[0].length === 0) {
        finishRound(theTricks);
      } else {
        startTrick(winner);
      }
    }, 3000);
  };

  const finishRound = (theTricks) => {
    const theLife = [...life];
    const theElimTurn = [...elimTurn];
    for (let i = 0; i < playersNb; i++) {
      let damage = Math.abs(bids[i] - theTricks[i]);
      if (damage > 0) {
        console.log(`${names[i]} perd ${damage} vie(s)`);
      }
      theLife[players[i]] = Math.max(theLife[players[i]] - damage, 0);
      if (theLife[players[i]] === 0) {
        theElimTurn[players[i]] = round;
        setElimTurn(theElimTurn);
        console.log(`${names[players[i]]} est éliminé`);
        if (i === 0) {
          console.log("Vous avez perdu");
          setScore({ names, life: theLife, elimTurn: theElimTurn });
          navigate("/score");
        }
      }
    }
    setLife(theLife);
    if (theLife.filter((item) => item > 0).length === 1) {
      console.log("Vous avez gagné");
      setScore({ names, life: theLife, elimTurn: theElimTurn });
      navigate("/score");
    } else if (theLife.filter((item) => item > 0).length === 0) {
      console.log("Aucun gagnant");
    } else {
      let next = dealer;
      do {
        next = dealer === startPlayersNb - 1 ? 0 : next + 1;
        //console.log("next : " + next);
      } while (theLife[next] === 0);
      setDealer(next);
      setRound(round + 1);
      let theCardsNb = 5 - (round % 5);
      distributeCards(next, theCardsNb);
    }
  };

  return (
    <>
      {/* <button onClick={() => navigate("/")}>Revenir au Menu</button>
      <h1>Tarot Africain</h1>
      <br /> */}
      {cards && (
        <>
          {/* <div>Donneur : {dealer}</div>
          <div>Au tour de : {player}</div> */}
          {startPlayers.map((player) => (
            <Player
              key={player}
              id={player}
              gameData={gameData}
              handleCardClick={finishTrick}
            />
          ))}

          {askBid && (
            <div className="bid">
              <h3>Votre mise ?</h3>
              {Array.from({ length: cardsNb + 1 }, (_, index) => (
                <button key={index} onClick={() => finishBids(index)}>
                  {index}
                </button>
              ))}
            </div>
          )}
          {/* <h3>Cartes jouées</h3> */}
          <div className="board">
            {cardsPlayed.map((card, index) => (
              <div className={position[index]}>
                <Card
                  key={index}
                  isVisible={!!card}
                  isClickable={false}
                  value={card}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

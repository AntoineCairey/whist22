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
  const [askFool, setAskFool] = useState(false); // demander valeur excuse ?
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

  const [history, setHistory] = useState([]); // historique à afficher

  let cardsNb = 5 - ((round - 1) % 5); // nombre de cartes en main pour cette manche

  const gameData = {
    names,
    dealer,
    player,
    life,
    bids,
    tricks,
    cards,
    elimTurn,
    cardsNb,
  };

  // fonction qui s'exécute à chaque tour (chaque fois que player change)
  // fait jouer une nouvelle carte au bot dont c'est le tour puis passe au suivant
  // si fin de pli, détermine le gagnant
  useEffect(() => {
    // si pli pas commencé ou PJ doit jouer -> on ne fait rien
    if (loading === 0 || (loading === 1 && player === 0)) {
      return;
    }
    // si fin du pli -> déterminer le gagnant
    if (loading === 2 && player === firstPlayer) {
      determineWinner(cardsPlayed);
      return;
    }
    // si joueur est mort -> on passe au suivant
    if (life[player] <= 0) {
      setPlayer((p) => nextPlayer(p));
      return;
    }
    // si aucun de ces cas -> le bot choisit une carte à jouer
    const id = setTimeout(() => {
      let cardIndex;
      let cardPlayed;
      let biggestCardOnBoard = Math.max(...cardsPlayed, 0);
      let needsToScore = tricks[player] < bids[player];
      let isLastPlayer = nextAlivePlayer(player) === firstPlayer;
      let canWinTrick = cards[player].at(-1) > biggestCardOnBoard;

      if (!needsToScore) {
        // pas de pli à faire -> joue sa plus grande carde perdante
        cardIndex = cards[player].findLastIndex((c) => c < biggestCardOnBoard);
        if (!isLastPlayer && cardIndex === -1) {
          // si pas de carte perdante
          // dernier joueur -> plus grande carte
          // pas dernier joueur -> plus petite carte
          cardIndex = 0;
        }
      } else {
        // encore au moins un pli à faire
        if (isLastPlayer && canWinTrick) {
          // dernier joueur et peut gagner
          if (bids[player] - tricks[player] >= 2) {
            // doit faire plus d'un pli -> plus petite carte gagnante
            cardIndex = cards[player].findIndex((c) => c > biggestCardOnBoard);
          } else {
            // doit faire un seul pli -> plus grande carte
            cardIndex = -1;
          }
        } else {
          // pas dernier joueur ou peut pas gagner -> plus petite carte
          cardIndex = 0;
        }
      }
      cardPlayed = cards[player].at(cardIndex);

      // si carte choisie = excuse
      if (cardPlayed === 23) {
        if (!needsToScore) {
          // si a fait ses plis -> excuse vaut 0
          cardPlayed = 0;
        } else {
          if (cards[player].at(-2) > biggestCardOnBoard) {
            // si on peut gagner sans jouer l'excuse, on évite de jouer l'excuse
            cardIndex = -2;
            cardPlayed = cards[player].at(-2);
          } else {
            // si a pas fait tous ses plis -> excuse vaut 22
            cardPlayed = 22;
          }
        }
      }

      console.log(`${names[player]} joue ${cardPlayed}`);
      setHistory([`${names[player]} joue ${cardPlayed}`]);

      let newCardsPlayed = [...cardsPlayed];
      newCardsPlayed[player] = cardPlayed;
      setCardsPlayed(newCardsPlayed);

      let newCards = [...cards];
      newCards[player] = [...newCards[player]];
      newCards[player].splice(cardIndex, 1);
      setCards(newCards);

      setPlayer((p) => nextPlayer(p));
    }, 2000);
    return () => {
      clearTimeout(id);
    };
  }, [loading, player]);

  const nextPlayer = (currentPlayer) => {
    return currentPlayer >= startPlayersNb - 1 ? 0 : currentPlayer + 1;
  };

  const nextAlivePlayer = (currentPlayer) => {
    let p = currentPlayer;
    do {
      p = nextPlayer(p);
    } while (life[p] <= 0);
    return p;
  };

  const sumArray = (arr) => {
    return arr.reduce((acc, curr) => acc + curr, 0);
  };

  const handleCardClick = (value) => {
    if (value === 23) {
      setAskFool(true);
    } else {
      finishTrick(value);
    }
  };

  const startGame = () => {
    const theLife = Array(startPlayersNb).fill(3);
    setLife(theLife);
    let newDealer = Math.floor(Math.random() * startPlayersNb);
    setDealer(newDealer);
    setRound(1);
    distributeCards(newDealer, 5, theLife);
  };

  //s'exécute 1 fois, quand le jeu commence
  useEffect(startGame, []);

  const distributeCards = (theDealer, theCardsNb, theLife) => {
    console.log(`Distribution : ${theCardsNb} cartes par personne`);
    setCardsPlayed(Array(startPlayersNb).fill(null));
    setTricks(Array(startPlayersNb).fill(0));
    setFirstPlayer(nextPlayer(theDealer));
    const deck = Array.from({ length: 21 }, (_, index) => index + 1);
    // on rajoute l'excuse sauf dans le tour à 1 carte
    if (theCardsNb > 1) {
      deck.push(23);
    }
    const playersCards = Array(startPlayersNb).fill(null);
    for (let i = 0; i < startPlayersNb; i++) {
      if (life[i] > 0) {
        const playerCards = [];
        for (let j = 0; j < theCardsNb; j++) {
          const index = Math.floor(Math.random() * deck.length);
          playerCards.push(deck[index]);
          deck.splice(index, 1);
        }
        playerCards.sort((a, b) => a - b);
        playersCards[i] = playerCards;
      }
    }
    setCards(playersCards);
    startBids(nextPlayer(theDealer), theLife, playersCards, theCardsNb);
  };

  const startBids = (theFirstPlayer, theLife, playersCards, theCardsNb) => {
    let bidder = theFirstPlayer;
    let theBids = Array(startPlayersNb).fill(null);
    const totalCards = theCardsNb * theLife.filter((l) => l > 0).length;
    // on calcule une valeur seuil
    // toute carte supérieure à cette valeur est considérée comme gagnante
    const threshold = 10.5 + totalCards * 0.35;
    /* console.log(theCardsNb);
    console.log(totalCards);
    console.log(threshold); */
    while (bidder !== 0) {
      if (theLife[bidder] > 0) {
        const bid = playersCards[bidder].filter((c) => c >= threshold).length;
        theBids[bidder] = bid;
      }
      bidder = nextPlayer(bidder);
    }
    setBids(theBids);
    setAskBid(true);
  };

  const finishBids = (myBid) => {
    setAskBid(false);
    let theBids = [...bids];
    theBids[0] = myBid;
    const totalCards = cardsNb * life.filter((l) => l > 0).length;
    const threshold = 10.5 + totalCards * 0.35;
    let bidder = 1;
    while (bidder !== firstPlayer) {
      if (life[bidder] > 0) {
        let bid = cards[bidder].filter((c) => c >= threshold).length;
        // si dernier à parler -> on modifie la valeur de son annonce pour respecter la contrainte
        // le total des annonces ne doit pas etre egal au nombre de cartes en main
        if (bidder === dealer && sumArray(theBids) + bid === cardsNb) {
          bid === 0 ? bid++ : bid--;
        }
        theBids[bidder] = bid;
      }
      bidder = nextPlayer(bidder);
    }
    setBids(theBids);
    startTrick(firstPlayer);
  };

  const startTrick = (theFirstPlayer) => {
    setCardsPlayed(Array(startPlayersNb).fill(null));
    setFirstPlayer(theFirstPlayer);
    setPlayer(theFirstPlayer);
    setLoading(1);
  };

  const finishTrick = (myCard) => {
    setAskFool(false);
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
    for (let i = 0; i < startPlayersNb; i++) {
      if (life[i] > 0) {
        let damage = Math.abs(bids[i] - theTricks[i]);
        if (damage > 0) {
          console.log(`${names[i]} perd ${damage} vie(s)`);
        }
        theLife[i] = Math.max(theLife[i] - damage, 0);
        if (theLife[i] === 0) {
          theElimTurn[i] = round;
          setElimTurn(theElimTurn);
          console.log(`${names[i]} est éliminé`);
          if (i === 0) {
            console.log("Vous avez perdu");
            setScore({ names, life: theLife, elimTurn: theElimTurn });
            navigate("/score");
          }
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
        next = dealer >= startPlayersNb - 1 ? 0 : next + 1;
      } while (theLife[next] === 0);
      setDealer(next);
      setRound(round + 1);
      let theCardsNb = 5 - (round % 5);
      distributeCards(next, theCardsNb, theLife);
    }
  };

  return (
    <>
      <div className="info">
        <button onClick={() => navigate("/")}>Revenir au Menu</button>
        <div>
          Manche {round} ({cardsNb} cartes/pers)
        </div>
      </div>
      <div className="game">
        {cards && (
          <>
            {startPlayers.map((player) => (
              <Player
                key={player}
                id={player}
                gameData={gameData}
                handleCardClick={handleCardClick}
              />
            ))}

            <div className="board">
              {cardsPlayed.map(
                (card, index) =>
                  card != null && (
                    <div className={position[index]} key={index}>
                      <Card isVisible={true} isClickable={false} value={card} />
                    </div>
                  )
              )}
            </div>

            <div className="history">{history}</div>

            {askBid && (
              <div className="modal-back">
                <div className="modal">
                  <h3>Votre mise</h3>
                  {Array.from({ length: cardsNb + 1 }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => finishBids(index)}
                      disabled={
                        dealer === 0 && sumArray(bids) + index === cardsNb
                      }
                    >
                      {index}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {askFool && (
              <div className="modal-back">
                <div className="modal">
                  <h3>Valeur de l'excuse</h3>
                  {[0, 22].map((val) => (
                    <button key={val} onClick={() => finishTrick(val)}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

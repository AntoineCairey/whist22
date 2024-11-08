import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Player from "../components/Player";
import Card from "../components/Card";

export default function Game() {
  // parametres modifiables :
  const startCardsNb = 5; // nb de cartes en main au 1er tour (5 par défaut)
  const startLife = [3, 3, 3, 3]; // points de vie en début de partie (3 chacun par défaut)

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

  const [life, setLife] = useState(Array(startPlayersNb).fill(3)); // vies restantes
  const [bids, setBids] = useState(Array(startPlayersNb).fill(null)); // mises
  const [tricks, setTricks] = useState(Array(startPlayersNb).fill(0)); // plis gagnés
  const [cards, setCards] = useState(null); // cartes en main
  const [elimTurn, setElimTurn] = useState(Array(startPlayersNb).fill(null)); // tour élimination

  const [history, setHistory] = useState(null); // historique à afficher
  const [step, setStep] = useState("startGame"); // étape du jeu (state machine)

  let cardsNb = 5 - ((round - 1 + (5 - startCardsNb)) % 5); // nombre de cartes en main pour cette manche

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

  useEffect(() => {
    switch (step) {
      // Début de la partie
      case "startGame":
        setLife(startLife);
        setDealer(Math.floor(Math.random() * startPlayersNb));
        setRound(1);
        setStep("distributeCards");
        break;

      // =============================================================================================

      // Distribution des cartes
      case "distributeCards":
        const newDealer = nextAlivePlayer(dealer);
        setDealer(newDealer);
        setHistory(
          `${names[newDealer]} distribue${z(newDealer)} ${cardsNb} cartes par personne`
        );
        setCardsPlayed(Array(startPlayersNb).fill(null));
        setTricks(Array(startPlayersNb).fill(0));
        setFirstPlayer(nextAlivePlayer(newDealer));
        setPlayer(nextAlivePlayer(newDealer));
        setBids(Array(startPlayersNb).fill(null));
        const deck = Array.from({ length: 21 }, (_, index) => index + 1);
        // on rajoute l'excuse sauf dans le tour à 1 carte
        if (cardsNb > 1) {
          deck.push(23);
        }
        const playersCards = Array(startPlayersNb).fill(null);
        for (let i = 0; i < startPlayersNb; i++) {
          if (life[i] > 0) {
            const playerCards = [];
            for (let j = 0; j < cardsNb; j++) {
              const index = Math.floor(Math.random() * deck.length);
              playerCards.push(deck[index]);
              deck.splice(index, 1);
            }
            playerCards.sort((a, b) => a - b);
            playersCards[i] = playerCards;
          }
        }
        setCards(playersCards);
        setStep("playerBid");
        break;

      // =============================================================================================

      // Un joueur choisit son annonce
      case "playerBid":
        // si fin des annonces -> début 1er pli
        if (player === firstPlayer && bids[player] != null) {
          setStep("playerPlay");
          return;

          // si PJ doit parler -> on ne fait rien
        } else if (player === 0) {
          setAskBid(true);
          const myPlayTimeout = setTimeout(() => {
            setHistory("A vous de parler");
          }, 2000);
          return () => clearTimeout(myPlayTimeout);

          // si joueur est mort -> on passe au suivant
        } else if (life[player] <= 0) {
          setPlayer((p) => nextAlivePlayer(p));
          return;

          // cas classique : le bot choisit son annonce
        } else {
          const bidTimeout = setTimeout(() => {
            const totalCards = cardsNb * life.filter((l) => l > 0).length;
            // on calcule une valeur seuil
            // toute carte supérieure à cette valeur est considérée comme gagnante
            const threshold = 10.5 + totalCards * 0.35;

            let bid = cards[player].filter((c) => c >= threshold).length;
            // si dernier à parler -> on modifie la valeur de son annonce pour respecter la contrainte
            // le total des annonces ne doit pas etre egal au nombre de cartes en main
            if (
              player === dealer &&
              sumArray(bids) + bid === cardsNb &&
              cardsNb !== 1
            ) {
              bid === 0 ? bid++ : bid--;
            }
            const theBids = [...bids];
            theBids[player] = bid;
            setBids(theBids);
            setHistory(`${names[player]} annonce ${bid} pli${s(bid)}`);
            setPlayer((p) => nextAlivePlayer(p));
          }, 2000);
          return () => clearTimeout(bidTimeout);
        }
        break;

      // =============================================================================================

      // Un joueur choisit la carte à jouer
      case "playerPlay":
        // si fin du pli -> déterminer le gagnant
        if (player === firstPlayer && cardsPlayed[player] != null) {
          setStep("finishTrick");
          return;

          // si PJ doit jouer -> on ne fait rien
        } else if (player === 0) {
          setTimeout(() => {
            setHistory("A vous de jouer");
            return;
          }, 2000);

          // si joueur est mort -> on passe au suivant
        } else if (life[player] <= 0) {
          setPlayer((p) => nextAlivePlayer(p));
          return;

          // si aucun de ces cas -> le bot choisit une carte à jouer
        } else {
          const playTimeout = setTimeout(() => {
            let cardIndex;
            let cardPlayed;
            let biggestCardOnBoard = Math.max(...cardsPlayed, 0);
            let needsToScore = tricks[player] < bids[player];
            let isLastPlayer = nextAlivePlayer(player) === firstPlayer;
            let canWinTrick = cards[player].at(-1) > biggestCardOnBoard;

            if (!needsToScore) {
              // pas de pli à faire -> joue sa plus grande carte perdante
              cardIndex = cards[player].findLastIndex(
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
              if (isLastPlayer && canWinTrick) {
                // dernier joueur et peut gagner
                if (bids[player] - tricks[player] >= 2) {
                  // doit faire plus d'un pli -> plus petite carte gagnante
                  cardIndex = cards[player].findIndex(
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

            let newCardsPlayed = [...cardsPlayed];
            newCardsPlayed[player] = cardPlayed;
            setCardsPlayed(newCardsPlayed);

            let newCards = [...cards];
            newCards[player] = [...newCards[player]];
            newCards[player].splice(cardIndex, 1);
            setCards(newCards);

            setHistory(`${names[player]} joue ${cardPlayed}`);
            setPlayer((p) => nextAlivePlayer(p));
          }, 2000);
          return () => clearTimeout(playTimeout);
        }
        break;

      // =============================================================================================

      // Fin du pli
      case "finishTrick":
        let winner = cardsPlayed.indexOf(Math.max(...cardsPlayed));
        let theTricks = [...tricks];
        theTricks[winner]++;
        setTricks(theTricks);
        setTimeout(() => {
          setHistory(`${names[winner]} gagne${z(winner)} le pli`);
          if (cards[0].length === 0) {
            setStep("finishRound");
          } else {
            setCardsPlayed(Array(startPlayersNb).fill(null));
            setFirstPlayer(winner);
            setPlayer(winner);
            setStep("playerPlay");
          }
        }, 2000);
        break;

      // =============================================================================================

      // Fin de la manche
      case "finishRound":
        const theLife = [...life];
        const theElimTurn = [...elimTurn];
        let infoText = "Fin de la manche";
        for (let i = 0; i < startPlayersNb; i++) {
          if (life[i] > 0) {
            let damage = Math.abs(bids[i] - tricks[i]);
            if (damage > 0) {
              infoText += `\n${names[i]} perd${ez(i)} ${damage} vie${s(damage)}`;
              theLife[i] = Math.max(theLife[i] - damage, 0);
              if (theLife[i] === 0) {
                theElimTurn[i] = round;
                setElimTurn(theElimTurn);
                infoText +=
                  i === 0 ? ", vous êtes éliminé" : ", il est éliminé";
              }
            }
          }
        }
        setHistory(infoText);
        setLife(theLife);
        const finishRoundTimeout = setTimeout(() => {
          if (theLife[0] === 0) {
            setScore({ names, life: theLife, elimTurn: theElimTurn });
            navigate("/score");
          } else if (theLife.filter((item) => item > 0).length === 1) {
            setScore({ names, life: theLife, elimTurn: theElimTurn });
            navigate("/score");
          } else {
            setRound(round + 1);
            setStep("distributeCards");
          }
        }, 5000);
        return () => clearTimeout(finishRoundTimeout);
        break;

      // =============================================================================================

      default:
        console.log(`Mauvaise valeur step : ${step}`);
        break;
    }
  }, [step, player]);

  // ==================================================================================================
  // ==================================================================================================

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

  const handleBidClick = (myBid) => {
    setAskBid(false);
    let theBids = [...bids];
    theBids[0] = myBid;
    setBids(theBids);
    setHistory(`Vous annoncez ${myBid} pli${s(myBid)}`);
    setPlayer((p) => nextAlivePlayer(p));
  };

  const handleCardClick = (value) => {
    if (value === 23) {
      setAskFool(true);
    } else {
      playMyCard(value);
    }
  };

  const handleFoolClick = (value) => {
    playMyCard(value);
  };

  const playMyCard = (myCard) => {
    setAskFool(false);
    let theCardsPlayed = [...cardsPlayed];
    theCardsPlayed[0] = myCard;
    setCardsPlayed(theCardsPlayed);

    let newCards = [...cards];
    newCards[0] = [...newCards[0]];
    newCards[0].splice(cards[0].indexOf(myCard), 1);
    setCards(newCards);

    setHistory(`Vous jouez ${myCard}`);
    setPlayer((p) => nextAlivePlayer(p));
  };

  // terminaison des mots
  const s = (value) => (value > 1 ? "s" : "");
  const z = (playerId) => (playerId === 0 ? "z" : "");
  const ez = (playerId) => (playerId === 0 ? "ez" : "");

  return (
    <>
      <div className="info">
        <button onClick={() => navigate("/")}>🏠 Menu</button>
        <div>
          Manche {round} ({cardsNb}🃏)
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

            {history && (
              <div className="history">
                <div>{history}</div>
              </div>
            )}

            {askBid && (
              <div className="modal-back">
                <div className="modal">
                  <h3>Votre mise</h3>
                  {Array.from({ length: cardsNb + 1 }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => handleBidClick(index)}
                      disabled={
                        dealer === 0 &&
                        sumArray(bids) + index === cardsNb &&
                        cardsNb !== 1
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
                    <button key={val} onClick={() => handleFoolClick(val)}>
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

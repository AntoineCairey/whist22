import { useState, useEffect } from "react";
import { useImmer } from "use-immer";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { produce } from "immer";

export default function Game() {
  const navigate = useNavigate();
  const startPlayersNb = 4;

  const playerStatus = {
    id: 0,
    name: "Vous",
    life: null,
    bid: null,
    tricks: null,
    cards: [],
    elimTurn: null,
  };
  const names = ["Vous", "Bot 1", "Bot 2", "Bot 3"];
  const startStatus = names.map((n, index) => ({
    ...playerStatus,
    id: index,
    name: n,
  }));

  const [status, setStatus] = useImmer(startStatus); // statut joueurs
  const [cardsPlayed, setCardsPlayed] = useImmer(
    Array(startPlayersNb).fill(null)
  ); // cartes jouées

  const [round, setRound] = useState(1); // numero de la manche
  const [dealer, setDealer] = useState(null); // donneur
  const [askBid, setAskBid] = useState(false); // demander mise ?
  const [firstPlayer, setFirstPlayer] = useState(null); // 1er joueur du pli
  const [loading, setLoading] = useState(0);
  //statut du pli (0 = avant le 1er pli, 1 = avant que le PJ joue, 2 = après que le PJ ait joué)
  const [player, setPlayer] = useState(null); //joueur actuel

  //const [bids, setBids] = useState(Array(startPlayersNb).fill(null)); // mises 💀
  //const [tricks, setTricks] = useState(Array(startPlayersNb).fill(0)); // plis gagnés 💀
  const [life, setLife] = useState(Array(startPlayersNb).fill(2)); // vies restantes 💀
  const [cards, setCards] = useState(null); // cartes en main 💀

  // fonction qui s'exécute à chaque tour (chaque fois que player change)
  // fait jouer une nouvelle carte au bot dont c'est le tour puis passe au suivant
  // si fin de pli, détermine le gagnant
  useEffect(() => {
    console.log("loading " + loading);
    console.log("player " + player);
    if (loading === 0 || (loading === 1 && player === 0)) {
      return;
    }
    if (loading === 2 && player === firstPlayer) {
      console.log("coucou");
      determineWinner(cardsPlayed);
      return;
    }
    const id = setInterval(() => {
      console.log("test" + player);
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      setCardsPlayed((draft) => {
        draft[player] = cards[player][cardIndex];
      });

      /* let newCardsPlayed = [...cardsPlayed];
      newCardsPlayed[player] = cards[player][cardIndex];
      setCardsPlayed(newCardsPlayed); */
      // cards[player].splice(cardIndex, 1);
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

  const otherPlayers = Array.from(
    { length: startPlayersNb - 1 },
    (_, index) => index + 1
  ); // itérable avec les numéros des bots
  let cardsNb = 5 - ((round - 1) % 5); // nombre de cartes en main pour cette manche

  let players = status
    .filter((player) => player.life > 0)
    .map((player) => player.id); // liste des joueurs en vie
  /* let players = life
    .map((value, index) => (value > 0 ? index : -1))
    .filter((value) => value >= 0); */
  let playersNb = players.length; // nombre de joueurs en vie

  const nextPlayer = (currentPlayer) => {
    return currentPlayer === playersNb - 1 ? 0 : currentPlayer + 1;
  };

  const startGame = () => {
    console.log("startGame");
    setStatus((draft) => {
      draft.forEach((p) => {
        p.life = 3;
      });
    });
    let newDealer = Math.floor(Math.random() * startPlayersNb);
    setDealer(newDealer);
    setRound(1);
    distributeCards(newDealer, 5);
  };

  //s'exécute 1 fois, quand le jeu commence
  useEffect(startGame, []);

  const distributeCards = (theDealer, theCardsNb) => {
    setCardsPlayed(Array(playersNb).fill(null));
    setStatus((draft) => {
      draft.forEach((p) => {
        p.tricks = 0;
      });
    });
    //setTricks(Array(playersNb).fill(0));
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
    console.log("startBids");
    console.log("dealer : " + dealer);
    let bidder = theFirstPlayer;
    while (bidder !== 0) {
      console.log("bidder : " + bidder);
      const theBidder = bidder;
      setStatus((draft) => {
        draft[theBidder].bid = Math.floor(Math.random() * 3);
      });
      bidder = nextPlayer(bidder);
    }
    setAskBid(true);
  };

  const finishBids = (myBid) => {
    console.log("finishBids");
    setAskBid(false);
    setStatus((draft) => {
      draft[0].bid = myBid;
    });
    let bidder = 1;
    while (bidder !== firstPlayer) {
      const theBidder = bidder;
      // faire une vraie fonction chooseBid
      setStatus((draft) => {
        draft[theBidder].bid = Math.floor(Math.random() * 3);
      });
      bidder = nextPlayer(bidder);
    }
    startTrick(firstPlayer);
  };

  const startTrick = (theFirstPlayer) => {
    setCardsPlayed(Array(playersNb).fill(null));
    setFirstPlayer(theFirstPlayer);
    setPlayer(theFirstPlayer);
    setLoading(1);
  };

  const finishTrick = (myCard) => {
    setCardsPlayed((draft) => {
      draft[0] = myCard;
    });
    /* let theCardsPlayed = [...cardsPlayed];
    theCardsPlayed[0] = myCard;
    setCardsPlayed(theCardsPlayed); */

    //cards[0].splice(cards[0].indexOf(myCard), 1);
    let newCards = [...cards];
    newCards[0] = [...newCards[0]];
    newCards[0].splice(cards[0].indexOf(myCard), 1);
    setCards(newCards);

    setPlayer(1);
    setLoading(2);
  };

  const determineWinner = (theCardsPlayed) => {
    console.log("coucou2");
    let winner = theCardsPlayed.indexOf(Math.max(...theCardsPlayed));
    const newStatus = produce((draft) => {
      draft[winner].tricks++;
    });
    setStatus(newStatus);
    /* let theTricks = [...tricks];
    theTricks[winner]++;
    setTricks(theTricks); */
    setTimeout(() => {
      if (cards[0].length === 0) {
        finishRound(newStatus);
      } else {
        startTrick(winner);
      }
    }, 3000);
  };

  const finishRound = (newStatus) => {
    /* let theLife = [...life];
    console.log(theLife); */
    for (let i = 0; i < playersNb; i++) {
      const damage = Math.abs(status[i].bid - newStatus[i].tricks);
      const newLife = Math.max(status[i].life - damage, 0);
      setStatus((draft) => {
        draft[i].life = newLife;
      });
      //theLife[players[i]] = Math.max(theLife[players[i]] - damage, 0);
      if (newLife === 0) {
        console.log(`${i} est éliminé`);
        if (i === 0) {
          console.log("vous avez perdu");
        }
      }
    }
    //console.log(theLife);
    //setLife(theLife);

    /////////////// CONTINUER MODIF LIFE ICI
    if (theLife.filter((item) => item > 0).length === 1) {
      console.log("vous avez gagné");
    } else if (theLife.filter((item) => item > 0).length === 0) {
      console.log("aucun gagnant");
    } else {
      let next = dealer;
      do {
        next = dealer === startPlayersNb - 1 ? 0 : dealer + 1;
      } while (theLife[next] === 0);
      setDealer(next);
      setRound(round + 1);
      let theCardsNb = 5 - (round % 5);
      distributeCards(next, theCardsNb);
    }
  };

  console.log("Dealer : " + dealer);
  //console.log(status[0].bid);

  return (
    <>
      <button onClick={() => navigate("/")}>Revenir au Menu</button>
      <h1>Tarot Africain</h1>
      {/* <button onClick={startGame}>Nouvelle partie</button> */}
      <br />
      {cards && (
        <>
          <div>Donneur : {dealer}</div>
          <div>Au tour de : {player}</div>
          <h3>Vous {dealer === 0 && "(D)"}</h3>
          <div className="scores">
            <div>Vies : {life && life[0]}</div>
            <div>Mise : {status[0].bid ?? "?"}</div>
            <div>Plis : {status[0].tricks}</div>
          </div>
          <div>
            {cards[0].map((card) => (
              <button
                className="card"
                key={card}
                onClick={() => finishTrick(card)}
              >
                {card}
              </button>
            ))}
            {/* Nouveau composant Card
            <Card
              isVisible={true}
              isClickable={true}
              value={23}
              handleCardClick={finishTrick}
            /> */}
          </div>
          {status.slice(1).map((player) => (
            <div key={player.id}>
              <h3>
                {player.name} {dealer === player.id && "(D)"}
              </h3>
              {players.includes(player.id) ? (
                <>
                  <div className="scores">
                    <div>Vies : {life && life[player.id]}</div>
                    <div>Mise : {player.bid ?? "?"}</div>
                    <div>Plis : {player.tricks}</div>
                  </div>
                  <div>
                    {cards[players.indexOf(player.id)].map((card) => (
                      <div className="card" key={card}>
                        {card}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div>Eliminé</div>
              )}
            </div>
          ))}
          {askBid && (
            <div>
              <h3>Votre mise ?</h3>
              {Array.from({ length: cardsNb + 1 }, (_, index) => (
                <button key={index} onClick={() => finishBids(index)}>
                  {index}
                </button>
              ))}
            </div>
          )}
          <h3>Cartes jouées</h3>
          <div>
            {cardsPlayed.map((card, index) => (
              <div className="card" key={index}>
                {card ?? "?"}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

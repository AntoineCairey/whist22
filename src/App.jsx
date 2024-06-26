import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const startPlayersNb = 4;
  const [round, setRound] = useState(1); // numero de la manche
  const [cards, setCards] = useState(null); // cartes en main
  const [dealer, setDealer] = useState(
    Math.floor(Math.random() * startPlayersNb)
  ); // donneur
  const [bids, setBids] = useState(Array(startPlayersNb).fill(null)); // mises
  const [askBid, setAskBid] = useState(false); // demander mise ?
  const [cardsPlayed, setCardsPlayed] = useState(
    Array(startPlayersNb).fill(null)
  ); // cartes jouées
  const [tricks, setTricks] = useState(Array(startPlayersNb).fill(0)); // plis gagnés
  const [firstPlayer, setFirstPlayer] = useState(null); // 1er joueur du pli
  const [life, setLife] = useState(Array(startPlayersNb).fill(2)); // vies restantes
  const [loading, setLoading] = useState(0);
  const [player, setPlayer] = useState(null);

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
      let theCardsPlayed = [...cardsPlayed];
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      theCardsPlayed[player] = cards[player][cardIndex];
      cards[player].splice(cardIndex, 1);
      setCardsPlayed(theCardsPlayed);
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

  let players = life
    .map((value, index) => (value > 0 ? index : -1))
    .filter((value) => value >= 0);
  let playersNb = players.length;

  const nextPlayer = (currentPlayer) => {
    return currentPlayer === playersNb - 1 ? 0 : currentPlayer + 1;
  };

  const distributeCards = (theDealer, theCardsNb) => {
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
    // let player = theFirstPlayer;
    // let theCardsPlayed = Array(playersNb).fill(null);

    setPlayer(theFirstPlayer);
    setLoading(1);

    /* while (player !== 0) {
      // faire une vraie fonction chooseCard
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      theCardsPlayed[player] = cards[player][cardIndex];
      cards[player].splice(cardIndex, 1); // je modifie un state sans passer par set..., c'est dangereux ?
      player = nextPlayer(player);
    }
    setCardsPlayed(theCardsPlayed); */
  };

  const finishTrick = (myCard) => {
    let theCardsPlayed = [...cardsPlayed];
    theCardsPlayed[0] = myCard;
    setCardsPlayed(theCardsPlayed);
    cards[0].splice(cards[0].indexOf(myCard), 1);
    setPlayer(1);
    setLoading(2);
    /* while (player !== firstPlayer) {
      // faire une vraie fonction chooseCard
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      theCardsPlayed[player] = cards[player][cardIndex];
      cards[player].splice(cardIndex, 1);
      player = nextPlayer(player);
    }
    setCardsPlayed(theCardsPlayed);
    determineWinner(theCardsPlayed); */
  };

  const determineWinner = (theCardsPlayed) => {
    console.log("coucou2");
    let winner = theCardsPlayed.indexOf(Math.max(...theCardsPlayed));
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
    let theLife = [...life];
    console.log(theLife);
    for (let i = 0; i < playersNb; i++) {
      let damage = Math.abs(bids[i] - theTricks[i]);
      theLife[players[i]] = Math.max(theLife[players[i]] - damage, 0);
      if (theLife[players[i]] === 0) {
        console.log(`${i} est éliminé`);
        if (i === 0) {
          console.log("vous avez perdu");
        }
      }
    }
    console.log(theLife);
    setLife(theLife);
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

  return (
    <>
      <h1>Tarot Africain</h1>
      <button onClick={() => distributeCards(dealer, cardsNb)}>
        Nouvelle partie
      </button>
      <br />
      <br />
      {cards && (
        <>
          <div>Donneur : {dealer}</div>
          <h3>Vous {dealer === 0 && "(D)"}</h3>
          <div className="scores">
            <div>Vies : {life && life[0]}</div>
            <div>Mise : {bids[0] ?? "?"}</div>
            <div>Plis : {tricks && tricks[0]}</div>
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
          </div>
          {otherPlayers.map((player) => (
            <div key={player}>
              <h3>
                Bot {player} {dealer === player && "(D)"}
              </h3>
              {players.includes(player) ? (
                <>
                  <div className="scores">
                    <div>Vies : {life && life[player]}</div>
                    <div>Mise : {bids[players.indexOf(player)] ?? "?"}</div>
                    <div>
                      Plis : {tricks && tricks[players.indexOf(player)]}
                    </div>
                  </div>
                  <div>
                    {cards[players.indexOf(player)].map((card) => (
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

export default App;

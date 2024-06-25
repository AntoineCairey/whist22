import { useState } from "react";
import "./App.css";

function App() {
  const playersNb = 4;
  const [round, setRound] = useState(1); // numero du round
  const [cards, setCards] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [bids, setBids] = useState(Array(playersNb).fill(null));
  const [askBid, setAskBid] = useState(false);
  const [cardsPlayed, setCardsPlayed] = useState(Array(playersNb).fill(null));
  const [tricks, setTricks] = useState(Array(playersNb).fill(0));
  const [firstPlayer, setFirstPlayer] = useState(null);
  const [life, setLife] = useState(Array(playersNb).fill(5));

  const otherPlayers = Array.from(
    { length: playersNb - 1 },
    (_, index) => index + 1
  );
  let cardsNb = 5 - ((round - 1) % 5);

  const nextPlayer = (currentPlayer) => {
    return currentPlayer === playersNb - 1 ? 0 : currentPlayer + 1;
  };

  const distributeCards = () => {
    setCardsPlayed(Array(playersNb).fill(null));
    setTricks(Array(playersNb).fill(0));
    const theDealer = Math.floor(Math.random() * playersNb);
    setDealer(theDealer);
    setFirstPlayer(nextPlayer(theDealer));
    const deck = Array.from({ length: 22 }, (_, index) => index + 1);
    let playersCards = [];
    for (let i = 0; i < playersNb; i++) {
      let playerCards = [];
      for (let j = 0; j < cardsNb; j++) {
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
    setFirstPlayer(theFirstPlayer);
    let player = theFirstPlayer;
    let theCardsPlayed = Array(playersNb).fill(null);
    while (player !== 0) {
      // faire une vraie fonction chooseCard
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      theCardsPlayed[player] = cards[player][cardIndex];
      cards[player].splice(cardIndex, 1); // je modifie un state sans passer par set..., c'est dangereux ?
      player = nextPlayer(player);
    }
    setCardsPlayed(theCardsPlayed);
  };

  const finishTrick = (myCard) => {
    console.log("coucou");
    let theCardsPlayed = [...cardsPlayed];
    theCardsPlayed[0] = myCard;
    cards[0].splice(cards[0].indexOf(myCard), 1);
    let player = 1;
    while (player !== firstPlayer) {
      // faire une vraie fonction chooseCard
      const cardIndex = Math.floor(Math.random() * cards[player].length);
      theCardsPlayed[player] = cards[player][cardIndex];
      cards[player].splice(cardIndex, 1); // je modifie un state sans passer par set..., c'est dangereux ?
      player = nextPlayer(player);
    }
    setCardsPlayed(theCardsPlayed);
    determineWinner(theCardsPlayed);
  };

  const determineWinner = (theCardsPlayed) => {
    let winner = theCardsPlayed.indexOf(Math.max(...theCardsPlayed));
    console.log(winner);
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
    for (let i = 0; i < playersNb; i++) {
      let damage = Math.abs(bids[i] - theTricks[i])
      
    }
  };

  // finish round -> remove points accordingly, check if someone is eliminated, check if someone won
  // if not, start another round (distrib cards, bid and play)

  // eliminate player -> change players nb, be careful not to switch players

  return (
    <>
      <h1>Tarot Africain</h1>
      <button onClick={distributeCards}>Nouvelle partie</button>
      <br />
      <br />
      {cards && (
        <>
          <div>Donneur : {dealer}</div>
          <h3>Vous</h3>
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
              <h3>Bot {player}</h3>
              <div className="scores">
                <div>Vies : {life && life[player]}</div>
                <div>Mise : {bids[player] ?? "?"}</div>
                <div>Plis : {tricks && tricks[player]}</div>
              </div>
              <div>
                {cards[player].map((card) => (
                  <div className="card" key={card}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {askBid && (
            <div>
              <h3>Votre mise ?</h3>
              {Array.from({ length: 6 }, (_, index) => (
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

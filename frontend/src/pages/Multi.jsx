import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Card";

export default function Multi() {
  let gameData = {
    roomId: "abc123",
    round: 1,
    cardsNb: 5,
    step: "startGame",
    activePlayer: 1, // index du joueur actif
    dealer: 0, // id du donneur
    board: [null, null, null, null], // null si pas encore joué ou éliminé
    previousTrick: [],
    players: [
      {
        index: 0, // nécessaire ?
        id: 1234, // null si bot ?
        name: "J1",
        health: 3,
        bid: null,
        tricks: null,
        hand: [3, 7, 12, 15, 19],
        elimTurn: null, // null si joueur en vie
      },
      {
        index: 1,
        id: 5678,
        name: "J2",
        health: 3,
        bid: null,
        tricks: null,
        hand: [3, 7, 12, 15, 19],
        elimTurn: null,
      },
      {
        index: 2,
        id: null,
        name: "B1",
        health: 3,
        bid: null,
        tricks: null,
        hand: [3, 7, 12, 15, 19],
        elimTurn: null,
      },
      {
        index: 3,
        id: null,
        name: "B2",
        health: 3,
        bid: null,
        tricks: null,
        hand: [3, 7, 12, 15, 19],
        elimTurn: null,
      },
    ],
  };

  const [game, setGame] = useState(gameData);
  const [askBid, setAskBid] = useState(false);
  const [askFool, setAskFool] = useState(false);

  const { user, getUserInfos } = useContext(AuthContext);
  const navigate = useNavigate();

  const position = ["bottom", "left", "top", "right"];
  const playSteps = ["playerPlay", "finishTrick", "finishRound"];

  /*   useEffect(() => {
    socket.on("gameUpdate", (gameData) => setGame(gameData));
    return () => socket.off("gameUpdate")
  }, []); */

  const sumArray = (arr) => {
    return arr.reduce((acc, curr) => acc + curr, 0);
  };

  const handleBidClick = (myBid) => {};
  const handleCardClick = (myCard) => {};
  const handleFoolClick = (myCard) => {};

  return (
    <>
      <div className="info">
        <button onClick={() => navigate("/")}>⬅️ Quitter</button>
        <div>
          Manche {game.round} ({game.cardsNb}🃏)
        </div>
      </div>
      <div className="game">
        {true && (
          <>
            {Array.from({ length: 4 }, (_, id) => (
              <div key={id} className={`player ${position[id]}`}>
                {game.players[id].health > 0 ? (
                  <>
                    <div
                      className={`scores${game.activePlayer === id ? " active-player" : ""}`}
                    >
                      <strong>
                        {game.players[id].name} {game.dealer === id && "♟️"}
                      </strong>
                      <div>{game.players[id].health} ❤️</div>
                      <div>
                        {playSteps.includes(game.step) &&
                          `${game.players[id].tricks} 🃏 / `}
                        {game.players[id].bid ?? "?"} 📣
                      </div>
                    </div>
                    <div className={`hand ${position[id]}`}>
                      {game.players[id].hand.map((card) => (
                        <Card
                          key={card}
                          isHorizontal={id === 1 || id === 3}
                          isVisible={(id === 0) !== (game.cardsNb === 1)}
                          isClickable={id === 0 && game.activePlayer === 0}
                          value={card}
                          handleCardClick={handleCardClick}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{game.players[id].name}</strong>
                    <div>Eliminé tour {game.players[id].elimTurn}</div>
                  </>
                )}
              </div>
            ))}

            <div className="board">
              {game.board.map(
                (card, index) =>
                  card != null && (
                    <div className={position[index]} key={index}>
                      <Card isVisible={true} isClickable={false} value={card} />
                    </div>
                  )
              )}
            </div>

            {/* {history && (
              <div className="history">
                <div>{history}</div>
              </div>
            )} */}

            {askBid && (
              <div className="modal-back">
                <div className="modal">
                  <h3>Votre mise</h3>
                  <div className="buttons">
                    {Array.from({ length: game.cardsNb + 1 }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => handleBidClick(index)}
                        disabled={
                          game.dealer === 0 &&
                          sumArray(game.players.map((p) => p.bid)) + index ===
                            game.cardsNb &&
                          game.cardsNb !== 1
                        }
                      >
                        <div>{index}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {askFool && (
              <div className="modal-back" onClick={() => setAskFool(false)}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <h3>Valeur de l'excuse</h3>
                  <div className="buttons">
                    {[0, 22].map((val) => (
                      <button key={val} onClick={() => handleFoolClick(val)}>
                        <div>{val}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

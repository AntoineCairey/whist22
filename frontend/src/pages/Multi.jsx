import { useContext, useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Card from "../components/Card";
import { useSocket } from "../context/SocketContext";

export default function Multi() {
  /*   let gameData = {
    roomId: "abc123",
    round: 1,
    cardsNb: 5,
    step: "startGame",
    activePlayerIndex: 1, // index du joueur actif
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
  }; */

  //let game = useLoaderData();
  const [game, setGame] = useState(useLoaderData());
  const [askBid, setAskBid] = useState(false);
  const [askFool, setAskFool] = useState(false);

  const socket = useSocket();
  const { user, getUserInfos } = useContext(AuthContext);
  const navigate = useNavigate();

  const position = ["bottom", "left", "top", "right"];
  const playSteps = ["playerPlay", "finishTrick", "finishRound"];

  const myIndex = game?.players.findIndex((p) => p.id === user?._id);
  const offset = (index) => (index - myIndex + 4) % 4;

  const showBid =
    game?.activePlayerIndex === myIndex &&
    game?.step === "playerBid" &&
    game?.players[myIndex].bid == null;

  useEffect(() => {
    if (!socket) return;
    socket.on("gameUpdate", (gameData) => {
      setGame(gameData);
      console.log(gameData);
    });
    socket.on("endOfGame", async () => {
      await getUserInfos();
      navigate("/score-multi");
    });
    return () => socket.off("gameUpdate");
  }, [socket]);

  const sumArray = (arr) => {
    return arr.reduce((acc, curr) => acc + curr, 0);
  };

  const handleBidClick = (myBid) => {
    const bidData = {
      roomId: game.roomId,
      userIndex: myIndex,
      userBid: myBid,
    };
    console.log(bidData);
    socket.emit("playerBid", bidData);
  };

  const handleCardClick = (myCard) => {
    console.log("cardClick");
    if (myCard === 23) {
      setAskFool(true);
    } else {
      playMyCard(myCard);
    }
  };
  const handleFoolClick = (myCard) => {
    playMyCard(myCard);
  };

  const playMyCard = (myCard) => {
    setAskFool(false);
    const cardData = {
      roomId: game.roomId,
      userIndex: myIndex,
      userCard: myCard,
    };
    console.log(cardData);
    socket.emit("playerPlay", cardData);
  };

  console.log(game);

  return !game ? (
    <div>Loading</div>
  ) : (
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
            {game.players.map((player, index) => (
              <div
                key={offset(index)}
                className={`player ${position[offset(index)]}`}
              >
                {player.health > 0 ? (
                  <>
                    <div
                      className={`scores${game.activePlayerIndex === index ? " active-player" : ""}`}
                    >
                      <strong>
                        {player.name} #{index} {game.dealer === index && "♟️"}
                      </strong>
                      <div>{player.health} ❤️</div>
                      <div>
                        {playSteps.includes(game.step) &&
                          `${player.tricks} 🃏 / `}
                        {player.bid ?? "?"} 📣
                      </div>
                    </div>
                    <div className={`hand ${position[offset(index)]}`}>
                      {player.hand.map((card) => (
                        <Card
                          key={card}
                          isHorizontal={
                            offset(index) === 1 || offset(index) === 3
                          }
                          isVisible={
                            (index === myIndex) !== (game.cardsNb === 1)
                          }
                          isClickable={
                            index === myIndex &&
                            game.activePlayerIndex === myIndex &&
                            game.step === "playerPlay"
                          }
                          value={card}
                          handleCardClick={handleCardClick}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <strong>{player.name}</strong>
                    <div>Eliminé tour {player.elimTurn}</div>
                  </>
                )}
              </div>
            ))}

            <div className="board">
              {game.board.map(
                (card, index) =>
                  card != null && (
                    <div
                      className={position[offset(index)]}
                      key={offset(index)}
                    >
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

            {showBid && (
              <div className="modal-back">
                <div className="modal">
                  <h3>Votre mise</h3>
                  <div className="buttons">
                    {Array.from({ length: game.cardsNb + 1 }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => handleBidClick(index)}
                        disabled={
                          game.dealer === myIndex &&
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

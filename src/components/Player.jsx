import Card from "./Card";

export default function Player({ id, gameData, handleCardClick }) {
  //console.log(gameData);
  const {
    names,
    dealer,
    player,
    life,
    bids,
    tricks,
    cards,
    elimTurn,
    cardsNb,
  } = gameData;

  const position = ["bottom", "left", "top", "right"];

  return (
    <div className={`player ${position[id]}`}>
      {life[id] > 0 ? (
        <>
          <div className={`scores${player === id ? " active-player" : ""}`}>
            <strong>
              {names[id]} {dealer === id && "♟️"}
            </strong>
            <div>{life && life[id]} ❤️</div>
            {/* <div>Mise : {bids[id] ?? "?"}</div> */}
            <div>
              {tricks && tricks[id]} / {bids[id] ?? "?"} 🃏
            </div>
          </div>
          <div className={`hand ${position[id]}`}>
            {cards[id].map((card) => (
              <Card
                key={card}
                isHorizontal={id === 1 || id === 3}
                isVisible={/* (id === 0) !== (cardsNb === 1) */ true}
                isClickable={id === 0 && player === 0}
                value={card}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <strong>{names[id]}</strong>
          <div>Eliminé tour {elimTurn[id]}</div>
        </>
      )}
    </div>
  );
}

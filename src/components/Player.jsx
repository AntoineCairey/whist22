import Card from "./Card";

export default function Player({ id, gameData, handleCardClick }) {
  //console.log(gameData);
  const {
    names,
    players,
    dealer,
    player,
    life,
    bids,
    tricks,
    cards,
    elimTurn,
  } = gameData;

  const position = ["bottom", "left", "top", "right"];

  return (
    <div className={`player ${position[id]}`}>
      {players.includes(id) ? (
        <>
          <div className="scores">
            <h3 className={players[player] === id ? "active-player" : ""}>
              {names[id]} {dealer === id && "(D)"}
            </h3>
            <div>Vies : {life && life[id]}</div>
            <div>Mise : {bids[players.indexOf(id)] ?? "?"}</div>
            <div>Plis : {tricks && tricks[players.indexOf(id)]}</div>
          </div>
          <div className={`hand ${position[id]}`}>
            {cards[players.indexOf(id)].map((card) => (
              <Card
                key={card}
                isHorizontal={id === 1 || id === 3}
                isVisible={true}
                isClickable={id === 0 && player === 0}
                value={card}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <h3 className={players[player] === id ? "active-player" : ""}>
            {names[id]} {dealer === id && "(D)"}
          </h3>
          <div>Eliminé tour {elimTurn[id]}</div>
        </>
      )}
    </div>
  );
}

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

  return (
    <div>
      <h3 className={players[player] === id ? "active-player" : ""}>
        {names[id]} {dealer === id && "(D)"}
      </h3>
      {players.includes(id) ? (
        <>
          <div className="scores">
            <div>Vies : {life && life[id]}</div>
            <div>Mise : {bids[players.indexOf(id)] ?? "?"}</div>
            <div>Plis : {tricks && tricks[players.indexOf(id)]}</div>
          </div>
          <div>
            {cards[players.indexOf(id)].map((card) => (
              <Card
                key={card}
                isVisible={true}
                isClickable={id === 0 && player === 0}
                value={card}
                handleCardClick={handleCardClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div>Eliminé tour {elimTurn[id]}</div>
      )}
    </div>
  );
}

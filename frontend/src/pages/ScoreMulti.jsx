import { useLoaderData, useNavigate, useOutletContext } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export default function ScoreMulti() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const game = useLoaderData();
  console.log(game);
  console.log(user);

  /* const combined = names.map((name, i) => ({
    name: name,
    life: life[i],
    elimTurn: elimTurn[i],
  }));
  combined.sort((a, b) => b.elimTurn - a.elimTurn);
  combined.sort((a, b) => b.life - a.life);

  const { isVictory, basePoints, bonusPoints, totalPoints, lifeLeft } =
    computePoints(life); */

  return game ? (
    <>
      <h1>Vous avez {game.isVictory ? "gagné 😎" : "perdu 😞"}</h1>
      {/* <table>
        <tbody>
          {combined.map((player, i) => (
            <tr key={i}>
              <td>{player.name}</td>
              <td>
                {player.life > 0
                  ? `${player.life} ❤️`
                  : `💀 tour ${player.elimTurn}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table> */}
      {user && (
        <>
          <br />
          <h2>
            {game.isVictory
              ? `Vous gagnez ${game.points} points 📈`
              : `Vous perdez ${-game.points} points 📉`}
          </h2>
          {/* <table>
            <tbody>
              <tr>
                <td>{isVictory ? "Victoire" : "Défaite"}</td>
                <td>{basePoints} pts</td>
              </tr>
              <tr>
                <td>
                  Vies {isVictory ? "" : "adverses "}restantes ({lifeLeft})
                </td>
                <td>{bonusPoints} pts</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>{basePoints + bonusPoints} pts</td>
              </tr>
            </tbody>
          </table> */}
          <h3>Nouveau score général : {user?.points ?? 0} points</h3>
        </>
      )}
      <br />
      <button onClick={() => navigate("/")}>🏠 Menu</button>
    </>
  ) : (
    <>
      <br />
      <div>Pas de score</div>
      <br />
      <button onClick={() => navigate("/")}>🏠 Menu</button>
    </>
  );
}

import { useNavigate, useOutletContext } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import computePoints from "../services/scoreService";

export default function Score() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { score } = useOutletContext();
  const { names, life, elimTurn } = score || {};

  // fausses données pour tester
  /* const names = ["Vous", "Bot 1", "Bot 2", "Bot 3"];
  const life = [2, 0, 0, 0];
  const elimTurn = [null, 3, 5, 4]; */

  const combined = names.map((name, i) => ({
    name: name,
    life: life[i],
    elimTurn: elimTurn[i],
  }));
  combined.sort((a, b) => b.elimTurn - a.elimTurn);
  combined.sort((a, b) => b.life - a.life);

  /* const isVictory = life[0] > 0;
  let basePoints, lifeLeft, bonusPoints;
  if (isVictory) {
    basePoints = 50;
    lifeLeft = life[0];
    bonusPoints = lifeLeft * 50;
  } else {
    basePoints = -20;
    lifeLeft = life[1] + life[2] + life[3];
    bonusPoints = lifeLeft * -10;
  }
  const totalPoints = basePoints + bonusPoints; */

  // const s = (value) => (value > 1 ? "s" : "");

  const { isVictory, basePoints, bonusPoints, totalPoints, lifeLeft } =
    computePoints(life);

  return life ? (
    <>
      <h1>Vous avez {isVictory ? "gagné 😎" : "perdu 😞"}</h1>
      <table>
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
      </table>
      {user && (
        <>
          <br />
          <h2>
            {isVictory
              ? `Vous gagnez ${totalPoints} points 📈`
              : `Vous perdez ${-totalPoints} points 📉`}
          </h2>
          <table>
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
          </table>
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

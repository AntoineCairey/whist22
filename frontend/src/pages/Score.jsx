import { useNavigate, useOutletContext } from "react-router-dom";

export default function Score() {
  const navigate = useNavigate();
  const { score } = useOutletContext();
  const { names, life, elimTurn } = score || {};

  // fausses données pour tester
  /* const names = ["Vous", "Bot 1", "Bot 2", "Bot 3"];
  const life = [0, 2, 0, 0];
  const elimTurn = [7, 3, 5, 7]; */

  const s = (value) => (value > 1 ? "s" : "");

  return life ? (
    <>
      <h1>Vous avez {life[0] > 0 ? "gagné 😎" : "perdu 😞"}</h1>
      <h2>Score final</h2>
      {names.map((name, i) => (
        <div key={i}>
          {life[i] > 0 ? "👑" : "💀"} {name} :
          {life[i] > 0
            ? ` ${life[i]} vie${s(life[i])} restante${s(life[i])}`
            : ` éliminé tour ${elimTurn[i]}`}
        </div>
      ))}
      <br />
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

import { useNavigate, useOutletContext } from "react-router-dom";

export default function Score() {
  const navigate = useNavigate();
  const { score } = useOutletContext();

  console.log(score);
  const { names, life, elimTurn } = score || {};

  return (
    score && (
      <>
        <h1>Vous avez {life[0] > 0 ? "gagné" : "perdu"}</h1>
        <div>Score final :</div>
        <br />
        {names.map((name, index) => (
          <div key={index}>
            {name} :
            {life[index] > 0
              ? ` ${life[index]} vie(s) restante(s)`
              : ` éliminé tour ${elimTurn[index]}`}
          </div>
        ))}
        <br />
        <button onClick={() => navigate("/")}>Revenir au Menu</button>
      </>
    )
  );
}

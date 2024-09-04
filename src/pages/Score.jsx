import { useNavigate, useOutletContext } from "react-router-dom";

function Score() {
  const navigate = useNavigate();
  const { score } = useOutletContext();

  score?.sort((a, b) => b.elimTurn - a.elimTurn);
  score?.sort((a, b) => b.life - a.life);

  return (
    score && (
      <>
        <h1>
          Vous avez {score.find((p) => p.id === 0).life > 0 ? "gagné" : "perdu"}
        </h1>
        <div>Score final :</div>
        <br />
        {score.map((p) => (
          <div key={p.id}>
            {p.name} :
            {p.life > 0
              ? ` ${p.life} vie(s) restante(s)`
              : ` éliminé tour ${p.elimTurn}`}
          </div>
        ))}
        <br />
        <button onClick={() => navigate("/")}>Revenir au Menu</button>
      </>
    )
  );
}
export default Score;

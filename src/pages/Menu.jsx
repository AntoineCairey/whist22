import { useNavigate, useOutletContext } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();

  /* const { setScore } = useOutletContext();
  const data = {
    names: ["Vous", "Bot 1", "Bot 2", "Bot 3"],
    life: [1, 0, 0, 0],
    elimTurn: [null, 6, 4, 3],
  }; */


  return (
    <>
      <h1>Tarot africain</h1>
      <div>Un jeu de cartes simple et passionnant</div>
      <div>Jouez contre 3 bots et tentez d'être le dernier en jeu</div>
      <br />
      <button onClick={() => navigate("/rules")}>Lire les règles</button>
      <br />
      <button onClick={() => navigate("/game")}>Jouer</button>
      
      {/* <br />
      <button
        onClick={() => {
          setScore(data);
          navigate("/score");
        }}
      >
        Score (test)
      </button> */}
    </>
  );
}

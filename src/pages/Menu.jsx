import { useNavigate, useOutletContext } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const { setScore } = useOutletContext();

  const data = {
    names: ["Vous", "Bot 1", "Bot 2", "Bot 3"],
    life: [1, 0, 0, 0],
    elimTurn: [null, 6, 4, 3],
  };

  return (
    <>
      <div>Menu</div>
      <button onClick={() => navigate("/game")}>Jouer</button>

      <button
        onClick={() => {
          setScore(data);
          navigate("/score");
        }}
      >
        Score (test)
      </button>
    </>
  );
}

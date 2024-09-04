import { useNavigate, useOutletContext } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const { setScore } = useOutletContext();

  const data = [
    {
      id: 0,
      name: "Vous",
      life: 0,
      elimTurn: 6,
    },
    {
      id: 1,
      name: "Bot1",
      life: 3,
      elimTurn: 3,
    },
    {
      id: 2,
      name: "Bot2",
      life: 2,
      elimTurn: 5,
    },
    {
      id: 3,
      name: "Bot3",
      life: 1,
      elimTurn: 7,
    },
  ];

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

import { useLoaderData, useNavigate } from "react-router-dom";

export default function Ranking() {
  const users = useLoaderData();
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate("/")}>⬅️ Retour</button>
      <h2>Classement général</h2>
      <ul>
        {users &&
          users.map((user) => (
            <li key={user._id}>
              {user.username} / {user.points} points / {user.numberOfGames} parties
            </li>
          ))}
      </ul>
    </>
  );
}

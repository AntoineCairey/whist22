import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLoaderData, useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const myGames = useLoaderData();
  const navigate = useNavigate();

  return (
    user && (
      <>
        <button onClick={() => navigate("/")}>⬅️ Retour</button>
        <h2>{user.username}</h2>
        <div>
          Créé le {new Date(user.creationDate).toLocaleDateString()}
        </div>
        <div>{user.email}</div>
        <div>{user.points} points</div>
        <div>{myGames.length} parties jouées</div>

        <h4>Parties précédentes</h4>
        <ul>
          {myGames &&
            myGames.map((game) => (
              <li key={game._id}>
                {new Date(game.creationDate).toLocaleString()} /{" "}
                {game.isVictory ? "Victoire" : "Défaite"} / {game.points} points
              </li>
            ))}
        </ul>
        <button onClick={logout}>Me déconnecter</button>
      </>
    )
  );
}

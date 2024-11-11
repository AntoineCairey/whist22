import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLoaderData } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const myGames = useLoaderData();

  return (
    user && (
      <>
        <button onClick={() => navigate("/")}>⬅️ Retour</button>
        <h2>{user.username}</h2>
        <div>{user.email}</div>

        <h4>Parties précédentes</h4>
        <ul>
          {myGames &&
            myGames.map((game) => (
              <li key={game._id}>
                {new Date(game.creationDate).toLocaleString()} -{" "}
                {game.isVictory === "true" ? "Victoire" : "Défaite"}
              </li>
            ))}
        </ul>
        <button onClick={logout}>Me déconnecter</button>
      </>
    )
  );
}

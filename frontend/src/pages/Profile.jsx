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
        <button className="back-button" onClick={() => navigate("/")}>
          ⬅️ Retour
        </button>
        <h2>Mon profil</h2>
        <div className="user-infos">
          <div>
            <strong>{user.username}</strong>
          </div>
          <br />
          <div>{user.email}</div>
          <div>créé le {new Date(user.creationDate).toLocaleDateString()}</div>
          <br />
          <div>{user.points} points</div>
          <div>{myGames.length} parties jouées</div>
          <br />
        </div>

        <h3>Parties précédentes</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Résultat</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {myGames &&
              myGames.map((game) => (
                <tr key={game._id}>
                  <td>{new Date(game.creationDate).toLocaleDateString()}</td>
                  <td>{game.isVictory ? "Victoire" : "Défaite"}</td>
                  <td>{game.points}</td>
                </tr>
              ))}
          </tbody>
        </table>

        <button onClick={logout}>❌ Me déconnecter</button>
      </>
    )
  );
}

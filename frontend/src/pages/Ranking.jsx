import { useLoaderData, useNavigate } from "react-router-dom";

export default function Ranking() {
  const users = useLoaderData();
  const navigate = useNavigate();

  return (
    <>
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Retour
      </button>
      <h2>Classement général</h2>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>Score</th>
            <th>Parties</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.points}</td>
                <td>{user.numberOfGames}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <br />
      <br />
      <div>
        <b>
          <i>
            Atteignez le sommet du classement et devenez le maître du tarot
            africain !
          </i>
        </b>
      </div>
      <br />
      <div>
        Chaque nouveau joueur commence avec 1000 points. Vous gagnez ou perdez
        des points en fonction des résultats de vos parties.
      </div>
    </>
  );
}

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LobbyInfo() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="lobby-info">
      <button onClick={() => navigate("/")}>⬅️ Retour</button>
      <h1>Compte utilisateur</h1>
      <br />
      <br />

      <div>
        Le jeu en ligne nécessite un compte utilisateur (ça prend 15 secondes
        promis)
      </div>
      <br />
      <button className="menu-button" onClick={() => navigate("/signup")}>
        🪪 Créer un compte
      </button>
      <br />
      <br />
      <br />
      <br />

      <div>Tu as déjà un compte ?</div>
      <br />
      <button className="menu-button" onClick={() => navigate("/login")}>
        🔑 Me connecter
      </button>
    </div>
  );
}

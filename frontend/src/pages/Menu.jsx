import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <>
      <img src="/joker-white.svg" alt="joker-icon" className="menu-icon" />
      <h1>Tarot africain</h1>
      <div>Un jeu de cartes simple et passionnant.</div>
      <div>Jouez contre 3 bots et tentez d'être le dernier en jeu.</div>

      {user ? (
        <button className="menu-button" onClick={() => navigate("/profile")}>
          Voir mon profil
        </button>
      ) : (
        <button className="menu-button" onClick={() => navigate("/login")}>
          Me connecter
        </button>
      )}
      <button className="menu-button" onClick={() => navigate("/game")}>
        🃏 Jouer
      </button>
      <button className="menu-button" onClick={() => navigate("/ranking")}>
        Classement général
      </button>
      <button className="menu-button" onClick={() => navigate("/rules")}>
        📖 Lire les règles
      </button>
    </>
  );
}

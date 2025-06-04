import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Menu() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="menu">
      <img src="/joker-white.svg" alt="joker-icon" className="menu-icon" />
      <h1>Tarot africain</h1>
      <div>Un jeu de cartes simple et passionnant.</div>
      <br />
      <div>Jouez contre 3 bots et tentez d'être le dernier en jeu. 🔥</div>
      <br />

      {navigator.onLine &&
        (user ? (
          <button className="menu-button" onClick={() => navigate("/profile")}>
            🪪 Mon profil
          </button>
        ) : (
          <button className="menu-button" onClick={() => navigate("/login")}>
            🔑 Me connecter
          </button>
        ))}

      <button className="menu-button" onClick={() => navigate("/game")}>
        🃏 Jouer contre des bots
      </button>

      {navigator.onLine && (
        <>
          <button className="menu-button" onClick={() => navigate("/lobby")}>
            🎮 Jouer en ligne
          </button>

          <button className="menu-button" onClick={() => navigate("/ranking")}>
            🏆 Classement général
          </button>
        </>
      )}

      <button className="menu-button" onClick={() => navigate("/rules")}>
        📖 Règles du jeu
      </button>

      {!navigator.onLine && (
        <>
          <br />
          <div>
            <i>Mode hors ligne</i>
          </div>
        </>
      )}
    </div>
  );
}

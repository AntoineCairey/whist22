import { useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <>
      <img src="/joker-white.svg" alt="joker-icon" className="menu-icon" />
      <h1>Tarot africain</h1>
      <div>Un jeu de cartes simple et passionnant.</div>
      <br />
      <div>Jouez contre 3 bots et tentez d'être le dernier en jeu.</div>
      <br />
      <button className="menu-button" onClick={() => navigate("/rules")}>📖 Lire les règles</button>
      <br />
      <button className="menu-button" onClick={() => navigate("/game")}>🃏 Jouer</button>
      <br />
    </>
  );
}

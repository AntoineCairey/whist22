import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const { setScore } = useOutletContext();

  const data = {
    names: ["Vous", "Bot 1", "Bot 2", "Bot 3"],
    life: [1, 0, 0, 0],
    elimTurn: [null, 6, 4, 3],
  };

  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <h1>Tarot africain</h1>
      <div>Un jeu de cartes simple et passionnant</div>
      <div>Jouez contre 3 bots et tentez d'être le dernier en jeu</div>
      <br />
      <button onClick={() => setShowRules(true)}>Apprendre à jouer</button>
      <br />
      <button onClick={() => navigate("/game")}>Jouer</button>
      <br />

      <button
        onClick={() => {
          setScore(data);
          navigate("/score");
        }}
      >
        Score (test)
      </button>

      {showRules && (
        <div className="rules">
          <h3>Règles du tarot africain</h3>
          <div>
            Au tarot africain, vous jouez contre des adversaires (3 ici). Vous commencez la partie avec 5 vies chacun. Si vous tombez à 0 vies, vous êtes éliminé. Votre but est d'être le dernier joueur en vie.
            
            Le jeu se joue avec les atouts d'un jeu de tarot français (1 à 21) et l'excuse. La partie se joue en manches successives. A chaque début de manche, chaque joueur doit estimer le nombre de plis qu'il va réaliser. On joue ensuite les différents plis. A la fin de la manche, on compare les plis réalisés par un joueur au nombre annoncé, et on retire la différence à son nombre de points de vies. S'il tombe à 0 vies, il est éliminé.
            
            La 1e manche se joue avec 5 cartes par personne, puis la 2e avec 4 cartes, puis la 3e à 3 cartes, etc. La manche à 1 carte est particulière : les joueurs ne voient pas leur propre carte, mais voient celle des autres joueurs. La manche suivante se fait avec 5 cartes par personne, puis 4, et ainsi de suite jusqu'à ce qu'il y ait un vainqueur.

            Dans un pli, chaque joueur joue une carte à tour de rôle, et la plus grande valeur remporte le pli. Il n'y a pas d'obligation de "monter", on peut jouer la carte de son choix. L'excuse est une carte particulière : au moment où il la pose, le joueur décide si elle vaut 0 ou 22.
          </div>
          <button onClick={() => setShowRules(false)}>Fermer</button>
        </div>
      )}
    </>
  );
}

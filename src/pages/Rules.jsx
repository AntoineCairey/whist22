import { useNavigate } from "react-router-dom";

export default function Rules() {
  const navigate = useNavigate();

  return (
    <div className="rules">
      <button onClick={() => navigate("/")}>🏠 Menu</button>
      <br />
      <br />

      <h3>Règles du tarot africain</h3>
      <div>
        <p>
          Au tarot africain, vous jouez contre des adversaires (3 ici). Vous
          commencez la partie avec 3 vies chacun. Si vous tombez à 0 vies, vous
          êtes éliminé. Votre but est d'être le dernier joueur en vie.
        </p>
        <p>
          Le jeu se joue avec les atouts d'un jeu de tarot français (1 à 21) et
          l'excuse. La partie se joue en manches successives. A chaque début de
          manche, chaque joueur doit estimer le nombre de plis qu'il va
          réaliser. On joue ensuite les différents plis. A la fin de la manche,
          on compare les plis réalisés par un joueur au nombre annoncé, et on
          retire la différence à son nombre de points de vies. S'il tombe à 0
          vies, il est éliminé.
        </p>
        <p>
          La 1e manche se joue avec 5 cartes par personne, puis la 2e avec 4
          cartes, puis la 3e à 3 cartes, etc. La manche à 1 carte est
          particulière : les joueurs ne voient pas leur propre carte, mais
          voient celle des autres joueurs. La manche suivante se fait avec 5
          cartes par personne, puis 4, et ainsi de suite jusqu'à ce qu'il y ait
          un vainqueur.
        </p>
        <p>
          Dans un pli, chaque joueur joue une carte à tour de rôle, et la plus
          grande valeur remporte le pli. Il n'y a pas d'obligation de "monter",
          on peut jouer la carte de son choix. L'excuse est une carte
          particulière : au moment où il la pose, le joueur décide si elle vaut
          0 ou 22.
        </p>
      </div>
    </div>
  );
}

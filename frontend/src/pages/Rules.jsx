import { useNavigate } from "react-router-dom";

export default function Rules() {
  const navigate = useNavigate();

  return (
    <div className="rules">
      <button onClick={() => navigate("/")}>⬅️ Retour</button>

      <h2>Règles du tarot africain</h2>

      <br />
      <h3>But du jeu</h3>
      <p>
        Le tarot africain est un jeu de cartes qui se joue avec les atouts d'un
        jeu de tarot français (1 à 21) et l'excuse. Vous jouez contre des
        adversaires (3 ici). Vous commencez la partie avec 3 vies chacun. Si
        vous tombez à 0 vies, vous êtes éliminé. Votre but est d'être le dernier
        joueur en vie.
      </p>

      <br />
      <h3>Déroulement d'un partie</h3>
      <p>
        La partie se joue en manches successives. On commence par distribuer les
        cartes (5 cartes par personne pour la 1e manche). Puis on passe à la
        phase d'annonces.
      </p>
      <p>
        Lors des annonces, chaque joueur à son tour doit annoncer le nombre de
        plis qu'il pense remporter pendant cette manche. On passe ensuite à la
        phase de jeu, en commençant le 1er pli.
      </p>
      <p>
        Lors d'un pli, chaque joueur joue à son tour une carte de sa main. La
        carte la plus grande remporte le pli. Le gagnant du pli commence le pli
        suivant. On continue jusqu'à ne plus avoir de cartes en main : c'est la
        fin de la manche.
      </p>
      <p>
        On va ensuite comparer, pour chaque joueur, le nombre de plis réalisés à
        l'annonce faite en début de manche. S'il n'a pas fait le bon nombre de
        plis, on retire la différence de son total de points de vie. Si un
        joueur arrive à 0 vies, il est éliminé.
      </p>
      <p>
        Une fois les vies retirées, s'il y a encore au moins 2 joueurs en vie,
        on relance une nouvelle manche avec 1 carte de moins en main, et ainsi
        de suite. Le jeu s'arrête lorsque qu'il ne reste qu'un seul joueur en
        vie, il est déclaré vainqueur.
      </p>

      <br />
      <h3>Précisions</h3>
      <p>
        La première manche se joue avec 5 cartes par personne. La 2e manche avec
        4 cartes, la 3e à 3 cartes, etc. La manche à 1 carte est particulière :
        les joueurs ne voient pas leur propre carte, mais voient celle des
        autres joueurs. La manche suivante se fait avec 5 cartes par personne,
        puis 4, et ainsi de suite jusqu'à ce qu'il y ait un vainqueur.
      </p>
      <p>
        Lors des annonces, le donneur, qui est le dernier à parler, doit
        respecter une contrainte pour son annonce : la somme des annonces de la
        manche ne doit pas être égale au nombre de cartes en main.
      </p>
      <p>
        Lors d'un pli, il n'y a pas d'obligation de "monter", vous pouvez jouer
        n'importe quelle carte que vous avez en main.
      </p>
      <p>
        L'excuse est une carte "joker" très puissante. Lorsque vous la jouez,
        vous choisissez si elle vaut 0 ou 22.
      </p>
    </div>
  );
}

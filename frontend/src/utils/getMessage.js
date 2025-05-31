function s(value) {
  return value >= 2 ? "s" : "";
}

export default function getMessage(action) {
  switch (action.step) {
    case "dealCards": {
      return `${action.player} distribue ${action.value} carte${s(action.value)}`;
    }

    case "playerBid": {
      return `${action.player} annonce ${action.value} pli${s(action.value)}`;
    }

    case "playerPlay": {
      return `${action.player} joue ${action.value}`;
    }

    case "finishTrick": {
      return `${action.player} gagne le pli`;
    }

    case "finishRound": {
      let message = "Fin de la manche";
      action.result.forEach((p) => {
        message += `\n${p.player} perd ${p.damage} vie${s(p.damage)}`;
        if (p.isElim) {
          message += " → éliminé 💀";
        }
      });
      return;
    }

    default: {
      console.error("Etape inconnue");
      return "Erreur : étape inconnue";
    }
  }
}

/* const action = {
  step: "finishRound",
  result: [
    {
      player: 1,
      damage: 1,
      isElim: true,
    },
    {
      player: 2,
      damage: 1,
      isElim: false,
    },
  ],
}; */

const victoryBase = 50;
const victoryLifeBonus = 50;
const defeatBase = -20;
const defeatLifeMalus = -10;

const computePoints = (life) => {
  const isVictory = life[0] > 0;
  let basePoints, lifeLeft, bonusPoints;
  if (isVictory) {
    basePoints = victoryBase;
    lifeLeft = life[0];
    bonusPoints = lifeLeft * victoryLifeBonus;
  } else {
    basePoints = defeatBase;
    lifeLeft = life[1] + life[2] + life[3];
    bonusPoints = lifeLeft * defeatLifeMalus;
  }
  const totalPoints = basePoints + bonusPoints;
  return { isVictory, basePoints, bonusPoints, totalPoints, lifeLeft };
};

export default computePoints;

const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const dbName = "whist22";

const userStart = 500;
const victoryBase = 50;
const victoryLifeBonus = 50;
const defeatBase = -20;
const defeatLifeMalus = -10;

const computePoints = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db(dbName);

    // Compute game points (v2)
    const gamePoints = await db
      .collection("games")
      .find({}, { isVictory: 1, score: 1 })
      .toArray();

    for (const game of gamePoints) {
      const life = game.score.life;
      const basePoints = game.isVictory ? victoryBase : defeatBase;
      const bonusPoints = life[0] * victoryLifeBonus;
      const malusPoints = (life[1] + life[2] + life[3]) * defeatLifeMalus;
      game.totalPoints = basePoints + bonusPoints + malusPoints;
    }

    const bulkOps1 = gamePoints.map((game) => ({
      updateOne: {
        filter: { _id: game._id },
        update: { $set: { points: game.totalPoints } },
      },
    }));
    const result1 = await db.collection("games").bulkWrite(bulkOps1);
    console.log(`Games modified : ${result1.modifiedCount}`);

    // Compute user points
    const userPoints = await db
      .collection("games")
      .aggregate([
        {
          $group: {
            _id: "$userId",
            totalPoints: { $sum: "$points" },
          },
        },
      ])
      .toArray();

    await db
      .collection("users")
      .updateMany({}, { $set: { points: userStart } });

    const bulkOps2 = userPoints.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: [{ $set: { points: { $add: ["$points", user.totalPoints] } } }],
      },
    }));
    const result2 = await db.collection("users").bulkWrite(bulkOps2);
    console.log(`Users modified : ${result2.modifiedCount}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
};

computePoints();

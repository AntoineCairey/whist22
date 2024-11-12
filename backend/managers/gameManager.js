const { ObjectId } = require("mongodb");
const connectDb = require("../db");

let db = null;
const initializeDb = async () => {
  db = await connectDb();
};
initializeDb();

const getGames = async (req, res) => {
  try {
    // const result = await db.collection("games").find().toArray();
    const result = await db
      .collection("games")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            userId: 1,
            username: "$user.username",
            creationDate: 1,
            isVictory: 1,
            points: 1,
          },
        },
      ])
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch the data" });
  }
};

const getGame = async (req, res) => {
  const gameId = req.params.id;
  if (ObjectId.isValid(gameId)) {
    try {
      const result = await db
        .collection("games")
        .aggregate([
          { $match: { _id: ObjectId.createFromHexString(gameId) } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              userId: 1,
              username: "$user.username",
              creationDate: 1,
              isVictory: 1,
              points: 1,
            },
          },
        ])
        .next();
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not fetch the data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

const createGame = async (req, res) => {
  try {
    const newGame = req.body;
    newGame.creationDate = new Date();
    newGame.userId = ObjectId.isValid(newGame.userId)
      ? ObjectId.createFromHexString(newGame.userId)
      : null;
    const result1 = await db.collection("games").insertOne(newGame);

    // update user points
    if (newGame.userId) {
      const result2 = await db
        .collection("users")
        .updateOne(
          { _id: newGame.userId },
          {
            $set: {
              points: { $add: ["$points", newGame.points] },
            },
          }
        );
    }
    console.log(result);
    res.status(201).json({ insertedId: result1.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create data" });
  }
};

const updateGame = async (req, res) => {
  const gameId = req.params.id;
  if (ObjectId.isValid(gameId)) {
    try {
      const newGame = req.body;
      newGame.userId = ObjectId.createFromHexString(newGame.userId);
      const result = await db
        .collection("games")
        .updateOne(
          { _id: ObjectId.createFromHexString(gameId) },
          { $set: newGame }
        );
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not update data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

const deleteGame = async (req, res) => {
  const gameId = req.params.id;
  if (ObjectId.isValid(gameId)) {
    try {
      const result = await db
        .collection("games")
        .deleteOne({ _id: ObjectId.createFromHexString(gameId) });
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not delete data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

const getGamesByUser = async (req, res) => {
  const userId = req.params.id ?? req.user.userId;
  if (ObjectId.isValid(userId)) {
    try {
      const result = await db
        .collection("games")
        .aggregate([
          { $match: { userId: ObjectId.createFromHexString(userId) } },
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              userId: 1,
              username: "$user.username",
              creationDate: 1,
              isVictory: 1,
              points: 1,
            },
          },
          { $sort: { creationDate: -1 } },
        ])
        .toArray();
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not fetch the data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

module.exports = {
  getGames,
  getGame,
  createGame,
  updateGame,
  deleteGame,
  getGamesByUser,
};

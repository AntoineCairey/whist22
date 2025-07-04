const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const connectDb = require("../db");

let db = null;
const initializeDb = async () => {
  db = await connectDb();
};
initializeDb();

const getUsers = async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch the data" });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.id ?? req.user.userId;
  //console.log(userId);
  if (ObjectId.isValid(userId)) {
    try {
      const result = await db
        .collection("users")
        .findOne(
          { _id: ObjectId.createFromHexString(userId) },
          { projection: { password: 0 } }
        );
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not fetch the data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = req.body;
    const existingUser = await db
      .collection("users")
      .findOne({ email: newUser.email });
    if (existingUser) {
      res.status(409).json({ error: "Email already in use" });
    } else {
      newUser.creationDate = new Date();
      newUser.points = 1000;
      newUser.password = await bcrypt.hash(newUser.password, 10);
      const result = await db.collection("users").insertOne(newUser);
      const token = jwt.sign(
        { userId: result.insertedId },
        process.env.APP_SECRET
        /* , { expiresIn: "1h" } */
      );
      res.status(201).json({ token });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create data" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  if (ObjectId.isValid(userId)) {
    try {
      const newUser = req.body;
      const result = await db
        .collection("users")
        .updateOne(
          { _id: ObjectId.createFromHexString(userId) },
          { $set: newUser }
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

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (ObjectId.isValid(userId)) {
    try {
      const result = await db
        .collection("users")
        .deleteOne({ _id: ObjectId.createFromHexString(userId) });
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Could not delete data" });
    }
  } else {
    res.status(404).json({ error: "Invalid ID" });
  }
};

const login = async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid password" });
      } else {
        const token = jwt.sign(
          { userId: user._id },
          process.env.APP_SECRET
          /* , { expiresIn: "1h"} */
        );
        res.status(200).json({ token });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process credentials" });
  }
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token missing" });
    } else {
      const token = authHeader.split(" ")[1];
      //console.log(token);
      const decoded = jwt.verify(token, process.env.APP_SECRET);
      req.user = decoded;
      //console.log(decoded);
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

const getBestUsers = async (req, res) => {
  try {
    const result = await db
      .collection("users")
      .aggregate([
        {
          $lookup: {
            from: "games",
            localField: "_id",
            foreignField: "userId",
            as: "games",
          },
        },
        {
          $project: {
            username: 1,
            points: 1,
            numberOfGames: { $size: "$games" },
          },
        },
        { $match: { numberOfGames: { $gte: 1 } } },
        { $sort: { points: -1 } },
        { $limit: 10 },
      ])
      .toArray();
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch the data" });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  login,
  verifyToken,
  getBestUsers,
};

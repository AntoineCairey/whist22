const { ObjectId } = require("mongodb");
const connectDb = require("./db");

let db = null;
const initializeDb = async () => {
  db = await connectDb();
};
initializeDb();

const getUsers = async (req, res) => {
  try {
    const result = await db.collection("users").find().toArray();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch the data" });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.id;
  if (ObjectId.isValid(userId)) {
    try {
      const result = await db
        .collection("users")
        .findOne({ _id: ObjectId.createFromHexString(userId) });
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
    const result = await db.collection("users").insertOne(newUser);
    console.log(result);
    res.status(201).json({ insertedId: result.insertedId });
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

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };

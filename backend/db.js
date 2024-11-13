const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let dbInstance = null;

const connectDb = async () => {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    console.log("Connexion à MongoDB réussie");
    dbInstance = client.db();
    return dbInstance;
  } catch (err) {
    console.error("Erreur de connexion à MongoDB:", err.message);
    throw err;
  }
};

module.exports = connectDb;

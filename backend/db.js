const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017";
const dbName = "whist22";
const client = new MongoClient(uri);
let dbInstance = null;

const connectDb = async () => {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    console.log("Connexion à MongoDB réussie");
    dbInstance = client.db(dbName);
    return dbInstance;
  } catch (err) {
    console.error("Erreur de connexion à MongoDB:", err.message);
    throw err;
  }
};

module.exports = connectDb;

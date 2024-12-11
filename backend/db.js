const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
let dbInstance = null;

const connectDb = async () => {
  if (dbInstance) return dbInstance;
  try {
    await client.connect();
    console.log("Connexion à MongoDB réussie");
    dbInstance = client.db(process.env.MONGO_DATABASE);
    return dbInstance;
  } catch (err) {
    console.error("Erreur de connexion à MongoDB:", err.message);
    throw err;
  }
};

module.exports = connectDb;

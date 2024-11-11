const express = require("express");
const cors = require("cors");
const router = require("./router");
require("dotenv").config();

const app = express();
const port = process.env.APP_PORT;

app.use(cors());
app.use(express.json());
app.use("/api", router);

app
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

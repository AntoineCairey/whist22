const express = require("express");
const router = require("./router");

const app = express();
const port = 3000;

app.use(express.json());
app.use("/api", router);

app
  .listen(port, () => {
    console.info(`Server is listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

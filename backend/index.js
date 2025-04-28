require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./router");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = process.env.APP_PORT;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors());
app.use(express.json());
app.use("/", router);

io.on("connection", (socket) => {
  console.log("Client connecté : " + socket.id);

  socket.on("disconnect", () => {
    console.log("Client déconnecté : " + socket.id);
  });

  // Exemple : écouter un event
  socket.on("message", (data) => {
    console.log("Message reçu:", data);
    // on peut répondre si besoin
    socket.emit("message-from-server", "Hello from server!");
  });
});

server
  .listen(port, () => {
    console.info(`Server is listening on port ${port} 🔥`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

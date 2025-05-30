require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./router");
const http = require("http");
const { Server } = require("socket.io");
const { handleSocketConnection } = require("./sockets/handlers");

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

// middleware authentification socket
io.use((socket, next) => {
  console.log(socket.handshake.auth);
  const { userId, username } = socket.handshake.auth;
  if (!userId) {
    return next(new Error("userId manquant"));
  }
  socket.userId = userId;
  socket.username = username;
  next();
});

io.on("connection", (socket) => {
  handleSocketConnection(io, socket);
});

server
  .listen(port, () => {
    console.info(`Server is listening on port ${port} 🔥`);
  })
  .on("error", (err) => {
    console.error("Error:", err.message);
  });

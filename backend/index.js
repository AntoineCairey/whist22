require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./router");
const http = require("http");
const { Server } = require("socket.io");
const { handleSocketConnection } = require("./sockets/handlers");
const { rooms, joinRoom } = require("./sockets/roomController");

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

  console.log(JSON.stringify(rooms, null, 2));

  // TODO : checker si ce userId a une room -> si oui le reconnecter

  /* console.log(console.log(JSON.stringify(rooms, null, 2)));
  const myRoom = Object.keys(rooms).find((k) =>
    rooms[k].players.find((p) => p.id === userId)
  );
  console.log(myRoom);
  if (myRoom) {
    joinRoom(io, socket, {
      roomId: myRoom,
      player: { id: userId, name: username },
    });
  } */

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

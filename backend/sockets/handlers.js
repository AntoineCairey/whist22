const {
  getGameState,
  startGame,
  playerBid,
  playerPlay,
} = require("./gameController");
const {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  leaveRooms,
} = require("./roomController");

function handleSocketConnection(io, socket) {
  console.log(
    "Client connecté, socketId : " +
      socket.id +
      " / userId : " +
      socket.userId +
      " / username : " +
      socket.username
  );

  socket.on("disconnect", () => {
    console.log("Client déconnecté : " + socket.id);
    leaveRooms(io, socket, socket.userId);
  });

  // room events
  socket.on("getRooms", () => getRooms(io, socket));
  socket.on("createRoom", (data) => createRoom(io, socket, data));
  socket.on("joinRoom", (data) => joinRoom(io, socket, data));
  socket.on("leaveRoom", (data) => leaveRoom(io, socket, data));

  // game events
  socket.on("getGameState", (data) => getGameState(socket, data));
  socket.on("startGame", (data) => startGame(io, data));
  socket.on("playerBid", (data) => playerBid(io, data));
  socket.on("playerPlay", (data) => playerPlay(io, data));
}

module.exports = { handleSocketConnection };

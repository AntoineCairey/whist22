const { startGame } = require("./gameController");
const {
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  //startGame,
} = require("./roomController");

function handleSocketConnection(io, socket) {
  console.log("Client connecté : " + socket.id);
  socket.on("disconnect", () => {
    console.log("Client déconnecté : " + socket.id);
  });

  socket.on("getRooms", () => getRooms(io, socket));
  socket.on("createRoom", (data) => createRoom(io, socket, data));
  socket.on("joinRoom", (data) => joinRoom(io, socket, data));
  socket.on("leaveRoom", (data) => leaveRoom(io, socket, data));
  
  // game events
  socket.on("startGame", (data) => startGame(io, data));
}

module.exports = { handleSocketConnection };

const crypto = require("crypto");

const rooms = {};
const randomId = () => crypto.randomBytes(4).toString("hex");

function getRooms(io, socket) {
  socket.emit("roomsUpdate", rooms);
}

function createRoom(io, socket, player) {
  /* if (rooms[roomName]) {
    socket.emit("error", "Room already exists");
    return;
  } */
  const roomName = randomId();
  rooms[roomName] = [player];
  socket.join(roomName);
  io.emit("roomsUpdate", rooms);
}

function joinRoom(io, socket, { roomName, player }) {
  const room = rooms[roomName];
  if (!room) {
    socket.emit("error", "Room does not exist");
    return;
  }
  room.push(player);
  socket.join(roomName);
  io.emit("roomsUpdate", rooms);
}

function leaveRoom(io, socket, { roomName, player }) {
  rooms[roomName] = rooms[roomName].filter((p) => p.id !== player.id);
  socket.leave(roomName);
  if (rooms[roomName].length === 0) {
    delete rooms[roomName];
  }
  io.emit("roomsUpdate", rooms);
}

/* function startGame(io, socket, { roomName, player }) {
  console.log("startGame");
  console.log(roomName);
  io.to(roomName).emit("gameStarted", roomName);
  //delete rooms[roomName];
} */

module.exports = { rooms, getRooms, createRoom, joinRoom, leaveRoom };

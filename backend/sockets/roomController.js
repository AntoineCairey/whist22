const crypto = require("crypto");

const rooms = {};
const randomId = () => crypto.randomBytes(4).toString("hex");

function getRooms(io, socket) {
  socket.emit("roomsUpdate", rooms);
}

function createRoom(io, socket, player) {
  /* if (rooms[roomId]) {
    socket.emit("error", "Room already exists");
    return;
  } */
  const roomId = randomId();
  rooms[roomId] = [player];
  socket.join(roomId);
  io.emit("roomsUpdate", rooms);
}

function joinRoom(io, socket, { roomId, player }) {
  const room = rooms[roomId];
  if (!room) {
    socket.emit("error", "Room does not exist");
    return;
  }
  room.push(player);
  socket.join(roomId);
  io.emit("roomsUpdate", rooms);
}

function leaveRoom(io, socket, { roomId, player }) {
  rooms[roomId] = rooms[roomId].filter((p) => p.id !== player.id);
  socket.leave(roomId);
  if (rooms[roomId].length === 0) {
    delete rooms[roomId];
  }
  io.emit("roomsUpdate", rooms);
}

function leaveRooms(io, socket, player) {
  Object.entries(rooms).forEach(([roomId, playersList]) => {
    playersList = playersList.filter((p) => p.id !== player.id);
    if (playersList.length === 0) {
      delete rooms[roomId];
    }
  });
  io.emit("roomsUpdate", rooms);
}

/* function startGame(io, socket, { roomId, player }) {
  console.log("startGame");
  console.log(roomId);
  io.to(roomId).emit("gameStarted", roomId);
  //delete rooms[roomId];
} */

module.exports = {
  rooms,
  getRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  leaveRooms,
};

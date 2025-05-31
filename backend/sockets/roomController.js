const crypto = require("crypto");

const rooms = {};
const randomId = () => crypto.randomBytes(4).toString("hex");

function getRooms(io, socket) {
  //console.log("getRooms");
  //console.log(JSON.stringify(rooms, null, 2));
  socket.emit("roomsUpdate", rooms);
}

function createRoom(io, socket, player) {
  /* if (rooms[roomId]) {
    socket.emit("error", "Room already exists");
    return;
  } */
  const roomId = randomId();
  rooms[roomId] = { players: [player], status: "waiting" };
  socket.join(roomId);
  //console.log(JSON.stringify(rooms, null, 2));
  io.emit("roomsUpdate", rooms);
}

function joinRoom(io, socket, { roomId, player }) {
  const room = rooms[roomId];
  if (!room) {
    socket.emit("error", "Room does not exist");
    return;
  }
  room.players.push(player);
  socket.join(roomId);
  //console.log(JSON.stringify(rooms, null, 2));
  io.emit("roomsUpdate", rooms);
}

function leaveRoom(io, socket, { roomId, player }) {
  const room = rooms[roomId];
  if (!room) return;
  room.players = room.players.filter((p) => p.id !== player.id);
  socket.leave(roomId);
  if (room.players.length === 0) {
    delete rooms[roomId];
  }
  //console.log(JSON.stringify(rooms, null, 2));
  io.emit("roomsUpdate", rooms);
}

function leaveRooms(io, socket, userId) {
  Object.entries(rooms).forEach(([roomId, { players }]) => {
    const room = rooms[roomId];
    room.players = players.filter((p) => p.id !== userId);
    //socket.leave(roomId);
    if (room.players.length === 0) {
      delete rooms[roomId];
    }
  });
  //console.log(JSON.stringify(rooms, null, 2));
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

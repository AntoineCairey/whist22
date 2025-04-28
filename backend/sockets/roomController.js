const rooms = {};

function getRooms(io, socket) {
  socket.emit("roomsUpdate", rooms);
}

function createRoom(io, socket, { roomName, player }) {
  if (rooms[roomName]) {
    socket.emit("error", "Room already exists");
    return;
  }

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

function startGame(io, socket, { roomName, player }) {
  console.log("startGame")
  io.to(roomName).emit("gameStarted");
  //delete rooms[roomName];
}

module.exports = { getRooms, createRoom, joinRoom, leaveRoom, startGame };

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function Lobby() {
  const [rooms, setRooms] = useState({});
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const player = { id: user?._id, name: user?.username };
  const myRoom = Object.keys(rooms).find((k) =>
    rooms[k].find((p) => p.id === user?._id)
  );
  console.log(myRoom);

  function handleBack() {
    if (myRoom !== undefined) {
      socket.emit("leaveRoom", { roomId: myRoom, player });
    }
    navigate("/");
  }

  useEffect(() => {
    if (!socket) return;

    socket.emit("getRooms");

    socket.on("roomsUpdate", (rooms) => {
      console.log("Liste des rooms mise à jour");
      console.log(rooms);
      setRooms(rooms);
    });

    socket.on("gameStarted", (roomId) => {
      console.log("gameStarted");
      console.log(roomId);
      navigate("/multi/" + roomId);
    });

    return () => {
      socket.off("roomsUpdate");
      socket.off("gameStarted");
    };
  }, [socket]);

  return (
    <div className="lobby">
      <button onClick={handleBack}>⬅️ Retour</button>
      <h1>Lobby</h1>
      <h3>Tables disponibles</h3>
      {Object.keys(rooms).length === 0 && (
        <i>Pas de table disponible actuellement, crée-en une</i>
      )}
      {Object.entries(rooms).map(([roomId, players]) => (
        <div key={roomId} className="table">
          <div>{players.map((p) => p.name).join(", ")}</div>
          <div>{4 - players.length} places disponibles</div>
          {roomId !== myRoom ? (
            <button onClick={() => socket.emit("joinRoom", { roomId, player })}>
              Rejoindre
            </button>
          ) : (
            <button
              onClick={() => socket.emit("leaveRoom", { roomId, player })}
            >
              Quitter
            </button>
          )}
          {roomId === myRoom && players.length >= 2 && (
            <button onClick={() => socket.emit("startGame", roomId)}>
              Jouer
            </button>
          )}
        </div>
      ))}
      <br />
      <br />
      {myRoom === undefined && (
        <button onClick={() => socket.emit("createRoom", player)}>
          ➕ Créer une nouvelle table
        </button>
      )}
    </div>
  );
}

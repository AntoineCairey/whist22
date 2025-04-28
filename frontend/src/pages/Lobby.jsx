import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000");

export default function Lobby() {
  const [tables, setTables] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const player = { id: user?._id, name: user?.username };

  useEffect(() => {
    socket.emit("getRooms");

    socket.on("roomsUpdate", (tables) => {
      console.log("Liste des rooms mise à jour");
      console.log(tables);
      setTables(tables);
    });

    socket.on("gameStarted", () => {
      console.log("gameStarted");
      navigate("/multi");
    });

    return () => {
      socket.off("roomsUpdate");
      socket.off("gameStarted");
    };
  }, []);

  return (
    <div className="lobby">
      
      <button onClick={() => navigate("/")}>⬅️ Retour</button>
      <h1>Lobby</h1>
      <h3>Tables disponibles</h3>
      {Object.keys(tables).length === 0 && (
        <i>Pas de table disponible actuellement, crée-en une</i>
      )}

      {Object.entries(tables).map(([roomName, players]) => (
        <div key={roomName} className="table">
          <div>{players.map((p) => p.name).join(", ")}</div>
          <div>{4 - players.length} places disponibles</div>
          <button onClick={() => socket.emit("joinRoom", { roomName, player })}>
            Rejoindre
          </button>
          <button
            onClick={() => socket.emit("leaveRoom", { roomName, player })}
          >
            Quitter
          </button>
          {players.length >= 2 && (
            <button
              onClick={() => socket.emit("startGame", { roomName, player })}
            >
              Jouer
            </button>
          )}
        </div>
      ))}

      <br />
      <br />
      <button
        onClick={() =>
          socket.emit("createRoom", {
            roomName: `room-${Date.now()}`,
            player,
          })
        }
      >
        ➕ Créer une nouvelle table
      </button>
    </div>
  );
}

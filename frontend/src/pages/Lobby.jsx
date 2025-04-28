import { io } from "socket.io-client";

export default function Lobby() {
  const tables = [["Gio", "MC", "Stouf"], ["Pax"]];

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    console.log("Connecté avec l'ID:", socket.id);
  });

  socket.emit("message", "Hello server!");

  return (
    <>
      <h1>Lobby</h1>
      <h3>Tables disponibles</h3>
      {tables.map((table, index) => (
        <div key={index} style={{ border: "1px solid white" }}>
          <div>{table.join(", ")}</div>
          <button>Rejoindre cette table</button>
        </div>
      ))}
      <br />
      <br />
      <button>➕ Créer une nouvelle table</button>
    </>
  );
}

import { createContext, useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider() {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;
    console.log(user);
    const newSocket = io("http://localhost:3000", {
      auth: { userId: user._id, username: user.username },
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return (
    <SocketContext.Provider value={socket}>
      <Outlet />
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

/* export function gameLoader({ params }) {
  return new Promise((resolve, reject) => {
    socket.emit("getGameState", params.roomId);
    socket.once("gameUpdate", (data) => resolve(data));
    setTimeout(() => reject(new Error("Pas de réponse du serveur")), 5000);
  });
} */

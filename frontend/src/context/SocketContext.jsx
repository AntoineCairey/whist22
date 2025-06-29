import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider() {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/lobby-info");
      return;
    }

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { userId: user._id, username: user.username },
    });

    const onConnect = () => {
      console.log("Socket connected");
      setSocket(newSocket);
    };

    newSocket.on("connect", onConnect);

    return () => {
      newSocket.off("connect", onConnect);
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

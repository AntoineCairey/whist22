import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../services/socket";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

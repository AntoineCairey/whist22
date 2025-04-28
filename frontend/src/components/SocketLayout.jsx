import { Outlet } from "react-router-dom";
import { SocketProvider } from "../context/SocketContext";

export default function SocketLayout() {
  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
}

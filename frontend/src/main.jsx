import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext";
import "./App.css";

import App from "./App.jsx";
import Game from "./pages/Game.jsx";
import Menu from "./pages/Menu.jsx";
import Score from "./pages/Score.jsx";
import Rules from "./pages/Rules.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import api from "./services/apiService.js";
import Ranking from "./pages/Ranking.jsx";
import Lobby from "./pages/Lobby.jsx";
import Multi from "./pages/Multi.jsx";
import ScoreMulti from "./pages/ScoreMulti.jsx";
import LobbyInfo from "./pages/LobbyInfo.jsx";

/* export function gameLoader({ params }) {
  return new Promise((resolve, reject) => {
    socket.emit("getGameState", params.roomId);
    socket.once("gameUpdate", (data) => resolve(data));
    setTimeout(() => reject(new Error("Pas de réponse du serveur")), 5000);
  });
} */

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      {
        path: "/",
        element: <Menu />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/game",
        element: <Game />,
      },
      {
        path: "/score",
        element: <Score />,
      },
      {
        path: "/rules",
        element: <Rules />,
      },
      {
        path: "/profile",
        element: <Profile />,
        loader: async () =>
          navigator.onLine ? (await api.get("/users/me/games")).data : [],
      },
      {
        path: "/ranking",
        element: <Ranking />,
        loader: async () =>
          navigator.onLine ? (await api.get("/bestusers")).data : [],
      },
      {
        path: "lobby-info",
        element: <LobbyInfo />,
      },
      {
        element: <SocketProvider />, // fournit le socket
        children: [
          {
            path: "/lobby",
            element: <Lobby />,
          },
          {
            path: "/multi/:roomId",
            element: <Multi />,
            //loader: gameLoader,
          },
          {
            path: "/score-multi",
            element: <ScoreMulti />,
            loader: async () =>
              navigator.onLine
                ? (await api.get("/users/me/games")).data[0]
                : [],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

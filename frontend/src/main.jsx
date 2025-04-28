import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
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
        path: "/lobby",
        element: <Lobby />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

import { useState } from "react";
import { useImmer } from "use-immer";
import { Outlet } from "react-router-dom";
import "./App.css";

export default function App() {
  const [score, setScore] = useState(null);

  return <Outlet context={{ score, setScore }} />;
}

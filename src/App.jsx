import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";

function App() {
  const [score, setScore] = useState(null);

  return <Outlet context={{ score, setScore }} />;
}

export default App;

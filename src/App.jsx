import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function App() {
  const [score, setScore] = useState(null);

  return <Outlet context={{ score, setScore }} />;
}

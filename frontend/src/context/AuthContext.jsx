import { createContext, useState, useEffect } from "react";
import api from "../services/ApiService";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  const getUserInfos = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    getUserInfos();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, getUserInfos }}>
      {children}
    </AuthContext.Provider>
  );
};

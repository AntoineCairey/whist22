import { createContext, useState, useEffect } from "react";
import api from "../services/ApiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const getUserInfos = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get("/users/me");
        setUser(response.data);
      } catch (err) {
        logout();
      }
    } else {
      logout();
    }
  };

  useEffect(() => {
    console.log("useeffect");
    getUserInfos();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, getUserInfos }}>
      {children}
    </AuthContext.Provider>
  );
};

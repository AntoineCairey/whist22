import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/ApiService";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { getUserInfos } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/login", formData);
      const token = response.data.token;
      localStorage.setItem("token", token);
      getUserInfos();
      navigate("/");
    } catch (error) {
      setError("Identifiants incorrects");
    }
  };

  return (
    <>
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Retour
      </button>
      <h2>Connecte-toi</h2>
      <div>
        Tu n'as pas de compte ? <br />
        <Link to="/signup">Crées-en un</Link>
      </div>
      <br />
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label htmlFor="password">Mot de passe </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">✅ Valider</button>
        {error && <p>{error}</p>}
      </form>
    </>
  );
}

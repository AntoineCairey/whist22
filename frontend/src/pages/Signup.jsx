import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/signup`, formData);
      navigate("/");
    } catch (error) {
      setError("Erreur lors de la création de compte");
    }
  };

  return (
    <>
      <h2>Crée ton compte</h2>
      <br />
      <div>
        Tu as déjà un compte ? <Link to="/login">Connecte-toi</Link>
      </div>
      <br />
      <form onSubmit={handleSignup}>
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
        <label htmlFor="username">Pseudo</label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <button type="submit">Valider</button>
        {error && <p>{error}</p>}
      </form>
    </>
  );
}

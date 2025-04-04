import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/apiService";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    username: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { getUserInfos } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError("Les mots de passe doivent être identiques");
    } else {
      try {
        const response = await api.post("/signup", formData);
        const token = response.data.token;
        localStorage.setItem("token", token);
        getUserInfos();
        navigate("/");
      } catch (error) {
        console.log(error);
        setError("Erreur lors de la création de compte");
      }
    }
  };

  return (
    <>
      <button className="back-button" onClick={() => navigate("/")}>
        ⬅️ Retour
      </button>
      <h2>Crée ton compte</h2>
      <br />
      <div>
        Tu as déjà un compte ? <br />
        <Link to="/login">Connecte-toi</Link>
      </div>
      <br />
      <form onSubmit={handleSignup}>
        <div className="form-fields">
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
          <label htmlFor="password2">Confirmer le mot de passe </label>
          <input
            type="password"
            name="password2"
            id="password2"
            value={formData.password2}
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
        </div>
        <button type="submit">✅ Valider</button>
        {error && <div className="form-error">{error}</div>}
      </form>
    </>
  );
}

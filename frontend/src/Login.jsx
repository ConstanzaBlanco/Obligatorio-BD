import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./components/UserContext";
import "./Login.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { setUser } = useUser(); //para guardar el usuario

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // LOGIN
      const res = await axios.post("http://localhost:8000/login", {
        username: correo,
        password: contrasenia,
      });

      // Guardar token
      localStorage.setItem("token", res.data.access_token);

      // Obtener usuario con /me
      const me = await axios.get("http://localhost:8000/me", {
        headers: {
          Authorization: `Bearer ${res.data.access_token}`,
        },
      });

      // Guardar usuario en contexto
      setUser({
        token: res.data.access_token,
        rol: res.data.rol,
        ...me.data
      });
      navigate("/")

    } catch (el) {
      setError("Credenciales inválidas. Inténtalo de nuevo.", el);

    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Iniciar Sesión</h2>

      <button type="button" className="register-button" onClick={() => { navigate("/registro") }}>Registrarse</button>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasenia}
          onChange={(e) => setContrasenia(e.target.value)}
          required
        />

        <button type="submit" className="login-button">Entrar</button>
      </form>

      {error && <p className="login-error">{error}</p>}
    </div>
  );
}

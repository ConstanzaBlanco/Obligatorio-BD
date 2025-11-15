import { useState } from "react";
import axios from "axios";
import { useUser } from "./components/UserContext";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");

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

    } catch (e) {
      setError("Credenciales inválidas. Inténtalo de nuevo.");
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "50px auto" }}>
      <h2>Iniciar Sesión</h2>

      <form onSubmit={handleLogin}>
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

        <button type="submit">Entrar</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

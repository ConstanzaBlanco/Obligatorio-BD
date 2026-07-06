import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./components/useUser";
import { Button, Field, Input } from "./components/ui";
import styles from "./styles/Auth.module.css";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
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
        ...me.data,
      });
      navigate("/");
    } catch (el) {
      setError("Credenciales inválidas. Intentá de nuevo.", el);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.mark}>B</span>
          <span>
            <div className={styles.brandName}>Salas · Biblioteca</div>
            <div className={styles.brandSub}>Reserva de salas de estudio</div>
          </span>
        </div>

        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>Ingresá con tu correo institucional.</p>

        <form className={styles.form} onSubmit={handleLogin}>
          <Field label="Correo">
            <Input
              type="email"
              placeholder="nombre@correo.ucu.edu.uy"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              required
            />
          </Field>

          <Field label="Contraseña">
            <Input
              type="password"
              placeholder="Tu contraseña"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>

          {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Ingresando…" : "Entrar"}
          </Button>
        </form>

        <p className={styles.footNote}>
          ¿No tenés cuenta?{" "}
          <button type="button" onClick={() => navigate("/registro")}>
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}

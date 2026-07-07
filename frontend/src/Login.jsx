import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./components/useUser";
import AuthLayout from "./components/AuthLayout";
import { Button, Field, IconInput, PasswordInput, Spinner } from "./components/ui";
import { useToast } from "./components/ui/useToast";
import { MailIcon } from "./components/ui/icons";
import styles from "./styles/Auth.module.css";

const REMEMBER_KEY = "salasBiblioteca.rememberedEmail";

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useUser();
  const { info } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setCorreo(saved);
      setRemember(true);
    }
  }, []);

  const correoValid = isEmailLike(correo);
  const passwordValid = contrasenia.length > 0;
  const canSubmit = correoValid && passwordValid && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ correo: true, contrasenia: true });
    if (!correoValid || !passwordValid) return;

    setError("");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/login", {
        username: correo,
        password: contrasenia,
      });

      localStorage.setItem("token", res.data.access_token);

      const me = await axios.get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${res.data.access_token}` },
      });

      setUser({
        token: res.data.access_token,
        rol: res.data.rol,
        ...me.data,
      });

      if (remember) localStorage.setItem(REMEMBER_KEY, correo);
      else localStorage.removeItem(REMEMBER_KEY);

      navigate("/");
    } catch {
      setError("Credenciales inválidas. Revisá tu correo y contraseña e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className={styles.eyebrow}>Bienvenido de nuevo</span>
      <h1 className={styles.title}>Iniciá sesión</h1>
      <p className={styles.subtitle}>Ingresá con tu correo institucional para continuar.</p>

      <form className={styles.form} onSubmit={handleLogin} noValidate>
        <Field
          label="Correo"
          error={touched.correo && !correoValid ? "Ingresá un correo válido." : undefined}
        >
          <IconInput
            icon={<MailIcon />}
            type="email"
            placeholder="nombre@correo.ucu.edu.uy"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, correo: true }))}
            autoComplete="email"
            required
          />
        </Field>

        <Field
          label="Contraseña"
          error={touched.contrasenia && !passwordValid ? "Ingresá tu contraseña." : undefined}
        >
          <PasswordInput
            placeholder="Tu contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, contrasenia: true }))}
            autoComplete="current-password"
            required
          />
        </Field>

        <div className={styles.optionsRow}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Recordarme
          </label>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() =>
              info("Todavía no está disponible. Pedile a un bibliotecario que te ayude a restablecerla.")
            }
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {error && <div className={`${styles.alert} ${styles.alertError}`} role="alert">{error}</div>}

        <Button type="submit" fullWidth disabled={!canSubmit} className={styles.submitBtn}>
          {loading ? <Spinner size={16} label="Ingresando" /> : "Iniciar sesión"}
        </Button>
      </form>

      <p className={styles.footNote}>
        ¿No tenés cuenta?{" "}
        <button type="button" onClick={() => navigate("/registro")}>
          Creá una
        </button>
      </p>
    </AuthLayout>
  );
}

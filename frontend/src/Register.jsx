import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Field, Input, Select } from "./components/ui";
import styles from "./styles/Auth.module.css";

export default function Register() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [academicProgram, setAcademicProgram] = useState("");

  const [programs, setPrograms] = useState([]);

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch("http://localhost:8000/createUser/programs");
        const data = await res.json();
        setPrograms(data.programs || []);
      } catch (err) {
        console.error("Error cargando programas", err);
      }
    };

    fetchPrograms();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    if (ci.length !== 8) {
      setError("El CI debe tener exactamente 8 dígitos");
      return;
    }

    if (password.length <= 6) {
      setError("La contraseña debe tener más de 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        correo,
        ci: Number(ci),
        name,
        lastName,
        password,
        academicProgram,
      };

      const res = await fetch("http://localhost:8000/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al registrar");
        return;
      }

      setOk("Usuario creado correctamente. Redirigiendo…");

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.screen}>
      <div className={`${styles.card} ${styles.wide}`}>
        <div className={styles.brand}>
          <span className={styles.mark}>B</span>
          <span>
            <div className={styles.brandName}>Salas · Biblioteca</div>
            <div className={styles.brandSub}>Reserva de salas de estudio</div>
          </span>
        </div>

        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Registrate para reservar salas y recibir invitaciones.</p>

        <form className={styles.form} onSubmit={handleRegister}>
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

          <Field label="Cédula de identidad" hint="8 dígitos, sin puntos ni guiones.">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej. 51234567"
              value={ci}
              onChange={(e) => setCi(e.target.value.replace(/\D/g, "").slice(0, 8))}
              required
              minLength={8}
              maxLength={8}
            />
          </Field>

          <Field label="Nombre">
            <Input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              required
            />
          </Field>

          <Field label="Apellido">
            <Input
              type="text"
              placeholder="Tu apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </Field>

          <Field label="Contraseña" hint="Más de 6 caracteres.">
            <Input
              type="password"
              placeholder="Elegí una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={7}
            />
          </Field>

          <Field label="Programa académico">
            <Select
              value={academicProgram}
              onChange={(e) => setAcademicProgram(e.target.value)}
              required
            >
              <option value="">Seleccioná un programa académico</option>
              {programs.map((p, i) => (
                <option key={i} value={p.nombre_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </Select>
          </Field>

          {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
          {ok && <div className={`${styles.alert} ${styles.alertSuccess}`}>{ok}</div>}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Creando cuenta…" : "Registrarse"}
          </Button>
        </form>

        <p className={styles.footNote}>
          ¿Ya tenés cuenta?{" "}
          <button type="button" onClick={() => navigate("/login")}>
            Iniciá sesión
          </button>
        </p>
      </div>
    </div>
  );
}

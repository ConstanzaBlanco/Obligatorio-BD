import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import {
  Button,
  Field,
  Input,
  Select,
  IconInput,
  PasswordInput,
  PasswordStrength,
  Spinner,
  passwordScore,
} from "./components/ui";
import { MailIcon, IdIcon, UserIcon, CheckIcon } from "./components/ui/icons";
import styles from "./styles/Auth.module.css";

function isEmailLike(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Register() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [academicProgram, setAcademicProgram] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [touched, setTouched] = useState({});
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

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const correoValid = isEmailLike(correo);
  const ciValid = ci.length === 8;
  const nameValid = name.trim().length > 0;
  const lastNameValid = lastName.trim().length > 0;
  const passwordValid = password.length > 6;
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password;
  const programValid = academicProgram !== "";
  const score = passwordScore(password);

  const canSubmit =
    correoValid &&
    ciValid &&
    nameValid &&
    lastNameValid &&
    passwordValid &&
    confirmValid &&
    programValid &&
    acceptedTerms &&
    !loading;

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({
      correo: true,
      ci: true,
      name: true,
      lastName: true,
      password: true,
      confirmPassword: true,
      academicProgram: true,
    });
    if (!canSubmit) return;

    setError("");
    setOk("");
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

      setOk("Cuenta creada correctamente. Redirigiendo…");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("No se pudo registrar el usuario. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <span className={styles.eyebrow}>Primera vez por acá</span>
      <h1 className={styles.title}>Creá tu cuenta</h1>
      <p className={styles.subtitle}>Registrate para reservar salas y recibir invitaciones.</p>

      <form className={styles.form} onSubmit={handleRegister} noValidate>
        <div className={styles.fieldRow}>
          <Field label="Nombre" error={touched.name && !nameValid ? "Requerido." : undefined}>
            <IconInput
              icon={<UserIcon />}
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch("name")}
              autoComplete="given-name"
              required
            />
          </Field>
          <Field label="Apellido" error={touched.lastName && !lastNameValid ? "Requerido." : undefined}>
            <Input
              placeholder="Tu apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => touch("lastName")}
              autoComplete="family-name"
              required
            />
          </Field>
        </div>

        <Field label="Correo" error={touched.correo && !correoValid ? "Ingresá un correo válido." : undefined}>
          <IconInput
            icon={<MailIcon />}
            type="email"
            placeholder="nombre@correo.ucu.edu.uy"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            onBlur={() => touch("correo")}
            autoComplete="email"
            required
          />
        </Field>

        <div className={styles.fieldRow}>
          <Field
            label="Cédula de identidad"
            hint={!touched.ci || ciValid ? "8 dígitos, sin puntos." : undefined}
            error={touched.ci && !ciValid ? "Deben ser 8 dígitos." : undefined}
          >
            <IconInput
              icon={<IdIcon />}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Ej. 51234567"
              value={ci}
              onChange={(e) => setCi(e.target.value.replace(/\D/g, "").slice(0, 8))}
              onBlur={() => touch("ci")}
              required
              minLength={8}
              maxLength={8}
            />
          </Field>

          <Field label="Programa académico" error={touched.academicProgram && !programValid ? "Seleccioná uno." : undefined}>
            <Select
              value={academicProgram}
              onChange={(e) => setAcademicProgram(e.target.value)}
              onBlur={() => touch("academicProgram")}
              required
            >
              <option value="">Seleccioná…</option>
              {programs.map((p, i) => (
                <option key={i} value={p.nombre_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className={styles.passwordGroup}>
          <Field label="Contraseña" error={touched.password && !passwordValid ? "Debe tener más de 6 caracteres." : undefined}>
            <PasswordInput
              placeholder="Elegí una contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch("password")}
              autoComplete="new-password"
              required
              minLength={7}
            />
          </Field>
          <PasswordStrength score={score} visible={password.length > 0} />
          <div className={styles.requirements}>
            <span className={`${styles.requirement} ${passwordValid ? styles.met : ""}`}>
              <span className={styles.requirementDot}>{passwordValid && <CheckIcon width={9} height={9} />}</span>
              Al menos 7 caracteres
            </span>
            <span className={`${styles.requirement} ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? styles.met : ""}`}>
              <span className={styles.requirementDot}>
                {/[A-Z]/.test(password) && /[a-z]/.test(password) && <CheckIcon width={9} height={9} />}
              </span>
              Mayúsculas y minúsculas
            </span>
            <span className={`${styles.requirement} ${/[0-9]/.test(password) ? styles.met : ""}`}>
              <span className={styles.requirementDot}>{/[0-9]/.test(password) && <CheckIcon width={9} height={9} />}</span>
              Un número
            </span>
          </div>
        </div>

        <Field
          label="Confirmar contraseña"
          error={touched.confirmPassword && !confirmValid ? "Las contraseñas no coinciden." : undefined}
        >
          <PasswordInput
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => touch("confirmPassword")}
            autoComplete="new-password"
            required
          />
        </Field>

        <label className={styles.termsRow}>
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <span className={styles.termsLabel}>Acepto los términos de uso del sistema de reservas.</span>
        </label>

        {error && <div className={`${styles.alert} ${styles.alertError}`} role="alert">{error}</div>}
        {ok && <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">{ok}</div>}

        <Button type="submit" fullWidth disabled={!canSubmit} className={styles.submitBtn}>
          {loading ? <Spinner size={16} label="Creando cuenta" /> : "Crear cuenta"}
        </Button>
      </form>

      <p className={styles.footNote}>
        ¿Ya tenés cuenta?{" "}
        <button type="button" onClick={() => navigate("/login")}>
          Iniciá sesión
        </button>
      </p>
    </AuthLayout>
  );
}

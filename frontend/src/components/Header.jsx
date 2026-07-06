import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "./useUser";
import styles from "./Header.module.css";

const NAV_BY_ROLE = {
  usuario: [
    { to: "/", label: "Inicio", end: true },
    { to: "/mis-reservas", label: "Mis Reservas" },
    { to: "/mis-invitaciones", label: "Invitaciones" },
    { to: "/bloqueados", label: "Bloqueados" },
    { to: "/mis-sanciones", label: "Mis Sanciones" },
    { to: "/edificios", label: "Reservar" },
    { to: "/notificaciones", label: "Notificaciones" },
  ],
  bibliotecario: [
    { to: "/", label: "Inicio", end: true },
    { to: "/reservas-vencidas", label: "Reservas Vencidas" },
    { to: "/reservas", label: "Reservas" },
    { to: "/edificios", label: "Edificios" },
    { to: "/sanciones", label: "Sanciones" },
    { to: "/users", label: "Usuarios" },
  ],
  administrador: [
    { to: "/", label: "Inicio", end: true },
    { to: "/edificios", label: "Edificios" },
    { to: "/facultad", label: "Facultades" },
    { to: "/programa", label: "Programas" },
    { to: "/users", label: "Usuarios" },
  ],
};

const ROLE_LABEL = {
  usuario: "Usuario",
  bibliotecario: "Bibliotecario",
  administrador: "Administrador",
};

export default function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const rol = user?.rol?.toLowerCase();
  const links = NAV_BY_ROLE[rol] || [];

  return (
    <header className={`${styles.bar} no-print`}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => navigate("/")} aria-label="Ir al inicio">
          <span className={styles.mark}>B</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Salas · Biblioteca</span>
            {rol && <span className={styles.brandRole}>{ROLE_LABEL[rol] || user.rol}</span>}
          </span>
        </button>

        <nav className={styles.nav} aria-label="Navegación principal">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <button
            className={styles.avatar}
            onClick={() => navigate("/me")}
            aria-label="Mi perfil"
            title="Mi perfil"
          >
            {(user?.name?.[0] || "U").toUpperCase()}
          </button>
          <button className={styles.logout} onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

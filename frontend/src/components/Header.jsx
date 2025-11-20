import { Link } from "react-router-dom";
import { useUser } from "./UserContext";
import "./Header.css";

export default function Header() {
  const { user, logout } = useUser();
  const rol = user?.rol?.toLowerCase();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* LOGO / BRAND */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">SalaHub</span>
        </Link>

        {/* MENU NAVEGACION */}
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Inicio</Link>

          {rol === "usuario" && (
            <>
              <Link to="/mis-reservas" className="nav-link">Mis Reservas</Link>
              <Link to="/mis-invitaciones" className="nav-link">Invitaciones</Link>
              <Link to="/mis-sanciones" className="nav-link">Sanciones</Link>
              <Link to="/edificios" className="nav-link nav-link-primary">+ Reservar</Link>
            </>
          )}

          {rol === "bibliotecario" && (
            <>
              <Link to="/reservas" className="nav-link">Reservas</Link>
              <Link to="/reservas-vencidas" className="nav-link">Vencidas</Link>
              <Link to="/sanciones" className="nav-link">Sanciones</Link>
              <Link to="/users" className="nav-link">Usuarios</Link>
            </>
          )}

          {rol === "administrador" && (
            <>
              <Link to="/edificios" className="nav-link">Edificios</Link>
              <Link to="/facultad" className="nav-link">Facultades</Link>
              <Link to="/programa" className="nav-link">Programas</Link>
              <Link to="/users" className="nav-link">Usuarios</Link>
            </>
          )}
        </div>

        {/* DERECHA - USER & LOGOUT */}
        <div className="navbar-right">
          <button
            className="nav-avatar-btn"
            title={`${user?.name || "Usuario"}`}
            onClick={() => window.location.href = "/me"}
          >
            <span className="avatar-icon">👤</span>
          </button>
          <span className="nav-user-name">{user?.name || "Usuario"}</span>
          <button className="nav-logout-btn" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

import { Link } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Header() {
  const { user, logout } = useUser();
  const rol = user?.rol?.toLowerCase();

  return (
    <nav style={navStyle}>
      {/* IZQUIERDA */}
      <div style={leftSection}>
        {rol === "usuario" && (
          <>
            <Link to="/mis-reservas" style={linkStyle}>Mis Reservas</Link>
            <Link to="/mis-invitaciones" style={linkStyle}>Invitaciones</Link>
            <Link to="/mis-sanciones" style={linkStyle}>Mis Sanciones</Link>
            <Link to="/edificios" style={linkStyle}>Reservar</Link>
          </>
        )}

        {rol === "bibliotecario" && (
          <>
            <Link to="/reservas-vencidas" style={linkStyle}>Reservas Vencidas</Link>
            <Link to="/reservas" style={linkStyle}>Reservas</Link>
            <Link to="/edificios" style={linkStyle}>Edificios</Link>
            <Link to="/sanciones" style={linkStyle}>Sanciones</Link>
            <Link to="/eliminarUsuario" style={linkStyle}>Eliminar Usuario</Link>
          </>
        )}

        {rol === "administrador" && (
          <>
            <Link to="/edificios" style={linkStyle}>Edificios</Link>
            <Link to="/facultad" style={linkStyle}>Facultades</Link>
            <Link to="/programa" style={linkStyle}>Programa</Link>
            <Link to="/crearBibliotecario" style={linkStyle}>Crear Bibliotecario</Link>
            <Link to="/eliminarBibliotecario" style={linkStyle}>Eliminar Bibliotecario</Link>
            <Link to="/eliminarUsuario" style={linkStyle}>Eliminar Usuario</Link>
          </>
        )}
      </div>

      {/* DERECHA */}
      <div style={rightSection}>
        <button 
          onClick={() => window.location.href = "/me"}
          style={avatarBtn}
        >
          👤
        </button>

        <button onClick={logout} style={logoutBtn}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}

/* ---------------- ESTILOS ---------------- */

const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 25px",
  background: "#ffffff",
  borderBottom: "2px solid #e5e5e5",
  boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
  position: "sticky",
  top: 0,
  zIndex: 999,
};

const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const rightSection = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const linkStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  textDecoration: "none",
  color: "#007bff",
  fontWeight: 600,
  transition: "0.2s ease",
};

const logoutBtn = {
  padding: "8px 14px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

const avatarBtn = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "#e6e6ff",
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

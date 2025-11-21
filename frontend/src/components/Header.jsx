import { Link } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Header() {
  const { user, logout } = useUser();
  const rol = user?.rol?.toLowerCase();

  return (
    <nav style={navStyle}>
      <div style={innerContainer}>
        {/* IZQUIERDA */}
        <div style={leftSection}>
          <NavLink to="/">Home</NavLink>

          {rol === "usuario" && (
            <>
              <NavLink to="/mis-reservas">Mis Reservas</NavLink>
              <NavLink to="/mis-invitaciones">Invitaciones</NavLink>
              <NavLink to="/mis-sanciones">Mis Sanciones</NavLink>
              <NavLink to="/edificios">Reservar</NavLink>
            </>
          )}

          {rol === "bibliotecario" && (
            <>
              <NavLink to="/reservas-vencidas">Reservas Vencidas</NavLink>
              <NavLink to="/reservas">Reservas</NavLink>
              <NavLink to="/edificios">Edificios</NavLink>
              <NavLink to="/sanciones">Sanciones</NavLink>
              <NavLink to="/users">Usuario</NavLink>
            </>
          )}

          {rol === "administrador" && (
            <>
              <NavLink to="/edificios">Edificios</NavLink>
              <NavLink to="/facultad">Facultades</NavLink>
              <NavLink to="/programa">Programas</NavLink>
              <NavLink to="/users">Usuarios</NavLink>
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
      </div>
    </nav>
  );
}


/* ---------------- COMPONENTE NAVLINK ---------------- */

function NavLink({ to, children }) {
  return (
    <Link to={to} className="nav-text" style={linkStyle}>
      {children}
    </Link>
  );
}


/* ---------------- ESTILOS ---------------- */

const navStyle = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  background: "#002B7A",
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  margin: 0,
  zIndex: 1000,
  boxSizing: "border-box",
};

const innerContainer = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};


const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
};

const rightSection = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const linkStyle = {
  textDecoration: "none",
  color: "white",
  fontWeight: 600,
  fontSize: "16px",
  padding: "5px 0",
};

const avatarBtn = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  background: "#ffffff22",
  border: "1px solid #ffffff55",
  cursor: "pointer",
  fontSize: "18px",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoutBtn = {
  padding: "8px 14px",
  backgroundColor: "#FF4B4B",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
};

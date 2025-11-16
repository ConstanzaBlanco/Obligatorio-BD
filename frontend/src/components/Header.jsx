import { Link } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Header() {
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  return (
    <nav
      style={{
        padding: "10px",
        borderBottom: "2px solid #ddd",
        marginBottom: 20,
      }}
    >
      {/* ----------- USUARIO ----------- */}
      {rol === "usuario" && (
        <>
          <Link to="/mis-reservas" style={linkStyle}>
            Mis Reservas
          </Link>

          <Link to="/mis-sanciones" style={linkStyle}>
            Mis Sanciones
          </Link>

          <Link to="/edificios" style={linkStyle}>
            Edificios
          </Link>
        </>
      )}

      {/* ----------- BIBLIOTECARIO ----------- */}
      {rol === "bibliotecario" && (
        <>
          <Link to="/reservas-vencidas" style={linkStyle}>
            Reservas Vencidas
          </Link>

          <Link to="/edificios" style={linkStyle}>
            Edificios
          </Link>
        </>
      )}

      {/* ----------- ADMINISTRADOR ----------- */}
      {rol === "administrador" && (
        <>
          <Link to="/edificios" style={linkStyle}>
            Edificios
          </Link>
        </>
      )}
    </nav>
  );
}

const linkStyle = {
  marginRight: 15,
  textDecoration: "none",
  color: "#007bff",
  fontWeight: "bold",
};

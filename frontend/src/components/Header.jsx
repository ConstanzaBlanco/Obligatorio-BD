import { Link } from "react-router-dom";

export default function Header() {
  return (
    <nav
      style={{
        padding: "10px",
        borderBottom: "2px solid #ddd",
        marginBottom: 20,
      }}
    >
      <Link to="/mis-reservas" style={linkStyle}>
        Mis Reservas
      </Link>

      <Link to="/edificios" style={linkStyle}>
        Edificios
      </Link>

      <Link to="/crear-reserva" style={linkStyle}>
        Crear Reserva
      </Link>

      <Link to="/sanciones" style={linkStyle}>
        Sanciones
      </Link>

      <Link to="/reservas-vencidas" style={linkStyle}>
        Reservas Vencidas
      </Link>

      <Link to="/crear-sala" style={linkStyle}>
        Crear Sala
      </Link>


    </nav>
  );
}

const linkStyle = {
  marginRight: 15,
  textDecoration: "none",
  color: "#007bff",
  fontWeight: "bold",
};

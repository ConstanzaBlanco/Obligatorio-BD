import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import { useUser } from "./components/UserContext";

// Componentes
import Header from "./components/Header";
import Reservas from "./components/User/Reservas";
import Edificios from "./components/Edificios";
import SalasPorEdificio from "./components/SalasPorEdificio";
import CrearReserva from "./components/User/CrearReserva";
import Sanciones from "./components/User/Sanciones";

export default function App() {
  const { user, logout } = useUser();

  // Si no hay usuario, mostrar login
  if (!user) return <Login />;

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <Header />

      <h2>Bienvenido/a {user.name}</h2>
      <h3>
        Tu rol es: <strong>{user.rol}</strong>
      </h3>

      <button
        onClick={logout}
        style={{
          padding: "8px 14px",
          marginBottom: 25,
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>

      {/* RUTAS */}
      <Routes>
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/edificios" element={<Edificios />} />
        <Route path="/edificios/:nombreEdificio" element={<SalasPorEdificio />} />
        <Route path="/crear-reserva" element={<CrearReserva />} />
        <Route path="/sanciones" element={<Sanciones />} />


        {/* Página por defecto */}
        <Route path="*" element={<h3>Seleccione una opción del menú</h3>} />
      </Routes>
    </div>
  );
}

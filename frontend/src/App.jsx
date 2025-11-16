import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import { useUser } from "./components/UserContext";

// Componentes
import Header from "./components/Header";
import MisReservas from "./components/User/MisReservas";
import Edificios from "./components/Edificios";
import SalasPorEdificio from "./components/SalasPorEdificio";
import CrearReserva from "./components/User/CrearReserva";
import Sanciones from "./components/User/MisSanciones";
import ReservasVencidas from "./components/Bibliotecario/ReservasVencidas";
import CrearSala from "./components/Admin/CrearSala";
import RemoveSalas from "./components/Admin/RemoveSalas";

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
        <Route path="/mis-reservas" element={<MisReservas />} />
        <Route path="/edificios" element={<Edificios />} />
        <Route path="/edificios/:nombreEdificio" element={<SalasPorEdificio />} />
        <Route path="/crear-reserva" element={<CrearReserva />} />
        <Route path="/mis-sanciones" element={<Sanciones />} />
        <Route path="/reservas-vencidas" element={<ReservasVencidas />} />
        <Route path="/crear-sala" element={<CrearSala />} />
        <Route path="/remove-sala" element={<RemoveSalas />} />


        {/* Página por defecto */}
        <Route path="*" element={<h3>Seleccione una opción del menú</h3>} />
      </Routes>
    </div>
  );
}

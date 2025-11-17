import { Routes, Route } from "react-router-dom";
import Protected from "./Protected";
import Login from "./Login";
import Register from "./Register";
import { useUser } from "./components/UserContext";

// Componentes privados
import Header from "./components/Header";
import MisReservas from "./components/User/MisReservas";
import Edificios from "./components/Edificios";
import SalasPorEdificio from "./components/SalasPorEdificio";
import CrearReserva from "./components/User/CrearReserva";
import ReservasVencidas from "./components/Bibliotecario/ReservasVencidas";
import CrearSala from "./components/Admin/CrearSala";
import RemoveSalas from "./components/Admin/RemoveSalas";
import MisSanciones from "./components/User/MisSanciones";
import Me from "./components/Me";
import Reservas from "./components/Bibliotecario/Reservas";
import Sanciones from "./components/Bibliotecario/Sanciones";
import CreateBiblioUser from "./components/Admin/CrearBibliotecario";

export default function App() {
  const { user, logout } = useUser();

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>

      <Routes>

        {/* Rutas públicas */}
        {!user && (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="*" element={<Login />} />
          </>
        )}

        {/* Rutas privadas */}
        {user && (
          <>
            {/* Header SIEMPRE visible para usuarios logueados */}
            <Route
              element={
                <>
                  <Header />

                  <h2>Bienvenido/a {user.name}</h2>
                  <h3>Tu rol es: <strong>{user.rol}</strong></h3>

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

                  {/* Acá se renderizan las rutas protegidas */}
                  <Protected />
                </>
              }
            >
              <Route path="/mis-reservas" element={<MisReservas />} />
              <Route path="/edificios" element={<Edificios />} />
              <Route path="/edificios/:nombreEdificio" element={<SalasPorEdificio />} />
              <Route path="/crear-reserva" element={<CrearReserva />} />
              <Route path="/mis-sanciones" element={<MisSanciones />} />
              <Route path="/reservas-vencidas" element={<ReservasVencidas />} />
              <Route path="/crear-sala" element={<CrearSala />} />
              <Route path="/remove-sala" element={<RemoveSalas />} />
              <Route path="/me" element={<Me />} />
              <Route path="/reservas" element={<Reservas />} />
              <Route path="/sanciones" element={<Sanciones />} />
              <Route path="/crearBibliotecario" element={<CreateBiblioUser />} />
            </Route>
          </>
        )}

      </Routes>
    </div>
  );
}

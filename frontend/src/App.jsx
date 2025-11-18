import { Routes, Route } from "react-router-dom";

import Protected from "./protect/Protected";
import AdminOnly from "./protect/AdminOnly";
import BiblioOnly from "./protect/BiblioOnly";

import Login from "./Login";
import Register from "./Register";
import { useUser } from "./components/UserContext";

import PrivateLayout from "./protect/PrivateLayout"; // <-- AGREGADO

// Componentes privados
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
import DeleteBiblio from "./components/Admin/DeleteBiblio";
import DeleteUser from "./components/Bibliotecario/DeleteUser";
import AdminOrBiblioOnly from "./protect/AdminOrBiblioOnly";

export default function App() {
  const { user, logout } = useUser();

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <Routes>

        {/* PUBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        {!user && <Route path="*" element={<Login />} />}

        {/* PRIVADAS */}
        {user && (
          <Route element={<Protected />}>

            {/* SOLO HEADER GLOBAL */}
            <Route element={<PrivateLayout />}>

              {/* INICIO — SOLO ACÁ MOSTRAMOS EL BLOQUE DE BIENVENIDA */}
              <Route
                path="/"
                element={
                  <>
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
                  </>
                }
              />

              {/* Rutas normales */}
              <Route path="/mis-reservas" element={<MisReservas />} />
              <Route path="/edificios" element={<Edificios />} />
              <Route path="/edificios/:nombreEdificio" element={<SalasPorEdificio />} />
              <Route path="/crear-reserva" element={<CrearReserva />} />
              <Route path="/mis-sanciones" element={<MisSanciones />} />
              <Route path="/me" element={<Me />} />

              {/* BIBLIO */}
              <Route element={<BiblioOnly />}>
                <Route path="/reservas-vencidas" element={<ReservasVencidas />} />
                <Route path="/reservas" element={<Reservas />} />
                <Route path="/sanciones" element={<Sanciones />} />
              </Route>

              {/* ADMIN */}
              <Route element={<AdminOnly />}>
                <Route path="/crear-sala" element={<CrearSala />} />
                <Route path="/remove-sala" element={<RemoveSalas />} />
                <Route path="/crearBibliotecario" element={<CreateBiblioUser />} />
                <Route path="/eliminarBibliotecario" element={<DeleteBiblio />} />
              </Route>

              <Route element={<AdminOrBiblioOnly />}>
                <Route path="/eliminarUsuario" element={<DeleteUser />} />
              </Route>

            </Route>
          </Route>
        )}

      </Routes>
    </div>
  );
}

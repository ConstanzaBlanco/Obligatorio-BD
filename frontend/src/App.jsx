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
import MisInvitaciones from "./components/User/MisInvitaciones";
import Edificios from "./components/Edificios";
import SalasPorEdificio from "./components/SalasPorEdificio";
import ReservasVencidas from "./components/Bibliotecario/ReservasVencidas";
import MisSanciones from "./components/User/MisSanciones";
import Me from "./components/Me";
import CrearReserva from "./components/User/CrearReserva";
import Reservas from "./components/Bibliotecario/Reservas";
import Sanciones from "./components/Bibliotecario/Sanciones";
import CreateBiblioUser from "./components/Admin/CrearBibliotecario";
import Usuarios from "./components/Admin/Usuarios";
import AdminOrBiblioOnly from "./protect/AdminOrBiblioOnly";
import FacultadManager from "./components/Admin/Facultad";
import ProgramaManager from "./components/Admin/ProgramaAcademico";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

export default function App() {
  const { user, logout } = useUser();

  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        {!user && <Route path="*" element={<Login />} />}

        {user && (
          <Route element={<Protected />}>

            <Route element={<PrivateLayout />}>

              <Route
                path="/"
                element={<Home />}
              />

              <Route path="/mis-reservas" element={<MisReservas />} />
              <Route path="/mis-invitaciones" element={<MisInvitaciones />} />
              <Route path="/edificios" element={<Edificios />} />
              <Route path="/edificios/:nombreEdificio" element={<SalasPorEdificio />} />
              <Route path="/crear-reserva" element={<CrearReserva />} />
              <Route path="/mis-sanciones" element={<MisSanciones />} />
              <Route path="/me" element={<Me />} />

              <Route element={<BiblioOnly />}>
                <Route path="/reservas-vencidas" element={<ReservasVencidas />} />
                <Route path="/reservas" element={<Reservas />} />
                <Route path="/sanciones" element={<Sanciones />} />
              </Route>

              <Route element={<AdminOnly />}>
                <Route path="/crearBibliotecario" element={<CreateBiblioUser />} />
                <Route path="/facultad" element={<FacultadManager />} />
                <Route path="/programa" element={<ProgramaManager />} />
              </Route>

              <Route element={<AdminOrBiblioOnly />}>
                <Route path="/users" element={<Usuarios />} />
              </Route>

              <Route path="*" element={<NotFound />} />


            </Route>
          </Route>
        )}

      </Routes>
    </div>
  );
}

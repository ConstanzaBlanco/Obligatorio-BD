import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Login from "./Login";
import Salas from "./components/Salas";
import Reservas from "./components/Reservas";
import Sanciones from "./components/Sanciones";
import CrearSala from "./components/CrearSala";
import CrearReserva from "./components/CrearReserva";

function App() {
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem("token")
  );

  if (!isLogged) {
    return <Login onLogin={() => setIsLogged(true)} />;
  }

  return (
    <Router>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        
        {/* BOTÓN DE LOGOUT */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            setIsLogged(false);
          }}
          style={{ marginBottom: 30 }}
        >
          Cerrar Sesión
        </button>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav style={{ marginBottom: 30 }}>
          <Link to="/salas" style={{ marginRight: 20 }}>Salas</Link>
          <Link to="/reservas" style={{ marginRight: 20 }}>Reservas</Link>
          <Link to="/sanciones" style={{ marginRight: 20 }}>Sanciones</Link>
          <Link to="/crear-sala" style={{ marginRight: 20 }}>Crear Sala</Link>
          <Link to="/crear-reserva">Crear Reserva</Link>
        </nav>

        {/* RUTAS */}
        <Routes>
          <Route path="/salas" element={<Salas />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/sanciones" element={<Sanciones />} />
          <Route path="/crear-sala" element={<CrearSala />} />
          <Route path="/crear-reserva" element={<CrearReserva />} />
          <Route path="*" element={<h3>Seleccione una opción del menú</h3>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

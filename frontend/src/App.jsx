import { useState } from "react";
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

  const [vista, setVista] = useState("none");

  const renderVista = () => {
    switch (vista) {
      case "salas":
        return <Salas />;
      case "reservas":
        return <Reservas />;
      case "sanciones":
        return <Sanciones />;
      case "crearSala":
        return <CrearSala />;
      case "reservas":
        return <Reservas />;
      case "crearReserva":
        return <CrearReserva />;
      default:
        return <h3>Seleccione una opción del menú</h3>;
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {isLogged ? (
        <div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              setIsLogged(false);
            }}
            style={{ marginBottom: 20 }}
          >
            Cerrar Sesión
          </button>

          {/* MENÚ */}
          <div style={{ marginBottom: 20 }}>
            <button onClick={() => setVista("salas")} style={{ marginRight: 10 }}>
              Ver Información de Salas
            </button>

            <button onClick={() => setVista("reservas")} style={{ marginRight: 10 }}>
              Ver Información de Reservas
            </button>

            <button onClick={() => setVista("sanciones")} style={{ marginRight: 10 }}>
              Ver Información de Sanciones
            </button>

            <button onClick={() => setVista("crearSala")}>
              Crear Sala
            </button>

            <button onClick={() => setVista("crearReserva")}>
              Crear Reserva
            </button>

          </div>

          {renderVista()}

        </div>
      ) : (
        <Login onLogin={() => setIsLogged(true)} />
      )}
    </div>
  );
}

export default App;

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import CrearReserva from "./User/CrearReserva";

export default function SalasPorEdificio() {
  const { nombreEdificio } = useParams();
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [salas, setSalas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // FILTROS
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [turnoFiltro, setTurnoFiltro] = useState("");

  //turnos desde backend
  const [turnos, setTurnos] = useState([]);

  //Cargar turnos al montar
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const res = await fetch("http://localhost:8000/turnosPosibles");
        const data = await res.json();
        setTurnos(data.turnos_posibles || []);
      } catch {
        console.log("Error cargando turnos");
      }
    };

    cargarTurnos();
  }, []);

  // CARGAR SALAS
  const cargarSalas = async () => {
    try {
      const token = localStorage.getItem("token");

      let url = `http://localhost:8000/salasDisponibles?edificio=${nombreEdificio}`;

      if (fechaFiltro) url += `&fecha=${fechaFiltro}`;
      if (turnoFiltro) url += `&id_turno=${turnoFiltro}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.salas_disponibles) {
        setSalas(data.salas_disponibles);
        setMensaje("");
      } else {
        setSalas([]);
        setMensaje("No hay salas que cumplan el filtro.");
      }
    } catch (error) {
      setMensaje("Error al cargar salas.");
    }
  };

  useEffect(() => {
    cargarSalas();
  }, [nombreEdificio]);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Salas en {nombreEdificio}</h2>

      {/* FILTROS */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          style={{ marginRight: 10 }}
        />

        {/*SELECT DE TURNOS DINÁMICO */}
        <select
          value={turnoFiltro}
          onChange={(e) => setTurnoFiltro(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Todos los turnos</option>

          {turnos.map((t) => (
            <option key={t.id_turno} value={t.id_turno}>
              {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
            </option>
          ))}
        </select>

        <button onClick={cargarSalas}>Aplicar filtros</button>
      </div>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {/* LISTA DE SALAS */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {salas.map((s, i) => (
          <li
            key={i}
            style={{
              border: "1px solid gray",
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
              maxWidth: 400,
              margin: "10px auto",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <strong>{s.nombre_sala}</strong>
            <p>Capacidad: {s.capacidad}</p>
            <p>Tipo: {s.tipo_sala}</p>
          </li>
        ))}
      </ul>

      {/* SOLO usuario puede crear reservas */}
      <CrearReserva edificio={nombreEdificio} salas={salas} />
    </div>
  );
}

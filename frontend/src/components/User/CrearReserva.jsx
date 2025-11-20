import { useState, useEffect } from "react";
import { useUser } from "../UserContext";

export default function CrearReserva({ edificio, salas }) {

  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  if (rol !== "usuario") {
    return null;
  }

  const [nombreSala, setNombreSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");

  const [turnos, setTurnos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  // Cargar turnos desde backend
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/turnosPosibles", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        setTurnos(data.turnos_posibles || []);

      } catch (e) {
        console.error("Error cargando turnos:", e);
      }
    };

    cargarTurnos();
  }, []);

  const crearReserva = async () => {
    setMensaje("");
    setError("");

    if (!nombreSala || !fecha || !idTurno) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (fecha < hoy) {
      setError("La fecha no puede ser menor a hoy.");
      return;
    }

    let participantesArray =
      participantes.trim() === ""
        ? []
        : participantes
            .split(",")
            .map((x) => parseInt(x.trim()))
            .filter((x) => !isNaN(x));

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          edificio,
          fecha,
          id_turno: parseInt(idTurno),
          participantes: participantesArray,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMensaje(`Reserva creada correctamente. ID: ${data.id_reserva}`);
        setNombreSala("");
        setFecha("");
        setIdTurno("");
        setParticipantes("");
      }
    } catch {
      setError("Error al crear reserva.");
    }
  };

useEffect(() => {
  async function verHoraSist() {
    const resHora = await fetch("http://localhost:8000/hora-servidor");
    const dataHora = await resHora.json();
    const horaServidor = new Date(dataHora.hora_servidor);
    console.log("HORA SERVIDOR:", horaServidor);
  }
  verHoraSist();
}, []);



  return (
    <div style={{ marginTop: 40 }}>
      <h2>Crear Reserva en {edificio}</h2>

      <div
        style={{
          maxWidth: 350,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <select value={nombreSala} onChange={(e) => setNombreSala(e.target.value)}>
          <option value="">Seleccione una sala</option>
          {salas.map((s, i) => (
            <option key={i} value={s.nombre_sala}>
              {s.nombre_sala}
            </option>
          ))}
        </select>

        <input
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <select value={idTurno} onChange={(e) => setIdTurno(e.target.value)}>
          <option value="">Seleccione turno</option>

          {turnos.map((t) => (
            <option key={t.id_turno} value={t.id_turno}>
              {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
            </option>
          ))}
        </select>

        <input
          placeholder="Participantes (CI separados por coma)"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
        />

        <button
          onClick={crearReserva}
          style={{
            padding: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 5,
          }}
        >
          Crear Reserva
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useUser } from "../UserContext";

export default function CrearReserva({ edificio, salas }) {

  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  // Si NO es usuario → no mostrar nada
  if (rol !== "usuario") {
    return null;
  }

  const [nombreSala, setNombreSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

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
          <option value="1">08:00 - 09:00</option>
          <option value="2">09:00 - 10:00</option>
          <option value="3">10:00 - 11:00</option>
          <option value="4">11:00 - 12:00</option>
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

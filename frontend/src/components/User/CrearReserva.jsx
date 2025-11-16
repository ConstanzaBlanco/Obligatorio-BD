import { useState } from "react";
import { useUser } from "../UserContext";

export default function CrearReservaAdaptado({ edificio, salas }) {
  const { user } = useUser();

  const rol = user?.rol?.toLowerCase();

  const [nombreSala, setNombreSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  const rolNoPermitido =
    rol === "administrador" || rol === "bibliotecario";

  const crearReserva = async () => {
    setMensaje("");
    setError("");

    if (rolNoPermitido) {
      setError("Solo los usuarios pueden crear reservas.");
      return;
    }

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
          edificio: edificio, // <- AHORA EL EDIFICIO VIENE DEL PADRE
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
    } catch (err) {
      setError("Error al crear reserva. Intente nuevamente.");
    }
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Crear Reserva</h2>

      {rolNoPermitido && (
        <p style={{ color: "red" }}>
          🚫 No estás autorizado para crear reservas. Rol actual: <b>{rol}</b>
        </p>
      )}

      <div
        style={{
          maxWidth: 350,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* Selección de salas desde SalasPorEdificio */}
        <select
          value={nombreSala}
          onChange={(e) => setNombreSala(e.target.value)}
          disabled={rolNoPermitido}
        >
          <option value="">Seleccione una sala</option>

          {salas.map((s, i) => (
            <option key={i} value={s.nombre_sala}>
              {s.nombre_sala}
            </option>
          ))}
        </select>

        {/* El edificio YA NO se ingresa, viene del padre */}

        <input
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          disabled={rolNoPermitido}
        />

        <select
          value={idTurno}
          onChange={(e) => setIdTurno(e.target.value)}
          disabled={rolNoPermitido}
        >
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
          disabled={rolNoPermitido}
        />

        <button
          onClick={crearReserva}
          disabled={rolNoPermitido}
          style={{
            padding: 10,
            backgroundColor: rolNoPermitido ? "gray" : "#007bff",
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

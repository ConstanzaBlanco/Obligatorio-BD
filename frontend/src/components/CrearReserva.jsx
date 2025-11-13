import { useState } from "react";

export default function CrearReserva() {
  const [nombreSala, setNombreSala] = useState("");
  const [edificio, setEdificio] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [mensaje, setMensaje] = useState("");

  const crearReserva = async () => {
    if (!nombreSala || !edificio || !fecha || !idTurno) {
      setMensaje("❌ Complete todos los campos obligatorios");
      return;
    }

    const participantesArray =
      participantes.trim() === ""
        ? []
        : participantes.split(",").map((p) => parseInt(p.trim()));

    try {
      const response = await fetch("http://localhost:8000/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          edificio: edificio,
          fecha: fecha,
          id_turno: parseInt(idTurno),
          participantes: participantesArray
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMensaje("❌ " + data.error);
      } else {
        setMensaje(
          `✔ Reserva creada correctamente (ID: ${data.id_reserva})`
        );

        // Limpiar inputs
        setNombreSala("");
        setEdificio("");
        setFecha("");
        setIdTurno("");
        setParticipantes("");
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al crear la reserva");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Crear Reserva</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nombre de sala"
          value={nombreSala}
          onChange={(e) => setNombreSala(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="Edificio"
          value={edificio}
          onChange={(e) => setEdificio(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ marginRight: 10 }}
        />

        {/* SELECT DE TURNOS */}
        <select
          value={idTurno}
          onChange={(e) => setIdTurno(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Seleccionar turno</option>
          {Array.from({ length: 15 }).map((_, i) => {
            const start = 8 + i;
            const end = start + 1;
            return (
              <option key={i + 1} value={i + 1}>
                {start}:00 - {end}:00
              </option>
            );
          })}
        </select>

        <input
          placeholder="CI participantes adicionales (separados por coma)"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
          style={{ marginRight: 10, width: 300 }}
        />

        <button onClick={crearReserva}>Reservar</button>
      </div>

      {mensaje && (
        <p style={{ color: mensaje.startsWith("✔") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

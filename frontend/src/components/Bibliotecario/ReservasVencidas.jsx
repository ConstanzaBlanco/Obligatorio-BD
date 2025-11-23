import { useEffect, useState } from "react";

export default function ReservasVencidas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [checks, setChecks] = useState({});

  const token = localStorage.getItem("token");

  // Cargar reservas vencidas
  const cargarReservas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seePastAndActiveReservations", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.reservas_pasadas_activas) {
        setReservas(data.reservas_pasadas_activas);
      } else {
        setReservas([]);
      }

    } catch (err) {
      console.error(err);
      setMensaje("Error cargando reservas vencidas.");
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  // Manejo de checkboxes
  const toggleCheck = (idReserva, ci) => {
    setChecks(prev => {
      const actuales = prev[idReserva] || [];
      if (actuales.includes(ci)) {
        return { ...prev, [idReserva]: actuales.filter(x => x !== ci) };
      }
      return { ...prev, [idReserva]: [...actuales, ci] };
    });
  };

  // Acción final: enviar asistencias o sancionar a todos
  const finalizarReserva = async (idReserva) => {
    try {
      const cisSeleccionados = checks[idReserva] || [];

      const res = await fetch("http://localhost:8000/updateReservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reserveId: idReserva,
          cis: cisSeleccionados  // si está vacío entonces el backend sanciona a todos
        })
      });

      await res.json();
      cargarReservas();

    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar reserva.");
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Reservas Vencidas</h2>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {reservas.length === 0 && <p>No hay reservas vencidas pendientes.</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {reservas.map((r) => (
          <li key={r.id_reserva} style={cardStyle}>
            <strong>{r.nombre_sala} - {r.edificio}</strong>

            <p><strong>Fecha:</strong> {r.fecha}</p>
            <p><strong>Hora fin:</strong> {r.hora_fin}</p>
            <p><strong>Estado actual:</strong> {r.estado}</p>
            <p><strong>ID reserva:</strong> {r.id_reserva}</p>

            <p><strong>Participantes (tildar los que asistieron):</strong></p>

            {r.ci_participantes.map((ci) => (
              <label key={ci} style={{ display: "block", marginBottom: 5 }}>
                <input
                  type="checkbox"
                  checked={checks[r.id_reserva]?.includes(ci) || false}
                  onChange={() => toggleCheck(r.id_reserva, ci)}
                />
                {" "}
                {ci}
              </label>
            ))}

            <button
              onClick={() => finalizarReserva(r.id_reserva)}
              style={btnOk}
            >
              Finalizar reserva
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  padding: 15,
  borderRadius: 8,
  margin: "15px auto",
  maxWidth: 420,
  textAlign: "left",
  backgroundColor: "#fdfdfd"
};

const btnOk = {
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  padding: "8px 12px",
  marginTop: 10,
  borderRadius: 5,
  cursor: "pointer"
};

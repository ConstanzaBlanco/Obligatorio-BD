import { useEffect, useState } from "react";

export default function ReservasVencidas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");

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

  // Acción para marcar finalizada
  const marcarFinalizada = async (idReserva, cis) => {
    try {
      const res = await fetch("http://localhost:8000/updateReservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reserveId: idReserva,
          cis: cis  // todos los participantes asistieron
        })
      });

      await res.json();
      cargarReservas(); // recargar la lista
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar reserva.");
    }
  };

  // Acción para marcar sin asistencia
  const marcarSinAsistencia = async (idReserva) => {
    try {
      const res = await fetch("http://localhost:8000/updateReservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reserveId: idReserva,
          cis: [] // NADIE asistió
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
        {reservas.map((r, i) => (
          <li key={i} style={cardStyle}>
            <strong>{r.nombre_sala} - {r.edificio}</strong>

            <p>
              <strong>Participantes:</strong><br />
              {r.ci_participantes.join(", ")}
            </p>

            <p><strong>Fecha:</strong> {r.fecha}</p>
            <p><strong>Hora fin:</strong> {r.hora_fin}</p>
            <p><strong>Estado actual:</strong> {r.estado}</p>

            <button
              onClick={() => marcarFinalizada(r.id_reserva, r.ci_participantes)}
              style={btnOk}
            >
              Finalizada
            </button>

            <button
              onClick={() => marcarSinAsistencia(r.id_reserva)}
              style={btnFail}
            >
              Sin asistencia
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
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  padding: "8px 12px",
  marginRight: 10,
  borderRadius: 5,
  cursor: "pointer"
};

const btnFail = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 5,
  cursor: "pointer"
};

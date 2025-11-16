import { useEffect, useState } from "react";

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Convierte "2025-11-16T20:10:29" → "16/11/2025 20:10"
function formatFechaCompleta(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleString("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Convierte "2025-11-16" → "16/11/2025"
function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-UY");
}

// Convierte 32400 (segundos) → "09:00"
function formatHora(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}


  const cancelarReserva = async (id_reserva) => {
  const confirmacion = window.confirm("¿Seguro que querés cancelar esta reserva?");
  if (!confirmacion) return;

  try {
    const res = await fetch("http://localhost:8000/cancelarReserva", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id_reserva })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.detail || data.error || "No se pudo cancelar la reserva.");
      return;
    }

    alert(data.mensaje);

    // Después de cancelar, recargamos las reservas activas
    cargarActivas();

  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
};


  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveReservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setReservas(data.reservas_activas_del_usuario || []);
      } else {
        setError(data.detail || "Error al cargar reservas");
      }

    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    }
  };

  useEffect(() => {
    cargarActivas();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Reservas Activas</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {reservas.length === 0 && (
        <p>No tenés reservas activas.</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {reservas.map((r) => (
          <div
            key={r.id_reserva}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: 16,
              width: 260,
              background: "#fafafa"
            }}
          >
            <h4>{r.nombre_sala} - {r.edificio}</h4>
            <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>
            <p><strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</p>
            <p><strong>Solicitada:</strong> {formatFechaCompleta(r.fecha_solicitud_reserva)}</p>


            <button
              onClick={() => cancelarReserva(r.id_reserva)}
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: "#d9534f",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >Cancelar</button>

          </div>
        ))}
      </div>
    </div>
  );
}

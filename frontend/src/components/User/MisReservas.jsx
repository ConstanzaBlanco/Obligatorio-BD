import { useEffect, useState } from "react";

export default function MisReservas() {
  const [misReservas, setMisReservas] = useState([]);
  const [reservasParticipando, setReservasParticipando] = useState([]);
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

// Pasa de "2025-11-16" → "16/11/2025"
function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString("es-UY");
}

function formatHora(hora) {


  //Funcionn horrible que no pude hacer solo :(
  if (hora === null || hora === undefined || hora === "") return "";

  // Si ya es string con formato HH:MM:SS o HH:MM
  if (typeof hora === "string") {
    const parts = hora.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return hora;
  }

  // Si es número 
  if (typeof hora === "number") {
    const h = Math.floor(hora / 3600);
    const m = Math.floor((hora % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // Si es un objeto 
  if (typeof hora === "object") {
    const h = hora.hour ?? hora.H ?? hora.h ?? null;
    const m = hora.minute ?? hora.min ?? hora.M ?? null;
    if (h !== null && m !== null) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    //si puede lo pasa a string
    try {
      const s = String(hora);
      if (s && typeof s === "string") return s;
    } catch (e) {
      return "";
    }
  }

  // Último recurso
  return String(hora);
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
        setMisReservas(data.mis_reservas_creadas || []);
        setReservasParticipando(data.reservas_donde_participo || []);
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

      {misReservas.length === 0 && reservasParticipando.length === 0 && (
        <p>No tenés reservas activas.</p>
      )}

      {misReservas.length > 0 && (
        <>
          <h3>Reservas que creaste</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {misReservas.map((r) => (
              <div
                key={`creada-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#fff6f6"
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>
                <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>
                <p><strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</p>

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
        </>
      )}

      {reservasParticipando.length > 0 && (
        <>
          <h3>Reservas donde participás</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {reservasParticipando.map((r) => (
              <div
                key={`part-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#f6fff6"
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>
                <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>
                <p><strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</p>
                <p style={{ fontSize: 13, color: '#666' }}><strong>Estado invitación:</strong> {r.estado_invitacion || 'aceptada'}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

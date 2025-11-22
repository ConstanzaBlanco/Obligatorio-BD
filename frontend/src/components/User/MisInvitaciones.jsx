import { useEffect, useState } from "react";

export default function MisInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Convierte "2025-11-16" → "16/11/2025"
  function formatFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-UY");
  }

  const cargarInvitaciones = async () => {
    console.log("Cargando invitaciones...");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/invitaciones/pendientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setInvitaciones(data.invitaciones || []);
        setError("");
      } else {
        setError(data.error || data.detail || "Error al cargar invitaciones");
        setInvitaciones([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
      setInvitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const aceptarInvitacion = async (id_reserva) => {
    try {
      const res = await fetch("http://localhost:8000/invitaciones/aceptar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo aceptar la invitación");
        return;
      }

      alert(data.mensaje || "Invitación aceptada");
      cargarInvitaciones();
    } catch (err) {
      console.error(err);
      alert("Error al aceptar la invitación");
    }
  };

  const rechazarInvitacion = async (id_reserva) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que querés rechazar esta invitación?"
    );
    if (!confirmacion) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/rechazar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo rechazar la invitación");
        return;
      }

      alert(data.mensaje || "Invitación rechazada");
      cargarInvitaciones();
    } catch (err) {
      console.error(err);
      alert("Error al rechazar la invitación");
    }
  };

  const bloquearInvitacion = async (id_reserva) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que querés bloquear las invitaciones de esta reserva? No recibirás más invitaciones de ella."
    );
    if (!confirmacion) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/bloquear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo bloquear la invitación");
        return;
      }

      alert(data.mensaje || "Invitaciones bloqueadas");
      cargarInvitaciones();
    } catch (err) {
      console.error(err);
      alert("Error al bloquear las invitaciones");
    }
  };

  useEffect(() => {
    cargarInvitaciones();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Invitaciones</h2>

      {loading && <p>Cargando invitaciones...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && invitaciones.length === 0 && (
        <p>No tenés invitaciones pendientes.</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        {invitaciones.map((inv, i) => (
          <div
            key={`${inv.id_reserva}-${inv.ci_participante}`}
            style={{
              border: "2px solid #5cb85c",
              borderRadius: 8,
              padding: 16,
              width: 300,
              background: "#f0f8f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ marginTop: 0, color: "#333" }}>
              {inv.nombre_sala} - {inv.edificio}
            </h4>
            <p>
              <strong>N°:</strong> {i + 1}
            </p>
            <p>
              <strong>Hora:</strong> {inv.hora_inicio} → {inv.hora_fin}
            </p>
            <p style={{ color: "#666", fontSize: 14 }}>
              <strong>De:</strong> {inv.creador_nombre} {inv.creador_apellido}
            </p>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                flexDirection: "column",
              }}
            >
              <button
                onClick={() => aceptarInvitacion(inv.id_reserva)}
                style={{
                  padding: "8px 12px",
                  background: "#5cb85c",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                ✓ Aceptar
              </button>
              <button
                onClick={() => rechazarInvitacion(inv.id_reserva)}
                style={{
                  padding: "8px 12px",
                  background: "#d9534f",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                ✗ Rechazar
              </button>
              <button
                onClick={() => bloquearInvitacion(inv.id_reserva)}
                style={{
                  padding: "8px 12px",
                  background: "#555",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                🔒 Bloquear
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

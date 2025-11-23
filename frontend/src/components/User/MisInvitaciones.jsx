import { useEffect, useState } from "react";

export default function MisInvitaciones() {
  const [invitaciones, setInvitaciones] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  function formatFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-UY");
  }

  function formatHora(hora) {
    if (!hora) return "";
    if (typeof hora === "string") {
      const parts = hora.split(":");
      if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
      return hora;
    }
    if (typeof hora === "number") {
      const h = Math.floor(hora / 3600);
      const m = Math.floor((hora % 3600) / 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    if (typeof hora === "object") {
      const h = hora.hour ?? hora.H ?? null;
      const m = hora.minute ?? hora.M ?? null;
      if (h !== null && m !== null)
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return String(hora);
  }

  const cargarInvitaciones = async () => {
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
    } catch {
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
    } catch {
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
    } catch {
      alert("Error al bloquear las invitaciones");
    }
  };

  const bloquearUsuario = async (ci_bloqueado) => {
    const confirmacion = window.confirm(
      "¿Seguro que querés bloquear a este usuario para que no te pueda invitar?"
    );
    if (!confirmacion) return;

    try {
      const res = await fetch("http://localhost:8000/bloqueos/block", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ci_bloqueado }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo bloquear al usuario");
        return;
      }

      alert(data.mensaje || "Usuario bloqueado");
      cargarInvitaciones();
    } catch {
      alert("Error al bloquear usuario");
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

            <div style={{ marginBottom: 6 }}>
              {inv.estado === "cancelada" ? (
                <span style={{ color: "#c0392b", fontWeight: 700 }}>
                  Reserva Cancelada
                </span>
              ) : (
                <span style={{ color: "#27ae60", fontWeight: 700 }}>
                  Reserva Activa
                </span>
              )}
            </div>

            <p>
              <strong>N°:</strong> {i + 1}
            </p>

            <p>
              <strong>Hora:</strong> {formatHora(inv.hora_inicio)} →{" "}
              {formatHora(inv.hora_fin)}
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
                disabled={inv.estado === "cancelada"}
                style={{
                  padding: "8px 12px",
                  background:
                    inv.estado === "cancelada" ? "#9dd7b2" : "#5cb85c",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor:
                    inv.estado === "cancelada" ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                ✓ Aceptar
              </button>

              <button
                onClick={() => rechazarInvitacion(inv.id_reserva)}
                disabled={inv.estado === "cancelada"}
                style={{
                  padding: "8px 12px",
                  background:
                    inv.estado === "cancelada" ? "#f3b6b6" : "#d9534f",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor:
                    inv.estado === "cancelada" ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                ✗ Rechazar
              </button>

              <button
                onClick={() => bloquearInvitacion(inv.id_reserva)}
                disabled={inv.estado === "cancelada"}
                style={{
                  padding: "8px 12px",
                  background:
                    inv.estado === "cancelada" ? "#9e9e9e" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor:
                    inv.estado === "cancelada" ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                🔒 Bloquear
              </button>

              <button
                onClick={() => bloquearUsuario(inv.creador)}
                style={{
                  padding: "8px 12px",
                  background: "#444",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                🚫 Bloquear usuario
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

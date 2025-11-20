import { useEffect, useState } from "react";
import "./MisReservas.css";

export default function MisReservas() {
  const [misReservas, setMisReservas] = useState([]);
  const [reservasParticipando, setReservasParticipando] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteInputs, setInviteInputs] = useState({});

  const token = localStorage.getItem("token");

  // Formato: "2025-11-16" → "16/11/2025"
  const formatFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-UY");
  };

  // Formato: "20:10:00" o número → "20:10"
  const formatHora = (hora) => {
    if (!hora) return "";
    if (typeof hora === "string") {
      const parts = hora.split(":");
      return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : hora;
    }
    if (typeof hora === "number") {
      const h = Math.floor(hora / 3600);
      const m = Math.floor((hora % 3600) / 60);
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    return String(hora);
  };

  const cancelarReserva = async (id_reserva) => {
    if (!window.confirm("¿Seguro que querés cancelar esta reserva?")) return;

    try {
      const res = await fetch("http://localhost:8000/cancelarReserva", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.error || "No se pudo cancelar la reserva.");
        return;
      }

      alert("Reserva cancelada correctamente");
      cargarActivas();
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  const enviarInvitaciones = async (id_reserva) => {
    const raw = (inviteInputs[id_reserva] || "").trim();
    if (!raw) {
      alert("Ingresá al menos un CI para invitar");
      return;
    }

    const cis = raw
      .split(/[,\s]+/)
      .map((p) => p.trim())
      .filter((p) => p !== "")
      .map((p) => {
        const n = Number(p);
        return Number.isNaN(n) ? null : n;
      })
      .filter(Boolean);

    if (cis.length === 0) {
      alert("No se encontraron CIs válidos");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/invitaciones/invitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva, participantes: cis }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || data.error || "Error al enviar invitaciones");
        return;
      }

      alert("Invitaciones enviadas correctamente");
      setInviteInputs((prev) => ({ ...prev, [id_reserva]: "" }));
      cargarActivas();
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const cargarActivas = async () => {
    setLoading(true);
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
        setError("");
      } else {
        setError(data.detail || "Error al cargar reservas");
      }
    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActivas();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mis Reservas Activas</h1>
        <p className="subtitle">Visualiza y gestiona tus reservas</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Cargando reservas...</p>
        </div>
      )}

      {!loading && misReservas.length === 0 && reservasParticipando.length === 0 && (
        <div className="empty-state">
          <p>📭 No tenés reservas activas</p>
        </div>
      )}

      {!loading && misReservas.length > 0 && (
        <section className="reservas-section">
          <h2 className="section-title">
            <span className="title-icon">📝</span>
            Reservas que creaste
          </h2>
          <div className="grid">
            {misReservas.map((r) => (
              <div key={`creada-${r.id_reserva}`} className="card success">
                <div className="card-header">
                  <h3>{r.nombre_sala}</h3>
                  <span className="badge">{r.edificio}</span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">📅 Fecha:</span>
                    <span className="info-value">{formatFecha(r.fecha)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">⏰ Horario:</span>
                    <span className="info-value">
                      {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}
                    </span>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => cancelarReserva(r.id_reserva)}
                  >
                    ❌ Cancelar
                  </button>
                </div>

                <div className="invite-section">
                  <label className="invite-label">Invitar participantes</label>
                  <input
                    type="text"
                    placeholder="CIs: 11111111,22222222,33333333"
                    value={inviteInputs[r.id_reserva] || ""}
                    onChange={(e) =>
                      setInviteInputs((prev) => ({
                        ...prev,
                        [r.id_reserva]: e.target.value,
                      }))
                    }
                    className="invite-input"
                  />
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => enviarInvitaciones(r.id_reserva)}
                  >
                    📨 Invitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && reservasParticipando.length > 0 && (
        <section className="reservas-section">
          <h2 className="section-title">
            <span className="title-icon">👥</span>
            Reservas donde participás
          </h2>
          <div className="grid">
            {reservasParticipando.map((r) => (
              <div key={`part-${r.id_reserva}`} className="card info">
                <div className="card-header">
                  <h3>{r.nombre_sala}</h3>
                  <span className="badge">{r.edificio}</span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">📅 Fecha:</span>
                    <span className="info-value">{formatFecha(r.fecha)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">⏰ Horario:</span>
                    <span className="info-value">
                      {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">✓ Estado:</span>
                    <span className="status-badge aceptada">
                      {r.estado_invitacion || "aceptada"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

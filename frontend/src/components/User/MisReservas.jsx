import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function MisReservas() {
  const [misReservas, setMisReservas] = useState([]);
  const [inviteInputs, setInviteInputs] = useState({});
  const [reservasParticipando, setReservasParticipando] = useState([]);
  const [reservasBloqueadas, setReservasBloqueadas] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const { user: currentUser } = useUser();

  function formatFechaCompleta(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-UY", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
      const h = hora.hour ?? null;
      const m = hora.minute ?? null;
      if (h !== null && m !== null)
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.error || "No se pudo cancelar la reserva.");
        return;
      }

      alert(data.mensaje);
      cargarActivas();
    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  };

  const cargarActivas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seeOwnActiveReservations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setMisReservas(data.mis_reservas_creadas || []);

        const allParticip = data.reservas_donde_participo || [];
        const bloqueadas = allParticip.filter(
          (r) => (r.estado_invitacion || "").toString() === "bloqueada"
        );
        const normales = allParticip.filter(
          (r) => (r.estado_invitacion || "").toString() !== "bloqueada"
        );

        setReservasParticipando(normales);
        setReservasBloqueadas(bloqueadas);

        const init = {};
        (data.mis_reservas_creadas || []).forEach((r) => {
          init[r.id_reserva] = { value: "", list: [], errors: [] };
        });
        setInviteInputs(init);

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


      {/*                 RESERVAS QUE CREASTE                     */}

      {misReservas.length > 0 && (
        <>
          <h3>Reservas que creaste</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {misReservas.map((r, idx) => (
              <div
                key={`creada-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#fff6f6",
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>

                <p><strong>N°:</strong> {idx + 1}</p>

                <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>

                <p>
                  <strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}
                </p>

                {/*       INVITAR PARTICIPANTES             */}
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="CI a invitar"
                    value={(inviteInputs[r.id_reserva]?.value) || ""}
                    onChange={(e) => {
                      const raw = e.target.value || "";
                      const digits = raw.replace(/\D/g, "");
                      setInviteInputs((prev) => ({
                        ...prev,
                        [r.id_reserva]: {
                          ...(prev[r.id_reserva] || { list: [], errors: [] }),
                          value: digits,
                        },
                      }));
                    }}
                    style={{ padding: 6, width: 140, marginRight: 8 }}
                  />

                  <button
                    onClick={async () => {
                      const v = inviteInputs[r.id_reserva]?.value || "";
                      if (!v) return alert("Ingresá un CI");

                      const existing = inviteInputs[r.id_reserva]?.list || [];
                      if (existing.includes(Number(v)))
                        return alert("CI ya agregado");

                      const myCi = currentUser?.ci;
                      if (myCi && Number(v) === Number(myCi)) {
                        return alert("No te podés invitar a vos mismo");
                      }

                      try {
                        const res = await fetch(
                          `http://localhost:8000/participante/existe/${v}`,
                          {
                            headers: { Authorization: `Bearer ${token}` },
                          }
                        );
                        const data = await res.json();

                        if (data.error) {
                          alert(data.error);
                          return;
                        }

                        if (data.exists) {
                          setInviteInputs((prev) => {
                            const cur = prev[r.id_reserva] || {
                              value: "",
                              list: [],
                              errors: [],
                            };
                            return {
                              ...prev,
                              [r.id_reserva]: {
                                value: "",
                                list: [...cur.list, Number(v)],
                                errors: cur.errors,
                              },
                            };
                          });
                        } else {
                          setInviteInputs((prev) => {
                            const cur = prev[r.id_reserva] || {
                              value: "",
                              list: [],
                              errors: [],
                            };
                            return {
                              ...prev,
                              [r.id_reserva]: {
                                value: "",
                                list: cur.list,
                                errors: [
                                  ...cur.errors,
                                  { ci: Number(v), error: "No existe ese CI" },
                                ],
                              },
                            };
                          });
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Error validando CI");
                      }
                    }}
                    style={{
                      padding: "8px 12px",
                      background: "#0275d8",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Agregar
                  </button>

                  {inviteInputs[r.id_reserva]?.list?.length > 0 && (
                    <button
                      onClick={async () => {
                        const list = inviteInputs[r.id_reserva].list;
                        if (!list.length) return;

                        try {
                          const res = await fetch(
                            "http://localhost:8000/invitaciones/invitar",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                id_reserva: r.id_reserva,
                                participantes: list,
                              }),
                            }
                          );

                          const data = await res.json();

                          if (!res.ok || data.error) {
                            if (Array.isArray(data.errores)) {
                              const msgs = data.errores
                                .map((e) => `${e.ci}: ${e.error}`)
                                .join("\n");
                              alert(
                                `No se pudieron enviar algunas invitaciones:\n${msgs}`
                              );
                            } else {
                              alert(data.error || "Error al enviar invitaciones");
                            }
                            return;
                          }

                          let msg =
                            data.mensaje || "Invitaciones enviadas correctamente.";

                          if (Array.isArray(data.invitados)) {
                            msg += `\nInvitados: ${data.invitados.join(", ")}`;
                          }
                          if (Array.isArray(data.errores)) {
                            const msgs = data.errores
                              .map((e) => `${e.ci}: ${e.error}`)
                              .join("\n");
                            msg += `\nAlgunos errores:\n${msgs}`;
                          }

                          alert(msg);

                          setInviteInputs((prev) => ({
                            ...prev,
                            [r.id_reserva]: { value: "", list: [], errors: [] },
                          }));

                          cargarActivas();
                        } catch (err) {
                          console.error(err);
                          alert("Error enviando invitaciones");
                        }
                      }}
                      style={{
                        padding: "8px 12px",
                        marginLeft: 8,
                        background: "#5cb85c",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      Enviar
                    </button>
                  )}

                  <div style={{ marginTop: 8 }}>
                    {(inviteInputs[r.id_reserva]?.list || []).map((ciItem) => (
                      <span
                        key={ciItem}
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          marginRight: 6,
                          background: "#eef",
                          borderRadius: 6,
                        }}
                      >
                        {ciItem}
                      </span>
                    ))}

                    {(inviteInputs[r.id_reserva]?.errors || []).map((errItem) => (
                      <div
                        key={String(errItem.ci)}
                        style={{ color: "crimson", fontSize: 12 }}
                      >
                        {errItem.ci}: {errItem.error}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CANCELAR */}
                <button
                  onClick={() => cancelarReserva(r.id_reserva)}
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            ))}
          </div>
        </>
      )}


      {/*            RESERVAS DONDE PARTICIPÁS                     */}

      {reservasParticipando.length > 0 && (
        <>
          <h3>Reservas donde participás</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {reservasParticipando.map((r, idx) => (
              <div
                key={`part-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#f6fff6",
                }}
              >
                <h4>{r.nombre_sala} - {r.edificio}</h4>

                <p><strong>N°:</strong> {idx + 1}</p>

                <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>

                <p>
                  <strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}
                </p>

                <p style={{ fontSize: 13, color: "#666" }}>
                  <strong>Estado invitación:</strong>{" "}
                  {r.estado_invitacion || "aceptada"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}


      {/*                RESERVAS BLOQUEADAS                        */}


      {reservasBloqueadas.length > 0 && (
        <>
          <h3>Reservas bloqueadas</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {reservasBloqueadas.map((r, idx) => (
              <div
                key={`bloq-${r.id_reserva}`}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  width: 260,
                  background: "#f2f2f2",
                  color: "#666",
                }}
              >
                <h4 style={{ marginTop: 0 }}>{r.nombre_sala} - {r.edificio}</h4>

                <p><strong>N°:</strong> {idx + 1}</p>


                <p><strong>Fecha:</strong> {formatFecha(r.fecha)}</p>

                <p>
                  <strong>Hora:</strong> {formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}
                </p>

                <p style={{ fontSize: 13 }}>
                  <strong>Estado invitación:</strong> {r.estado_invitacion}
                </p>

                <p style={{ fontSize: 12 }}>Bloqueaste recibir más invitaciones.</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

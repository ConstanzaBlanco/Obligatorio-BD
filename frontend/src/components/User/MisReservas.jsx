import { useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { Input } from "../ui/Field";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/Confirm";
import styles from "./Reservas.module.css";

export default function MisReservas() {
  const [misReservas, setMisReservas] = useState([]);
  const [inviteInputs, setInviteInputs] = useState({});
  const [reservasParticipando, setReservasParticipando] = useState([]);
  const [reservasBloqueadas, setReservasBloqueadas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const { user: currentUser } = useUser();
  const { success, error: toastError, warning } = useToast();
  const confirm = useConfirm();

  function formatFecha(fechaStr) {
    const [y, m, d] = fechaStr.split("-");
    const fecha = new Date(y, m - 1, d);
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
    const ok = await confirm({
      title: "Cancelar reserva",
      message: "¿Seguro que querés cancelar esta reserva?",
      confirmText: "Cancelar reserva",
      cancelText: "Volver",
      danger: true,
    });
    if (!ok) return;

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
        toastError(data.detail || data.error || "No se pudo cancelar la reserva.");
        return;
      }

      success(data.mensaje || "Reserva cancelada.");
      cargarActivas();
    } catch (err) {
      console.error(err);
      toastError("Error de conexión con el servidor");
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
        toastError(data.detail || "Error al cargar reservas");
      }
    } catch (err) {
      console.error(err);
      toastError("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActivas();
  }, []);

  const desbloquearReserva = async (id_reserva) => {
    const ok = await confirm({
      title: "Desbloquear reserva",
      message: "¿Seguro que querés desbloquear esta reserva? Volverás a recibir invitaciones.",
      confirmText: "Desbloquear",
    });
    if (!ok) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/desbloquear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        toastError(data.error || "No se pudo desbloquear la reserva");
        return;
      }

      success(data.mensaje || "Reserva desbloqueada.");
      cargarActivas();
    } catch (err) {
      console.error(err);
      toastError("Error al desbloquear la reserva");
    }
  };

  const agregarCi = async (id_reserva) => {
    const v = inviteInputs[id_reserva]?.value || "";
    if (!v) return warning("Ingresá un CI");

    const existing = inviteInputs[id_reserva]?.list || [];
    if (existing.includes(Number(v))) return warning("CI ya agregado");

    const myCi = currentUser?.ci;
    if (myCi && Number(v) === Number(myCi)) {
      return warning("No te podés invitar a vos mismo");
    }

    try {
      const res = await fetch(`http://localhost:8000/participante/existe/${v}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.error) {
        toastError(data.error);
        return;
      }

      setInviteInputs((prev) => {
        const cur = prev[id_reserva] || { value: "", list: [], errors: [] };
        if (data.exists) {
          return { ...prev, [id_reserva]: { value: "", list: [...cur.list, Number(v)], errors: cur.errors } };
        }
        return {
          ...prev,
          [id_reserva]: {
            value: "",
            list: cur.list,
            errors: [...cur.errors, { ci: Number(v), error: "No existe ese CI" }],
          },
        };
      });
    } catch (err) {
      console.error(err);
      toastError("Error validando CI");
    }
  };

  const enviarInvitaciones = async (id_reserva) => {
    const list = inviteInputs[id_reserva]?.list || [];
    if (!list.length) return;

    try {
      const res = await fetch("http://localhost:8000/invitaciones/invitar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_reserva, participantes: list }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (Array.isArray(data.errores)) {
          const msgs = data.errores.map((e) => `${e.ci}: ${e.error}`).join("\n");
          toastError(`No se pudieron enviar algunas invitaciones:\n${msgs}`);
        } else {
          toastError(data.error || "Error al enviar invitaciones");
        }
        return;
      }

      let msg = data.mensaje || "Invitaciones enviadas correctamente.";
      if (Array.isArray(data.invitados)) msg += `\nInvitados: ${data.invitados.join(", ")}`;
      if (Array.isArray(data.errores)) {
        const msgs = data.errores.map((e) => `${e.ci}: ${e.error}`).join("\n");
        msg += `\nAlgunos errores:\n${msgs}`;
      }
      success(msg);

      setInviteInputs((prev) => ({ ...prev, [id_reserva]: { value: "", list: [], errors: [] } }));
      cargarActivas();
    } catch (err) {
      console.error(err);
      toastError("Error enviando invitaciones");
    }
  };

  const nothing =
    !loading &&
    misReservas.length === 0 &&
    reservasParticipando.length === 0 &&
    reservasBloqueadas.length === 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tus reservas"
        title="Mis reservas activas"
        description="Gestioná tus reservas, invitá participantes y controlá tus invitaciones."
      />

      {loading && (
        <div className={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {nothing && (
        <EmptyState
          title="No tenés reservas activas"
          description="Cuando reserves una sala, vas a verla acá."
        />
      )}

      {/* Reservas creadas */}
      {misReservas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reservas que creaste</h2>
          <div className={styles.grid}>
            {misReservas.map((r, idx) => (
              <Card key={`creada-${r.id_reserva}`} tone="ok">
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.roomName}>{r.nombre_sala} · {r.edificio}</span>
                    <Badge variant="neutral">#{idx + 1}</Badge>
                  </div>
                  <div className={styles.rowMeta}>
                    <span><strong>{formatFecha(r.fecha)}</strong></span>
                    <span>{formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</span>
                  </div>

                  <div className={styles.inviteBlock}>
                    <div className={styles.inviteRow}>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="CI a invitar"
                        aria-label="CI a invitar"
                        value={inviteInputs[r.id_reserva]?.value || ""}
                        onChange={(e) => {
                          const digits = (e.target.value || "").replace(/\D/g, "");
                          setInviteInputs((prev) => ({
                            ...prev,
                            [r.id_reserva]: {
                              ...(prev[r.id_reserva] || { list: [], errors: [] }),
                              value: digits,
                            },
                          }));
                        }}
                      />
                      <Button variant="secondary" size="sm" onClick={() => agregarCi(r.id_reserva)}>
                        Agregar
                      </Button>
                      {inviteInputs[r.id_reserva]?.list?.length > 0 && (
                        <Button size="sm" onClick={() => enviarInvitaciones(r.id_reserva)}>
                          Enviar
                        </Button>
                      )}
                    </div>

                    {(inviteInputs[r.id_reserva]?.list?.length > 0 ||
                      inviteInputs[r.id_reserva]?.errors?.length > 0) && (
                      <div className={styles.chips}>
                        {(inviteInputs[r.id_reserva]?.list || []).map((ciItem) => (
                          <span key={ciItem} className={styles.chip}>{ciItem}</span>
                        ))}
                        {(inviteInputs[r.id_reserva]?.errors || []).map((errItem) => (
                          <span key={String(errItem.ci)} className={styles.chipError}>
                            {errItem.ci}: {errItem.error}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <Button variant="danger" size="sm" onClick={() => cancelarReserva(r.id_reserva)}>
                      Cancelar reserva
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Reservas donde participa */}
      {reservasParticipando.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reservas donde participás</h2>
          <div className={styles.grid}>
            {reservasParticipando.map((r, idx) => (
              <Card key={`part-${r.id_reserva}`}>
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.roomName}>{r.nombre_sala} · {r.edificio}</span>
                    <Badge variant="neutral">#{idx + 1}</Badge>
                  </div>
                  <div className={styles.rowMeta}>
                    <span><strong>{formatFecha(r.fecha)}</strong></span>
                    <span>{formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</span>
                  </div>
                  <div>
                    <Badge variant="info">{r.estado_invitacion || "aceptada"}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Reservas bloqueadas */}
      {reservasBloqueadas.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reservas bloqueadas</h2>
          <div className={styles.grid}>
            {reservasBloqueadas.map((r, idx) => (
              <Card key={`bloq-${r.id_reserva}`} tone="muted">
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <span className={styles.roomName}>{r.nombre_sala} · {r.edificio}</span>
                    <Badge variant="neutral">#{idx + 1}</Badge>
                  </div>
                  <div className={styles.rowMeta}>
                    <span><strong>{formatFecha(r.fecha)}</strong></span>
                    <span>{formatHora(r.hora_inicio)} → {formatHora(r.hora_fin)}</span>
                  </div>
                  <p className={styles.caption}>Bloqueaste recibir más invitaciones.</p>
                  <div className={styles.cardActions}>
                    <Button variant="secondary" size="sm" fullWidth onClick={() => desbloquearReserva(r.id_reserva)}>
                      Desbloquear
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}

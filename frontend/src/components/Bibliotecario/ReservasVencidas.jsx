import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import { useToast } from "../ui/Toast";
import styles from "./ReservasVencidas.module.css";

export default function ReservasVencidas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({});

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();

  const cargarReservas = async () => {
    try {
      const res = await fetch("http://localhost:8000/seePastAndActiveReservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReservas(data.reservas_pasadas_activas || []);
    } catch (err) {
      console.error(err);
      toastError("Error cargando reservas vencidas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, []);

  const toggleCheck = (idReserva, ci) => {
    setChecks((prev) => {
      const actuales = prev[idReserva] || [];
      if (actuales.includes(ci)) {
        return { ...prev, [idReserva]: actuales.filter((x) => x !== ci) };
      }
      return { ...prev, [idReserva]: [...actuales, ci] };
    });
  };

  const finalizarReserva = async (idReserva) => {
    try {
      const cisSeleccionados = checks[idReserva] || [];
      const res = await fetch("http://localhost:8000/updateReservation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reserveId: idReserva, cis: cisSeleccionados }),
      });
      await res.json();
      success("Reserva finalizada. Se registraron asistencias y sanciones.");
      cargarReservas();
    } catch (err) {
      console.error(err);
      toastError("Error al actualizar reserva.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Bibliotecario"
        title="Reservas vencidas"
        description="Marcá quién asistió a cada reserva. Los participantes no tildados serán sancionados."
      />

      {loading ? (
        <div className={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : reservas.length === 0 ? (
        <EmptyState title="Todo al día" description="No hay reservas vencidas pendientes de cierre." />
      ) : (
        <div className={styles.grid}>
          {reservas.map((r) => (
            <Card key={r.id_reserva} tone="warn">
              <div className={styles.head}>
                <span className={styles.room}>{r.nombre_sala} · {r.edificio}</span>
                <Badge variant="neutral">#{r.id_reserva}</Badge>
              </div>
              <div className={styles.meta}>
                <span>{r.fecha}</span>
                <span>Fin {r.hora_fin}</span>
                <span>Estado: {r.estado}</span>
              </div>

              <p className={styles.legend}>Tildá los participantes que asistieron</p>
              <div className={styles.checks}>
                {r.ci_participantes.map((ci) => (
                  <label key={ci} className={styles.check}>
                    <input
                      type="checkbox"
                      checked={checks[r.id_reserva]?.includes(ci) || false}
                      onChange={() => toggleCheck(r.id_reserva, ci)}
                    />
                    <span>{ci}</span>
                  </label>
                ))}
              </div>

              <div className={styles.actions}>
                <Button size="sm" onClick={() => finalizarReserva(r.id_reserva)}>
                  Finalizar reserva
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}

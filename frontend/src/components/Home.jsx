import { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { PageContainer, PageHeader } from "./ui/Page";
import Card, { CardHeader } from "./ui/Card";
import Table from "./ui/Table";
import { SkeletonCard } from "./ui/Skeleton";
import EmptyState from "./ui/EmptyState";
import styles from "./Home.module.css";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    salas: [],
    turnos: [],
    promedioParticipantes: [],
    reservasCarrera: [],
    ocupacionEdificios: [],
    asistencias: [],
    sanciones: [],
    usoReservas: null,
    topMes: [],
    promedioSanciones: [],
    diaMasReservas: null,
  });

  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const urls = {
        salas: "/estadisticas/salas-mas-reservadas",
        promedioParticipantes: "/estadisticas/promedio-participantes",
        reservasCarrera: "/estadisticas/reservas-por-carrera",
        ocupacionEdificios: "/estadisticas/ocupacion-edificios",
        asistencias: "/estadisticas/asistencias",
        sanciones: "/estadisticas/sanciones",
        usoReservas: "/estadisticas/uso-reservas",
        topMes: "/estadisticas/top-participantes-mes",
        promedioSanciones: "/estadisticas/promedio-sanciones",
        diaMasReservas: "/estadisticas/dia-mas-reservas",
      };

      const results = {};

      for (const key in urls) {
        const res = await fetch("http://localhost:8000" + urls[key], {
          headers: { Authorization: `Bearer ${token}` },
        });
        results[key] = await res.json();
      }

      setData(results);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isStaff = rol === "bibliotecario" || rol === "administrador";

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`Hola, ${user?.name || ""}`}
        title="Panel de estadísticas"
        description="Un resumen del uso de las salas de estudio del sistema."
      />

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Salas más reservadas */}
          <Card>
            <CardHeader title="Salas más reservadas" />
            {data.salas.length ? (
              <Table>
                <thead><tr><th>Sala</th><th>Reservas</th></tr></thead>
                <tbody>
                  {data.salas.map((s, i) => (
                    <tr key={i}><td>{s.nombre_sala}</td><td>{s.cant_reservas}</td></tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState title="Sin datos" description="Todavía no hay reservas registradas." />
            )}
          </Card>

          {/* Promedio de participantes */}
          <Card>
            <CardHeader title="Promedio de participantes por sala" />
            {data.promedioParticipantes.length ? (
              <Table>
                <thead><tr><th>Sala</th><th>Promedio</th></tr></thead>
                <tbody>
                  {data.promedioParticipantes.map((p, i) => (
                    <tr key={i}><td>{p.nombre_sala}</td><td>{Number(p.promedio_participantes).toFixed(1)}</td></tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState title="Sin datos" description="No hay participantes registrados aún." />
            )}
          </Card>

          {/* Reservas por facultad y carrera */}
          <Card>
            <CardHeader title="Reservas por facultad y carrera" />
            {data.reservasCarrera.length ? (
              <Table>
                <thead><tr><th>Facultad</th><th>Programa</th><th>Total</th></tr></thead>
                <tbody>
                  {data.reservasCarrera.map((r, i) => (
                    <tr key={i}><td>{r.facultad}</td><td>{r.nombre_programa}</td><td>{r.cantidadReservas}</td></tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState title="Sin datos" description="No hay reservas por carrera todavía." />
            )}
          </Card>

          {/* Ocupación de edificios */}
          <Card>
            <CardHeader title="Ocupación actual de edificios" />
            <div className={styles.cardBody}>
              {data.ocupacionEdificios.length ? (
                data.ocupacionEdificios.map((o, i) => (
                  <div key={i} className={styles.barRow}>
                    <div className={styles.barLabel}>
                      <strong>{o.edificio}</strong>
                      <span>{o.porcentaje_ocupadas.toFixed(1)}%</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: `${o.porcentaje_ocupadas}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="Sin datos" description="No hay información de ocupación." />
              )}
            </div>
          </Card>

          {isStaff && (
            <>
              {/* Asistencias */}
              <Card>
                <CardHeader title="Asistencias y reservas" />
                {data.asistencias.length ? (
                  <Table>
                    <thead><tr><th>Participante</th><th>Rol</th><th>Tipo</th><th>Asist.</th></tr></thead>
                    <tbody>
                      {data.asistencias.map((a, i) => (
                        <tr key={i}><td>{a.nombre} {a.apellido}</td><td>{a.rol}</td><td>{a.tipo}</td><td>{a.asistencias}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState title="Sin datos" description="No hay asistencias registradas." />
                )}
              </Card>

              {/* Sanciones por rol y programa */}
              <Card>
                <CardHeader title="Sanciones por rol y programa" />
                {data.sanciones.length ? (
                  <Table>
                    <thead><tr><th>Rol</th><th>Programa</th><th>Total</th></tr></thead>
                    <tbody>
                      {data.sanciones.map((s, i) => (
                        <tr key={i}><td>{s.rol}</td><td>{s.tipo}</td><td>{s.cant_sanciones}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState title="Sin datos" description="No hay sanciones registradas." />
                )}
              </Card>

              {/* Uso de reservas */}
              <Card>
                <CardHeader title="Uso de reservas" />
                <div className={styles.cardBody}>
                  <div className={styles.statRow}>
                    <span className={styles.statCaption}>Utilizadas</span>
                    <span className={styles.statValue}>{data.usoReservas?.Utilizadas?.toFixed(1)}%</span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statCaption}>No utilizadas</span>
                    <span className={styles.statValue}>{data.usoReservas?.NoUtilizadas?.toFixed(1)}%</span>
                  </div>
                </div>
              </Card>

              {/* Top participantes del mes */}
              <Card>
                <CardHeader title="Top participantes del mes" />
                {data.topMes.length ? (
                  <Table>
                    <thead><tr><th>Participante</th><th>Reservas</th></tr></thead>
                    <tbody>
                      {data.topMes.map((p, i) => (
                        <tr key={i}><td>{p.nombre} {p.apellido}</td><td>{p.cant_reservas}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState title="Sin datos" description="Nadie participó este mes todavía." />
                )}
              </Card>

              {/* Promedio duración de sanciones */}
              <Card>
                <CardHeader title="Promedio de duración de sanciones (días)" />
                {data.promedioSanciones.length ? (
                  <Table>
                    <thead><tr><th>CI</th><th>Promedio</th></tr></thead>
                    <tbody>
                      {data.promedioSanciones.map((p, i) => (
                        <tr key={i}><td>{p.ci}</td><td>{Number(p.promedio_dias).toFixed(1)}</td></tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState title="Sin datos" description="No hay sanciones con duración registrada." />
                )}
              </Card>

              {/* Día con más reservas */}
              <Card>
                <CardHeader title="Día de la semana con más reservas" />
                <div className={styles.cardBody}>
                  {data.diaMasReservas ? (
                    <div className={styles.statRow}>
                      <span className={styles.statValue} style={{ textTransform: "capitalize" }}>
                        {data.diaMasReservas.dia_semana}
                      </span>
                      <span className={styles.statCaption}>{data.diaMasReservas.total_reservas} reservas</span>
                    </div>
                  ) : (
                    <EmptyState title="Sin datos" description="No hay datos suficientes." />
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </PageContainer>
  );
}

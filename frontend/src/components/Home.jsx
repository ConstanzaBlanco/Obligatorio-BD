import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./useUser";
import { PageContainer, PageHeader } from "./ui/Page";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import EmptyState from "./ui/EmptyState";
import { SkeletonCard } from "./ui/Skeleton";
import styles from "./Home.module.css";

const AVATAR_PALETTE = [
  { bg: "var(--color-info-bg)", text: "var(--color-info-text)" },
  { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" },
  { bg: "var(--color-success-bg)", text: "var(--color-success-text)" },
  { bg: "rgba(214, 158, 46, 0.16)", text: "var(--color-accent-strong)" },
  { bg: "var(--color-error-bg)", text: "var(--color-error-text)" },
  { bg: "var(--color-surface-sunken)", text: "var(--color-text-muted)" },
];

const MEDAL_STYLE = [
  { bg: "rgba(214, 158, 46, 0.16)", text: "var(--color-accent-strong)" }, // oro
  { bg: "var(--color-surface-sunken)", text: "var(--color-text-muted)" }, // plata
  { bg: "var(--color-warning-bg)", text: "var(--color-warning-text)" }, // bronce
];

const ROLE_VARIANT = { docente: "info", alumno: "success" };
const TIPO_VARIANT = { grado: "neutral", posgrado: "accent" };

function avatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(nombre, apellido) {
  return `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
}

function pct(n) {
  return `${Number(n || 0).toFixed(1)}%`;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    salas: [],
    promedioParticipantes: [],
    reservasCarrera: [],
    ocupacionEdificios: [],
    asistencias: [],
    sanciones: [],
    usoReservas: null,
    topMes: [],
    promedioSanciones: [],
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch once on mount
  }, []);

  // Este panel es para el personal de la biblioteca; a Usuario lo mandamos a su propia vista.
  if (rol !== "administrador" && rol !== "bibliotecario") {
    return <Navigate to="/mis-reservas" replace />;
  }

  const utilizadas = data.usoReservas?.Utilizadas ?? 0;
  const noUtilizadas = data.usoReservas?.NoUtilizadas ?? 0;
  const totalSanciones = data.sanciones.reduce((sum, s) => sum + s.cant_sanciones, 0);

  const topSalas = data.salas.slice(0, 5);
  const maxSalas = Math.max(1, ...topSalas.map((s) => s.cant_reservas));
  const maxParticipantes = Math.max(1, ...data.promedioParticipantes.map((p) => Number(p.promedio_participantes)));
  const maxCarrera = Math.max(1, ...data.reservasCarrera.map((r) => r.cantidadReservas));
  const maxSanciones = Math.max(1, ...data.sanciones.map((s) => s.cant_sanciones));
  const maxDuracion = Math.max(1, ...data.promedioSanciones.map((p) => Number(p.promedio_dias)));

  const utilizadasDeg = (utilizadas / 100) * 360;
  const noUtilizadasDeg = utilizadasDeg + (noUtilizadas / 100) * 360;

  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow={`Rol: ${user?.rol || ""}`}
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
        <>
          <div className={styles.grid}>
            {/* Salas más reservadas */}
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}>Salas más reservadas</h3>
              {topSalas.length ? (
                <div className={styles.hbarList}>
                  {topSalas.map((s, i) => (
                    <div key={i} className={styles.hbarRow}>
                      <span className={styles.hbarLabel}>{s.nombre_sala}</span>
                      <div className={styles.hbarTrack}>
                        <div
                          className={styles.hbarFill}
                          style={{
                            width: `${(s.cant_reservas / maxSalas) * 100}%`,
                            opacity: 1 - i * 0.15,
                          }}
                        />
                      </div>
                      <span className={styles.hbarValue}>{s.cant_reservas}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="Todavía no hay reservas registradas." />
              )}
            </Card>

            {/* Promedio de participantes */}
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}>Promedio de participantes por sala</h3>
              {data.promedioParticipantes.length ? (
                <div className={styles.vchart}>
                  {data.promedioParticipantes.map((p, i) => {
                    const value = Number(p.promedio_participantes);
                    const isMax = value === maxParticipantes;
                    return (
                      <div key={i} className={styles.vcol}>
                        <span className={styles.vval}>{value.toFixed(1)}</span>
                        <div
                          className={`${styles.vbar} ${isMax ? styles.vbarMax : ""}`}
                          style={{ height: `${(value / maxParticipantes) * 100}%` }}
                        />
                        <span className={styles.vlabel}>{p.nombre_sala}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay participantes registrados aún." />
              )}
            </Card>

            {/* Reservas por facultad y carrera */}
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}>Reservas por facultad y carrera</h3>
              {data.reservasCarrera.length ? (
                <div className={styles.facultadList}>
                  {data.reservasCarrera.map((r, i) => (
                    <div key={i} className={styles.facultadRow}>
                      <div className={styles.facultadHead}>
                        <span className={styles.facultadName}>
                          <strong>{r.facultad}</strong>{" "}
                          <span className={styles.muted2}>· {r.nombre_programa}</span>
                        </span>
                        <span className={styles.facultadTotal}>{r.cantidadReservas}</span>
                      </div>
                      <div className={`${styles.hbarTrack} ${styles.thin}`}>
                        <div
                          className={styles.hbarFill}
                          style={{ width: `${(r.cantidadReservas / maxCarrera) * 100}%`, opacity: 1 - i * 0.15 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay reservas por carrera todavía." />
              )}
            </Card>

            {/* Uso de reservas */}
            <Card className={`${styles.card} ${styles.donutCard}`}>
              <h3 className={styles.cardTitle}>Uso de reservas</h3>
              <div
                className={styles.donut}
                style={{
                  background: `conic-gradient(var(--color-primary) 0deg ${utilizadasDeg}deg, var(--color-warning) ${utilizadasDeg}deg ${noUtilizadasDeg}deg, var(--color-surface-sunken) ${noUtilizadasDeg}deg 360deg)`,
                }}
              >
                <div className={styles.donutHole}>
                  <span className={styles.donutValue}>{pct(utilizadas)}</span>
                  <span className={styles.donutCaption}>utilizadas</span>
                </div>
              </div>
            </Card>

            {/* Ocupación de edificios */}
            <Card className={styles.card}>
              <div className={styles.cardHeadRow}>
                <h3 className={styles.cardTitle}>Ocupación actual de edificios</h3>
                <span className={styles.nowBadge}>Ahora</span>
              </div>
              {data.ocupacionEdificios.length ? (
                <div className={styles.occupancyList}>
                  {data.ocupacionEdificios.map((o, i) => (
                    <div key={i} className={styles.occupancyRow}>
                      <span className={styles.occupancyName}>{o.edificio}</span>
                      <div className={`${styles.hbarTrack} ${styles.thinner}`}>
                        <div className={styles.hbarFill} style={{ width: `${o.porcentaje_ocupadas}%` }} />
                      </div>
                      <span className={styles.occupancyValue}>{pct(o.porcentaje_ocupadas)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay información de ocupación." />
              )}
            </Card>

            {/* Top participantes del mes */}
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}>Top participantes del mes</h3>
              {data.topMes.length ? (
                <div className={styles.rankList}>
                  {data.topMes.map((p, i) => {
                    const medal = MEDAL_STYLE[i] || MEDAL_STYLE[2];
                    const avatar = avatarColor(`${p.nombre}${p.apellido}`);
                    return (
                      <div key={i} className={`${styles.rankRow} ${i === 0 ? styles.rankFirst : ""}`}>
                        <span
                          className={styles.rankMedal}
                          style={{ background: medal.bg, color: medal.text }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={styles.avatar}
                          style={{ background: avatar.bg, color: avatar.text }}
                        >
                          {initials(p.nombre, p.apellido)}
                        </span>
                        <span className={styles.rankName}>{p.nombre} {p.apellido}</span>
                        <span className={styles.rankCount}>
                          <strong>{p.cant_reservas}</strong> reservas
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="Nadie participó este mes todavía." />
              )}
            </Card>

            {/* Asistencias y reservas */}
            <Card className={`${styles.card} ${styles.spanTwo}`}>
              <h3 className={styles.cardTitle}>Asistencias y reservas</h3>
              {data.asistencias.length ? (
                <div className={styles.attTable}>
                  <div className={`${styles.attRow} ${styles.attHead}`}>
                    <span>Participante</span>
                    <span>Rol</span>
                    <span>Tipo</span>
                    <span className={styles.alignRight}>Asistencias</span>
                  </div>
                  {data.asistencias.map((a, i) => {
                    const avatar = avatarColor(`${a.nombre}${a.apellido}`);
                    return (
                      <div key={i} className={styles.attRow}>
                        <span className={styles.attParticipant}>
                          <span
                            className={styles.avatarSm}
                            style={{ background: avatar.bg, color: avatar.text }}
                          >
                            {initials(a.nombre, a.apellido)}
                          </span>
                          {a.nombre} {a.apellido}
                        </span>
                        <span>
                          <Badge variant={ROLE_VARIANT[a.rol] || "neutral"}>{a.rol}</Badge>
                        </span>
                        <span>
                          <Badge variant={TIPO_VARIANT[a.tipo] || "neutral"}>{a.tipo}</Badge>
                        </span>
                        <span className={styles.alignRight}><strong>{a.asistencias}</strong></span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay asistencias registradas." />
              )}
            </Card>

            {/* Sanciones por rol y programa */}
            <Card className={styles.card}>
              <h3 className={styles.cardTitle}>Sanciones por rol y programa</h3>
              {data.sanciones.length ? (
                <div className={styles.facultadList}>
                  {data.sanciones.map((s, i) => (
                    <div key={i} className={styles.facultadRow}>
                      <div className={styles.facultadHead}>
                        <span className={styles.facultadName}>
                          <strong className="capitalize">{s.rol}</strong>{" "}
                          <span className={styles.muted2}>· {s.tipo}</span>
                        </span>
                        <span className={styles.dangerValue}>{s.cant_sanciones}</span>
                      </div>
                      <div className={`${styles.hbarTrack} ${styles.thin} ${styles.dangerTrack}`}>
                        <div
                          className={styles.hbarFillDanger}
                          style={{ width: `${(s.cant_sanciones / maxSanciones) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay sanciones registradas." />
              )}
              <div className={styles.sancionesFooter}>
                <span className={styles.muted}>Total de sanciones</span>
                <span className={styles.sancionesFooterValue}>{totalSanciones}</span>
              </div>
            </Card>

            {/* Promedio duración de sanciones */}
            <Card className={`${styles.card} ${styles.spanThree}`}>
              <div className={styles.cardHeadRow}>
                <h3 className={styles.cardTitle}>Promedio de duración de sanciones (días)</h3>
                <span className={styles.muted2}>por CI del usuario</span>
              </div>
              {data.promedioSanciones.length ? (
                <div className={`${styles.vchart} ${styles.vchartTall}`}>
                  {data.promedioSanciones.map((p, i) => {
                    const value = Number(p.promedio_dias);
                    const isMax = value === maxDuracion && value > 0;
                    return (
                      <div key={i} className={styles.vcol}>
                        <span className={`${styles.vval} ${isMax ? styles.vvalDanger : ""}`}>{value.toFixed(1)}</span>
                        <div
                          className={`${styles.vbar} ${isMax ? styles.vbarDanger : ""}`}
                          style={{ height: `${Math.max(2, (value / maxDuracion) * 100)}%` }}
                        />
                        <span className={styles.vlabel}>{p.ci}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sin datos" description="No hay sanciones con duración registrada." />
              )}
            </Card>
          </div>
        </>
      )}
    </PageContainer>
  );
}

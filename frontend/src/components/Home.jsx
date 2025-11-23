import { useEffect, useState } from "react";
import { useUser } from "./UserContext";

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
    diaMasReservas: null   
  });

  const { user, logout } = useUser();
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
        diaMasReservas: "/estadisticas/dia-mas-reservas"
      };

      const results = {};

      for (const key in urls) {
        const res = await fetch("http://localhost:8000" + urls[key], {
          headers: { Authorization: `Bearer ${token}` }
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

  if (loading) return <h2 style={{ textAlign: "center" }}>Cargando estadísticas...</h2>;

  return (
    <>
      <style>{`
        .home-container {
          padding: 40px;
          background: #f5f7fb;
          min-height: 100vh;
        }
        .title {
          font-size: 32px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 30px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 25px;
        }
        .card {
          background: white;
          padding: 22px;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(0,0,0,0.08);
          border: 1px solid #e1e1e1;
        }
        .card h3 {
          margin-bottom: 12px;
          color: #2c3e50;
          font-size: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          text-align: left;
        }
        th {
          background: #e8effc;
          font-weight: bold;
        }
        .bar {
          height: 12px;
          background: #2980b9;
          border-radius: 6px;
        }
      `}</style>

      <h2>Bienvenido/a {user.name}</h2>
      <h3>Tu rol es: <strong>{user.rol}</strong></h3>

      <button
        onClick={logout}
        style={{
          padding: "8px 14px",
          marginBottom: 25,
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>

      <div className="home-container">
        <h2 className="title">Dashboard — Estadísticas del Sistema</h2>

        <div className="grid">

          {/* TARJETA 1 */}
          <div className="card">
            <h3>Salas más reservadas</h3>
            <table>
              <thead>
                <tr><th>Sala</th><th>Reservas</th></tr>
              </thead>
              <tbody>
                {data.salas.map((s, i) => (
                  <tr key={i}>
                    <td>{s.nombre_sala}</td>
                    <td>{s.cant_reservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*TARJETA 2 */}
          <div className="card">
            <h3>Promedio de participantes por sala</h3>
            <table>
              <thead><tr><th>Sala</th><th>Promedio</th></tr></thead>
              <tbody>
                {data.promedioParticipantes.map((p, i) => (
                  <tr key={i}>
                    <td>{p.nombre_sala}</td>
                    <td>{Number(p.promedio_participantes).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TARJETA 3  */}
          <div className="card">
            <h3>Reservas por facultad y carrera</h3>
            <table>
              <thead><tr><th>Facultad</th><th>Programa</th><th>Total</th></tr></thead>
              <tbody>
                {data.reservasCarrera.map((r, i) => (
                  <tr key={i}>
                    <td>{r.facultad}</td>
                    <td>{r.nombre_programa}</td>
                    <td>{r.cantidadReservas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TARJETA 4  */}
          <div className="card">
            <h3>Ocupación actual de edificios (%)</h3>
            {data.ocupacionEdificios.map((o, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <strong>{o.edificio}</strong> — {o.porcentaje_ocupadas.toFixed(1)}%
                <div className="bar" style={{ width: `${o.porcentaje_ocupadas}%` }}></div>
              </div>
            ))}
          </div>

          {/* BLOQUE SOLO ADM/BIBLIO */}
          {(rol === "bibliotecario" || rol === "administrador") && (
            <>

              {/* Tarjeta 6 */}
              <div className="card">
                <h3>Asistencias y Reservas</h3>
                <table>
                  <thead>
                    <tr><th>Participante</th><th>Rol</th><th>Tipo</th><th>Asistencias</th></tr>
                  </thead>
                  <tbody>
                    {data.asistencias.map((a, i) => (
                      <tr key={i}>
                        <td>{a.nombre} {a.apellido}</td>
                        <td>{a.rol}</td>
                        <td>{a.tipo}</td>
                        <td>{a.asistencias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjeta 7 */}
              <div className="card">
                <h3>Sanciones por Rol y Programa</h3>
                <table>
                  <thead><tr><th>Rol</th><th>Programa</th><th>Total</th></tr></thead>
                  <tbody>
                    {data.sanciones.map((s, i) => (
                      <tr key={i}>
                        <td>{s.rol}</td>
                        <td>{s.tipo}</td>
                        <td>{s.cant_sanciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjeta 8 */}
              <div className="card">
                <h3>Uso de Reservas</h3>
                <p>Utilizadas: <strong>{data.usoReservas?.Utilizadas?.toFixed(1)}%</strong></p>
                <p>No utilizadas: <strong>{data.usoReservas?.NoUtilizadas?.toFixed(1)}%</strong></p>
              </div>

              {/* Tarjeta 9 */}
              <div className="card">
                <h3>Top participantes del mes</h3>
                <table>
                  <thead><tr><th>Participante</th><th>Reservas</th></tr></thead>
                  <tbody>
                    {data.topMes.map((p, i) => (
                      <tr key={i}>
                        <td>{p.nombre} {p.apellido}</td>
                        <td>{p.cant_reservas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjeta 10 */}
              <div className="card">
                <h3>Promedio duración de sanciones (días)</h3>
                <table>
                  <thead><tr><th>CI</th><th>Promedio</th></tr></thead>
                  <tbody>
                    {data.promedioSanciones.map((p, i) => (
                      <tr key={i}>
                        <td>{p.ci}</td>
                        <td>{Number(p.promedio_dias).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/*Tarjeta 11 */}
              <div className="card">
                <h3>Día de la semana con más reservas</h3>
                {data.diaMasReservas ? (
                  <p>
                    <strong>{data.diaMasReservas.dia_semana}</strong>  
                    — {data.diaMasReservas.total_reservas} reservas
                  </p>
                ) : (
                  <p>No hay datos.</p>
                )}
              </div>

            </>
          )}

        </div>
      </div>
    </>
  );
}

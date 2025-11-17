import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CrearReserva from "./User/CrearReserva";

export default function SalasPorEdificio() {

  const { nombreEdificio } = useParams();

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");

  const [mensaje, setMensaje] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  // Cargar turnos del backend
  useEffect(() => {
    const cargarTurnos = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/turnosPosibles", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        setTurnos(data.turnos_posibles || []);

      } catch {
        console.log("Error cargando turnos");
      }
    };

    cargarTurnos();
  }, []);

  // Cargar salas (con o sin filtros)
  useEffect(() => {
    const cargarSalas = async () => {
      try {
        const token = localStorage.getItem("token");

        // Construir URL con filtros dinámicos
        let url = `http://localhost:8000/salasDelEdificio?edificio=${nombreEdificio}`;

        if (fecha) url += `&fecha=${fecha}`;
        if (idTurno) url += `&id_turno=${idTurno}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (Array.isArray(data.salas)) {
          setSalas(data.salas);
          setMensaje("");
        } 
        else if (data.mensaje) {
          setSalas([]);
          setMensaje(data.mensaje);
        } 
        else {
          setSalas([]);
          setMensaje("No hay salas disponibles.");
        }

      } catch {
        setMensaje("Error cargando salas.");
      }
    };

    cargarSalas();
  }, [nombreEdificio, fecha, idTurno]); // <--- FILTRO AUTOMÁTICO

  return (
    <div style={{ marginTop: 30 }}>
      <h2 style={{ textAlign: "center" }}>
        Salas del edificio <b>{nombreEdificio}</b>
      </h2>

      {/* FILTRO FECHA Y TURNO */}
      <div style={{
        maxWidth: 400,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 20
      }}>
        
        <input 
          type="date"
          min={hoy}
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />

        <select value={idTurno} onChange={(e) => setIdTurno(e.target.value)}>
          <option value="">Seleccionar turno</option>
          {turnos.map((t) => (
            <option key={t.id_turno} value={t.id_turno}>
              {t.hora_inicio.slice(0,5)} - {t.hora_fin.slice(0,5)}
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p style={{ color: "red", textAlign: "center", marginTop: 10 }}>{mensaje}</p>
      )}

      {/* TARJETAS DE SALAS */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 20,
        marginTop: 20
      }}>
        {salas.map((s, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              background: "#fafafa",
              padding: 15,
              borderRadius: 10,
              width: 300,
              textAlign: "left",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: 10 }}>{s.nombre_sala}</h3>

            <p><strong>Capacidad:</strong> {s.capacidad} personas</p>
            <p><strong>Tipo:</strong> {s.tipo_sala}</p>
          </div>
        ))}
      </div>

      {/* FORMULARIO DE RESERVA */}
      <div style={{ marginTop: 40 }}>
        <CrearReserva edificio={nombreEdificio} salas={salas} />
      </div>
    </div>
  );
}

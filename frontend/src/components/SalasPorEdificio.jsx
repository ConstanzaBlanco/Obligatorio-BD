import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "./UserContext";

export default function SalasPorEdificio() {
  const { nombreEdificio } = useParams();
  const { user } = useUser();
  const rol = user?.rol?.toLowerCase();

  const [salas, setSalas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // FILTROS (opcionales)
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [turnoFiltro, setTurnoFiltro] = useState("");

  // CAMPOS PARA CREAR RESERVA
  const [nombreSala, setNombreSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [mensajeReserva, setMensajeReserva] = useState("");
  const [errorReserva, setErrorReserva] = useState("");

  const hoy = new Date().toISOString().split("T")[0];
  const rolNoPermitido = rol === "administrador" || rol === "bibliotecario";

  // CARGAR SALAS
  const cargarSalas = async () => {
    try {
      const token = localStorage.getItem("token");

      let url = `http://localhost:8000/salasDisponibles?edificio=${nombreEdificio}`;

      if (fechaFiltro) url += `&fecha=${fechaFiltro}`;
      if (turnoFiltro) url += `&id_turno=${turnoFiltro}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.salas_disponibles) {
        setSalas(data.salas_disponibles);
        setMensaje("");
      } else {
        setSalas([]);
        setMensaje("No hay salas que cumplan el filtro.");
      }
    } catch (error) {
      setMensaje("Error al cargar salas.");
    }
  };

  useEffect(() => {
    cargarSalas();
  }, [nombreEdificio]);

  // CREAR RESERVA
  const crearReserva = async () => {
    setMensajeReserva("");
    setErrorReserva("");

    if (rolNoPermitido) {
      setErrorReserva("Solo los usuarios pueden crear reservas.");
      return;
    }

    if (!nombreSala || !fecha || !idTurno) {
      setErrorReserva("Todos los campos son obligatorios.");
      return;
    }

    if (fecha < hoy) {
      setErrorReserva("La fecha no puede ser menor a hoy.");
      return;
    }

    const participantesArray =
      participantes.trim() === ""
        ? []
        : participantes
            .split(",")
            .map((x) => parseInt(x.trim()))
            .filter((x) => !isNaN(x));

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_sala: nombreSala,
          edificio: nombreEdificio,
          fecha,
          id_turno: parseInt(idTurno),
          participantes: participantesArray,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setErrorReserva(data.error);
      } else {
        setMensajeReserva(`Reserva creada correctamente. ID: ${data.id_reserva}`);
        setNombreSala("");
        setFecha("");
        setIdTurno("");
        setParticipantes("");
      }
    } catch {
      setErrorReserva("Error al crear reserva.");
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Salas en {nombreEdificio}</h2>

      {/* FILTROS */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={fechaFiltro}
          onChange={(e) => setFechaFiltro(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <select
          value={turnoFiltro}
          onChange={(e) => setTurnoFiltro(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Todos los turnos</option>
          <option value="1">8:00 - 9:00</option>
          <option value="2">9:00 - 10:00</option>
          <option value="3">10:00 - 11:00</option>
          <option value="4">11:00 - 12:00</option>
        </select>

        <button onClick={cargarSalas}>Aplicar filtros</button>
      </div>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {/* LISTA DE SALAS */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {salas.map((s, i) => (
          <li
            key={i}
            style={{
              border: "1px solid gray",
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
              maxWidth: 400,
              margin: "10px auto",
              textAlign: "left",
              cursor: "pointer",
            }}
            onClick={() => setNombreSala(s.nombre_sala)} // ← ESTA LÍNEA ES CLAVE
          >
            <strong>{s.nombre_sala}</strong>
            <p>Capacidad: {s.capacidad}</p>
            <p>Tipo: {s.tipo_sala}</p>
          </li>
        ))}
      </ul>

      {/* FORMULARIO DE CREAR RESERVA */}
      <div style={{ marginTop: 50 }}>
        <h2>Crear Reserva en {nombreEdificio}</h2>

        {errorReserva && <p style={{ color: "red" }}>{errorReserva}</p>}
        {mensajeReserva && <p style={{ color: "green" }}>{mensajeReserva}</p>}

        <div
          style={{
            maxWidth: 350,
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Sala elegida desde arriba */}
          <select
            value={nombreSala}
            onChange={(e) => setNombreSala(e.target.value)}
          >
            <option value="">Seleccione una sala</option>
            {salas.map((s, index) => (
              <option key={index} value={s.nombre_sala}>
                {s.nombre_sala}
              </option>
            ))}
          </select>

          {/* Fecha */}
          <input
            type="date"
            min={hoy}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          {/* Turno */}
          <select value={idTurno} onChange={(e) => setIdTurno(e.target.value)}>
            <option value="">Seleccione turno</option>
            <option value="1">08:00 - 09:00</option>
            <option value="2">09:00 - 10:00</option>
            <option value="3">10:00 - 11:00</option>
            <option value="4">11:00 - 12:00</option>
          </select>

          {/* Participantes */}
          <input
            placeholder="Participantes (CI separados por coma)"
            value={participantes}
            onChange={(e) => setParticipantes(e.target.value)}
          />

          {/* Botón */}
          <button onClick={crearReserva} disabled={rolNoPermitido}>
            Crear Reserva
          </button>
        </div>
      </div>
    </div>
  );
}

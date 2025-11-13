import { useState } from "react";

export default function Salas() {
  const [edificio, setEdificio] = useState("");
  const [fecha, setFecha] = useState("");
  const [idTurno, setIdTurno] = useState("");
  const [salas, setSalas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const buscarSalas = async () => {
    let url = "http://localhost:8000/salasDisponibles";
    const params = new URLSearchParams();

    if (edificio) params.append("edificio", edificio);
    if (fecha) params.append("fecha", fecha);
    if (idTurno) params.append("id_turno", idTurno);

    if (params.toString() !== "") {
      url += "?" + params.toString();
    }

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.salas_disponibles) {
        setSalas(data.salas_disponibles);
        setMensaje("");
      } else {
        setSalas([]);
        setMensaje("No hay salas disponibles con esos filtros.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Hubo un error al buscar las salas.");
      setSalas([]);
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Buscar Salas</h2>

      {/* INPUTS */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Edificio"
          value={edificio}
          onChange={(e) => setEdificio(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ marginRight: 10 }}
        />

        {/* SELECT DE TURNOS */}
        <select
          value={idTurno}
          onChange={(e) => setIdTurno(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Seleccionar turno</option>
          {Array.from({ length: 15 }).map((_, i) => {
            const startHour = 8 + i;
            const endHour = startHour + 1;

            return (
              <option key={i + 1} value={i + 1}>
                {startHour}:00 - {endHour}:00
              </option>
            );
          })}
        </select>

        <button onClick={buscarSalas}>Buscar</button>
      </div>

      {/* MENSAJE */}
      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {/* LISTA DE SALAS */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {salas.map((sala, index) => (
          <li
            key={index}
            style={{
              border: "1px solid gray",
              borderRadius: 5,
              margin: "10px 0",
              padding: 10,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "left",
            }}
          >
            <strong>{sala.nombre_sala}</strong>
            <p>Edificio: {sala.edificio}</p>
            <p>Capacidad: {sala.capacidad}</p>
            <p>Tipo: {sala.tipo_sala}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SalasPorEdificio() {
  const { nombreEdificio } = useParams();

  const [salas, setSalas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [fecha, setFecha] = useState("");
  const [turno, setTurno] = useState("");

  const cargarSalas = async () => {
    try {
      const token = localStorage.getItem("token");

      let url = `http://localhost:8000/salasDisponibles?edificio=${nombreEdificio}`;

      // agregar filtros si existen
      if (fecha) url += `&fecha=${fecha}`;
      if (turno) url += `&id_turno=${turno}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
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

  // cargar salas la primera vez
  useEffect(() => {
    cargarSalas();
  }, [nombreEdificio]);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Salas en {nombreEdificio}</h2>

      {/* FILTROS */}
      <div style={{ marginBottom: 20 }}>
        <input 
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <select
          value={turno}
          onChange={(e) => setTurno(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Todos los turnos</option>
          <option value="1">8:00 - 9:00</option>
          <option value="2">9:00 - 10:00</option>
          <option value="3">10:00 - 11:00</option>
          <option value="4">11:00 - 12:00</option>
          <option value="5">12:00 - 13:00</option>
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
            }}
          >
            <strong>{s.nombre_sala}</strong>
            <p>Capacidad: {s.capacidad}</p>
            <p>Tipo: {s.tipo_sala}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

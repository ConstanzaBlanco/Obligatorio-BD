import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context";

export default function BuildingDetail() {
  const { nombre } = useParams();
  const { token } = useAuth();

  const [salas, setSalas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [selectedSala, setSelectedSala] = useState("");
  const [fecha, setFecha] = useState("");
  const [turno, setTurno] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resSalas = await fetch(
        `http://localhost:8000/infoSalas?edificio=${nombre}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const s = await resSalas.json();
      setSalas(s.salas || []);

      const resTurnos = await fetch("http://localhost:8000/turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const t = await resTurnos.json();
      setTurnos(t.turnos || []);
    };

    fetchData();
  }, [nombre, token]);

  const reservar = async (e) => {
    e.preventDefault();

    const lista = participantes
      .split(",")
      .map((x) => parseInt(x.trim()))
      .filter(Boolean);

    const res = await fetch("http://localhost:8000/reservar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nombre_sala: selectedSala,
        edificio: nombre,
        fecha,
        id_turno: Number(turno),
        participantes: lista,
      }),
    });

    const data = await res.json();
    setMsg(data.error || `Reserva creada (ID ${data.id_reserva})`);
  };

  return (
    <div>
      <h2>Edificio: {nombre}</h2>

      <h3>Salas</h3>
      {salas.map((s) => (
        <button
          key={s.nombre_sala}
          onClick={() => setSelectedSala(s.nombre_sala)}
          style={{ marginRight: 8 }}
        >
          {s.nombre_sala}
        </button>
      ))}

      <form onSubmit={reservar}>
        <p>Sala seleccionada: {selectedSala || "ninguna"}</p>

        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />

        <select value={turno} onChange={(e) => setTurno(e.target.value)} required>
          <option value="">Seleccioná turno</option>
          {turnos.map((t) => (
            <option key={t.id_turno} value={t.id_turno}>
              {t.hora_inicio}-{t.hora_fin}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="CI participantes separados por coma"
          value={participantes}
          onChange={(e) => setParticipantes(e.target.value)}
        />

        <button type="submit">Reservar</button>
      </form>

      <p>{msg}</p>
    </div>
  );
}

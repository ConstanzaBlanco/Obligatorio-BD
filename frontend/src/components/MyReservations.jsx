import { useEffect, useState } from "react";
import { useAuth } from "../context";

export default function MyReservations() {
  const { token } = useAuth();
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/seePastAndActiveReservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReservas(data.reservas || []);
    };

    fetchData();
  }, [token]);

  return (
    <div>
      <h2>Mis reservas</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {reservas.map((r) => (
          <div
            key={r.id_reserva}
            style={{ border: "1px solid #ccc", padding: 12, width: 250 }}
          >
            <p>Sala: {r.nombre_sala}</p>
            <p>Fecha: {r.fecha}</p>
            <p>Estado: {r.estado}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

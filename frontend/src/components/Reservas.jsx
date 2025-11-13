import { useState } from "react";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const cargarReservas = async () => {
    try {
      const response = await fetch("http://localhost:8000/showAll");
      const data = await response.json();

      if (data.reservas) {
        setReservas(data.reservas);
        setMensaje("");
      } else {
        setReservas([]);
        setMensaje("No hay reservas registradas.");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error al obtener las reservas.");
    }
  };

  return (
    <div>
      <h2>Información de Reservas</h2>

      <button onClick={cargarReservas} style={{ marginBottom: 20 }}>
        Cargar Reservas
      </button>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {reservas.map((reserva, index) => (
          <li
            key={index}
            style={{
              border: "1px solid gray",
              borderRadius: 5,
              margin: "10px 0",
              padding: 10,
              maxWidth: 500,
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "left",
            }}
          >
            <strong>ID Reserva: {reserva.id_reserva}</strong>
            <p>Sala: {reserva.nombre_sala}</p>
            <p>Edificio: {reserva.edificio}</p>
            <p>Fecha: {reserva.fecha}</p>
            <p>Turno: {reserva.id_turno}</p>
            <p>Estado: {reserva.estado}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

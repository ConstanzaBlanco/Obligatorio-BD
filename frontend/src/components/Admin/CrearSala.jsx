import { useState } from "react";

export default function CrearSala() {
  const [nombre, setNombre] = useState("");
  const [edificio, setEdificio] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [tipo, setTipo] = useState("libre");
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  const crearSala = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const res = await fetch("http://localhost:8000/salas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_sala: nombre,
          edificio: edificio,
          capacidad: Number(capacidad),
          tipo_sala: tipo
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Sala creada correctamente ✔");
        setNombre("");
        setEdificio("");
        setCapacidad("");
        setTipo("libre");
      } else {
        setMensaje(data.detail || "Error al crear sala");
      }
    } catch (error) {
      console.error(error);
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div style={container}>
      <h2>Crear nueva sala</h2>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      <form onSubmit={crearSala} style={formStyle}>
        <label>Nombre de sala</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Edificio</label>
        <input
          type="text"
          value={edificio}
          onChange={(e) => setEdificio(e.target.value)}
          required
        />

        <label>Capacidad</label>
        <input
          type="number"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          min="1"
          required
        />

        <label>Tipo de sala</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="libre">Uso libre</option>
          <option value="posgrado">Exclusiva posgrado</option>
          <option value="docente">Exclusiva docente</option>
        </select>

        <button type="submit" style={btnStyle}>
          Crear sala
        </button>
      </form>
    </div>
  );
}

const container = {
  maxWidth: "400px",
  margin: "30px auto",
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "10px",
  backgroundColor: "#fff",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const btnStyle = {
  backgroundColor: "#007bff",
  color: "white",
  padding: "10px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px"
};

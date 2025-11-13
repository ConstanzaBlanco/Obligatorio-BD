import { useState } from "react";

export default function CrearSala() {
  const [nombre, setNombre] = useState("");
  const [edificio, setEdificio] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const crearSala = async () => {
    if (!nombre || !edificio || !capacidad || !tipo) {
      setMensaje("Por favor complete todos los campos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/salas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_sala: nombre,
          edificio: edificio,
          capacidad: parseInt(capacidad),
          tipo_sala: tipo,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMensaje("❌ " + data.error);
      } else {
        setMensaje("✔ Sala creada correctamente (ID: " + data.id_sala + ")");
        setNombre("");
        setEdificio("");
        setCapacidad("");
        setTipo("");
      }
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al crear la sala.");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Crear Nueva Sala</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nombre de la sala"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          placeholder="Edificio"
          value={edificio}
          onChange={(e) => setEdificio(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="number"
          placeholder="Capacidad"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{ marginRight: 10 }}
        >
          <option value="">Tipo de sala</option>
          <option value="libre">Libre</option>
          <option value="posgrado">Posgrado</option>
          <option value="docente">Docente</option>
        </select>

        <button onClick={crearSala}>Crear Sala</button>
      </div>

      {mensaje && (
        <p style={{ color: mensaje.startsWith("✔") ? "green" : "red" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

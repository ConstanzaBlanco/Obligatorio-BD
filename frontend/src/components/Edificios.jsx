import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Edificios() {
  const [edificios, setEdificios] = useState([]);
  const [departamento, setDepartamento] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar departamentos desde backend
  const cargarDepartamentos = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/departamentos", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (Array.isArray(data.departamentos)) {
        setDepartamentos(data.departamentos);
      } else {
        setDepartamentos([]);
      }

    } catch (err) {
      console.log("Error cargando departamentos:", err);
    }
  };

  // Cargar edificios (con o sin filtro)
  const cargarEdificios = async () => {
    try {
      const token = localStorage.getItem("token");

      let url = "http://localhost:8000/edificios";
      if (departamento) url += `?departamento=${departamento}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setEdificios(data.edificios || []);
      setMensaje("");

    } catch (err) {
      console.log("Error cargando edificios:", err);
      setMensaje("Error cargando edificios.");
      setEdificios([]);
    }
  };

  // Cargar al montar la página
  useEffect(() => {
    cargarDepartamentos();
    cargarEdificios();
  }, []);

  // EJECUTAR FILTRO AUTOMÁTICAMENTE AL CAMBIAR DEPARTAMENTO
  useEffect(() => {
    cargarEdificios();
  }, [departamento]);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Listado de Edificios</h2>

      {/* SELECT DE DEPARTAMENTOS */}
      <select
        value={departamento}
        onChange={(e) => setDepartamento(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      >
        <option value="">Todos los departamentos</option>

        {departamentos.map((dep, i) => (
          <option key={i} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      {mensaje && <p style={{ color: "red" }}>{mensaje}</p>}

      {/* LISTA DE EDIFICIOS */}
      <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
        {edificios.map((e, i) => (
          <li
            key={i}
            style={{
              border: "1px solid #ccc",
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
              maxWidth: 400,
              marginLeft: "auto",
              marginRight: "auto",
              textAlign: "left",
            }}
          >
            <strong>
              <Link
                to={`/edificios/${e.nombre_edificio}`}
                style={{ textDecoration: "none", color: "#007bff" }}
              >
                {e.nombre_edificio}
              </Link>
            </strong>

            <p>Dirección: {e.direccion}</p>
            <p>Departamento: {e.departamento}</p>
            <p>ID Facultad: {e.id_facultad}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

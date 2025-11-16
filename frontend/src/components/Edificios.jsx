import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 

export default function Edificios() {
  const [edificios, setEdificios] = useState([]);
  const [departamento, setDepartamento] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  //Cargar departamentos desde el backend
  const cargarDepartamentos = async () => {
    try {
      const res = await fetch("http://localhost:8000/departamentos");
      const data = await res.json();

      if (data.departamentos) {
        setDepartamentos(data.departamentos);
      }
    } catch (err) {
      console.log("Error cargando departamentos", err);
    }
  };

  const cargarEdificios = async () => {
    try {
      let url = "http://localhost:8000/edificios";

      if (departamento) {
        url += `?departamento=${departamento}`;
      }

      const token = localStorage.getItem("token");

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.edificios) {
        setEdificios(data.edificios);
        setMensaje("");
      } else {
        setEdificios([]);
        setMensaje("No se encontraron edificios.");
      }

    } catch (err) {
      setMensaje("Error cargando edificios.");
      setEdificios([]);
    }
  };

  // Cargar departamentos y edificios al inicio
  useEffect(() => {
    cargarDepartamentos();
    cargarEdificios();
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Listado de Edificios</h2>

      {/* SELECTOR DINÁMICO DE DEPARTAMENTOS */}
      <select
        value={departamento}
        onChange={(e) => setDepartamento(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      >
        <option value="">Todos los departamentos</option>

        {departamentos.map((dep, index) => (
          <option key={index} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      <button onClick={cargarEdificios}>Filtrar</button>

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
            {/* LINK A /edificios/NOMBRE */}
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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Home() {
  const { token, user } = useUser(); // 👈 tu contexto REAL
  const [edificios, setEdificios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:8000/home", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setEdificios(data.edificios || []);
      } catch (err) {
        console.error("Error cargando edificios:", err);
      }
    };

    fetchBuildings();
  }, [token]);

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 40 }}>
      {edificios.map((e) => (
        <div
          key={e.nombre_edificio}
          onClick={() => navigate(`/edificios/${e.nombre_edificio}`)}
          style={{
            width: 200,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
            background: "white",
          }}
        >
          <h3>{e.nombre_edificio}</h3>
        </div>
      ))}
    </div>
  );
}

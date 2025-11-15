import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context";

export default function Home() {
  const { token } = useAuth();
  const [edificios, setEdificios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildings = async () => {
      const res = await fetch("http://localhost:8000/home", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEdificios(data.edificios || []);
    };

    fetchBuildings();
  }, [token]);

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {edificios.map((e) => (
        <div
          key={e.nombre_edificio}
          onClick={() => navigate(`/edificio/${e.nombre_edificio}`)}
          style={{
            width: 200,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <h3>{e.nombre_edificio}</h3>
        </div>
      ))}
    </div>
  );
}

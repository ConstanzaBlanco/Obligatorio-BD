import { useEffect, useState } from "react";

export default function BlockedUsers() {
  const [bloqueados, setBloqueados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const cargarBloqueados = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/bloqueos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.detail || "Error al cargar bloqueos");
        setBloqueados([]);
      } else {
        setBloqueados(data.bloqueados || []);
      }
    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
      setBloqueados([]);
    } finally {
      setLoading(false);
    }
  };

  const desbloquear = async (ci) => {
    if (!confirm(`¿Desbloquear al usuario ${ci}?`)) return;
    try {
      const res = await fetch("http://localhost:8000/bloqueos/unblock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ci_bloqueado: ci }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo desbloquear");
        return;
      }

      alert(data.mensaje || "Usuario desbloqueado");
      cargarBloqueados();
    } catch (err) {
      console.error(err);
      alert("Error al desbloquear usuario");
    }
  };

  useEffect(() => {
    cargarBloqueados();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Usuarios Bloqueados</h2>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && bloqueados.length === 0 && <p>No tenés usuarios bloqueados.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {bloqueados.map((b) => (
          <div
            key={b.ci}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{b.nombre} {b.apellido}</div>
              <div style={{ color: "#666", fontSize: 13 }}>CI: {b.ci}</div>
              <div style={{ color: "#999", fontSize: 12 }}>Bloqueado: {new Date(b.fecha_bloqueo).toLocaleString()}</div>
            </div>

            <div>
              <button
                onClick={() => desbloquear(b.ci)}
                style={{
                  padding: "8px 12px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Desbloquear
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

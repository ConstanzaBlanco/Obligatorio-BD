import { useEffect, useState } from "react";
import ChangePasswordModal from "./User/ChangePasswordModal";

export default function Me() {
  const [user, setUser] = useState(null);
  const [openPassModal, setOpenPassModal] = useState(false);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarUsuario = async () => {
      const res = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUser(data);

      setName(data.name);
      setLastName(data.lastName);
      setEmail(data.mail);
    };

    cargarUsuario();
  }, [token]);

  const guardarCambios = async () => {
    setMensaje("");

    const payload = {
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };

    try {
      const res = await fetch("http://localhost:8000/me/modify", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data.detail || "Error al actualizar");
        return;
      }

      if (data.new_token) {
        localStorage.setItem("token", data.new_token);
      }

      setUser((prev) => ({
        ...prev,
        name: payload.name,
        lastName: payload.lastName,
        mail: payload.email,
      }));

      setMensaje("Datos actualizados ✔");
    } catch (err) {
      console.error(err);
      setMensaje("Error al guardar cambios");
    }
  };

  if (!user)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Cargando...</p>;

  return (
    <div style={container}>
      <h2 style={title}>Mi Perfil</h2>

      <div style={card}>
        <div style={avatar}>👤</div>

        <div style={infoSection}>
          <label><strong>Nombre:</strong></label>
          <input style={input} value={name} onChange={(e) => setName(e.target.value)} />

          <label><strong>Apellido:</strong></label>
          <input style={input} value={lastName} onChange={(e) => setLastName(e.target.value)} />

          <label><strong>Email:</strong></label>
          <input style={input} value={email} onChange={(e) => setEmail(e.target.value)} />

          <p><strong>CI:</strong> {user.ci}</p>
          <p><strong>Rol:</strong> {user.rol}</p>
          <p><strong>Último acceso:</strong> {user.last_access}</p>
        </div>

        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        <button style={btnSave} onClick={guardarCambios}>Guardar cambios</button>

        <button style={btn} onClick={() => setOpenPassModal(true)}>
          Cambiar contraseña
        </button>
      </div>

      <ChangePasswordModal
        isOpen={openPassModal}
        onClose={() => setOpenPassModal(false)}
      />
    </div>
  );
}


// ===== ESTILOS =====
const container = { maxWidth: "700px", margin: "40px auto", padding: "20px" };
const title = { textAlign: "center", fontSize: "28px", marginBottom: "20px" };
const card = { background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 18px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" };
const avatar = { width: "90px", height: "90px", background: "#eef", borderRadius: "50%", fontSize: "40px", display: "flex", justifyContent: "center", alignItems: "center" };
const infoSection = { width: "100%", background: "#f7f7f7", padding: "15px", borderRadius: "10px" };
const input = { width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px" };
const btn = { padding: "10px 20px", background: "#6c63ff", color: "white", borderRadius: "6px", cursor: "pointer" };
const btnSave = { ...btn, background: "#4CAF50" };

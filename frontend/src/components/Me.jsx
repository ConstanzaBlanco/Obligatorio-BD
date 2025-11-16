import { useEffect, useState } from "react";
import ChangePasswordModal from "./User/ChangePasswordModal";

export default function Me() {
  const [user, setUser] = useState(null);
  const [openPassModal, setOpenPassModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarUsuario = async () => {
      const res = await fetch("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUser(data);
    };

    cargarUsuario();
  }, [token]);

  if (!user)
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Cargando información...
      </p>
    );

  return (
    <div style={container}>
      <h2 style={title}>Mi Perfil</h2>

      <div style={card}>
        <div style={avatar}>👤</div>

        <div style={infoSection}>
          <p><strong>Nombre:</strong> {user.name} {user.lastName}</p>
          <p><strong>CI:</strong> {user.ci}</p>
          <p><strong>Email:</strong> {user.mail}</p>
          <p><strong>Rol:</strong> {user.rol}</p>
          <p><strong>Último acceso:</strong> {user.last_access}</p>
        </div>

        <button 
          style={btn}
          onClick={() => setOpenPassModal(true)}
        >
          Cambiar contraseña
        </button>
      </div>

      {/* Modal para cambiar contraseña */}
      <ChangePasswordModal
        isOpen={openPassModal}
        onClose={() => setOpenPassModal(false)}
      />
    </div>
  );
}

/* ----------- ESTILOS ----------- */

const container = {
  maxWidth: "700px",
  margin: "40px auto",
  padding: "20px",
};

const title = {
  textAlign: "center",
  fontSize: "28px",
  marginBottom: "20px",
  color: "#333",
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 4px 18px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
};

const avatar = {
  width: "90px",
  height: "90px",
  background: "#eef",
  borderRadius: "50%",
  fontSize: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const infoSection = {
  width: "100%",
  background: "#f7f7f7",
  padding: "15px",
  borderRadius: "10px",
  lineHeight: "1.6",
};

const btn = {
  padding: "10px 20px",
  background: "#6c63ff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
  marginTop: "10px",
  transition: "0.2s ease",
};

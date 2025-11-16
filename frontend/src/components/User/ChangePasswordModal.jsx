import { useState } from "react";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  if (!isOpen) return null; // No renderiza si está cerrado

  const handleSubmit = async () => {
    setMensaje("");
    setError("");

    try {
      const res = await fetch("http://localhost:8000/changePassword", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al cambiar la contraseña");
        return;
      }

      setMensaje("Contraseña actualizada correctamente ✔️");
      setCurrentPassword("");
      setNewPassword("");

    } catch (e) {
      setError("Error al conectar con el servidor");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✖</button>

        <h2>Cambiar Contraseña</h2>

        {/* Input contraseña actual */}
        <input
          type="password"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={inputStyle}
        />

        {/* Input nueva contraseña */}
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />

        {/* Mensajes */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}

        <button onClick={handleSubmit} style={btnStyle}>
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
}

/* --------------------- ESTILOS ---------------------- */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  width: "350px",
  boxShadow: "0 0 20px rgba(0,0,0,0.3)",
  position: "relative",
  textAlign: "center",
};

const closeBtnStyle = {
  border: "none",
  background: "transparent",
  fontSize: "20px",
  cursor: "pointer",
  position: "absolute",
  top: "10px",
  right: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
};

const btnStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
};

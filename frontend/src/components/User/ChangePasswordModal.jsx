import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Field, { Input } from "../ui/Field";
import { useToast } from "../ui/Toast";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const { success } = useToast();

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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

      success("Contraseña actualizada correctamente");
      reset();
      onClose();
    } catch (e) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambiar contraseña"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" form="change-password-form" disabled={loading}>
            {loading ? "Guardando…" : "Cambiar contraseña"}
          </Button>
        </>
      }
    >
      <form
        id="change-password-form"
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
      >
        <Field label="Contraseña actual">
          <Input
            type="password"
            placeholder="Tu contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>

        <Field label="Nueva contraseña" error={error}>
          <Input
            type="password"
            placeholder="Elegí una nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
      </form>
    </Modal>
  );
}

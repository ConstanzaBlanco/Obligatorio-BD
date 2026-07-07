import { useEffect, useState } from "react";
import ChangePasswordModal from "./User/ChangePasswordModal";
import { PageContainer, PageHeader } from "./ui/Page";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Field, { Input } from "./ui/Field";
import { PageSpinner } from "./ui/Spinner";
import { useToast } from "./ui/useToast";
import styles from "./Me.module.css";

export default function Me() {
  const [user, setUser] = useState(null);
  const [openPassModal, setOpenPassModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const token = localStorage.getItem("token");
  const { success, error: toastError } = useToast();

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

  const guardarCambios = async (e) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };

    setSaving(true);
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
        toastError(data.detail || "Error al actualizar");
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

      success("Datos actualizados");
    } catch (err) {
      console.error(err);
      toastError("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <PageContainer size="narrow">
        <PageSpinner />
      </PageContainer>
    );
  }

  const initial = (user.name?.[0] || "U").toUpperCase();

  return (
    <PageContainer size="narrow">
      <PageHeader eyebrow="Tu cuenta" title="Mi perfil" description="Actualizá tus datos personales y tu contraseña." />

      <div className={styles.grid}>
        <Card>
          <div className={styles.identity}>
            <div className={styles.avatar} aria-hidden="true">{initial}</div>
            <div className={styles.name}>{user.name} {user.lastName}</div>
            <div className={styles.meta}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>CI</span>
                <span className={styles.metaValue}>{user.ci}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Rol</span>
                <span className={styles.metaValue}>{user.rol}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Último acceso</span>
                <span className={styles.metaValue}>{user.last_access}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form className={styles.form} onSubmit={guardarCambios}>
            <Field label="Nombre">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Apellido">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>

            <div className={styles.actions}>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setOpenPassModal(true)}>
                Cambiar contraseña
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <ChangePasswordModal isOpen={openPassModal} onClose={() => setOpenPassModal(false)} />
    </PageContainer>
  );
}

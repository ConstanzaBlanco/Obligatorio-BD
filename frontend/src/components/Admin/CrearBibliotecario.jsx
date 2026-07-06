import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer, PageHeader } from "../ui/Page";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Field, { Input } from "../ui/Field";
import { useToast } from "../ui/useToast";

export default function CreateBiblioUser() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { success } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (ci.length !== 8) {
      setError("La cédula debe tener exactamente 8 dígitos");
      return;
    }
    if (password.length <= 6) {
      setError("La contraseña debe tener más de 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      const payload = { correo, ci: Number(ci), name, lastName, password };

      const res = await fetch("http://localhost:8000/createBiblioUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al crear bibliotecario");
        return;
      }

      success("Bibliotecario creado correctamente");
      setCorreo("");
      setCi("");
      setName("");
      setLastName("");
      setPassword("");
      setTimeout(() => navigate("/users"), 1200);
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el bibliotecario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer size="narrow">
      <PageHeader
        eyebrow="Administración"
        title="Crear bibliotecario"
        description="Registrá una cuenta con permisos de bibliotecario."
      />
      <Card>
        <form onSubmit={handleSubmit} className="form-stack">
          <Field label="Correo institucional" required>
            <Input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" required />
          </Field>
          <Field label="Cédula de identidad" hint="8 dígitos." required>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={ci}
              onChange={(e) => setCi(e.target.value.replace(/\D/g, "").slice(0, 8))}
              required
              minLength={8}
              maxLength={8}
            />
          </Field>
          <Field label="Nombre" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Apellido" required>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field label="Contraseña" hint="Más de 6 caracteres." error={error} required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required minLength={7} />
          </Field>
          <Button type="submit" disabled={saving}>
            {saving ? "Creando…" : "Crear bibliotecario"}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}

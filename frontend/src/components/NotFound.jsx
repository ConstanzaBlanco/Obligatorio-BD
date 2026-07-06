import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";

export default function NotFound({ mensaje = "Página no encontrada" }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "var(--space-3)",
        padding: "var(--space-6)",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-4xl)",
          fontWeight: "var(--font-bold)",
          color: "var(--color-primary)",
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        404
      </p>
      <h1 style={{ fontSize: "var(--text-2xl)" }}>{mensaje}</h1>
      <p style={{ color: "var(--color-text-muted)", maxWidth: "40ch" }}>
        La página que buscás no existe o fue movida.
      </p>
      <Button onClick={() => navigate("/")} style={{ marginTop: "var(--space-3)" }}>
        Volver al inicio
      </Button>
    </div>
  );
}

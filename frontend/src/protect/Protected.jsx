import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
import Spinner from "../components/ui/Spinner";

export default function Protected() {
  const { user, loadingUser } = useUser();

  if (loadingUser) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-3)",
          color: "var(--color-text-muted)",
        }}
      >
        <Spinner size={28} />
        <p>Cargando tu sesión…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}

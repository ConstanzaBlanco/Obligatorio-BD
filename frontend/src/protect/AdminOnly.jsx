import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../components/UserContext";

export default function AdminOnly() {
  const { user, loadingUser } = useUser();

  if (loadingUser) return <p>Cargando...</p>;

  if (!user || user.rol !== "Administrador") {
    alert("❌ No tienes los permisos necesarios (Administrador)");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

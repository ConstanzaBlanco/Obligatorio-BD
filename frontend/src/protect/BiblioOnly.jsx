import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../components/UserContext";

export default function BiblioOnly() {
  const { user, loadingUser } = useUser();

  if (loadingUser) return <p>Cargando...</p>;

  if (!user || user.rol !== "Bibliotecario") {
    alert("❌ No tienes los permisos necesarios (Bibliotecario)");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../components/UserContext";

export default function AdminOrBiblioOnly() {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" />;

  if (user.rol !== "Administrador" && user.rol !== "Bibliotecario") {
    alert("No tienes los permisos necesarios");
    return <Navigate to="/" />;
  }

  return <Outlet />;
}

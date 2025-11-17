import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../components/UserContext";

export default function Protected() {
  const { user, loadingUser } = useUser();

  if (loadingUser) return <p>Cargando...</p>;

  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}

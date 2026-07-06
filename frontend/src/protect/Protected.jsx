import { Outlet, Navigate } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { PageSpinner } from "../components/ui/Spinner";

export default function Protected() {
  const { user, loadingUser } = useUser();

  if (loadingUser) return <PageSpinner label="Cargando tu sesión…" />;

  if (!user) return <Navigate to="/" replace />;

  return <Outlet />;
}

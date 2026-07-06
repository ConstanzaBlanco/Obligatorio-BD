import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../components/useUser";
import { PageSpinner } from "../components/ui/Spinner";
import { useToast } from "../components/ui/useToast";

/**
 * RoleGuard — gate a nested route to a set of roles.
 * Shows an access-denied toast (via effect, never during render) and
 * redirects home when the current user's role isn't allowed.
 */
export default function RoleGuard({ allow, message = "No tenés los permisos necesarios." }) {
  const { user, loadingUser } = useUser();
  const { error } = useToast();

  const denied = !loadingUser && (!user || !allow.includes(user.rol));

  useEffect(() => {
    if (denied) error(message);
  }, [denied, message, error]);

  if (loadingUser) return <PageSpinner />;

  if (denied) return <Navigate to="/" replace />;

  return <Outlet />;
}

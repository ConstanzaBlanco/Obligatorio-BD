import RoleGuard from "./RoleGuard";

export default function AdminOnly() {
  return <RoleGuard allow={["Administrador"]} message="No tenés los permisos necesarios (Administrador)." />;
}

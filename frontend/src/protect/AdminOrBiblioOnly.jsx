import RoleGuard from "./RoleGuard";

export default function AdminOrBiblioOnly() {
  return <RoleGuard allow={["Administrador", "Bibliotecario"]} message="No tenés los permisos necesarios." />;
}

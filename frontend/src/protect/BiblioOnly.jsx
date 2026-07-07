import RoleGuard from "./RoleGuard";

export default function BiblioOnly() {
  return <RoleGuard allow={["Bibliotecario"]} message="No tenés los permisos necesarios (Bibliotecario)." />;
}

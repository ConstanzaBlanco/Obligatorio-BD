import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function PrivateLayout() {
  return (
    <>
      <Header />

      {/* contenido de la ruta */}
      <Outlet />
    </>
  );
}

import { useState } from "react";
import Login from "./Login";

function App() {
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem("token") // Si tengo un token entocnes estoy logeado
  );

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {isLogged ? (
        <div>
        <h1>Ya te logeaste</h1>

        <button onClick={() => {
          localStorage.removeItem("token"); //Botón de deslogueo
          setIsLogged(false);
        }}
        >Cerrar Sesión</button>
        </div>
      ) : (
        <Login onLogin={() => setIsLogged(true)} />
      )}
    </div>
  );
}

export default App;

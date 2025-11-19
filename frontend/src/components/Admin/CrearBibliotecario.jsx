import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateBiblioUser() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      const payload = {
        correo,
        ci: Number(ci),
        name,
        lastName,
        password
      };

      const res = await fetch("http://localhost:8000/createBiblioUser", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al crear bibliotecario");
        return;
      }

      setOk("Bibliotecario creado correctamente ✔");

      setTimeout(() => {
        navigate("/usuarios");
      }, 1500);

      setCorreo("");
      setCi("");
      setName("");
      setLastName("");
      setPassword("");

    } catch (err) {
      console.error(err);
      setError("No se pudo crear el bibliotecario");
    }
  };

  return (
    <>
      <style>{`
.biblio-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
  background: #f3f6fb;
  min-height: 100vh;
}

/* TARJETA — más compacta y con padding correcto */
.biblio-card {
  width: 380px;
  background: #fff;
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  border: 1px solid #e2e2e2;
  animation: fadeIn 0.25s ease-in-out;
}

/* Título más compacto */
.biblio-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 18px;
  padding-left: 10px;
  border-left: 4px solid #2980b9;
}

/* INPUTS — reducidos y con buen aire a los costados */
.biblio-form input {
  width: 80x  %;
  padding: 11px 14px;        /* 🔥 padding perfecto */
  margin-bottom: 12px;       /* 🔥 menos espacio => menos altura total */
  border: 1px solid #c7c7c7;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.25s ease;
}

.biblio-form input:focus {
  background: #fff;
  border-color: #2980b9;
  box-shadow: 0 0 4px rgba(41, 128, 185, 0.4);
  outline: none;
}

/* BOTÓN — más compacto */
.biblio-btn {
  width: 100%;
  background: linear-gradient(135deg, #2980b9, #1f5f8b);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.25s ease, background 0.25s ease;
  margin-top: 6px;
}

.biblio-btn:hover {
  transform: scale(1.02);
  background: linear-gradient(135deg, #1f5f8b, #164865);
}

/* ALERTAS — más pequeñas para que no agranden la tarjeta */
.biblio-error, .biblio-ok {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  font-size: 14px;
}

.biblio-error {
  background: #ffdddd;
  color: #c0392b;
  border-left: 4px solid #c0392b;
}

.biblio-ok {
  background: #d4f8da;
  color: #27ae60;
  border-left: 4px solid #27ae60;
}

/* Animación */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
        }
      `}</style>

      <div className="biblio-container">
        <div className="biblio-card">
          <h2 className="biblio-title">Crear Bibliotecario</h2>

          <form onSubmit={handleSubmit} className="biblio-form">
            <input type="email" placeholder="Correo institucional" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            <input type="number" placeholder="Cédula" value={ci} onChange={(e) => setCi(e.target.value)} required />
            <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />

            <button type="submit" className="biblio-btn">
              Crear Bibliotecario
            </button>
          </form>

          {error && <p className="biblio-error">{error}</p>}
          {ok && <p className="biblio-ok">{ok}</p>}
        </div>
      </div>
    </>
  );
}

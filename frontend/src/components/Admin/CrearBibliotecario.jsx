import { useState } from "react";

export default function CreateBiblioUser() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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
          margin-top: 40px;
        }

        .biblio-card {
          background: #ffffff;
          width: 420px;
          padding: 28px 32px;
          border-radius: 8px;
          border: 1px solid #d9d9d9;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .biblio-title {
          font-size: 22px;
          color: #2c3e50;
          font-weight: 600;
          margin-bottom: 18px;
          padding-left: 10px;
          border-left: 5px solid #2980b9;
        }

        .biblio-form input {
          width: 100%;
          padding: 12px;
          margin-bottom: 14px;
          border: 1px solid #b5b5b5;
          border-radius: 4px;
          font-size: 14px;
          background: #fafafa;
          transition: border 0.2s ease, background 0.2s ease;
        }

        .biblio-form input:focus {
          background: #fff;
          border-color: #2980b9;
          outline: none;
        }

        .biblio-btn {
          width: 100%;
          background: #2980b9;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 4px;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s ease;
          margin-top: 8px;
        }

        .biblio-btn:hover {
          background: #216796;
        }

        .biblio-error {
          margin-top: 12px;
          color: #c0392b;
          font-weight: bold;
          text-align: center;
        }

        .biblio-ok {
          margin-top: 12px;
          color: #27ae60;
          font-weight: bold;
          text-align: center;
        }
      `}</style>

      <div className="biblio-container">
        <div className="biblio-card">
          <h2 className="biblio-title">Crear Bibliotecario</h2>

          <form onSubmit={handleSubmit} className="biblio-form">
            <input
              type="email"
              placeholder="Correo institucional"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Cédula"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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

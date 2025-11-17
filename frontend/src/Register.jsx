import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [correo, setCorreo] = useState("");
  const [ci, setCi] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [academicProgram, setAcademicProgram] = useState("");

  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    try {
      const payload = {
        correo,
        ci: Number(ci),
        name,
        lastName,
        password,
        academicProgram,
      };

      const res = await fetch("http://localhost:8000/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Error al registrar");
        return;
      }

      setOk("Usuario creado correctamente ✔");

      setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
      console.error(err);
      setError("No se pudo registrar el usuario");
    }
  };

  return (
    <>
      {/* -------------- CSS dentro del mismo archivo -------------- */}
      <style>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 90vh;
          background: #f4f6f9;
          padding: 20px;
        }

        .register-card {
          background: white;
          padding: 30px 40px;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
          width: 350px;
          text-align: center;
          animation: fadeIn 0.4s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .register-card h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .register-form input {
          width: 100%;
          margin-bottom: 12px;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .register-form input:focus {
          border-color: #0066ff;
          outline: none;
          box-shadow: 0 0 4px rgba(0, 102, 255, 0.3);
        }

        .btn-register {
          width: 100%;
          padding: 12px;
          background: #0066ff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 15px;
          transition: 0.2s ease;
          margin-top: 5px;
        }

        .btn-register:hover {
          background: #0053cc;
        }

        .error-msg {
          margin-top: 15px;
          color: #d9534f;
          font-weight: bold;
        }

        .ok-msg {
          margin-top: 15px;
          color: #28a745;
          font-weight: bold;
        }
      `}</style>

      {/* -------------- HTML del formulario -------------- */}
      <div className="register-container">
        <div className="register-card">

          <h2>Crear cuenta</h2>

          <form onSubmit={handleRegister} className="register-form">

            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="CI"
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

            <input
              type="text"
              placeholder="Programa académico"
              value={academicProgram}
              onChange={(e) => setAcademicProgram(e.target.value)}
              required
            />

            <button type="submit" className="btn-register">
              Registrarse
            </button>
          </form>

          {error && <p className="error-msg">{error}</p>}
          {ok && <p className="ok-msg">{ok}</p>}
        </div>
      </div>
    </>
  );
}

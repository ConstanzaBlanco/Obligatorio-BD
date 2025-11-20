export default function NotFound({ mensaje = "Página no encontrada" }) {
  return (
    <div style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>{mensaje}</h2>

      <p style={styles.text}>
        La página que buscás no existe o fue movida.
      </p>

      <a href="/" style={styles.button}>
        Volver al inicio
      </a>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "80px",
    color: "#333",
    padding: "20px",
  },
  code: {
    fontSize: "80px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#cc0000",
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  text: {
    fontSize: "16px",
    marginBottom: "30px",
    color: "#666",
  },
  button: {
    padding: "10px 18px",
    backgroundColor: "#007bff",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "16px",
  },
};

import mysql.connector

# Configuración de conexión
conn = mysql.connector.connect(
    host="localhost",        
    user="gestion_salas_user",
    password="manuElMasGay4",
    database="gestion_salas"
)

cursor = conn.cursor()

import os

# Ruta absoluta del SQL
base_dir = os.path.dirname(os.path.abspath(__file__))  # carpeta Py
sql_path = os.path.join(base_dir, "..", "sql", "creacion_tablas.sql")

with open(sql_path, "r", encoding="utf-8") as f:
    sql_script = f.read()


# Separar por ; y ejecutar cada query
for statement in sql_script.split(";"):
    if statement.strip():
        cursor.execute(statement)

conn.commit()

# Probar obtener todos los participantes
cursor.execute("SELECT * FROM participante")
resultados = cursor.fetchall() 


for participante in resultados:
    print(f"{participante[1]} {participante[2]} - {participante[3]}")

# Salas mas reservadas
print("Consulta Salas mas reservadas")
cursor.execute("SELECT nombre_sala, COUNT(*) as cant_reservas FROM reserva GROUP BY nombre_sala ORDER BY cant_reservas desc")
resultado=cursor.fetchall()

for sala in resultado:
    print(f"{sala[0]} {sala[1]}")


#Promedio de participantes por sala
print("Consulta del promedio de participantes por sala")
cursor.execute("SELECT nombre_sala, AVG(cant_participantes) AS promedio_participantes FROM ( SELECT r.id_reserva, r.nombre_sala, COUNT(rp.ci_participante) AS cant_participantes FROM reserva r LEFT JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva GROUP BY r.id_reserva, r.nombre_sala ) AS sub GROUP BY nombre_sala; ")
resultado=cursor.fetchall()

for sala in resultado:
    print(f"{sala[0]} {sala[1]}")

#Participantes con mas reservas en el mes
print("Consulta de participantes con mas reservas en el mes")
cursor.execute("SELECT p.ci, p.nombre, p.apellido, COUNT(*) AS cant_reservas FROM participante p JOIN reserva_participante r ON p.ci = r.ci_participante WHERE MONTH(r.fecha_solicitud_reserva) = MONTH(CURRENT_DATE) AND YEAR(r.fecha_solicitud_reserva) = YEAR(CURRENT_DATE) GROUP BY p.ci, p.nombre, p.apellido ORDER BY cant_reservas DESC LIMIT 3;")
resultado=cursor.fetchall()

for sala in resultado:
    print(f"{sala[0]} {sala[1]} {sala[2]} {sala[3]}")




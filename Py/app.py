import mysql.connector
from datetime import time

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


#Cantidad de sanciones para profesores y alumnos (grado y posgrado)
print("Cantidad de sanciones para profesores y alumnos (grado y posgrado)")
cursor.execute("""
SELECT 
    ppa.rol AS tipo_rol,
    pa.tipo AS tipo_programa,
    COUNT(sp.ci_participante) AS cant_sanciones
FROM sancion_participante sp
JOIN participante_programa_academico ppa ON sp.ci_participante = ppa.ci_participante
JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
GROUP BY ppa.rol, pa.tipo
ORDER BY ppa.rol, pa.tipo;
""")

resultado = cursor.fetchall()

for res in resultado:
    print(f"{res[0]} {res[1]} {res[2]}")




#Verificacion para turno entre las 8AM y las 11PM
def turno_valido(hora_inicio: str, hora_fin: str):

    h_inicio = time.fromisoformat(hora_inicio)  
    h_fin = time.fromisoformat(hora_fin)

    inicio_permitido = time(8, 0, 0)   
    fin_permitido = time(23, 0, 0)    


    #No es valido si inicio = fin
    if (h_fin==h_inicio) :
        return False

    else:
    #Es valido si esta entre las horas de inicio y fin
        if(h_inicio>=inicio_permitido and h_fin<=fin_permitido):
            #verifico que el horarario de fin no sea > al de inicio
            if(h_inicio<h_fin):
                return True
            else:
                return False

        else:
            return False


# Pruebo la funcion
print("Prueba de turnos validos")
print(turno_valido("08:00:00", "10:00:00"))  # True 
print(turno_valido("07:30:00", "09:00:00"))  # False
print(turno_valido("22:00:00", "23:30:00"))  # False
print(turno_valido("14:00:00","08:00:00"))  #False
print(turno_valido("08:00:00","08:00:00"))  #False




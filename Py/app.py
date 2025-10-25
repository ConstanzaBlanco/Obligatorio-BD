from flask import Flask, jsonify
from db_connection import get_connection
from queries import (
    get_cantidad_reservar_por_carrera_y_facultad,
    get_cantidad_reservas_asistencias_profesor_y_alumnos,
    get_porcentaje_reservas_utilizadas_vs_no_utilizadas,
    get_promedio_duracion_sancion_por_participante
)

app = Flask(__name__)

# ---- Endpoints ---- #

'''
La estructura de cada end point es simple:
1.Primero de establece en que ruta de la api se va a responder a determinado endpoint
2. luego se establecen cursor y conecction para poder llamar a las queris
3. Se hace un json con los datos de la query
4.Se retorna ese json al cliente 
'''
@app.route("/")
def index():
    return "Bienvenido nuestra api god :)"


# Endpoint que devuelve la cantidad de reservas por carrera y facultad
@app.route("/reservas-por-carrera", methods=["GET"])
def reservas_por_carrera():
    conn = get_connection()
    cursor = conn.cursor()
    resultados = get_cantidad_reservar_por_carrera_y_facultad(cursor)  # me quedo con la query de sql

    # se hace la estructura del JSON con los resultados de la query
    data = []
    for f, p, c in resultados:
        data.append({
            "facultad": f,
            "programa": p,
            "reservas": c
        })

    cursor.close()
    conn.close()
    return jsonify(data)  # Devuelve el json


# Endpoint que devuelve las asistencias y reservas según el rol y tipo de programa
@app.route("/asistencias", methods=["GET"])
def asistencias():
    conn = get_connection()
    cursor = conn.cursor()
    resultados = get_cantidad_reservas_asistencias_profesor_y_alumnos(cursor)

    data = []
    for n, a, asist, res, r, t in resultados:
        data.append({
            "nombre": n,
            "apellido": a,
            "rol": r,
            "tipo_programa": t,
            "asistencias": asist,
            "reservas": res
        })

    cursor.close()
    conn.close()
    return jsonify(data)


# Endpoint que devuelve el porcentaje de reservas utilizadas vs no utilizadas
@app.route("/porcentaje-reservas", methods=["GET"])
def porcentaje_reservas():
    conn = get_connection()
    cursor = conn.cursor()
    resultados = get_porcentaje_reservas_utilizadas_vs_no_utilizadas(cursor)

    no_usadas, usadas = resultados[0]
    data = {"utilizadas": usadas, "no_utilizadas": no_usadas}

    cursor.close()
    conn.close()
    return jsonify(data)


# Endpoint que devuelve el promedio de duración de sanciones por participante
@app.route("/promedio-sanciones", methods=["GET"])
def promedio_sanciones():
    conn = get_connection()
    cursor = conn.cursor()
    resultados = get_promedio_duracion_sancion_por_participante(cursor)

    data = []
    for ci, p in resultados:
        data.append(
        {"ci": ci, "promedio_dias": p}
        )

    cursor.close()
    conn.close()
    return jsonify(data)


# ---- Main ---- #
# Ejecuta la aplicación de Flask en el puerto 5000 y escuchar para poder aceptar conecciones externas
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

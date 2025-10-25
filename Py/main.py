from db_connection import get_connection
from queries import (
    get_cantidad_reservar_por_carrera_y_facultad,
    get_cantidad_reservas_asistencias_profesor_y_alumnos,
    get_porcentaje_reservas_utilizadas_vs_no_utilizadas,
    get_promedio_duracion_sancion_por_participante
)

'''
Este archivo funciona para ver en los get del archivo de querry y ver que nos retornan las mismas
Solo se crea la instancia de cursor y la connection para poder usarlas y pasarlas a los get que utilizan las queries
'''

def main():
    conn = get_connection()
    cursor = conn.cursor()

    print("\n CANTIDAD DE RESERVAS POR CARRERA Y FACULTAD")
    reservas_por_carrera = get_cantidad_reservar_por_carrera_y_facultad(cursor)
    for fila in reservas_por_carrera:
        facultad, carrera, cantidad = fila
        print(f"Facultad: {facultad} | Programa: {carrera} | Reservas: {cantidad}")

    print("\n CANTIDAD DE RESERVAS Y ASISTENCIAS POR ROL Y TIPO DE PROGRAMA")
    asistencias = get_cantidad_reservas_asistencias_profesor_y_alumnos(cursor)
    for fila in asistencias:
        nombre, apellido, asistencias, reservas, rol, tipo = fila
        print(f"{nombre} {apellido} | Rol: {rol} | Tipo: {tipo} | Asistencias: {asistencias} | Reservas: {reservas}")

    print("\n PORCENTAJE DE RESERVAS UTILIZADAS VS NO UTILIZADAS")
    porcentajes = get_porcentaje_reservas_utilizadas_vs_no_utilizadas(cursor)
    for fila in porcentajes:
        no_utilizadas, utilizadas = fila
        print(f"Utilizadas: {utilizadas:.2f}% | No utilizadas: {no_utilizadas:.2f}%")

    print("\n⏱ PROMEDIO DE DURACIÓN DE SANCIONES POR PARTICIPANTE")
    sanciones = get_promedio_duracion_sancion_por_participante(cursor)
    for fila in sanciones:
        ci, promedio = fila
        print(f"CI: {ci} | Promedio días de sanción: {promedio:.2f}")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()

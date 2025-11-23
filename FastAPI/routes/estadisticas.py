from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole

router = APIRouter(prefix="/estadisticas", tags=["Estadísticas"])

# ---------------------------------------------
# 1. Salas más reservadas
# ---------------------------------------------
@router.get("/salas-mas-reservadas")
def salas_mas_reservadas(user=Depends(requireRole("Administrador", "Usuario", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT nombre_sala, COUNT(*) AS cant_reservas
        FROM reserva
        GROUP BY nombre_sala
        ORDER BY cant_reservas DESC
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 2. Turnos más demandados
# ---------------------------------------------
@router.get("/turnos-mas-demandados")
def turnos_mas_demandados(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT r.id_turno, t.hora_inicio, t.hora_fin, COUNT(*) AS total_reservas
        FROM reserva r
        JOIN turno t ON t.id_turno = r.id_turno
        WHERE r.estado IN ('activa','finalizada')
        GROUP BY r.id_turno, t.hora_inicio, t.hora_fin
        ORDER BY total_reservas DESC
        LIMIT 10;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 3. Promedio de participantes por sala
# ---------------------------------------------
@router.get("/promedio-participantes")
def promedio_participantes(user=Depends(requireRole("Administrador", "Usuario", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT nombre_sala, AVG(cant_participantes) AS promedio_participantes 
        FROM (
            SELECT r.id_reserva, r.nombre_sala, COUNT(rp.ci_participante) AS cant_participantes 
            FROM reserva r 
            LEFT JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva 
            GROUP BY r.id_reserva, r.nombre_sala
        ) AS sub 
        GROUP BY nombre_sala;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 4. Reservas por carrera y facultad
# ---------------------------------------------
@router.get("/reservas-por-carrera")
def reservas_por_carrera(user=Depends(requireRole("Administrador", "Usuario", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT f.nombre AS facultad, pa.nombre_programa, COUNT(*) AS cantidadReservas
        FROM reserva r
        JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
        JOIN participante_programa_academico ppa ON ppa.ci_participante = rp.ci_participante
        JOIN programa_academico pa ON pa.nombre_programa = ppa.nombre_programa
        JOIN facultad f ON f.id_facultad = pa.id_facultad
        GROUP BY f.nombre, pa.nombre_programa;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 5. Porcentaje ocupación por edificio (dinámico)
# ---------------------------------------------
@router.get("/ocupacion-edificios")
def ocupacion_edificios(user=Depends(requireRole("Administrador", "Usuario", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT st.edificio,
               ((CASE WHEN so.salas_ocupadas IS NULL THEN 0 ELSE so.salas_ocupadas END) 
                 / st.cantidad_salas * 100) AS porcentaje_ocupadas
        FROM (SELECT edificio, COUNT(*) AS cantidad_salas FROM sala GROUP BY edificio) st
        LEFT JOIN (
            SELECT r.edificio, COUNT(*) AS salas_ocupadas
            FROM reserva r
            JOIN turno t ON r.id_turno = t.id_turno
            WHERE r.fecha = CURDATE()
            AND CURRENT_TIME BETWEEN t.hora_inicio AND t.hora_fin
            AND r.estado = 'activa'
            GROUP BY r.edificio
        ) so ON st.edificio = so.edificio;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 6. Asistencias y reservas
# ---------------------------------------------
@router.get("/asistencias")
def asistencias(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.nombre, p.apellido,
       SUM(CASE WHEN rp.asistencia = TRUE THEN 1 ELSE 0 END) AS asistencias,
       COUNT(*) AS cantidadReservas,
       ppa.rol, pa.tipo
        FROM reserva_participante rp
        JOIN participante p ON rp.ci_participante = p.ci
        JOIN participante_programa_academico ppa ON ppa.ci_participante = p.ci
        JOIN programa_academico pa ON pa.nombre_programa = ppa.nombre_programa
        GROUP BY p.ci, p.nombre, p.apellido, ppa.rol, pa.tipo;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 7. Sanciones por rol y programa
# ---------------------------------------------
@router.get("/sanciones")
def sanciones(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT ppa.rol, pa.tipo, COUNT(sp.ci_participante) AS cant_sanciones
        FROM sancion_participante sp
        JOIN participante_programa_academico ppa ON sp.ci_participante = ppa.ci_participante
        JOIN programa_academico pa ON ppa.nombre_programa = pa.nombre_programa
        GROUP BY ppa.rol, pa.tipo
        ORDER BY ppa.rol, pa.tipo;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 8. Porcentaje de reservas utilizadas / no utilizadas
# ---------------------------------------------
@router.get("/uso-reservas")
def uso_reservas(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT
        (SUM(CASE WHEN estado = 'sin asistencia' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS NoUtilizadas,
        (SUM(CASE WHEN estado = 'finalizada' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS Utilizadas
    FROM reserva;
    """)
    data = cursor.fetchone()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 9. Top participantes del mes
# ---------------------------------------------
@router.get("/top-participantes-mes")
def top_mes(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.ci, p.nombre, p.apellido, COUNT(*) AS cant_reservas
        FROM participante p
        JOIN reserva_participante rp ON p.ci = rp.ci_participante
        WHERE MONTH(rp.fecha_solicitud_reserva) = MONTH(CURRENT_DATE)
        AND YEAR(rp.fecha_solicitud_reserva) = YEAR(CURRENT_DATE)
        GROUP BY p.ci, p.nombre, p.apellido
        ORDER BY cant_reservas DESC
        LIMIT 3;

    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 10. Promedio días sanción
# ---------------------------------------------
@router.get("/promedio-sanciones")
def promedio_sanciones(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.ci,
               (CASE WHEN sp.ci_participante IS NOT NULL 
                     THEN AVG(DATEDIFF(fecha_fin, fecha_inicio))
                     ELSE 0 END) AS promedio_dias
        FROM sancion_participante sp
        RIGHT JOIN participante p ON sp.ci_participante = p.ci
        GROUP BY p.ci;
    """)
    data = cursor.fetchall()
    cursor.close(); conn.close()
    return data


# ---------------------------------------------
# 11. Día de la semana con más reservas
# ---------------------------------------------
@router.get("/dia-mas-reservas")
def dia_mas_reservas(user=Depends(requireRole("Administrador", "Bibliotecario"))):
    conn = getConnection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT DAYNAME(r.fecha) AS dia_semana,
       DAYOFWEEK(r.fecha) AS num_semana,
       COUNT(*) AS total_reservas
        FROM reserva r
        WHERE r.estado IN ('activa','finalizada')
        GROUP BY dia_semana, num_semana
        ORDER BY total_reservas DESC
        LIMIT 1;
    """)
    data = cursor.fetchone()
    cursor.close(); conn.close()
    return data

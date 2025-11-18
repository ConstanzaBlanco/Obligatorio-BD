from db.connector import getConnection

def getAllReservations(roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("""
            SELECT 
                r.id_reserva, 
                r.nombre_sala, 
                r.edificio, 
                r.fecha, 
                t.id_turno, 
                TIME_FORMAT(t.hora_inicio, '%H:%i:%s') AS hora_inicio,
                TIME_FORMAT(t.hora_fin, '%H:%i:%s') AS hora_fin,
                COUNT(rp.ci_participante) AS total_participantes,
                GROUP_CONCAT(rp.ci_participante ORDER BY rp.ci_participante SEPARATOR ',') AS cis,
                s.habilitada                              
            FROM reserva AS r
                JOIN turno AS t ON t.id_turno = r.id_turno
                LEFT JOIN reserva_participante AS rp ON rp.id_reserva = r.id_reserva
                JOIN sala AS s ON s.nombre_sala = r.nombre_sala AND s.edificio = r.edificio   
            WHERE r.estado = 'activa'
            GROUP BY 
                r.id_reserva, r.nombre_sala, r.edificio, r.fecha, 
                t.id_turno, t.hora_inicio, t.hora_fin, s.habilitada   
            ORDER BY r.fecha, r.edificio, r.nombre_sala, t.hora_inicio;
        """)
        return cur.fetchall()
    finally:
        cn.close()


def updateAssistUser(ci: int, reserveId: int, boolean: bool, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE reserva_participante SET asistencia = %s WHERE ci_participante = %s AND id_reserva = %s;",
            (boolean, ci, reserveId)
        )
        cn.commit()
        return cur.rowcount  
    finally:
        cn.close()


def getAllCisOfOneReservation(reserveId: int, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT ci_participante FROM reserva_participante WHERE id_reserva = %s;",
            (reserveId,)
        )
        rows = cur.fetchall()
        cis = []
        for row in rows:
            cis.append(row["ci_participante"])
        return cis
    finally:
        cn.close()


def updateReserveToFinish(reserveId: int, state: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE reserva SET estado = %s WHERE id_reserva = %s;",
            (state, reserveId)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

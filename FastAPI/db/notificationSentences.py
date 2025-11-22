from db.connector import getConnection


def createNotification(ci_destinatario, tipo, mensaje, referencia_tipo=None, referencia_id=None, roleDb="Administrador"):
    cn = getConnection(roleDb)
    cur = cn.cursor()
    try:
        cur.execute("""
            INSERT INTO notificacion (ci_destinatario, tipo, mensaje, referencia_tipo, referencia_id)
            VALUES (%s, %s, %s, %s, %s);
        """, (ci_destinatario, tipo, mensaje, referencia_tipo, referencia_id))
        cn.commit()
        return cur.rowcount
    finally:
        cur.close()
        cn.close()


def getNotifications(ci, roleDb):
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT n.*,
                   r.nombre_sala AS sala,
                   r.edificio AS edificio,
                   r.fecha AS fecha_reserva,
                   TIME_FORMAT(t.hora_inicio, '%H:%i') AS hora_inicio,
                   TIME_FORMAT(t.hora_fin, '%H:%i') AS hora_fin,
                   p.nombre AS creador_nombre
            FROM notificacion n
            LEFT JOIN reserva r ON n.referencia_id = r.id_reserva
            LEFT JOIN turno t ON r.id_turno = t.id_turno
            LEFT JOIN participante p ON r.creador = p.ci
            WHERE n.ci_destinatario = %s
            ORDER BY n.fecha DESC;
        """, (ci,))

        return cur.fetchall()

    finally:
        cur.close()
        cn.close()






def markAsRead(id_notif, roleDb):
    cn = getConnection(roleDb)
    cur = cn.cursor()
    try:
        cur.execute("""
            UPDATE notificacion
            SET leido = TRUE
            WHERE id_notificacion = %s;
        """, (id_notif,))
        cn.commit()
        return cur.rowcount
    finally:
        cur.close()
        cn.close()


def markAllAsRead(ci, roleDb):
    cn = getConnection(roleDb)
    cur = cn.cursor()
    try:
        cur.execute("""
            UPDATE notificacion
            SET leido = TRUE
            WHERE ci_destinatario = %s;
        """, (ci,))
        cn.commit()
        return cur.rowcount
    finally:
        cur.close()
        cn.close()


def countUnread(ci, roleDb):
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT COUNT(*) AS unread
            FROM notificacion
            WHERE ci_destinatario = %s AND leido = FALSE;
        """, (ci,))
        row = cur.fetchone()
        return row["unread"]
    finally:
        cur.close()
        cn.close()

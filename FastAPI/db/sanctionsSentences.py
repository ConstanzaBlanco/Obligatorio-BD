from db.connector import getConnection

def getAllSanctions(roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(""" select s.ci_participante, p.email, s.fecha_inicio, s.fecha_fin from sancion_participante as s 
                    join participante p on p.ci = s.ci_participante order by s.ci_participante ASC; """)
        return cur.fetchall()
    finally:
        cn.close()

def createSanction(ci: int, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin)
            VALUES (%s, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 MONTH));
        """, (ci,))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

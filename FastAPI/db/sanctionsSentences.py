from db.connector import getConnection

def getAllSanctions():
    cn = getConnection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(""" select s.ci_participante, p.email, s.fecha_inicio, s.fecha_fin from sancion_participante as s 
                    join participante p on p.ci = s.ci_participante order by s.ci_participante ASC; """)
        return cur.fetchall()
    finally:
        cn.close()
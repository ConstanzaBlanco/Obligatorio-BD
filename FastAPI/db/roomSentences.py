from db.connector import getConnection

def getRooms(roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT * FROM sala ORDER BY nombre_sala ASC ")
        return cur.fetchall()
    finally:
        cn.close()
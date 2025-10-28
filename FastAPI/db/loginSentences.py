from db.connector import getConnection
from datetime import datetime

def getUser(correo: str):
    cn = getConnection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT correo, contrasenia, rol, last_access FROM login WHERE correo=%s AND (deleted_at IS NULL)",
            (correo,),
        )
        return cur.fetchone()
    finally:
        cn.close()

def updateLastAccess(correo: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("UPDATE login SET last_access=%s WHERE correo=%s", (datetime.now(), correo))
        cn.commit()
    finally:
        cn.close()

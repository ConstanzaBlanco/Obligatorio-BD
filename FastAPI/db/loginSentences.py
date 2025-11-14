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

def getOneUser(correo: str):
    cn = getConnection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "select * from participante where email = %s",
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

def updatePassword(correo: str, password: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("UPDATE login SET contrasenia=%s WHERE correo=%s", (password, correo))
        cn.commit()
    finally:
        cn.close()

def updateRolOfUser(correo: str, rol: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET rol=%s WHERE correo=%s AND deleted_at IS NULL",
            (rol, correo)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def deleteUser(correo: str):
    cn = getConnection()
    try:
        cur = cn.cursor()

        cur.execute(
            "UPDATE participante SET deleted_at=%s WHERE email=%s AND deleted_at IS NULL",
            (datetime.now(), correo)
        )
        participante_rows = cur.rowcount

        # Borrar login
        cur.execute(
            "UPDATE login SET deleted_at=%s WHERE correo=%s AND deleted_at IS NULL",
            (datetime.now(), correo)
        )
        login_rows = cur.rowcount

        cn.commit()

        # Si no se eliminó de login, no existe el usuario
        return login_rows

    finally:
        cn.close()
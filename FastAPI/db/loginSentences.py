from db.connector import getConnection
from datetime import datetime

def getUser(correo: str):
    cn = getConnection("Invitado")
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM login WHERE correo=%s",
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

def updateLastAccess(correo: str, roleDb: str):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET last_access=NOW() WHERE correo=%s",
            (correo,)
            )
        cn.commit()
    finally:
        cn.close()

def updatePassword(correo: str, password: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("UPDATE login SET contrasenia=%s WHERE correo=%s", (password, correo))
        cn.commit()
    finally:
        cn.close()

def updateRolOfUser(correo: str, rol: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET rol=%s WHERE correo=%s",
            (rol, correo)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def deleteUser(correo: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()

        # 1) Obtener CI del participante a partir del correo
        cur.execute(
            "SELECT ci FROM participante WHERE email = %s",
            (correo,)
        )
        row = cur.fetchone()

        # Si no hay participante, asumimos que no existe el usuario
        if not row:
            return 0

        ci = row[0]

        # 2) Borrar dependencias por CI (tablas hijas)
        cur.execute(
            "DELETE FROM reserva_participante WHERE ci_participante = %s",
            (ci,)
        )
        cur.execute(
            "DELETE FROM sancion_participante WHERE ci_participante = %s",
            (ci,)
        )
        cur.execute(
            "DELETE FROM participante_programa_academico WHERE ci_participante = %s",
            (ci,)
        )

        # 3) Borrar participante
        cur.execute(
            "DELETE FROM participante WHERE ci = %s",
            (ci,)
        )

        # 4) Borrar login
        cur.execute(
            "DELETE FROM login WHERE correo = %s",
            (correo,)
        )
        login_rows = cur.rowcount  # 1 si se borró, 0 si no

        cn.commit()
        return login_rows

    finally:
        cn.close()

def updateTokenJti(correo: str, jti: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET current_jti=%s WHERE correo=%s",
            (jti, correo)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def clearTokenJti(correo: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET current_jti = NULL WHERE correo=%s",
            (correo,)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def updateDataUser(newEmail: str, oldEmail: str, name: str, lastName: str, ci: int, roleDb: str):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()

        cur.execute(
            "UPDATE login SET correo=%s WHERE correo=%s",
            (newEmail, oldEmail)
        )

        cur.execute(
            "UPDATE participante SET nombre=%s, apellido=%s, email=%s WHERE ci=%s",
            (name, lastName, newEmail, ci)
        )

        cn.commit()
    finally:
        cn.close()
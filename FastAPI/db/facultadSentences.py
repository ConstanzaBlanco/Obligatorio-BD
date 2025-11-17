from db.connector import getConnection
from datetime import datetime

def createFacultad(nombre: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO facultad (nombre, created_at)
            VALUES (%s, %s)
        """, (nombre, datetime.now()))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def getFacultades(roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT * FROM facultad")
        return cur.fetchall()
    finally:
        cn.close()


def getOneFacultad(id_facultad: int, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM facultad WHERE id_facultad=%s",
            (id_facultad,)
        )
        return cur.fetchone()
    finally:
        cn.close()


def updateFacultad(id_facultad: int, nombre: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            UPDATE facultad
            SET nombre=%s
            WHERE id_facultad=%s
        """, (nombre, id_facultad))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def deleteFacultad(id_facultad: int, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "DELETE FROM facultad WHERE id_facultad=%s",
            (id_facultad,)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

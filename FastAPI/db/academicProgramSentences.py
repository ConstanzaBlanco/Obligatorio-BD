from db.connector import getConnection

def createPrograma(nombre_programa: str, id_facultad: int, tipo: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO programa_academico (nombre_programa, id_facultad, tipo)
            VALUES (%s, %s, %s)
        """, (nombre_programa, id_facultad, tipo))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def getProgramas(roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute("SELECT * FROM programa_academico")
        return cur.fetchall()
    finally:
        cn.close()


def getOnePrograma(nombre_programa: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT * FROM programa_academico WHERE nombre_programa=%s",
            (nombre_programa,)
        )
        return cur.fetchone()
    finally:
        cn.close()


def updatePrograma(nombre_programa: str, id_facultad: int, tipo: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            UPDATE programa_academico
            SET id_facultad=%s, tipo=%s
            WHERE nombre_programa=%s
        """, (id_facultad, tipo, nombre_programa))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def deletePrograma(nombre_programa: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute(
            "DELETE FROM programa_academico WHERE nombre_programa=%s",
            (nombre_programa,)
        )
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

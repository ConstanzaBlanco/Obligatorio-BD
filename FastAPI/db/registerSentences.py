from db.connector import getConnection
from fastapi import HTTPException

def insertLogin(correo: str, password: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO login (correo, contrasenia, rol, last_access)
            VALUES (%s, %s, %s, NOW());
        """, (correo, password, 'Usuario'))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def insertPaticipante(ci: int, name: str, lastName: str, email: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO participante (ci, nombre, apellido, email)
            VALUES (%s, %s, %s, %s);
        """, (ci, name, lastName, email))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def insertParticipanteProgramaAcademico(ci: int, nameProgram: str, rol: str, roleDb):
    cn = getConnection(roleDb)
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO participante_programa_academico (ci_participante, nombre_programa, rol)
            VALUES (%s, %s, %s);
        """, (ci, nameProgram, rol))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def insertBiblioLogin(correo: str, password: str, roleDb):
     cn = getConnection(roleDb)
     try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO login (correo, contrasenia, rol, last_access)
            VALUES (%s, %s, %s, NOW());
        """, (correo, password, 'Bibliotecario'))
        cn.commit()
        return cur.rowcount
     finally:
        cn.close()

def verifyExisteUser(ci: int, correo: str, roleDb="Invitado"):
    conn = getConnection(roleDb)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM participante WHERE ci = %s", (ci,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="ci ya registrado")

        cursor.execute("SELECT 1 FROM login WHERE correo = %s", (correo,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="correo ya registrado")
    finally:
        cursor.close()
        conn.close()
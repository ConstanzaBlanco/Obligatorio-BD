from db.connector import getConnection

def insertLogin(correo: str, password: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO login (correo, contrasenia, rol, created_at, last_access)
            VALUES (%s, %s, %s, NOW(), NOW());
        """, (correo, password, 'Usuario'))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def insertPaticipante(ci: int, name: str, lastName: str, email: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO participante (ci, nombre, apellido, email, created_at)
            VALUES (%s, %s, %s, %s, NOW());
        """, (ci, name, lastName, email))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()

def insertParticipanteProgramaAcademico(ci: int, nameProgram: str, rol: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO participante_programa_academico (ci_participante, nombre_programa, rol, created_at)
            VALUES (%s, %s, %s, NOW());
        """, (ci, nameProgram, rol))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()


def insertBiblioLogin(correo: str, password: str):
    cn = getConnection()
    try:
        cur = cn.cursor()
        cur.execute("""
            INSERT INTO login (correo, contrasenia, rol, created_at, last_access)
            VALUES (%s, %s, %s, NOW(), NOW());
        """, (correo, password, 'Bibliotecario'))
        cn.commit()
        return cur.rowcount
    finally:
        cn.close()
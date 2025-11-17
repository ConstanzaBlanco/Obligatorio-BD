from db.connector import getConnection

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
import mysql.connector
from datetime import datetime

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "BaseToken"
}

def get_connection():
    """Devuelve una conexión nueva a la base de datos."""
    return mysql.connector.connect(**DB_CONFIG)

def get_user(correo: str):
    """Obtiene un usuario por su correo (si no está borrado lógicamente)."""
    cn = get_connection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT correo, contraseña, last_access FROM login WHERE correo=%s AND deleted_at IS NULL",
            (correo,),
        )
        return cur.fetchone()
    finally:
        cn.close()

def update_last_access(correo: str):
    """Actualiza la fecha del último acceso."""
    cn = get_connection()
    try:
        cur = cn.cursor()
        cur.execute(
            "UPDATE login SET last_access=%s WHERE correo=%s",
            (datetime.now(), correo),
        )
        cn.commit()
    finally:
        cn.close()

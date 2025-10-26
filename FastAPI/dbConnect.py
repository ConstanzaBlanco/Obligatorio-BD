# dbConnect.py
import os, mysql.connector
from datetime import datetime

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "db"),   # <<--- 'db' (nombre del servicio en docker-compose)
    "user": os.getenv("DB_USER", "gestion_salas_user"),
    "password": os.getenv("DB_PASSWORD", "shaw"),
    "database": os.getenv("DB_NAME", "gestion_salas"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

def get_connection():
    return mysql.connector.connect(**DB_CONFIG)

def get_user(correo: str):
    cn = get_connection()
    try:
        cur = cn.cursor(dictionary=True)
        cur.execute(
            "SELECT correo, contrasenia, last_access FROM login WHERE correo=%s AND (deleted_at IS NULL)",
            (correo,),
        )
        return cur.fetchone()
    finally:
        cn.close()

def update_last_access(correo: str):
    cn = get_connection()
    try:
        cur = cn.cursor()
        cur.execute("UPDATE login SET last_access=%s WHERE correo=%s", (datetime.now(), correo))
        cn.commit()
    finally:
        cn.close()

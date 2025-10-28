# dbConnect.py
import os, mysql.connector

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "db"),   # <<--- 'db' (nombre del servicio en docker-compose)
    "user": os.getenv("DB_USER", "gestion_salas_user"),
    "password": os.getenv("DB_PASSWORD", "shaw"),
    "database": os.getenv("DB_NAME", "gestion_salas"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

def getConnection():
    return mysql.connector.connect(**DB_CONFIG)
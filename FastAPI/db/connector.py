# dbConnect.py
import os, mysql.connector

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),   # <<--- 'db' (nombre del servicio en docker-compose)
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "port": int(os.getenv("DB_PORT")),
}

def getConnection():
    return mysql.connector.connect(**DB_CONFIG)
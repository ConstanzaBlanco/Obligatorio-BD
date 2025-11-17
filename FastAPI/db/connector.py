# dbConnect.py
import os
import mysql.connector

DB_CONFIGS = {
    "Invitado": {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER_INVITED"),      # invited_user
        "password": os.getenv("DB_PASSWORD_INVITED"),
        "database": os.getenv("DB_NAME"),
        "port": int(os.getenv("DB_PORT")),
    },
    "Usuario": {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER_USER"),         # app_user
        "password": os.getenv("DB_PASSWORD_USER"),
        "database": os.getenv("DB_NAME"),
        "port": int(os.getenv("DB_PORT")),
    },
    "Bibliotecario": {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER_BIBLIO"),       # biblio_user
        "password": os.getenv("DB_PASSWORD_BIBLIO"),
        "database": os.getenv("DB_NAME"),
        "port": int(os.getenv("DB_PORT")),
    },
    "Administrador": {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER_ADMIN"),        # admin_user
        "password": os.getenv("DB_PASSWORD_ADMIN"),
        "database": os.getenv("DB_NAME"),
        "port": int(os.getenv("DB_PORT")),
    },
}

def getConnection(role: str = "Invitado"):
    cfg = DB_CONFIGS.get(role, DB_CONFIGS["Invitado"])
    print(f"[DB-CONNECT] role_app={role!r} → mysql_user={cfg['user']!r}")
    return mysql.connector.connect(**cfg)

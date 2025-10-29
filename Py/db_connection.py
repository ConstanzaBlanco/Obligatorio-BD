import mysql.connector

def get_connection():
    conn = mysql.connector.connect(
        host="db",  # si usás Docker Compose, el servicio del MySQL se llama "db"
        user="gestion_salas_user",
        password="shaw",
        database="gestion_salas_db"
    )
    return conn

print(get_connection())
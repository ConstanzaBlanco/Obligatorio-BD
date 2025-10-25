import mysql.connector
import os #Se necesita para leer varioables del entorno en este caso el compose
'''
Esta parte se encarga de conectarse con la base de datos
'''
def get_connection(): #Retorna la conexión con la base para uqe la puedan usar otras partes del codigo
    conn = mysql.connector.connect( ##Pide una conexión con la base de datos
        host=os.getenv("DB_HOST", "localhost")  ,
        user=os.getenv("DB_USER", "gestion_salas_user"),
        password=os.getenv("DB_PASSWORD", "shaw"),
        database=os.getenv("DB_NAME", "gestion_salas")
        #En todas estas lineas se hace algo como leer lo que está en el docker y usar el valor de esa variable
        # y en caso de no estar hay un valor por defecto que es el segundo
    )
    return conn

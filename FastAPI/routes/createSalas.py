from fastapi import APIRouter, Depends
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole

router = APIRouter()

class CrearSalaRequest(BaseModel):
    nombre_sala: str
    edificio: str
    capacidad: int
    tipo_sala: str  # libre / posgrado / docente


@router.post("/salas")
def crear_sala(request: CrearSalaRequest):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Verificar si ya existe la sala en el edificio que se pone
        cur.execute("""
            SELECT * FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala_existente = cur.fetchone()
        if sala_existente:
            return {"error": "Ya existe una sala con ese nombre en ese edificio"}

        # Insertar la sala
        cur.execute("""
            INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, created_at)
            VALUES (%s, %s, %s, %s, NOW());
        """, (request.nombre_sala, request.edificio, request.capacidad, request.tipo_sala))

        cn.commit()
        # Me guardo el id de la sala que se genera al hacer el insert
        id_sala = cur.lastrowid

        return {
            "mensaje": "Sala creada correctamente",
            "id_sala": id_sala
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole

router = APIRouter()

class CrearSalaRequest(BaseModel):
    nombre_sala: str
    edificio: str
    capacidad: int
    tipo_sala: str  # que son libre / posgrado / docente


@router.post("/salas")
def crear_sala(request: CrearSalaRequest, user = Depends(requireRole("Administrador"))):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Validar tipo de sala, en coso de que ponga algo que no debería poder
        if request.tipo_sala not in ["libre", "posgrado", "docente"]:
            raise HTTPException(status_code=400, detail="tipo_sala inválido")

        # Verificar que el edificio exista
        cur.execute("""
            SELECT nombre_edificio 
            FROM edificio 
            WHERE nombre_edificio = %s
        """, (request.edificio,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="El edificio especificado no existe")

        # Verificar si ya existe la sala en ese edificio
        cur.execute("""
            SELECT * FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala_existente = cur.fetchone()
        if sala_existente:
            raise HTTPException(status_code=400, detail="Ya existe una sala con ese nombre en ese edificio")

        # Insertar la sala
        cur.execute("""
            INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala)
            VALUES (%s, %s, %s, %s);
        """, (request.nombre_sala, request.edificio, request.capacidad, request.tipo_sala))

        cn.commit()

        # devolvemos el nombre y el edificio de la sala creada para el front
        return {
            "mensaje": "Sala creada correctamente",
            "nombre_sala": request.nombre_sala,
            "edificio": request.edificio
        }

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

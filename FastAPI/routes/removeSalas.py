from fastapi import APIRouter
from db.connector import getConnection
from pydantic import BaseModel

router = APIRouter()

class RemoveSalaRequest(BaseModel):
    nombre_sala: str

@router.delete("/removeSalas")
def remove_sala(request: RemoveSalaRequest):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Verificar si la sala existe
        cur.execute("""
            SELECT * FROM sala
            WHERE nombre_sala = %s;
        """, (request.nombre_sala,))
        
        sala_existente = cur.fetchone()

        if not sala_existente:
            return {"error": "La sala no existe"}

        # Eliminar la sala
        cur.execute("""
            DELETE FROM sala
            WHERE nombre_sala = %s;
        """, (request.nombre_sala,))

        cn.commit()

        return {
            "mensaje": "Sala eliminada correctamente",
            "sala_eliminada": request.nombre_sala
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

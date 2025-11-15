from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole

router = APIRouter()

class RemoveSalaRequest(BaseModel):
    nombre_sala: str
    edificio: str  

@router.delete("/removeSalas")
def remove_sala(request: RemoveSalaRequest, user=Depends(requireRole("Administrador"))):
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Verificar si la sala existe con su pareja de edificio
        cur.execute("""
            SELECT * 
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="La sala no existe en ese edificio")
        # Verificamos si la sala tiene reservas asociadas
        # Si haríamos esto los datos de reservas pierden sentido y se rompe la integridad referencial de bd
        cur.execute("""
            SELECT id_reserva 
            FROM reserva
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        reservas = cur.fetchall()
        if reservas:
            raise HTTPException(
                status_code=400,
                detail="No se puede eliminar la sala porque tiene reservas asociadas"
            )

        # Eliminamos la sala la sala
        cur.execute("""
            DELETE FROM sala
            WHERE nombre_sala = %s AND edificio = %s;
        """, (request.nombre_sala, request.edificio))

        cn.commit()

        return {
            "mensaje": "Sala eliminada correctamente",
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

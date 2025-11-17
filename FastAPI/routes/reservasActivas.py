from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole

router = APIRouter()

@router.get("/reservasActivas")
def reservas_activas(user = Depends(requireRole("Bibliotecario"))):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        cur.execute("""
            SELECT 
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                t.hora_inicio,
                t.hora_fin,
                r.estado AS estado_reserva
            FROM reserva r
            JOIN turno t ON r.id_turno = t.id_turno
            WHERE r.estado = 'activa'
            ORDER BY r.fecha ASC, t.hora_inicio ASC
        """)

        reservas = cur.fetchall()

        return {"reservas_activas": reservas}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

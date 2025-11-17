from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole

router = APIRouter()

@router.get("/reservasPasadas")
def reservas_pasadas(user = Depends(requireRole("Bibliotecario"))):
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
            WHERE r.estado = 'pasada'
               OR (r.fecha < CURDATE())
               OR (r.fecha = CURDATE() AND t.hora_fin < CURTIME())
            ORDER BY r.fecha DESC, t.hora_inicio DESC
        """)

        reservas = cur.fetchall()

        return {"reservas_pasadas": reservas}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

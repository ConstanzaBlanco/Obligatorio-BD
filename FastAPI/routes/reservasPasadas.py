from fastapi import APIRouter
from db.connector import getConnection

router = APIRouter()

@router.get("/reservasPasadas")
def reservas_pasadas():
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        cur.execute("""
            SELECT 
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                r.estado AS estado_reserva,
                t.hora_inicio,
                t.hora_fin
            FROM reserva r
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE r.estado IN ('finalizada', 'sin_asistencia', 'vencida')
            ORDER BY r.fecha DESC;
        """)

        reservas = cur.fetchall()
        return {"reservas_pasadas": reservas}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try: cn.close()
        except: pass

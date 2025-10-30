

from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser 

router = APIRouter()

@router.get("/seePastAndActiveReservations")
def seePastAndActiveReservations(): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)
        
        #Hago la consulta de reservas totales pasadas y activas para sancionar o marcar como finalizadas
        cur.execute("""
             SELECT
            rp.ci_participante,
            r.estado,
            r.fecha,
            t.hora_inicio,
            t.hora_fin
        FROM turno t
        JOIN reserva r ON t.id_turno = r.id_turno
        JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
        WHERE r.estado = 'ACTIVA'
        AND (r.fecha < CURRENT_DATE
            OR (r.fecha = CURRENT_DATE AND CURRENT_TIME > t.hora_fin)
            );
        """) #Parametrizamos para evitar Injections

        resp = cur.fetchall()
        return {"reservas_pasadas_activas": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

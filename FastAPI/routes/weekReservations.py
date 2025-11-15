from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/weekReservations")
def dayReservations(user=Depends(currentUser)): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        #Obtener el correo del usuario autenticado
        correo = user["correo"]


        #Busco su ci a partir del correo
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE email = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="No se encontró participante asociado a este usuario")

        ci = participante["ci"]

        #Hago la consulta de reservas en la SEMANA sin contar las canceladas con ci
        cur.execute("""
            SELECT 
                r.fecha,
                t.hora_inicio,
                t.hora_fin,
                r.nombre_sala,
                r.estado
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE r.fecha >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
            AND rp.ci_participante = %s
            AND r.estado != 'cancelada'
            ORDER BY r.fecha ASC, t.hora_inicio ASC;
        """, (ci,))  # Parametrizamos para evitar Injections

        resp = cur.fetchall()
        return {"reservas_del_usuario_en_la_semana": resp}

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

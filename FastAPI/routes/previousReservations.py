from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/previousReservations")
def previousReservations(user=Depends(currentUser)): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        #Obtener el correo del usuario autenticado
        correo = user["correo"]

        #Busco su ci a partir del correo
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE correo = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            return {"error": "No se encontró participante asociado a este usuario"}

        ci = participante["ci"]

        #Hago la consulta de reservas anteriores del usuario
        cur.execute("""
            SELECT 
                r.fecha,
                r.estado,
                t.hora_inicio,
                t.hora_fin,
                r.nombre_sala,
                r.edificio
            FROM reserva r 
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE rp.ci_participante = %s
              AND r.estado != 'activa'
            ORDER BY r.fecha DESC;
        """, (ci,))

        resp = cur.fetchall()
        return {"reservas_del_usuario_anteriores": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser 

router = APIRouter()

@router.get("/seeOwnActiveReservations")
def seeOwnActiveReservations(user=Depends(currentUser)): 
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
        #Hago la consulta de reservas activas, sin cancelar ni finalizar
        cur.execute("""
            SELECT rp.ci_participante,r.nombre_sala,r.fecha, t.hora_inicio,t.hora_fin,r.estado,rp.fecha_solicitud_reserva
            FROM turno t JOIN reserva r on (t.id_turno=r.id_turno) 
                    JOIN reserva_participante rp on (r.id_reserva=rp.id_reserva)
            WHERE r.estado='activa' and rp.ci_participante= %s
        """, (ci,)) #Parametrizamos para evitar Injections

        resp = cur.fetchall()
        return {"sanciones_del_usuario": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

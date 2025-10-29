from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/previousReservations")
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
            WHERE correo = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            return {"error": "No se encontró participante asociado a este usuario"}

        ci = participante["ci"]
        #Hago la consulta de reservas anteriores del usaurio (finalizada o cancelada)
        cur.execute("""
             SELECT r.fecha,r.estado
            from reserva r JOIN reserva_participante rp 
                    on (r.id_reserva=rp.id_reserva)
            where rp.ci_participante=}%s
                    AND r.estado!='activa';
        """, (ci,)) #Parametrizamos para evitar Injections

        resp = cur.fetchall()
        return {"reservas_del_usuario_anteriores": resp}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

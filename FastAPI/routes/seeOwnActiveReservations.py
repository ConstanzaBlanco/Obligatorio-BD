from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser 

router = APIRouter()

@router.get("/seeOwnActiveReservations")
def seeOwnActiveReservations(user=Depends(currentUser)): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Obtener el correo del usuario autenticado
        correo = user["correo"]


        # Busco su ci a partir del correo
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE email = %s
        """, (correo,))
        participante = cur.fetchone()

        # si no lo encuentro aviso
        if not participante:
            raise HTTPException(status_code=404, detail="No se encontró participante asociado a este usuario")

        ci = participante["ci"]

        # Hago la consulta de reservas activas del usuario por su ci
        cur.execute("""
            SELECT 
                rp.ci_participante,
                r.nombre_sala,
                r.edificio,
                r.fecha, 
                t.hora_inicio,
                t.hora_fin,
                r.estado,
                rp.fecha_solicitud_reserva
            FROM turno t 
            JOIN reserva r ON t.id_turno = r.id_turno
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.estado = 'activa'
                AND rp.ci_participante = %s
            ORDER BY r.fecha, t.hora_inicio;
        """, (ci,))  # Parametrizamos para evitar Injections

        reservas = cur.fetchall()

        return {"reservas_activas_del_usuario": reservas}

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

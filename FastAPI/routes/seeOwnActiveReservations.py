from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/seeOwnActiveReservations")
def seeOwnActiveReservations(user=Depends(currentUser)): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # Obtener el correo del user auth
        correo = user["correo"]

        # Buscar CI del participante por su mail
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE email = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="No se encontró participante asociado a este usuario")

        ci = participante["ci"]

        # Me quedo con la fecha y hora actual del sistema
        cur.execute("SELECT NOW() AS now;")
        now = cur.fetchone()["now"]

        # Consultamos por las reservas activas que aún se pueden cancelar
        cur.execute("""
            SELECT 
                r.id_reserva,
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
                -- No permitir reservas de días pasados
                AND r.fecha >= DATE(%s)
                -- Si la reserva es hoy, no permitir si ya empezó
                AND NOT (
                        r.fecha = DATE(%s)
                        AND t.hora_inicio <= TIME(%s)
                    )
            ORDER BY r.fecha, t.hora_inicio;
        """, (ci, now, now, now))

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

from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/seeOwnActiveReservations")
def seeOwnActiveReservations(user=Depends(currentUser)): 
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
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
        date_now = now.date()
        time_now = now.time()

        # Reservas CREADAS por el usuario (que puede cancelar)
        cur.execute("""
            SELECT
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                t.hora_inicio,
                t.hora_fin,
                r.estado
            FROM turno t
            JOIN reserva r ON t.id_turno = r.id_turno
            WHERE r.estado = 'activa'
              AND r.creador = %s
              AND (r.fecha > %s OR (r.fecha = %s AND t.hora_inicio > %s))
            ORDER BY r.fecha, t.hora_inicio
        """, (ci, date_now, date_now, time_now))

        mis_reservas_creadas = cur.fetchall()

        # Reservas donde el usuario PARTICIPA pero NO es el creador
        cur.execute("""
            SELECT
                r.id_reserva,
                r.creador,
                r.nombre_sala,
                r.edificio,
                r.fecha,
                t.hora_inicio,
                t.hora_fin,
                r.estado,
                rp.fecha_solicitud_reserva,
                rp.estado_invitacion
            FROM turno t
            JOIN reserva r ON t.id_turno = r.id_turno
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.estado = 'activa'
              AND rp.ci_participante = %s
              AND r.creador != %s
              AND (r.fecha > %s OR (r.fecha = %s AND t.hora_inicio > %s))
            ORDER BY r.fecha, t.hora_inicio
        """, (ci, ci, date_now, date_now, time_now))

        reservas_donde_participo = cur.fetchall()

        return {
            "mis_reservas_creadas": mis_reservas_creadas,
            "reservas_donde_participo": reservas_donde_participo
        }

    except HTTPException:
        raise

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

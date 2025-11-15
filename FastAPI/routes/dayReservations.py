from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

@router.get("/dayReservations")
def dayReservations(user=Depends(requireRole("Usuario"))): 
    try:
        cn = getConnection()
        cur = cn.cursor(dictionary=True)

        # nos quedamos con el correo del usuario autenticado
        correo = user["correo"]

        # Busco su CI a partir del correo del user
        cur.execute("""
            SELECT ci
            FROM participante
            WHERE correo = %s
        """, (correo,))
        participante = cur.fetchone()

        if not participante:
            raise HTTPException(status_code=404, detail="No se encontró participante asociado a este usuario")

        ci = participante["ci"]

        # Hago la consulta de reservas activas en el día del usuario
        cur.execute("""
            SELECT 
                r.id_reserva,
                r.fecha, 
                r.nombre_sala,
                r.edificio,
                t.hora_inicio, 
                t.hora_fin
            FROM turno t
            JOIN reserva r ON t.id_turno = r.id_turno
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.fecha = CURRENT_DATE
                AND rp.ci_participante = %s
                AND r.estado != 'cancelada';
        """, (ci,))

        resp = cur.fetchall()

        return {"reservas_del_usuario_en_el_dia": resp}

    except HTTPException:
        raise
    
    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

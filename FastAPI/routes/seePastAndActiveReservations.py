from fastapi import APIRouter, Depends
from db.connector import getConnection
from core.security import currentUser

router = APIRouter()

@router.get("/seePastAndActiveReservations")
def seePastAndActiveReservations(user=Depends(currentUser)):
    try:
        roleDb = user["rol"]
        cn = getConnection(roleDb)
        cur = cn.cursor(dictionary=True)

        cur.execute("""
            SELECT
                r.id_reserva,
                r.nombre_sala,
                r.edificio,
                rp.ci_participante,
                r.estado,
                r.fecha,
                t.hora_inicio,
                t.hora_fin
            FROM turno t
            JOIN reserva r ON t.id_turno = r.id_turno
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE r.estado = 'activa'
              AND (
                    r.fecha < CURRENT_DATE
                    OR (r.fecha = CURRENT_DATE AND CURRENT_TIME > t.hora_fin)
                  )
            ORDER BY r.fecha ASC;
        """)

        rows = cur.fetchall()

        reservas = {}
        for row in rows:
            rid = row["id_reserva"]
            if rid not in reservas:
                reservas[rid] = {
                    "id_reserva": row["id_reserva"],
                    "nombre_sala": row["nombre_sala"],
                    "edificio": row["edificio"],
                    "fecha": row["fecha"],
                    "hora_inicio": row["hora_inicio"],
                    "hora_fin": row["hora_fin"],
                    "estado": row["estado"],
                    "ci_participantes": []
                }
            reservas[rid]["ci_participantes"].append(row["ci_participante"])

        return {"reservas_pasadas_activas": list(reservas.values())}

    except Exception as e:
        return {"error": str(e)}

    finally:
        try:
            cn.close()
        except:
            pass

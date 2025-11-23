from fastapi import APIRouter, Depends, HTTPException
from db.connector import getConnection
from pydantic import BaseModel
from core.security import requireRole
from db.notificationSentences import createNotification

router = APIRouter()

@router.patch("/admin/cancelarReserva")
def admin_cancelar_reserva(id_reserva: int, user=Depends(requireRole("Bibliotecario"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Buscar reserva
        cur.execute("""
            SELECT r.id_reserva, r.estado, r.fecha, t.hora_inicio,
                   r.nombre_sala, r.edificio
            FROM reserva r
            JOIN turno t ON t.id_turno = r.id_turno
            WHERE r.id_reserva = %s
        """, (id_reserva,))

        reserva = cur.fetchone()
        if not reserva:
            raise HTTPException(404, "La reserva no existe")

        if reserva["estado"] != "activa":
            raise HTTPException(400, f"La reserva ya está '{reserva['estado']}'")

        # NO verificamos "creador"-> bibliotecario puede cancelar cualquier reserva
        # También evitamos reglas de "ya empezó", porque el admin puede forzar cancelación

        # --- CANCELAR ---
        cur.execute("""
            UPDATE reserva
            SET estado = 'cancelada'
            WHERE id_reserva = %s
        """, (id_reserva,))
        cn.commit()

        # Notificar participantes
        cur.execute("""
            SELECT ci_participante
            FROM reserva_participante
            WHERE id_reserva = %s
              AND estado_invitacion IN ('aceptada','creador')
        """, (id_reserva,))
        invitados = cur.fetchall()

        for p in invitados:
            createNotification(
                p["ci_participante"],
                "reserva_cancelada_admin",
                f"La reserva #{id_reserva} fue cancelada por un bibliotecario.",
                referencia_tipo="reserva",
                referencia_id=id_reserva
            )

        return {"mensaje": f"Reserva {id_reserva} cancelada correctamente por el bibliotecario"}

    finally:
        cur.close()
        cn.close()

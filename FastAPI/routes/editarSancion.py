from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole
from db.notificationSentences import createNotification

router = APIRouter()

class EditarSancion(BaseModel):
    ci: int
    fecha_inicio_original: str
    fecha_fin_original: str
    nueva_fecha_inicio: str | None = None
    nueva_fecha_fin: str | None = None
    nueva_descripcion: str | None = None

@router.put("/editarSancion")
def editar_sancion(payload: EditarSancion, user=Depends(requireRole("Bibliotecario"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # VALIDAR FECHAS
        if payload.nueva_fecha_inicio and payload.nueva_fecha_fin:
            if payload.nueva_fecha_fin < payload.nueva_fecha_inicio:
                raise HTTPException(
                    400, "La fecha de fin no puede ser anterior a la fecha de inicio"
                )

        # BUSCAR SANCIÓN ORIGINAL
        cur.execute("""
            SELECT *
            FROM sancion_participante
            WHERE ci_participante = %s
              AND fecha_inicio = %s
              AND fecha_fin = %s
        """, (
            payload.ci,
            payload.fecha_inicio_original,
            payload.fecha_fin_original
        ))

        sancion = cur.fetchone()
        if not sancion:
            raise HTTPException(404, "La sanción no existe")

        # ARMAR UPDATE DINÁMICO
        cambios = []
        valores_update = []
        mensajes_cambio = []  

        if payload.nueva_fecha_inicio:
            cambios.append("fecha_inicio = %s")
            valores_update.append(payload.nueva_fecha_inicio)
            mensajes_cambio.append(
                f"Fecha de inicio modificada a {payload.nueva_fecha_inicio}"
            )

        if payload.nueva_fecha_fin:
            cambios.append("fecha_fin = %s")
            valores_update.append(payload.nueva_fecha_fin)
            mensajes_cambio.append(
                f"Fecha de fin modificada a {payload.nueva_fecha_fin}"
            )

        if payload.nueva_descripcion:
            cambios.append("descripcion = %s")
            valores_update.append(payload.nueva_descripcion)
            mensajes_cambio.append(
                f"Descripción actualizada: "
            )
            mensajes_cambio.append(f"'{payload.nueva_descripcion}'")

        if not cambios:
            raise HTTPException(400, "No se enviaron cambios")

        # Agregar filtros del WHERE
        valores_update.append(payload.ci)
        valores_update.append(payload.fecha_inicio_original)
        valores_update.append(payload.fecha_fin_original)

        # EJECUTAR UPDATE
        cur.execute(f"""
            UPDATE sancion_participante
            SET {", ".join(cambios)}
            WHERE ci_participante = %s
              AND fecha_inicio = %s
              AND fecha_fin = %s
        """, tuple(valores_update))

        cn.commit()

        #     ENVIAR NOTIFICACIÓN

        mensaje = "Tu sanción ha sido modificada:\n" + "\n".join(f"- {m}" for m in mensajes_cambio)

        createNotification(
            payload.ci,
            "SANCION EDITADA",
            mensaje,
            referencia_tipo="sancion",
            referencia_id=None
        )

        return {"mensaje": "Sanción actualizada y notificación enviada"}

    finally:
        cur.close()
        cn.close()

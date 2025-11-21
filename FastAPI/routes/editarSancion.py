from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole

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
    cur = cn.cursor()

    try:
        # Buscar la sanción original
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

        # VALIDACIÓN DE FECHAS

        # Si envía ambas fechas nuevas
        if payload.nueva_fecha_inicio and payload.nueva_fecha_fin:
            if payload.nueva_fecha_fin < payload.nueva_fecha_inicio:
                raise HTTPException(
                    400,
                    "La fecha de fin no puede ser anterior a la fecha de inicio."
                )

        # Si envía solo nueva fecha de fin
        if payload.nueva_fecha_fin and not payload.nueva_fecha_inicio:
            if payload.nueva_fecha_fin < payload.fecha_inicio_original:
                raise HTTPException(
                    400,
                    "La nueva fecha de fin no puede ser anterior a la fecha de inicio original."
                )

        # Si envía solo nueva fecha de inicio
        if payload.nueva_fecha_inicio and not payload.nueva_fecha_fin:
            if payload.fecha_fin_original < payload.nueva_fecha_inicio:
                raise HTTPException(
                    400,
                    "La nueva fecha de inicio no puede ser posterior a la fecha de fin original."
                )


        campos = []
        valores = []

        if payload.nueva_fecha_inicio:
            campos.append("fecha_inicio = %s")
            valores.append(payload.nueva_fecha_inicio)

        if payload.nueva_fecha_fin:
            campos.append("fecha_fin = %s")
            valores.append(payload.nueva_fecha_fin)

        if payload.nueva_descripcion:
            campos.append("descripcion = %s")
            valores.append(payload.nueva_descripcion)

        if not campos:
            raise HTTPException(400, "No se enviaron campos para modificar")

        valores.append(payload.ci)
        valores.append(payload.fecha_inicio_original)
        valores.append(payload.fecha_fin_original)

        cur.execute(f"""
            UPDATE sancion_participante
            SET {", ".join(campos)}
            WHERE ci_participante = %s
              AND fecha_inicio = %s
              AND fecha_fin = %s
        """, tuple(valores))

        cn.commit()
        return {"mensaje": "Sanción actualizada correctamente"}

    except Exception as e:
        raise HTTPException(500, str(e))

    finally:
        cur.close()
        cn.close()

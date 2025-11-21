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
        # validar fechas lógicamente
        if payload.nueva_fecha_inicio and payload.nueva_fecha_fin:
            if payload.nueva_fecha_fin < payload.nueva_fecha_inicio:
                raise HTTPException(
                    status_code=400,
                    detail="La fecha de fin no puede ser anterior a la fecha de inicio"
                )

        # buscar la sanción original
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

        # armar UPDATE dinámico
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
            raise HTTPException(400, "No se enviaron cambios")

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

    finally:
        cur.close()
        cn.close()

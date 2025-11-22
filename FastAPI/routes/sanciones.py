from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from core.security import requireRole
from db.connector import getConnection
from db.sanctionsSentences import createOtherSanction
from datetime import date
from core.input_validation import asegurar_input
from db.notificationSentences import createNotification

router = APIRouter(prefix="/sancion", tags=["Sanciones"])

class SancionCreate(BaseModel):
    ci: int
    fechaInicio: date
    fechaFin: date
    descripcion: str


@router.post("/crear")
def crear_sancion(payload: SancionCreate, user=Depends(requireRole("Bibliotecario"))):

    roleDb = user["rol"]

    descripcion_limpia = payload.descripcion.strip()

    # Validación de seguridad
    asegurar_input(str(payload.ci), "ci")
    asegurar_input(descripcion_limpia, "descripcion")

    # Validación fechas
    if payload.fechaFin < payload.fechaInicio:
        raise HTTPException(400, detail="La fecha de fin no puede ser anterior a la fecha de inicio.")

    hoy = date.today()
    if payload.fechaInicio < hoy.replace(year=hoy.year - 2):
        raise HTTPException(400, detail="La fecha de inicio es demasiado antigua.")

    if payload.fechaFin > hoy.replace(year=hoy.year + 2):
        raise HTTPException(400, detail="La fecha de fin es demasiado lejana.")

    # Validación longitud
    if len(descripcion_limpia) > 200:
        raise HTTPException(400, detail="La descripción no puede superar los 200 caracteres.")

    # Validar que el CI exista
    cn = getConnection()
    cur = cn.cursor(dictionary=True)

    cur.execute("SELECT 1 FROM participante WHERE ci = %s", (payload.ci,))
    if not cur.fetchone():
        raise HTTPException(400, detail="El CI indicado no existe en el sistema.")

    # Validar superposición de sanciones
    cur.execute("""
        SELECT 1 
        FROM sancion_participante
        WHERE ci_participante = %s
        AND fecha_fin >= %s
        AND fecha_inicio <= %s;
    """, (payload.ci, payload.fechaInicio, payload.fechaFin))

    if cur.fetchone():
        raise HTTPException(400, detail="El participante ya tiene una sanción activa en ese rango de fechas.")

    # INSERT
    filas = createOtherSanction(
        payload.ci,
        payload.fechaInicio.isoformat(),
        payload.fechaFin.isoformat(),
        descripcion_limpia,
        roleDb
    )

    # NOTIFICACIÓN 
    createNotification(
    payload.ci,
    "SANCION",
    f"Has sido sancionado del {payload.fechaInicio} al {payload.fechaFin}. Motivo: {descripcion_limpia}",
    referencia_tipo="sancion",
    referencia_id=None
    
)




    if filas == 0:
        raise HTTPException(400, detail="No se pudo crear la sanción")

    return {"status": "created", "mensaje": "Sanción creada correctamente"}

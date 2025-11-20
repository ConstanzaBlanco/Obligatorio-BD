from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole
from core.invalidInput import isInvalidInput

router = APIRouter()

class ModificarSalaRequest(BaseModel):
    nombre_sala: str
    edificio: str
    capacidad: int | None = None
    tipo_sala: str | None = None
    habilitada: bool | None = None


@router.put("/modificarSala")
def modificar_sala(request: ModificarSalaRequest, user=Depends(requireRole("Administrador"))):

    if isInvalidInput(request.nombre_sala) or isInvalidInput(request.edificio) or isInvalidInput(request.capacidad) or isInvalidInput(request.tipo_sala) or isInvalidInput(request.habilitada):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # 1. Verificar que la sala exista
        cur.execute("""
            SELECT capacidad, tipo_sala, habilitada
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="La sala no existe")

        # Si no envía nuevos valores, usar los actuales
        nueva_capacidad = request.capacidad if request.capacidad is not None else sala["capacidad"]
        nuevo_tipo = request.tipo_sala if request.tipo_sala is not None else sala["tipo_sala"]
        nuevo_estado = request.habilitada if request.habilitada is not None else sala["habilitada"]

        # 2. Si intenta DESHABILITAR la sala → verificar reservas activas
        if (sala["habilitada"] in (1, True)) and (nuevo_estado is False):
            cur.execute("""
                SELECT id_reserva
                FROM reserva
                WHERE nombre_sala = %s
                AND edificio = %s
                AND estado = 'activa'
            """, (request.nombre_sala, request.edificio))

            reservas_activas = cur.fetchall()

            if reservas_activas:
                raise HTTPException(
                    status_code=400,
                    detail="No se puede deshabilitar la sala porque tiene reservas activas"
                )

        # 3. Actualizar la sala
        cur.execute("""
            UPDATE sala
            SET capacidad = %s,
                tipo_sala = %s,
                habilitada = %s
            WHERE nombre_sala = %s AND edificio = %s
        """, (
            nueva_capacidad,
            nuevo_tipo,
            nuevo_estado,
            request.nombre_sala,
            request.edificio
        ))

        cn.commit()

        return {
            "mensaje": "Sala modificada correctamente",
            "capacidad": nueva_capacidad,
            "tipo_sala": nuevo_tipo,
            "habilitada": nuevo_estado
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        cn.close()

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

class ModificarSalaRequest(BaseModel):
    nombre_sala: str
    edificio: str
    nuevo_nombre_sala: str | None = None   # <-- AGREGADO
    capacidad: int | None = None
    tipo_sala: str | None = None
    habilitada: bool | None = None


@router.put("/modificarSala")
def modificar_sala(request: ModificarSalaRequest, user=Depends(requireRole("Administrador"))):

    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Verificar que la sala exista
        cur.execute("""
            SELECT nombre_sala, capacidad, tipo_sala, habilitada
            FROM sala
            WHERE nombre_sala = %s AND edificio = %s
        """, (request.nombre_sala, request.edificio))

        sala = cur.fetchone()
        if not sala:
            raise HTTPException(status_code=404, detail="La sala no existe")

        # Si no envía nuevos valores, mantener los actuales
        nuevo_nombre = request.nuevo_nombre_sala if request.nuevo_nombre_sala else sala["nombre_sala"]
        nueva_capacidad = request.capacidad if request.capacidad is not None else sala["capacidad"]
        nuevo_tipo = request.tipo_sala if request.tipo_sala is not None else sala["tipo_sala"]
        nuevo_estado = request.habilitada if request.habilitada is not None else sala["habilitada"]

        # Si intenta deshabilitar la sala → verificar reservas activas
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

        # Si cambia el nombre de la sala
        if nuevo_nombre != request.nombre_sala:
            # Verificar que el nuevo nombre no exista ya en ese edificio
            cur.execute("""
                SELECT 1 FROM sala
                WHERE nombre_sala = %s AND edificio = %s
            """, (nuevo_nombre, request.edificio))

            if cur.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail="Ya existe otra sala con ese nombre en este edificio"
                )

            # Hacer el UPDATE del nombre (esto cascada a reserva)
            cur.execute("""
                UPDATE sala
                SET nombre_sala = %s
                WHERE nombre_sala = %s AND edificio = %s
            """, (nuevo_nombre, request.nombre_sala, request.edificio))

            cn.commit()

        # Actualizar otros valores
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
            nuevo_nombre,          
            request.edificio
        ))

        cn.commit()

        return {
            "mensaje": "Sala modificada correctamente",
            "nombre_sala": nuevo_nombre,
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

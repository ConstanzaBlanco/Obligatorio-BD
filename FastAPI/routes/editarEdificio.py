from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole
from core.invalidInput import isInvalidInput

router = APIRouter()

class EditarEdificioRequest(BaseModel):
    nombre_original: str
    id_facultad: int | None = None
    habilitado: bool | None = None

@router.put("/editarEdificio")
def editar_edificio(data: EditarEdificioRequest, user=Depends(requireRole("Administrador"))):
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        if isInvalidInput(data.nombre_original) or isInvalidInput(data.id_facultad) or isInvalidInput(data.habilitado):
            raise HTTPException(status_code=401, detail="Error: credenciales inválidas")


        # Obtener edificio
        cur.execute("SELECT * FROM edificio WHERE nombre_edificio = %s", (data.nombre_original,))
        edif = cur.fetchone()

        if not edif:
            raise HTTPException(status_code=404, detail="El edificio no existe.")

        # Validación de facultad (solo si se envía)
        if data.id_facultad is not None:
            cur.execute("SELECT * FROM facultad WHERE id_facultad = %s", (data.id_facultad,))
            fac = cur.fetchone()
            if not fac:
                raise HTTPException(status_code=404, detail="La facultad no existe.")

        # Si intenta DESHABILITAR el edificio verificar que no tenga salas habilitadas
        if data.habilitado is False:
            cur.execute("""
                SELECT COUNT(*) AS activas
                FROM sala
                WHERE edificio = %s AND habilitada = TRUE
            """, (data.nombre_original,))

            row = cur.fetchone()
            if row["activas"] > 0:
                raise HTTPException(
                    status_code=400,
                    detail="No se puede deshabilitar el edificio porque tiene salas habilitadas. "
                           "Deshabilite las salas primero."
                )

        # update
        campos = []
        valores = []

        if data.id_facultad is not None:
            campos.append("id_facultad = %s")
            valores.append(data.id_facultad)

        if data.habilitado is not None:
            campos.append("habilitado = %s")
            valores.append(data.habilitado)

        if not campos:
            raise HTTPException(status_code=400, detail="No se enviaron datos para actualizar.")

        valores.append(data.nombre_original)

        query = f"""
            UPDATE edificio 
            SET {', '.join(campos)}
            WHERE nombre_edificio = %s
        """

        cur.execute(query, tuple(valores))
        cn.commit()

        return {
            "mensaje": "Edificio actualizado correctamente.",
            "cambios": campos
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        try:
            cur.close()
            cn.close()
        except:
            pass

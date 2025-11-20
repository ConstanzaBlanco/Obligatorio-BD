from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole
from core.invalidInput import isInvalidInput

router = APIRouter()


class EdificioCreate(BaseModel):
    nombre_edificio: str
    direccion: str
    departamento: str
    id_facultad: int

@router.post("/crearEdificio")
def crear_edificio(
    data: EdificioCreate,
    user=Depends(requireRole("Administrador"))
):
    
    if isInvalidInput(data.nombre_edificio) or isInvalidInput(data.direccion) or isInvalidInput(data.departamento) or isInvalidInput(data.id_facultad):
        raise HTTPException(status_code=401, detail="Error: credenciales inválidas")
    
    roleDb = user["rol"]
    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Verificar facultad
        cur.execute("SELECT * FROM facultad WHERE id_facultad = %s", (data.id_facultad,))
        fac = cur.fetchone()

        if not fac:
            raise HTTPException(status_code=404, detail="La facultad no existe.")

        # Insertar edificio 
        cur.execute("""
            INSERT INTO edificio (nombre_edificio, id_facultad, direccion, departamento, habilitado)
            VALUES (%s, %s, %s, %s, TRUE)
        """, (data.nombre_edificio, data.id_facultad, data.direccion, data.departamento))

        cn.commit()

        return {"mensaje": "Edificio creado correctamente", "habilitado": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cur.close()
        cn.close()

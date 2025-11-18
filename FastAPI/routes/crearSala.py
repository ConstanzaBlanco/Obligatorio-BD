from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from db.connector import getConnection
from core.security import requireRole

router = APIRouter()

class CrearSalaRequest(BaseModel):
    nombre_sala: str
    capacidad: int
    tipo_sala: str
    edificio: str  

@router.post("/crearSala")
def crear_sala(data: CrearSalaRequest, user=Depends(requireRole("Administrador"))):
    roleDb = user["rol"]

    if data.tipo_sala not in ["libre", "posgrado", "docente"]:
        raise HTTPException(status_code=400, detail="Tipo de sala inválido")

    if data.capacidad <= 0 or data.capacidad > 200:
        raise HTTPException(status_code=400, detail="Capacidad fuera de rango (1-200)")

    cn = getConnection(roleDb)
    cur = cn.cursor(dictionary=True)

    try:
        # Verificar duplicado
        cur.execute("SELECT * FROM sala WHERE nombre_sala = %s", (data.nombre_sala,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Ya existe una sala con ese nombre")

        # Insertar sala (habilitada por defecto)
        cur.execute("""
            INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, habilitada)
            VALUES (%s, %s, %s, %s, TRUE)
        """, (data.nombre_sala, data.edificio, data.capacidad, data.tipo_sala))

        cn.commit()

        return {"mensaje": "Sala creada correctamente"}

    finally:
        cur.close()
        cn.close()

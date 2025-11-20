from fastapi import APIRouter, Depends, HTTPException
from core.security import requireRole, createToken
from db.loginSentences import getOneUser, updateDataUser
from core.security import currentUser
from pydantic import BaseModel

router = APIRouter()

@router.get("/me")
def home(userLogin=Depends(currentUser)):
    user = getOneUser(userLogin['correo'])
    return {
        "ci": user["ci"],
        "name": user["nombre"],
        "lastName": user["apellido"],
        "mail": user["email"],
        "last_access": userLogin["last_access"],
        "rol": userLogin["rol"],
    }

class updateUser(BaseModel):
    email: str
    name: str
    lastName: str

@router.patch("/me/modify")
def modifyUserData(
    payload: updateUser,
    userLogin=Depends(requireRole("Usuario", "Bibliotecario", "Administrador"))
):

    new_email = payload.email.strip().lower()
    name = payload.name.strip()
    lastName = payload.lastName.strip()

    old_email = userLogin["correo"]
    ci = userLogin["ci"]
    roleDb = userLogin["rol"]

    if new_email == "":
        raise HTTPException(status_code=400, detail="email es requerido")

    if name == "":
        raise HTTPException(status_code=400, detail="name es requerido")

    if lastName == "":
        raise HTTPException(status_code=400, detail="lastName es requerido")

    if new_email.count("@") != 1:
        raise HTTPException(status_code=400, detail="email inválido")

    try:
        local, domain = new_email.split("@", 1)
    except ValueError:
        raise HTTPException(status_code=400, detail="email inválido")

    if not (domain.startswith("correo.") or domain.startswith("ucu.")):
        raise HTTPException(
            status_code=400,
            detail="email inválido (debe ser @correo.* o @ucu.*)"
        )

    updateDataUser(new_email, old_email, name, lastName, ci, roleDb)

    if new_email != old_email:
        new_token = createToken(new_email)
    else:
        new_token = None

    return {
        "success": True,
        "message": "Datos actualizados correctamente",
        "nuevo_email": new_email,
        "nuevo_nombre": name,
        "nuevo_apellido": lastName,
        "new_token": new_token
    }
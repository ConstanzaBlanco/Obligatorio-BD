from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import jwt
from db.loginSentences import getUser, getOneUser

# Config básica
SECRET_KEY = "bbfd9ee2a536ed05d4b609ff305b09f54b5af49ac3e567456fa913d9137c9617"
ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Helpers JWT ---
def createToken(correo: str):
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_MIN)
    payload = {"sub": correo, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verifyToken(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Dependencia para endpoints protegidos ---
def currentUser(token: str = Depends(oauth2_scheme)):
    correo = verifyToken(token)

    # Obtener datos de la tabla de login (rol, last_access, etc.)
    user_login = getUser(correo)
    if not user_login:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    # Intentar obtener datos del participante (por ejemplo `ci`) y combinar
    user_part = getOneUser(correo)

    if user_part:
        # Combinar datos, dando preferencia a campos de participante en caso de solapamiento
        combined = {**user_login, **user_part}
        return combined

    return user_login

def requireRole(*roles):
    """
    Ejemplos de uso:

    requireRole("Usuario")
    requireRole("Bibliotecario")
    requireRole("Administrador")
    requireRole("Usuario", "Bibliotecario")
    """
    # Normalizar roles permitidos a minúsculas para comparación insensible a mayúsculas
    allowed_roles = [r.strip().lower() for r in roles]

    def dep(user = Depends(currentUser)):
        roleUser = user.get("rol")

        if not roleUser:
            raise HTTPException(status_code=403, detail="Usuario sin rol asignado")

        role_normalized = roleUser.strip().lower()

        if role_normalized not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"No autorizado: se requiere uno de estos roles: {roles}"
            )

        return user

    return dep
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import jwt
import uuid
from db.loginSentences import getUser, getOneUser, updateTokenJti


# Config básica
SECRET_KEY = "bbfd9ee2a536ed05d4b609ff305b09f54b5af49ac3e567456fa913d9137c9617"
ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Helpers JWT ---
def createToken(correo: str):
    now = datetime.utcnow()
    exp = now + timedelta(minutes=ACCESS_TOKEN_MIN)

    jti = str(uuid.uuid4())

    payload = {
        "sub": correo,   # quién es
        "exp": exp,      # cuándo vence
        "iat": now,      # cuándo se emitió
        "jti": jti       # identificador único del token
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Guardamos el jti como "último token válido" en la BD
    updated = updateTokenJti(correo, jti)
    if updated == 0:
        # Si por algún motivo no se pudo actualizar, mejor no usar el token
        raise HTTPException(status_code=401, detail="No se pudo asociar el token al usuario")

    return token

def verifyToken(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        correo = payload.get("sub")
        jti = payload.get("jti")

        if not correo or not jti:
            raise HTTPException(status_code=401, detail="Token inválido")

        # Traemos al usuario para verificar el jti que está en BD
        user = getUser(correo)
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        db_jti = user["current_jti"]

        print("DEBUG TOKEN → correo:", correo)
        print("DEBUG TOKEN → jti payload:", jti)
        print("DEBUG TOKEN → jti DB:", db_jti)

        # Si no hay jti guardado o no coincide, el token es viejo o revocado
        if not db_jti or db_jti != jti:
            raise HTTPException(status_code=401, detail="Token inválido o revocado")

        return correo

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


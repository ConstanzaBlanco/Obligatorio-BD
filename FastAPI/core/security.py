from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timedelta
import jwt
from dbConnect import get_user


# Config básica
SECRET_KEY = "bbfd9ee2a536ed05d4b609ff305b09f54b5af49ac3e567456fa913d9137c9617"
ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Helpers JWT ---
def create_token(correo: str):
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_MIN)
    payload = {"sub": correo, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Dependencia para endpoints protegidos ---
def current_user(token: str = Depends(oauth2_scheme)):
    correo = verify_token(token)
    user = get_user(correo)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user
from passlib.context import CryptContext

passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hashPassword(passwd: str) -> str:
    return passwordContext.hash(passwd)

def verifyPassword(passwd: str, hashed: str) -> bool:
    return passwordContext.verify(passwd, hashed)
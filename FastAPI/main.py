from fastapi import FastAPI
from routes import proof
from routes import login
from routes import me
from routes import changePassword
from routes import infoSalas
from routes import seeAllSanctions

app = FastAPI()

# --- Endpoints ---


@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(proof.router)
app.include_router(login.router)
app.include_router(me.router)
app.include_router(changePassword.router)
app.include_router(infoSalas.router)
app.include_router(seeAllSanctions.router)
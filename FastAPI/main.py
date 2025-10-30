from fastapi import FastAPI
from routes import proof
from routes import login
from routes import home
from routes import showAll 
from routes import dayReservations
from routes import weekReservations
from routes import me
from routes import changePassword
from routes import infoSalas
from routes import seeAllSanctions
from routes import turnos
from routes import previousReservations
from routes import seeOwnSanctions
from routes import seeOwnActiveReservations

app = FastAPI()

# --- Endpoints ---


@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(proof.router)
app.include_router(login.router)
app.include_router(home.router)
app.include_router(showAll.router)
app.include_router(dayReservations.router)
app.include_router(me.router)
app.include_router(changePassword.router)
app.include_router(infoSalas.router)
app.include_router(seeAllSanctions.router)
app.include_router(weekReservations.router)
app.include_router(turnos.router)
app.include_router(previousReservations.router)
app.include_router(seeOwnSanctions.router)
app.include_router(seeOwnActiveReservations.router)


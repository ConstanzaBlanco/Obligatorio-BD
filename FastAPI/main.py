from fastapi import FastAPI
from routes import login
from routes import home
from routes import me
from routes import changePassword
from routes import turnos
from routes import previousReservations
from routes import seeOwnActiveSanctions
from routes import seeOwnPastSanctions
from routes import seeOwnActiveReservations
from routes import agregarReserva
from routes import cancelarReserva
from routes import seePastAndActiveReservations
from routes import createSalas
from routes import assistReservation
from routes import agregarReserva
from routes import cancelarReserva
from routes import removeSalas
from routes import edificios
from routes import salasDelEdificio
from routes import departamentos
from routes import createUser
from routes import logOut
from routes import sanctionsActive
from routes import sanctionsPast

# --- ADMIN ---

from routes import CreateBiblio
from routes import changeRolOfUser
from routes import deleteUser

# --- NUEVO: FACULTAD ---
from routes import facultad

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware


# --- Habilitar CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---


@app.get("/")
def root():
    return {"status": "ok"}

app.include_router(login.router)
app.include_router(home.router)
app.include_router(me.router)
app.include_router(changePassword.router)
app.include_router(turnos.router)
app.include_router(previousReservations.router)
app.include_router(seeOwnActiveSanctions.router)
app.include_router(seeOwnActiveReservations.router)
app.include_router(agregarReserva.router)
app.include_router(cancelarReserva.router)
app.include_router(seePastAndActiveReservations.router)
app.include_router(seeOwnPastSanctions.router)
app.include_router(createSalas.router)
app.include_router(assistReservation.router)
app.include_router(removeSalas.router)
app.include_router(edificios.router)
app.include_router(salasDelEdificio.router)
app.include_router(departamentos.router)
app.include_router(createUser.router)
app.include_router(sanctionsActive.router)
app.include_router(sanctionsPast.router)
app.include_router(logOut.router)
# --- routers admin ---
app.include_router(CreateBiblio.router)
app.include_router(changeRolOfUser.router)
app.include_router(deleteUser.router)

# --- router facultad ---
app.include_router(facultad.router)

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
from routes import assistReservation
from routes import agregarReserva
from routes import cancelarReserva
from routes import edificios
from routes import salasDelEdificio
from routes import departamentos
from routes import createUser
from routes import logOut
from routes import sanctionsActive
from routes import sanctionsPast
from routes import reservasActivas
from routes import reservasPasadas
from routes import getUsers
from routes import quitarSancion
from routes import academicProgram
from routes import crearEdificio
from routes import eliminarEdificio
from routes import editarEdificio
from routes import crearSala
from routes import modificarSala
# --- ADMIN ---

from routes import CreateBiblio
from routes import changeRolOfUser
from routes import deleteUser

# --- NUEVO: FACULTAD ---
from routes import facultad

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware


# --- Habilitar CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(assistReservation.router)
app.include_router(edificios.router)
app.include_router(salasDelEdificio.router)
app.include_router(departamentos.router)
app.include_router(createUser.router)
app.include_router(sanctionsActive.router)
app.include_router(sanctionsPast.router)
app.include_router(logOut.router)
app.include_router(reservasActivas.router)
app.include_router(reservasPasadas.router)
app.include_router(getUsers.router)
app.include_router(quitarSancion.router)
app.include_router(academicProgram.router)
app.include_router(crearEdificio.router)
app.include_router(eliminarEdificio.router)
app.include_router(editarEdificio.router)
app.include_router(crearSala.router)
app.include_router(modificarSala.router)
# --- routers admin ---
app.include_router(CreateBiblio.router)
app.include_router(changeRolOfUser.router)
app.include_router(deleteUser.router)

# --- router facultad ---
app.include_router(facultad.router)


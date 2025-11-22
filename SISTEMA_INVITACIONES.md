# Sistema de Invitaciones para Reservas

## Descripción General

Se implementó un sistema completo de invitaciones para reservas. Cuando un usuario crea una reserva, puede invitar a otros participantes que recibirán invitaciones pendientes que pueden aceptar o rechazar.

## Cambios en la Base de Datos

La tabla `reserva_participante` ya contaba con la columna `estado_invitacion` necesaria:

```sql
estado_invitacion ENUM('pendiente','aceptada','rechazada','bloqueada','creador') NOT NULL DEFAULT 'aceptada'
```

### Estados posibles:
- **pendiente**: La invitación fue enviada y está esperando respuesta
- **aceptada**: El participante aceptó la invitación
- **rechazada**: El participante rechazó la invitación
- **creador**: El participante que creó la reserva
- **bloqueada**: El participante decidió bloquear recibir invitaciones de esa reserva (no aparecerá en pendientes y no se podrá invitar mientras exista este estado)

---

### Migración para bases ya existentes
Si ya tenés la base de datos creada con la definición anterior, ejecutá este script en MySQL para agregar el nuevo valor al ENUM:

```sql
ALTER TABLE reserva_participante 
MODIFY COLUMN estado_invitacion 
ENUM('pendiente','aceptada','rechazada','bloqueada','creador') NOT NULL DEFAULT 'aceptada';
```

Nota: Hacé un backup antes de ejecutar migraciones en producción.

---

## Cambios en el Backend (FastAPI)

### 1. Actualización de `routes/agregarReserva.py`

Modificado el endpoint `/reservar` para asignar estados correctos:
- Al creador de la reserva: `estado_invitacion = 'creador'`
- A los participantes invitados: `estado_invitacion = 'pendiente'`

**Response actualizado:**
```json
{
  "mensaje": "Reserva creada correctamente",
  "id_reserva": 1,
  "creador": 12345678,
  "participantes_invitados": [87654321, 11111111],
  "estado_invitaciones": "pendiente"
}
```

### 2. Funciones en `db/reservationSentences.py`

Se agregaron tres funciones para manejar invitaciones:

#### `getPendingInvitations(ci: int, roleDb)`
Obtiene todas las invitaciones pendientes de un usuario.

**Retorna:**
```python
[
  {
    "id_reserva": 1,
    "ci_participante": 87654321,
    "estado_invitacion": "pendiente",
    "nombre_sala": "Sala A",
    "edificio": "Central",
    "fecha": "2025-11-20",
    "id_turno": 1,
    "hora_inicio": "08:00:00",
    "hora_fin": "09:00:00",
    "creador_nombre": "Juan",
    "creador_apellido": "Perez",
    "creador": 12345678
  }
]
```

#### `acceptInvitation(ci: int, id_reserva: int, roleDb)`
Cambia el estado de una invitación pendiente a 'aceptada'.

#### `rejectInvitation(ci: int, id_reserva: int, roleDb)`
Cambia el estado de una invitación pendiente a 'rechazada'.

### 3. Nuevo archivo: `routes/invitaciones.py`

Contiene tres endpoints:

#### `GET /invitaciones/pendientes`
Obtiene todas las invitaciones pendientes del usuario autenticado.

**Response:**
```json
{
  "total": 2,
  "invitaciones": [...]
}
```

#### `POST /invitaciones/aceptar`
Acepta una invitación pendiente.

**Request:**
```json
{
  "id_reserva": 1
}
```

**Response:**
```json
{
  "mensaje": "Invitación aceptada correctamente",
  "id_reserva": 1,
  "estado": "aceptada"
}
```

#### `POST /invitaciones/rechazar`
Rechaza una invitación pendiente (requiere confirmación).

**Request:**
```json
{
  "id_reserva": 1
}
```

**Response:**
```json
{
  "mensaje": "Invitación rechazada correctamente",
  "id_reserva": 1,
  "estado": "rechazada"
}
```

### 4. Actualización de `main.py`

Se agregó la importación y registro del router de invitaciones:
```python
from routes import invitaciones

app.include_router(invitaciones.router)
```

---

## Cambios en el Frontend (React)

### 1. Nuevo componente: `src/components/User/MisInvitaciones.jsx`

Componente que muestra:
- Lista de todas las invitaciones pendientes
- Información de la reserva (sala, edificio, fecha, hora)
- Nombre de quién creó la reserva
- Botones para aceptar o rechazar

**Features:**
- Carga automática de invitaciones pendientes
- Confirmación antes de rechazar
- Actualización automática después de aceptar/rechazar
- Mensaje cuando no hay invitaciones

### 2. Actualización de `src/components/Header.jsx`

Agregado link a "Invitaciones" en el menú para usuarios:
```jsx
<Link to="/mis-invitaciones" style={linkStyle}>Invitaciones</Link>
```

### 3. Actualización de `src/App.jsx`

Agregada la ruta para el componente de invitaciones:
```jsx
<Route path="/mis-invitaciones" element={<MisInvitaciones />} />
```

---

## Flujo de Uso

1. **Usuario crea una reserva** con la lista de participantes a invitar
   - Se crea la reserva con estado 'creador' para el creador
   - Se crean registros con estado 'pendiente' para cada participante invitado

2. **Participante invitado ve la invitación**
   - Va a "Invitaciones" en el menú
   - Ve una tarjeta con la información de la reserva y quién la creó

3. **Participante puede aceptar o rechazar**
   - Aceptar: El estado cambia a 'aceptada' (aparecerá en sus reservas)
   - Rechazar: El estado cambia a 'rechazada' (desaparece de invitaciones)

---

## Consideraciones Técnicas

- Solo se pueden enviar invitaciones al crear la reserva (por ahora)
- Una vez aceptada/rechazada, la invitación no aparece más en la lista de pendientes
- El creador de la reserva tiene estado especial 'creador' para identificación
- Se usa validación de seguridad en todos los endpoints (requieren estar autenticado)
- Se respeta el rol del usuario (Usuario, Bibliotecario, Administrador)

---

## Próximas mejoras posibles

1. Permitir enviar invitaciones después de crear la reserva Importante
2. Sistema de notificaciones en tiempo real
3. Comentarios en invitaciones
4. Historial de cambios en invitaciones
5. Re-envío de invitaciones expiradas

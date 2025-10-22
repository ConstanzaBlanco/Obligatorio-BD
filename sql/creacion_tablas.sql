-- Crear base de datos
CREATE DATABASE IF NOT EXISTS gestion_salas;
USE gestion_salas;

-- Tabla de login
CREATE TABLE login (
    correo VARCHAR(100) PRIMARY KEY,
    contraseña VARCHAR(255) NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME,
    last_access DATETIME
);

-- Tabla de facultad
CREATE TABLE facultad (
    id_facultad INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME
);

-- Tabla de programa_académico
CREATE TABLE programa_academico (
    nombre_programa VARCHAR(100) PRIMARY KEY,
    id_facultad INT NOT NULL,
    tipo ENUM('grado','posgrado') NOT NULL,
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
);

-- Tabla de participante
CREATE TABLE participante (
    ci BIGINT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME,
    deleted DATETIME
    FOREIGN KEY (email) REFERENCES login(correo)

);

-- Tabla participante_programa_académico
CREATE TABLE participante_programa_academico (
    id_alumno_programa INT PRIMARY KEY,
    ci_participante BIGINT NOT NULL,
    nombre_programa VARCHAR(100) NOT NULL,
    rol ENUM('alumno','docente') NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME,
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);

-- Tabla de edificio
CREATE TABLE edificio (
    nombre_edificio VARCHAR(100) PRIMARY KEY,
    direccion VARCHAR(200),
    departamento VARCHAR(100),
    created_at DATETIME,
    deleted_at DATETIME,
    FOREIGN KEY (departamento) REFERENCES facultad(id_facultad)
);

-- Tabla de sala
CREATE TABLE sala (
    nombre_sala VARCHAR(100),
    edificio VARCHAR(100),
    capacidad INT NOT NULL,
    tipo_sala ENUM('libre','posgrado','docente') NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME,
    PRIMARY KEY (nombre_sala, edificio),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);

-- Tabla de turno
CREATE TABLE turno (
    id_turno INT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME
);

-- Tabla de reserva
CREATE TABLE reserva (
    id_reserva INT PRIMARY KEY,
    nombre_sala VARCHAR(100) NOT NULL,
    edificio VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    id_turno INT NOT NULL,
    estado ENUM('activa','cancelada','sin asistencia','finalizada') NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME,
    FOREIGN KEY (nombre_sala) REFERENCES sala(nombre_sala),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio),
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno)
);

-- Tabla reserva_participante
CREATE TABLE reserva_participante (
    ci_participante BIGINT NOT NULL,
    id_reserva INT NOT NULL,
    fecha_solicitud_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    asistencia BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    deleted_at DATETIME,
    PRIMARY KEY (ci_participante, id_reserva),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

-- Tabla sancion_participante
CREATE TABLE sancion_participante (
    ci_participante BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    created_at DATETIME,
    deleted_at DATETIME,
    PRIMARY KEY (ci_participante, fecha_inicio, fecha_fin),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci)
);

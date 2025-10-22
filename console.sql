-- Crear base de datos
CREATE DATABASE IF NOT EXISTS gestion_salas;
USE gestion_salas;

-- Tabla de login
CREATE TABLE login (
    correo VARCHAR(100) PRIMARY KEY,
    contraseña VARCHAR(255) NOT NULL
);

-- Tabla de facultad
CREATE TABLE facultad (
    id_facultad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
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
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla participante_programa_académico
CREATE TABLE participante_programa_academico (
    id_alumno_programa INT AUTO_INCREMENT PRIMARY KEY,
    ci_participante BIGINT NOT NULL,
    nombre_programa VARCHAR(100) NOT NULL,
    rol ENUM('alumno','docente') NOT NULL,
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (nombre_programa) REFERENCES programa_academico(nombre_programa)
);

-- Tabla de edificio
CREATE TABLE edificio (
    nombre_edificio VARCHAR(100) PRIMARY KEY,
    direccion VARCHAR(200),
    departamento VARCHAR(100)
);

-- Tabla de sala
CREATE TABLE sala (
    nombre_sala VARCHAR(100),
    edificio VARCHAR(100),
    capacidad INT NOT NULL,
    tipo_sala ENUM('libre','posgrado','docente') NOT NULL,
    PRIMARY KEY (nombre_sala, edificio),
    FOREIGN KEY (edificio) REFERENCES edificio(nombre_edificio)
);

-- Tabla de turno
CREATE TABLE turno (
    id_turno INT AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

-- Tabla de reserva
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sala VARCHAR(100) NOT NULL,
    edificio VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    id_turno INT NOT NULL,
    estado ENUM('activa','cancelada','sin asistencia','finalizada') NOT NULL,
    FOREIGN KEY (nombre_sala, edificio) REFERENCES sala(nombre_sala, edificio),
    FOREIGN KEY (id_turno) REFERENCES turno(id_turno)
);

-- Tabla reserva_participante
CREATE TABLE reserva_participante (
    ci_participante BIGINT NOT NULL,
    id_reserva INT NOT NULL,
    fecha_solicitud_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    asistencia BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ci_participante, id_reserva),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci),
    FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva)
);

-- Tabla sancion_participante
CREATE TABLE sancion_participante (
    ci_participante BIGINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    PRIMARY KEY (ci_participante, fecha_inicio),
    FOREIGN KEY (ci_participante) REFERENCES participante(ci)
);

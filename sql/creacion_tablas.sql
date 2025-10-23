DROP DATABASE IF EXISTS gestion_salas;
CREATE DATABASE gestion_salas;
USE gestion_salas;


-- Tabla de login
CREATE TABLE login (
    correo VARCHAR(100) PRIMARY KEY,
    contrasenia VARCHAR(255) NOT NULL,
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

-- Tabla de programa_academico
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
    deleted DATETIME,
    FOREIGN KEY (email) REFERENCES login(correo)
);

-- Tabla participante_programa_academico
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
    id_facultad INT NOT NULL,
    direccion VARCHAR(200),
    created_at DATETIME,
    deleted_at DATETIME,
    FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad)
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
    FOREIGN KEY (nombre_sala, edificio) REFERENCES sala(nombre_sala, edificio),
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


-- Inserciones de prueba

-- Facultades
INSERT INTO facultad (id_facultad, nombre, created_at) VALUES
(1, 'Ingeniería', NOW()),
(2, 'Ciencias', NOW());

-- Edificios
INSERT INTO edificio (nombre_edificio, id_facultad, direccion, created_at) VALUES
('Central', 1, 'Av. Principal 123', NOW()),
('Sur', 2, 'Calle Secundaria 45', NOW());

-- Salas
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, created_at) VALUES
('Sala A', 'Central', 10, 'libre', NOW()),
('Sala B', 'Sur', 20, 'posgrado', NOW());

-- Turnos
INSERT INTO turno (id_turno, hora_inicio, hora_fin, created_at) VALUES
(1, '08:00:00', '10:00:00', NOW()),
(2, '10:00:00', '12:00:00', NOW());

-- Login
INSERT INTO login (correo, contrasena, created_at) VALUES
('juan.perez@ucu.edu.uy', '123456', NOW()),
('maria.gomez@ucu.edu.uy', 'abcdef', NOW());

-- Participantes
INSERT INTO participante (ci, nombre, apellido, email, created_at) VALUES
(12345678, 'Juan', 'Pérez', 'juan.perez@ucu.edu.uy', NOW()),
(87654321, 'Maria', 'Gomez', 'maria.gomez@ucu.edu.uy', NOW());

-- Programas académicos
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingeniería Informática', 1, 'grado'),
('Física Teórica', 2, 'posgrado');

-- Participante - Programa académico
INSERT INTO participante_programa_academico (id_alumno_programa, ci_participante, nombre_programa, rol, created_at) VALUES
(1, 12345678, 'Ingeniería Informática', 'alumno', NOW()),
(2, 87654321, 'Física Teórica', 'docente', NOW());

-- Reservas
INSERT INTO reserva (id_reserva, nombre_sala, edificio, fecha, id_turno, estado, created_at) VALUES
(1, 'Sala A', 'Central', '2025-10-22', 1, 'activa', NOW()),
(2, 'Sala B', 'Sur', '2025-10-23', 2, 'finalizada', NOW());

-- Reserva - Participante
INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, created_at) VALUES
(12345678, 1, TRUE, NOW()),
(87654321, 2, FALSE, NOW());

-- Sanciones
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin, created_at) VALUES
(12345678, '2025-11-01', '2025-11-07', NOW()),
(87654321, '2025-12-01', '2025-12-05', NOW());

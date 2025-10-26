DROP DATABASE IF EXISTS gestion_salas;
CREATE DATABASE gestion_salas;
USE gestion_salas;


-- Tabla de login
CREATE TABLE login (
    correo VARCHAR(100) PRIMARY KEY,
    contrasenia VARCHAR(255) NOT NULL,
    rol ENUM('Usuario','Bibliotecario','Administrador'),
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
    deleted_at DATETIME,
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
    departamento VARCHAR(100),
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
(1, 'Ingenieria', NOW()),
(2, 'Ciencias', NOW()),
(3, 'Derecho', NOW()),
(4, 'Economia', NOW());

INSERT INTO edificio (nombre_edificio, id_facultad, direccion, departamento, created_at) VALUES
('Central', 1, 'Av. Principal 123', 'Montevideo', NOW()),
('Sur', 2, 'Calle Secundaria 45', 'Canelones', NOW()),
('Norte', 3, 'Av. Legal 456', 'Maldonado', NOW()),
('Este', 4, 'Calle Financiera 89', 'Colonia', NOW());


-- Salas
INSERT INTO sala (nombre_sala, edificio, capacidad, tipo_sala, created_at) VALUES
('Sala A', 'Central', 10, 'libre', NOW()),
('Sala B', 'Sur', 20, 'posgrado', NOW()),
('Sala C', 'Norte', 15, 'docente', NOW()),
('Sala D', 'Este', 25, 'libre', NOW()),
('Sala E', 'Central', 12, 'posgrado', NOW());

-- Turnos
INSERT INTO turno (id_turno, hora_inicio, hora_fin, created_at) VALUES
(1, '08:00:00', '10:00:00', NOW()),
(2, '10:00:00', '12:00:00', NOW()),
(3, '12:00:00', '14:00:00', NOW()),
(4, '14:00:00', '16:00:00', NOW());

-- Login
INSERT INTO login (correo, contrasenia, created_at) VALUES
('juan.perez@ucu.edu.uy', '123456', NOW()),
('maria.gomez@ucu.edu.uy', 'abcdef', NOW()),
('ana.lopez@ucu.edu.uy', 'ana123', NOW()),
('carlos.mendez@ucu.edu.uy', 'cmz123', NOW()),
('sofia.ruiz@ucu.edu.uy', 'sfrz', NOW()),
('jorge.diaz@ucu.edu.uy', 'jd123', NOW());

-- Participantes
INSERT INTO participante (ci, nombre, apellido, email, created_at) VALUES
(12345678, 'Juan', 'Perez', 'juan.perez@ucu.edu.uy', NOW()),
(87654321, 'Maria', 'Gomez', 'maria.gomez@ucu.edu.uy', NOW()),
(11111111, 'Ana', 'Lopez', 'ana.lopez@ucu.edu.uy', NOW()),
(22222222, 'Carlos', 'Mendez', 'carlos.mendez@ucu.edu.uy', NOW()),
(33333333, 'Sofia', 'Ruiz', 'sofia.ruiz@ucu.edu.uy', NOW()),
(44444444, 'Jorge', 'Diaz', 'jorge.diaz@ucu.edu.uy', NOW());

-- Programas academicos
INSERT INTO programa_academico (nombre_programa, id_facultad, tipo) VALUES
('Ingenieria Informatica', 1, 'grado'),
('Fisica Teorica', 2, 'posgrado'),
('Derecho Penal', 3, 'grado'),
('Economia Internacional', 4, 'posgrado');

-- Participante - Programa academico
INSERT INTO participante_programa_academico (id_alumno_programa, ci_participante, nombre_programa, rol, created_at) VALUES
(1, 12345678, 'Ingenieria Informatica', 'alumno', NOW()),
(2, 87654321, 'Fisica Teorica', 'docente', NOW()),
(3, 11111111, 'Ingenieria Informatica', 'docente', NOW()),
(4, 22222222, 'Derecho Penal', 'alumno', NOW()),
(5, 33333333, 'Economia Internacional', 'docente', NOW()),
(6, 44444444, 'Fisica Teorica', 'alumno', NOW());

-- Reservas
INSERT INTO reserva (id_reserva, nombre_sala, edificio, fecha, id_turno, estado, created_at) VALUES
(1, 'Sala A', 'Central', '2025-10-22', 1, 'activa', NOW()),
(2, 'Sala B', 'Sur', '2025-10-23', 2, 'finalizada', NOW()),
(3, 'Sala A', 'Central', '2025-10-24', 1, 'activa', NOW()),
(4, 'Sala A', 'Central', '2025-10-24', 2, 'finalizada', NOW()),
(5, 'Sala B', 'Sur', '2025-10-24', 3, 'cancelada', NOW()),
(6, 'Sala C', 'Norte', '2025-10-24', 1, 'finalizada', NOW()),
(7, 'Sala D', 'Este', '2025-10-24', 4, 'sin asistencia', NOW()),
(8, 'Sala D', 'Este', '2025-10-25', 1, 'activa', NOW()),
(9, 'Sala E', 'Central', '2025-10-25', 2, 'activa', NOW());


-- Reserva - Participante
INSERT INTO reserva_participante (ci_participante, id_reserva, asistencia, created_at) VALUES
(12345678, 1, TRUE, NOW()),
(87654321, 2, FALSE, NOW()),
(11111111, 3, TRUE, NOW()),
(22222222, 3, TRUE, NOW()),
(33333333, 4, TRUE, NOW()),
(44444444, 5, FALSE, NOW()),
(87654321, 6, TRUE, NOW()),
(12345678, 7, FALSE, NOW()),
(33333333, 8, TRUE, NOW()),
(11111111, 9, FALSE, NOW());

-- Sanciones
INSERT INTO sancion_participante (ci_participante, fecha_inicio, fecha_fin, created_at) VALUES
(12345678, '2025-11-01', '2025-11-07', NOW()),
(87654321, '2025-12-01', '2025-12-05', NOW()),
(11111111, '2025-10-20', '2025-10-25', NOW()),
(22222222, '2025-10-10', '2025-10-15', NOW()),
(33333333, '2025-09-01', '2025-09-05', NOW()),
(12345678, '2025-10-01', '2025-11-07', NOW());

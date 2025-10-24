
-- Cantidad de reservas por carrera y facultad
select f.nombre, pa.nombre_programa, count(*) as cantidadReservas
from reserva r join reserva_participante rp on (r.id_reserva = rp.id_reserva)
join participante_programa_academico ppa on (ppa.ci_participante = rp.ci_participante)
join programa_academico pa on (pa.nombre_programa = ppa.nombre_programa)
join facultad f on (f.id_facultad = pa.id_facultad)
group by f.nombre, pa.nombre_programa;


-- Cantidad de reservas y asistencias de profesores y alumnos (grado y posgrado)
select p.nombre, p.apellido, sum(case when asistencia = true then 1 else 0 end) as CantidadAsistencias,
       count(*) as cantidadReservas --  sum(case when asistencia = true then 0 else 1 end) as CantidadInasistencias Si queremos ver el caso complementario
        ,ppa.rol
        , pa.tipo
from reserva r join reserva_participante rp on r.id_reserva = rp.id_reserva
join participante p on rp.ci_participante = p.ci
join participante_programa_academico ppa on p.ci = ppa.ci_participante
join programa_academico pa on ppa.nombre_programa = pa.nombre_programa
group by p.nombre, p.apellido, ppa.rol,pa.tipo;

-- Porcentaje de reservas efectivamente utilizadas vs. canceladas/no asistidas
select (((RC.totalReservas - RC.cantidadFinalizadas)/RC.totalReservas)*100) as NoUtilizadasPorcentaje, (((RC.cantidadFinalizadas)/RC.totalReservas)*100) as UtilizadasPorcentaje
    from(
        select sum(case when estado = 'activa' or estado='finalizada' then cantidad else 0 end) as cantidadFinalizadas, sum(cantidad) as totalReservas
        from (select count(*) cantidad, estado
            from reserva r
            group by estado) as cantidadReservasPorEstado) as RC;
--


-- Promedio de duración de sanción por participante

select p.ci, (case when sp.ci_participante is not null then (avg(DATEDIFF(fecha_fin,fecha_inicio))) else 0 end )as promedio
from sancion_participante sp
right join participante p on sp.ci_participante = p.ci
group by p.ci;

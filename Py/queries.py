'''
Este archivo nomás lo que hace es definir las queries que se pueden hacer y pedir después para poder hacer la api
'''
def get_cantidad_reservar_por_carrera_y_facultad(cursor):
    query = """
        select f.nombre, pa.nombre_programa, count(*) as cantidadReservas
        from reserva r join reserva_participante rp on (r.id_reserva = rp.id_reserva)
        join participante_programa_academico ppa on (ppa.ci_participante = rp.ci_participante)
        join programa_academico pa on (pa.nombre_programa = ppa.nombre_programa)
        join facultad f on (f.id_facultad = pa.id_facultad)
        group by f.nombre, pa.nombre_programa;
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_cantidad_reservas_asistencias_profesor_y_alumnos(cursor):
    query = """
        select p.nombre, p.apellido, sum(case when asistencia = true then 1 else 0 end) as CantidadAsistencias,
       count(*) as cantidadReservas --  sum(case when asistencia = true then 0 else 1 end) as CantidadInasistencias Si queremos ver el caso complementario
        ,ppa.rol
        , pa.tipo
from reserva r join reserva_participante rp on r.id_reserva = rp.id_reserva
join participante p on rp.ci_participante = p.ci
join participante_programa_academico ppa on p.ci = ppa.ci_participante
join programa_academico pa on ppa.nombre_programa = pa.nombre_programa
group by p.nombre, p.apellido, ppa.rol,pa.tipo;
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_porcentaje_reservas_utilizadas_vs_no_utilizadas(cursor):
    query = """
        select (((RC.totalReservas - RC.cantidadFinalizadas)/RC.totalReservas)*100) as NoUtilizadasPorcentaje, (((RC.cantidadFinalizadas)/RC.totalReservas)*100) as UtilizadasPorcentaje
    from(
        select sum(case when estado = 'activa' or estado='finalizada' then cantidad else 0 end) as cantidadFinalizadas, sum(cantidad) as totalReservas
        from (select count(*) cantidad, estado
            from reserva r
            group by estado) as cantidadReservasPorEstado) as RC;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_promedio_duracion_sancion_por_participante(cursor):
    query = """
    select p.ci, (case when sp.ci_participante is not null then (avg(DATEDIFF(fecha_fin,fecha_inicio))) else 0 end )as promedio
    from sancion_participante sp
    right join participante p on sp.ci_participante = p.ci
    group by p.ci;
    """
    cursor.execute(query)
    return cursor.fetchall()


package com.VoleyPlay.backend.services;
import com.VoleyPlay.backend.model.*;
import com.VoleyPlay.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class ReservaService {
    private final ReservaRepository repo;
    private final ClienteRepository clientes;
    private final CanchaRepository canchas;
    private final HorarioRepository horarios;
    private final PagoRepository pagos;
    public ReservaService(ReservaRepository repo, ClienteRepository clientes, CanchaRepository canchas, HorarioRepository horarios, PagoRepository pagos) {
        this.repo=repo; this.clientes=clientes; this.canchas=canchas; this.horarios=horarios; this.pagos=pagos;
    }
    public List<Reserva> listar() { return repo.findAll(); }
    public Reserva buscarPorId(Long id) { return Reglas.existe(repo.findById(id).orElse(null), "Reserva"); }
    public Reserva guardar(Reserva datos) { datos.setId(null); return escribir(null, datos); }
    public Reserva actualizar(Long id, Reserva datos) { return escribir(id, datos); }
    private Reserva escribir(Long id, Reserva datos) {
        // Serializa las escrituras del panel para evitar reservas y cobros simultáneos incompatibles.
        canchas.bloquear();
        Reserva reserva=id==null ? new Reserva() : buscarPorId(id);
        Reglas.exigir(datos.getIdCliente()!=null && datos.getIdCancha()!=null && datos.getIdHorario()!=null && datos.getFechaReserva()!=null,
                "Selecciona cliente, cancha, horario y fecha.");
        Reglas.existe(clientes.findById(datos.getIdCliente()).orElse(null), "Cliente");
        Cancha cancha=Reglas.existe(canchas.findById(datos.getIdCancha()).orElse(null), "Cancha");
        Horario horario=Reglas.existe(horarios.findById(datos.getIdHorario()).orElse(null), "Horario");
        String estado=Reglas.estado(datos.getEstado(), "Pendiente", "Confirmada", "Cancelada");
        boolean cambiaTurno=id==null || !reserva.getIdCancha().equals(datos.getIdCancha())
                || !reserva.getIdHorario().equals(datos.getIdHorario()) || !reserva.getFechaReserva().equals(datos.getFechaReserva());
        boolean reactiva=id!=null && "Cancelada".equalsIgnoreCase(reserva.getEstado()) && !"Cancelada".equals(estado);
        if (!"Cancelada".equals(estado) && (cambiaTurno || reactiva)) {
            Reglas.exigir(!datos.getFechaReserva().isBefore(Reglas.hoy()), "No puedes reservar una fecha pasada.");
            Reglas.exigir(!datos.getFechaReserva().equals(Reglas.hoy()) || horario.getHoraInicio().isAfter(java.time.LocalTime.now(java.time.ZoneId.of("America/Lima"))),
                    "El horario seleccionado ya comenzó.");
            Reglas.conflicto(!"Disponible".equalsIgnoreCase(cancha.getEstado()), "La cancha no está disponible.");
            Reglas.conflicto(!"Disponible".equalsIgnoreCase(horario.getEstado()), "El horario no está disponible.");
        }
        if (!"Cancelada".equals(estado)) {
            var inicio=datos.getFechaReserva().atTime(horario.getHoraInicio());
            var fin=finTurno(datos.getFechaReserva(), horario);
            for (Reserva otra : repo.findByIdCanchaAndFechaReservaBetween(datos.getIdCancha(), datos.getFechaReserva().minusDays(1), datos.getFechaReserva().plusDays(1))) {
                if (otra.getId().equals(id) || "Cancelada".equalsIgnoreCase(otra.getEstado())) continue;
                Horario ocupado=Reglas.existe(horarios.findById(otra.getIdHorario()).orElse(null), "Horario de reserva");
                Reglas.conflicto(inicio.isBefore(finTurno(otra.getFechaReserva(), ocupado)) && otra.getFechaReserva().atTime(ocupado.getHoraInicio()).isBefore(fin),
                        "La cancha ya tiene una reserva que coincide con ese horario.");
            }
        }
        // Mantiene el precio contratado si solo se cambia el estado o el cliente.
        double total=cambiaTurno ? horario.getPrecio() : reserva.getTotal();
        Reglas.dinero(total, "Total");
        BigDecimal cobrado=id==null ? BigDecimal.ZERO : pagos.findByIdReserva(id).stream()
                .filter(p -> "Pagado".equalsIgnoreCase(p.getEstado())).map(p -> BigDecimal.valueOf(p.getMonto()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Reglas.conflicto(cobrado.compareTo(BigDecimal.valueOf(total))>0, "El nuevo total es menor que los pagos ya registrados.");
        Reglas.conflicto("Cancelada".equals(estado) && cobrado.signum()>0, "Cancela primero los pagos registrados antes de cancelar la reserva.");
        reserva.setIdCliente(datos.getIdCliente()); reserva.setIdCancha(datos.getIdCancha()); reserva.setIdHorario(datos.getIdHorario());
        reserva.setFechaReserva(datos.getFechaReserva()); reserva.setEstado(estado); reserva.setTotal(total);
        return repo.save(reserva);
    }
    private java.time.LocalDateTime finTurno(java.time.LocalDate fecha, Horario horario) {
        return (horario.getHoraFin().isBefore(horario.getHoraInicio()) ? fecha.plusDays(1) : fecha).atTime(horario.getHoraFin());
    }
    public void eliminar(Long id) {
        canchas.bloquear(); Reserva reserva=buscarPorId(id);
        Reglas.conflicto(pagos.existsByIdReserva(id), "No puedes eliminar una reserva con pagos vinculados.");
        repo.delete(reserva);
    }
}

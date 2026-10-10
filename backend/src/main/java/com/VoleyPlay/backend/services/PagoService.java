package com.VoleyPlay.backend.services;
import com.VoleyPlay.backend.model.*;
import com.VoleyPlay.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;
@Service
@Transactional
public class PagoService {
    private final PagoRepository repo;
    private final ReservaRepository reservas;
    private final CanchaRepository canchas;
    public PagoService(PagoRepository repo, ReservaRepository reservas, CanchaRepository canchas) {
        this.repo=repo; this.reservas=reservas; this.canchas=canchas;
    }
    public List<Pago> listar() { return repo.findAll(); }
    public Pago buscarPorId(Long id) { return Reglas.existe(repo.findById(id).orElse(null), "Pago"); }
    public Pago guardar(Pago datos) { datos.setId(null); return escribir(null, datos); }
    public Pago actualizar(Long id, Pago datos) { return escribir(id, datos); }
    private Pago escribir(Long id, Pago datos) {
        canchas.bloquear();
        Pago pago=id==null ? new Pago() : buscarPorId(id);
        Reglas.exigir(datos.getIdReserva()!=null, "Selecciona una reserva.");
        Reserva reserva=Reglas.existe(reservas.findById(datos.getIdReserva()).orElse(null), "Reserva");
        BigDecimal monto=Reglas.dinero(datos.getMonto(), "Monto");
        Reglas.exigir(datos.getFechaPago()!=null && !datos.getFechaPago().isAfter(Reglas.hoy()), "La fecha del pago no puede estar en el futuro.");
        String estado=Reglas.estado(datos.getEstado(), "Pagado", "Pendiente", "Cancelado");
        if (!"Cancelado".equals(estado)) Reglas.conflicto("Cancelada".equalsIgnoreCase(reserva.getEstado()), "No puedes registrar pagos en una reserva cancelada.");
        if ("Pagado".equals(estado)) {
            BigDecimal cobrado=repo.findByIdReserva(reserva.getId()).stream()
                    .filter(p -> !p.getId().equals(id) && "Pagado".equalsIgnoreCase(p.getEstado()))
                    .map(p -> BigDecimal.valueOf(p.getMonto())).reduce(BigDecimal.ZERO, BigDecimal::add);
            Reglas.conflicto(cobrado.add(monto).compareTo(BigDecimal.valueOf(reserva.getTotal()))>0,
                    "El pago supera el saldo pendiente de la reserva.");
        }
        pago.setIdReserva(datos.getIdReserva()); pago.setMonto(monto.doubleValue()); pago.setFechaPago(datos.getFechaPago());
        pago.setMetodoPago(Reglas.estado(datos.getMetodoPago(), "Efectivo", "Yape", "Plin", "Tarjeta")); pago.setEstado(estado);
        return repo.save(pago);
    }
    public void eliminar(Long id) { canchas.bloquear(); repo.delete(buscarPorId(id)); }
}

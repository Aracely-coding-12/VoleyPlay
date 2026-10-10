package com.VoleyPlay.backend.repository;
import com.VoleyPlay.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    boolean existsByIdCliente(Long id);
    boolean existsByIdCancha(Long id);
    boolean existsByIdHorario(Long id);
    List<Reserva> findByIdCanchaAndFechaReserva(Long cancha, java.time.LocalDate fecha);
    List<Reserva> findByIdCanchaAndFechaReservaBetween(Long cancha, java.time.LocalDate desde, java.time.LocalDate hasta);
}

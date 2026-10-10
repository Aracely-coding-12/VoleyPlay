package com.VoleyPlay.backend.repository;
import com.VoleyPlay.backend.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PagoRepository extends JpaRepository<Pago, Long> {
    boolean existsByIdReserva(Long id);
    List<Pago> findByIdReserva(Long id);
}

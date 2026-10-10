package com.VoleyPlay.backend.repository;
import com.VoleyPlay.backend.model.Cancha;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.List;
public interface CanchaRepository extends JpaRepository<Cancha, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cancha c order by c.id")
    List<Cancha> bloquear();
    boolean existsByNumeroAndIdNot(int numero, Long id);
}

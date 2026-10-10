package com.VoleyPlay.backend.repository;
import com.VoleyPlay.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    boolean existsByDniAndIdNot(String dni, Long id);
}


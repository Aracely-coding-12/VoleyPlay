package com.VoleyPlay.backend.services;
import com.VoleyPlay.backend.model.Cancha;
import com.VoleyPlay.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CanchaService {
    private final CanchaRepository repo;
    private final ReservaRepository reservas;
    public CanchaService(CanchaRepository repo, ReservaRepository reservas) { this.repo=repo; this.reservas=reservas; }
    public List<Cancha> listar() { return repo.findAll(); }
    public Cancha buscarPorId(Long id) { return Reglas.existe(repo.findById(id).orElse(null), "Cancha"); }
    public Cancha guardar(Cancha datos) { datos.setId(null); return escribir(null, datos); }
    public Cancha actualizar(Long id, Cancha datos) { return escribir(id, datos); }
    private Cancha escribir(Long id, Cancha datos) {
        repo.bloquear();
        Cancha cancha=id==null ? new Cancha() : buscarPorId(id);
        Reglas.exigir(datos.getNumero()>0, "El número de cancha debe ser positivo.");
        Reglas.conflicto(repo.existsByNumeroAndIdNot(datos.getNumero(), id==null ? -1L : id), "Ya existe una cancha con ese número.");
        cancha.setNumero(datos.getNumero());
        cancha.setNombre(Reglas.texto(datos.getNombre(), "Nombre", 100));
        cancha.setTipoSuperficie(Reglas.estado(datos.getTipoSuperficie(), "Arena", "Cemento", "Losa", "Sintético", "Grass Sintético"));
        cancha.setEstado(Reglas.estado(datos.getEstado(), "Disponible", "Ocupada", "Mantenimiento"));
        return repo.save(cancha);
    }
    public void eliminar(Long id) {
        repo.bloquear(); Cancha cancha=buscarPorId(id);
        Reglas.conflicto(reservas.existsByIdCancha(id), "No puedes eliminar una cancha con reservas vinculadas.");
        repo.delete(cancha);
    }
}

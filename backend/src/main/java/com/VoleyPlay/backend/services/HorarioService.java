package com.VoleyPlay.backend.services;
import com.VoleyPlay.backend.model.Horario;
import com.VoleyPlay.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional
public class HorarioService {
    private final HorarioRepository repo;
    private final ReservaRepository reservas;
    private final CanchaRepository canchas;
    public HorarioService(HorarioRepository repo, ReservaRepository reservas, CanchaRepository canchas) {
        this.repo=repo; this.reservas=reservas; this.canchas=canchas;
    }
    public List<Horario> listar() { return repo.findAll(); }
    public Horario buscarPorId(Long id) { return Reglas.existe(repo.findById(id).orElse(null), "Horario"); }
    public Horario guardar(Horario datos) { datos.setId(null); return escribir(null, datos); }
    public Horario actualizar(Long id, Horario datos) { return escribir(id, datos); }
    private Horario escribir(Long id, Horario datos) {
        canchas.bloquear();
        Horario horario=id==null ? new Horario() : buscarPorId(id);
        Reglas.exigir(datos.getHoraInicio()!=null && datos.getHoraFin()!=null && !datos.getHoraInicio().equals(datos.getHoraFin()),
                "Las horas de inicio y fin deben ser distintas.");
        Reglas.dinero(datos.getPrecio(), "Precio");
        boolean cambiaHoras=id==null || !horario.getHoraInicio().equals(datos.getHoraInicio()) || !horario.getHoraFin().equals(datos.getHoraFin());
        Reglas.conflicto(cambiaHoras && repo.findAll().stream().anyMatch(h -> !h.getId().equals(id)
                && h.getHoraInicio().equals(datos.getHoraInicio()) && h.getHoraFin().equals(datos.getHoraFin())), "Ese horario ya existe.");
        if (id!=null && reservas.existsByIdHorario(id)) {
            Reglas.conflicto(!horario.getHoraInicio().equals(datos.getHoraInicio()) || !horario.getHoraFin().equals(datos.getHoraFin()),
                    "No puedes cambiar las horas de un horario con reservas vinculadas.");
        }
        horario.setHoraInicio(datos.getHoraInicio()); horario.setHoraFin(datos.getHoraFin());
        horario.setPrecio(datos.getPrecio()); horario.setEstado(Reglas.estado(datos.getEstado(), "Disponible", "Inactivo", "Ocupado", "En proceso", "Reservado"));
        return repo.save(horario);
    }
    public void eliminar(Long id) {
        canchas.bloquear(); Horario horario=buscarPorId(id);
        Reglas.conflicto(reservas.existsByIdHorario(id), "No puedes eliminar un horario con reservas vinculadas.");
        repo.delete(horario);
    }
}

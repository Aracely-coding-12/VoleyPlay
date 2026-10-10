package com.VoleyPlay.backend.services;
import com.VoleyPlay.backend.model.Cliente;
import com.VoleyPlay.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class ClienteService {
    private final ClienteRepository repo;
    private final ReservaRepository reservas;
    private final CanchaRepository canchas;
    public ClienteService(ClienteRepository repo, ReservaRepository reservas, CanchaRepository canchas) {
        this.repo=repo; this.reservas=reservas; this.canchas=canchas;
    }
    public List<Cliente> listar() { return repo.findAll(); }
    public Cliente buscarPorId(Long id) { return Reglas.existe(repo.findById(id).orElse(null), "Cliente"); }
    public Cliente guardar(Cliente datos) { return escribir(null, datos); }
    public Cliente actualizar(Long id, Cliente datos) { return escribir(id, datos); }
    private Cliente escribir(Long id, Cliente datos) {
        canchas.bloquear();
        Cliente cliente=id==null ? new Cliente() : buscarPorId(id);
        cliente.setNombre(Reglas.texto(datos.getNombre(), "Nombre", 100));
        cliente.setApellido(Reglas.texto(datos.getApellido(), "Apellido", 100));
        String dni=Reglas.opcional(datos.getDni(), 8);
        Reglas.exigir(dni.isEmpty() || dni.matches("[0-9]{8}"), "El DNI debe tener 8 dígitos.");
        Reglas.conflicto(!dni.isEmpty() && repo.existsByDniAndIdNot(dni, id==null ? -1L : id), "Ya existe un cliente con ese DNI.");
        cliente.setDni(dni.isEmpty() ? null : dni);
        String telefono=Reglas.opcional(datos.getTelefono(), 20);
        Reglas.exigir(telefono.isEmpty() || telefono.matches("[+0-9 ()-]{6,20}"), "El teléfono no es válido.");
        cliente.setTelefono(telefono);
        String email=Reglas.opcional(datos.getEmail(), 254);
        Reglas.exigir(email.isEmpty() || email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"), "El correo no es válido.");
        Reglas.conflicto(!email.isEmpty() && repo.existsByEmailIgnoreCaseAndIdNot(email, id==null ? -1L : id), "Ya existe un cliente con ese correo.");
        cliente.setEmail(email.isEmpty() ? null : email);
        return repo.save(cliente);
    }
    public void eliminar(Long id) {
        canchas.bloquear(); Cliente cliente=buscarPorId(id);
        Reglas.conflicto(reservas.existsByIdCliente(id), "No puedes eliminar un cliente con reservas vinculadas.");
        repo.delete(cliente);
    }
}

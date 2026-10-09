import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerCanchas } from "../service/CanchaService.jsx";
import { obtenerClientes } from "../service/ClienteService.jsx";
import { obtenerHorarios } from "../service/HorarioServise.jsx";
import { obtenerReservas } from "../service/ReservaServise.jsx";
import { obtenerPagos } from "../service/PagoServise.jsx";

function nombreDe(lista, id) {
  const encontrado = lista.find((item) => item.id === id);
  return encontrado ? encontrado.nombre : `#${id}`;
}

function horaDe(lista, id) {
  const encontrado = lista.find((item) => item.id === id);
  return encontrado ? `${encontrado.horaInicio} - ${encontrado.horaFin}` : `#${id}`;
}

function estadoClase(estado) {
  if (!estado) return "azul";
  const valor = estado.toLowerCase();
  if (valor.includes("confirm")) return "confirmada";
  if (valor.includes("pendiente")) return "pendiente";
  if (valor.includes("cancel")) return "cancelada";
  if (valor.includes("pagad")) return "pagado";
  return "azul";
}

function DashboardPage() {
  const [canchas, setCanchas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const mesActual = new Date().toLocaleDateString("es-PE", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    obtenerCanchas().then(setCanchas).catch(console.error);
    obtenerClientes().then(setClientes).catch(console.error);
    obtenerHorarios().then(setHorarios).catch(console.error);
    obtenerReservas().then(setReservas).catch(console.error);
    obtenerPagos().then(setPagos).catch(console.error);
  }, []);

  const disponibles = canchas.filter((c) =>
    String(c.estado).toLowerCase().includes("dispon")
  ).length;

  const reservasDelMes = reservas.filter((r) =>
    String(r.fechaReserva || "").startsWith(new Date().toISOString().slice(0, 7))
  );

  const ingresos = pagos
    .filter((p) => String(p.estado).toLowerCase().includes("pagad"))
    .reduce((total, p) => total + (Number(p.monto) || 0), 0);

  return (
    <div>
      <div className="pagina-encabezado">
        <div>
          <h1>👋 ¡Bienvenido, Administrador!</h1>
          <p>Aquí puedes gestionar todas las operaciones del sistema.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icono azul">👥</div>
          <div>
            <h4>Clientes registrados</h4>
            <p className="stat-valor">{clientes.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icono naranja">📅</div>
          <div>
            <h4>Reservas del mes</h4>
            <p className="stat-valor">{reservasDelMes.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icono verde">🏐</div>
          <div>
            <h4>Canchas disponibles</h4>
            <p className="stat-valor">{disponibles}/{canchas.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icono ambar">💰</div>
          <div>
            <h4>Ingresos del mes {mesActual && <span>({mesActual})</span>}</h4>
            <p className="stat-valor">S/ {ingresos.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Reservas recientes</h3>
          <Link to="/panel/horarios">Ver todas →</Link>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cancha</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr>
                <td colSpan="5" className="tabla-vacio">
                  No hay reservas registradas.
                </td>
              </tr>
            )}
            {reservas.slice(0, 4).map((reserva) => (
              <tr key={reserva.id}>
                <td>{nombreDe(clientes, reserva.idCliente)}</td>
                <td>{nombreDe(canchas, reserva.idCancha)}</td>
                <td>{reserva.fechaReserva}</td>
                <td>{horaDe(horarios, reserva.idHorario)}</td>
                <td>
                  <span className={`badge ${estadoClase(reserva.estado)}`}>
                    {reserva.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="tabla-caja">
        <div className="tabla-cabecera">
          <h3>Próximas reservas</h3>
          <Link to="/panel/horarios">Ver todas →</Link>
        </div>
        <table className="tabla">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Cliente</th>
              <th>Cancha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 && (
              <tr>
                <td colSpan="4" className="tabla-vacio">
                  No hay reservas próximas.
                </td>
              </tr>
            )}
            {reservas.slice(0, 4).map((reserva) => (
              <tr key={reserva.id}>
                <td>{horaDe(horarios, reserva.idHorario)}</td>
                <td>{nombreDe(clientes, reserva.idCliente)}</td>
                <td>{nombreDe(canchas, reserva.idCancha)}</td>
                <td>
                  <span className={`badge ${estadoClase(reserva.estado)}`}>
                    {reserva.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardPage;

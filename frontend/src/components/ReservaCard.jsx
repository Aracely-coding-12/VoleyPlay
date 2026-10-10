function ReservaCard({ reserva }) {
    return (
        <div className="reserva-card">
          <h3>Reserva #{reserva.id}</h3>
          <p>Cliente: {reserva.idCliente}</p>
          <p>Cancha: {reserva.idCancha}</p>
          <p>Horario: {reserva.idHorario}</p>
          <p>Fecha: {reserva.fechaReserva}</p>
          <p>Estado: {reserva.estado}</p>
          <p>Total: S/ {reserva.total}</p>
        </div>
    );
}

export default ReservaCard;

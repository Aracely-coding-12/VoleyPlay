function PagoCard({ pago }) {
    return (
        <div className="pago-card">
          <h3>Pago #{pago.id}</h3>
          <p>Reserva: {pago.idReserva}</p>
          <p>Fecha: {pago.fechaPago}</p>
          <p>Monto: S/ {pago.monto}</p>
          <p>Método de pago: {pago.metodoPago}</p>
          <p>Estado: {pago.estado}</p>
        </div>
    );
}

export default PagoCard;

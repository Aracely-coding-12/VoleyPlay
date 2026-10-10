function HorarioCard({ horario }) {
    return (
        <div className="horario-card">
          <h3>Horario #{horario.id}</h3>
          <p>Hora inicio: {horario.horaInicio}</p>
          <p>Hora fin: {horario.horaFin}</p>
          <p>Precio: S/ {horario.precio}</p>
          <p>estado: {horario.estado}</p>
        </div>
    );
}

export default HorarioCard;

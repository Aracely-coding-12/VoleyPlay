function CanchaCard({ cancha }) {

    return (
        <div>
          <h3>{cancha.nombre}</h3>
          <p>Número: {cancha.numero}</p>
          <p>Nombre: {cancha.nombre}</p>
          <p>TipoSuperficie: {cancha.tipoSuperficie}</p>
          <p>Estado: {cancha.estado}</p>
        </div>
    );
}

export default CanchaCard;
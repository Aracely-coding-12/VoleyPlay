function LogoutModal({ abierto, onCancelar, onConfirmar }) {
  if (!abierto) return null;

  return (
    <div className="modal-fondo">
      <div className="modal-caja">
        <span className="modal-icono">🚪</span>
        <h3>Cerrar sesión</h3>
        <p>¿Estás seguro de que deseas salir del sistema?</p>
        <div className="modal-botones">
          <button type="button" className="btn-cancelar" onClick={onCancelar}>
            Cancelar
          </button>
          <button type="button" className="btn-confirmar" onClick={onConfirmar}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;

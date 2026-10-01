import React from 'react';

export const PagoCard = ({ pago, onDelete, onEdit }) => {
  return (
    <div className="pago-card">
      <div className="pago-card-header">
        <h3>Pago #{pago.id}</h3>
        <span className={`pago-status ${pago.estado?.toLowerCase()}`}>
          {pago.estado || 'Completado'}
        </span>
      </div>
      <div className="pago-card-body">
        <p><strong>Monto:</strong> S/ {pago.monto}</p>
        <p><strong>Método:</strong> {pago.metodoPago}</p>
        <p><strong>Fecha:</strong> {pago.fecha ? new Date(pago.fecha).toLocaleDateString() : 'N/A'}</p>
      </div>
      <div className="pago-card-actions">
        {onEdit && (
          <button className="btn-edit" onClick={() => onEdit(pago)}>
            Editar
          </button>
        )}
        {onDelete && (
          <button className="btn-delete" onClick={() => onDelete(pago.id)}>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};
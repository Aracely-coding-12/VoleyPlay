import React, { useEffect, useState } from 'react';
import { PagoService } from '../service/PagoService';
import { PagoCard } from '../components/PagoCard';
import '../styles/pago.css';

export const PagoPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({ id: null, monto: '', metodoPago: '', estado: 'Pendiente' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    try {
      setLoading(true);
      const data = await PagoService.obtenerPagos();
      setPagos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await PagoService.actualizarPago(formData.id, formData);
      } else {
        await PagoService.guardarPago(formData);
      }
      resetForm();
      cargarPagos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (pago) => {
    setFormData(pago);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro de eliminar este pago?')) {
      try {
        await PagoService.eliminarPago(id);
        cargarPagos();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ id: null, monto: '', metodoPago: '', estado: 'Pendiente' });
    setIsEditing(false);
  };

  if (loading) return <p className="pago-loading">Cargando pagos...</p>;
  if (error) return <p className="pago-error">Error: {error}</p>;

  return (
    <div className="pago-container">
      <h2>Gestión de Pagos</h2>

      <form className="pago-form" onSubmit={handleSubmit}>
        <h3>{isEditing ? 'Actualizar Pago' : 'Nuevo Pago'}</h3>
        <input
          type="number"
          name="monto"
          placeholder="Monto"
          value={formData.monto}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="metodoPago"
          placeholder="Método de Pago (Yape, Tarjeta, Efectivo)"
          value={formData.metodoPago}
          onChange={handleChange}
          required
        />
        <select name="estado" value={formData.estado} onChange={handleChange}>
          <option value="Pendiente">Pendiente</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        
        <div className="form-buttons">
          <button type="submit" className="btn-save">
            {isEditing ? 'Guardar Cambios' : 'Registrar'}
          </button>
          {isEditing && (
            <button type="button" className="btn-cancel" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="pago-grid">
        {pagos.map((pago) => (
          <PagoCard
            key={pago.id}
            pago={pago}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
export default PagoPage;
// src/service/PagoService.jsx

const API_URL = 'http://localhost:8080/api/pago';

export const PagoService = {
  // Obtener la lista completa de pagos (GET /api/pago)
  obtenerPagos: async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al listar los pagos');
    return await res.json();
  },

  // Obtener un pago específico por ID (GET /api/pago/{id})
  obtenerPagoPorId: async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Error al obtener el pago');
    return await res.json();
  },

  // Crear un nuevo pago (POST /api/pago)
  guardarPago: async (pago) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pago),
    });
    if (!res.ok) throw new Error('Error al registrar el pago');
    return await res.json();
  },

  // Actualizar un pago existente (PUT /api/pago/{id})
  actualizarPago: async (id, pago) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pago),
    });
    if (!res.ok) throw new Error('Error al actualizar el pago');
    return await res.json();
  },

  // Eliminar un pago (DELETE /api/pago/{id})
  eliminarPago: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar el pago');
  },
};
import { request, save } from "./api.js";
export const obtenerPagos = () => request("/pago");
export const obtenerPagoPorId = id => request(`/pago/${id}`);
export const guardarPago = data => save("/pago", data);
export const actualizarPago = (id, data) => save("/pago", data, id);
export const eliminarPago = id => request(`/pago/${id}`, { method: "DELETE" });

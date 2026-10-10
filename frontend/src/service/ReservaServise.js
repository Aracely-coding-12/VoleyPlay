import { request, save } from "./api.js";
export const obtenerReservas = () => request("/reserva");
export const obtenerReservaPorId = id => request(`/reserva/${id}`);
export const guardarReserva = data => save("/reserva", data);
export const actualizarReserva = (id, data) => save("/reserva", data, id);
export const eliminarReserva = id => request(`/reserva/${id}`, { method: "DELETE" });

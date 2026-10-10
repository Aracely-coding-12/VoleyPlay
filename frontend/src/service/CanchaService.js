import { request, save } from "./api.js";
export const obtenerCanchas = () => request("/cancha");
export const obtenerCanchaPorId = id => request(`/cancha/${id}`);
export const guardarCancha = data => save("/cancha", data);
export const actualizarCancha = (id, data) => save("/cancha", data, id);
export const eliminarCancha = id => request(`/cancha/${id}`, { method: "DELETE" });

import { request, save } from "./api.js";
export const obtenerHorarios = () => request("/horario");
export const obtenerHorarioPorId = id => request(`/horario/${id}`);
export const guardarHorario = data => save("/horario", data);
export const actualizarHorario = (id, data) => save("/horario", data, id);
export const eliminarHorario = id => request(`/horario/${id}`, { method: "DELETE" });

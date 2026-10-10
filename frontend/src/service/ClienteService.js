import { request, save } from "./api.js";
export const obtenerClientes = () => request("/cliente");
export const obtenerClientePorId = id => request(`/cliente/${id}`);
export const guardarCliente = data => save("/cliente", data);
export const actualizarCliente = (id, data) => save("/cliente", data, id);
export const eliminarCliente = id => request(`/cliente/${id}`, { method: "DELETE" });

const API_URL = import.meta.env.VITE_API_URL;

export function obtenerClientes() {
  return fetch(`${API_URL}/cliente`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener clientes");
      }
      return response.json();
    });
}

export function obtenerClientePorId(id) {
  return fetch(`${API_URL}/cliente/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al obtener cliente");
      }
      return response.json();
    });
}

export function guardarCliente(cliente) {
  return fetch(`${API_URL}/cliente`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Error al guardar cliente");
    }
    return response.json();
  });
}

export function actualizarCliente(id, cliente) {
  return fetch(`${API_URL}/cliente/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Error al actualizar cliente");
    }
    return response.json();
  });
}

export function eliminarCliente(id) {
  return fetch(`${API_URL}/cliente/${id}`, {
    method: "DELETE",
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Error al eliminar cliente");
    }
  });
}

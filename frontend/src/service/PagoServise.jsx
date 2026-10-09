const API_URL = import.meta.env.VITE_API_URL;

export function obtenerPagos() {
    return fetch(`${API_URL}/pago`)
      .then((response) => {
        if (!response.ok) {
            throw new Error("Error al obtener pagos");
        }
        return response.json();
    });
}

export function guardarPago(pago) {
    return fetch(`${API_URL}/pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pago),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al guardar pago");
        }
        return response.json();
    });
}

export function actualizarPago(id, pago) {
    return fetch(`${API_URL}/pago/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pago),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al actualizar pago");
        }
        return response.json();
    });
}

export function eliminarPago(id) {
    return fetch(`${API_URL}/pago/${id}`, {
        method: "DELETE",
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al eliminar pago");
        }
    });
}

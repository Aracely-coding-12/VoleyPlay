const API_URL = import.meta.env.VITE_API_URL;

export function obtenerReservas() {
    return fetch(`${API_URL}/reserva`)
      .then((response) => {
        if (!response.ok) {
            throw new Error("Error al obtener reservas");
        }
        return response.json();
    });
}

export function guardarReserva(reserva) {
    return fetch(`${API_URL}/reserva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al guardar reserva");
        }
        return response.json();
    });
}

export function actualizarReserva(id, reserva) {
    return fetch(`${API_URL}/reserva/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reserva),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al actualizar reserva");
        }
        return response.json();
    });
}

export function eliminarReserva(id) {
    return fetch(`${API_URL}/reserva/${id}`, {
        method: "DELETE",
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al eliminar reserva");
        }
    });
}

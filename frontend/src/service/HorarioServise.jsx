const API_URL = import.meta.env.VITE_API_URL;

export function obtenerHorarios() {
    return fetch(`${API_URL}/horario`)
      .then((response) => {
        if (!response.ok) {
            throw new Error("Error al obtener horarios");
        }
        return response.json();
    });
}

export function guardarHorario(horario) {
    return fetch(`${API_URL}/horario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horario),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al guardar horario");
        }
        return response.json();
    });
}

export function actualizarHorario(id, horario) {
    return fetch(`${API_URL}/horario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(horario),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al actualizar horario");
        }
        return response.json();
    });
}

export function eliminarHorario(id) {
    return fetch(`${API_URL}/horario/${id}`, {
        method: "DELETE",
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al eliminar horario");
        }
    });
}

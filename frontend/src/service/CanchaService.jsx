const API_URL = import.meta.env.VITE_API_URL;

export function obtenerCanchas() {
    return fetch(`${API_URL}/cancha`)
      .then((response) => {
        if(!response.ok){
            throw new Error ("Error al obtener producto");
        }
        return response.json();
    });
}

export function obtenerCanchaPorId(id) {
    return fetch(`${API_URL}/cancha/${id}`)
      .then((response) => {
        if (!response.ok) {
            throw new Error("Error al obtener cancha");
        }
        return response.json();
    });
}

export function guardarCancha(cancha) {
    return fetch(`${API_URL}/cancha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancha),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al guardar cancha");
        }
        return response.json();
    });
}

export function actualizarCancha(id, cancha) {
    return fetch(`${API_URL}/cancha/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancha),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al actualizar cancha");
        }
        return response.json();
    });
}

export function eliminarCancha(id) {
    return fetch(`${API_URL}/cancha/${id}`, {
        method: "DELETE",
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error al eliminar cancha");
        }
    });
}

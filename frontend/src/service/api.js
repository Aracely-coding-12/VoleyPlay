const base = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
let csrf;

export async function request(path, options = {}) {
  const method = options.method || "GET";
  const headers = { ...options.headers };
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!csrf) csrf = await request("/auth/csrf");
    headers[csrf.headerName] = csrf.token;
  }
  let response;
  try {
    response = await fetch(`${base}${path}`, { ...options, method, headers, credentials: "include" });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Comprueba la conexión e inténtalo otra vez.");
  }
  const body = await response.text();
  let data;
  try { data = body ? JSON.parse(body) : undefined; } catch {
    throw new Error("El servidor respondió con un formato inesperado. Revisa la dirección de la API.");
  }
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login" && path !== "/auth/me") {
      window.dispatchEvent(new Event("session-expired"));
    }
    if (response.status === 403) csrf = undefined;
    throw new Error(data?.message || `No se pudo completar la operación (${response.status}).`);
  }
  return data;
}

export function save(path, data, id) {
  return request(id ? `${path}/${id}` : path, {
    method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
}
export async function login(username, password) {
  csrf = undefined;
  await request("/auth/login", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }).toString(),
  });
  csrf = undefined;
}
export async function logout() {
  await request("/auth/logout", { method: "POST" });
  csrf = undefined;
}

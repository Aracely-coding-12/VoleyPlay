export function fechaLima(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = type => parts.find(part => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function horaLima(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "America/Lima", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(date);
}
export const money = value => `S/ ${Number(value || 0).toFixed(2)}`;
export const nombre = (list, id) => {
  const item = list.find(row => Number(row.id) === Number(id));
  return item ? [item.nombre, item.apellido].filter(Boolean).join(" ") : `#${id}`;
};
export const hora = horario => horario ? `${horario.horaInicio.slice(0, 5)} – ${horario.horaFin.slice(0, 5)}${horario.horaFin < horario.horaInicio ? " (+1 día)" : ""}` : "—";
export const activa = reserva => reserva.estado !== "Cancelada";
function intervalo(horario, fecha) {
  const inicio = Date.parse(`${fecha}T${horario.horaInicio}Z`);
  const fin = Date.parse(`${fecha}T${horario.horaFin}Z`) + (horario.horaFin < horario.horaInicio ? 86400000 : 0);
  return [inicio, fin];
}
export function estadoCelda(horario, cancha, fecha, reservas, horarios, excludeId) {
  if (cancha.estado !== "Disponible") return cancha.estado;
  if (horario.estado !== "Disponible") return "Inactivo";
  const [inicio, fin] = intervalo(horario, fecha);
  const occupied = reservas.some(reserva => {
    if (Number(reserva.id) === Number(excludeId) || !activa(reserva) || Number(reserva.idCancha) !== Number(cancha.id)) return false;
    const booked = horarios.find(row => Number(row.id) === Number(reserva.idHorario));
    if (!booked) return false;
    const [bookedInicio, bookedFin] = intervalo(booked, reserva.fechaReserva);
    return inicio < bookedFin && bookedInicio < fin;
  });
  return occupied ? "Reservada" : "Disponible";
}
export function filtrar(rows, query, values = row => Object.values(row)) {
  const normalize = text => String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query || "").trim().split(/\s+/).filter(Boolean);
  return rows.filter(row => words.every(word => normalize(values(row).join(" ")).includes(word)));
}
export function resumen(reservas, pagos, horarios, date = new Date()) {
  const today = fechaLima(date), month = today.slice(0, 7), now = horaLima(date);
  const time = row => horarios.find(h => Number(h.id) === Number(row.idHorario))?.horaInicio || "00:00:00";
  return {
    reservasMes: reservas.filter(r => activa(r) && r.fechaReserva.startsWith(month)).length,
    ingresos: pagos.filter(p => p.estado === "Pagado" && p.fechaPago.startsWith(month)).reduce((sum, p) => sum + Math.round(Number(p.monto) * 100), 0) / 100,
    recientes: [...reservas].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4),
    proximas: reservas.filter(r => activa(r) && (r.fechaReserva > today || (r.fechaReserva === today && time(r) >= now)))
      .sort((a, b) => `${a.fechaReserva} ${time(a)}`.localeCompare(`${b.fechaReserva} ${time(b)}`)).slice(0, 4),
  };
}

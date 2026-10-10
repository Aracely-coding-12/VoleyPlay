export default function Badge({ value }) {
  const clase = { Disponible: "disponible", Confirmada: "confirmada", Pagado: "pagado", Pendiente: "pendiente", Cancelada: "cancelada", Cancelado: "cancelada", Ocupada: "ocupada", Reservada: "reservada", Mantenimiento: "pendiente", Inactivo: "azul", Ocupado: "ocupada" };
  return <span className={`badge ${clase[value] || "azul"}`}>{value}</span>;
}

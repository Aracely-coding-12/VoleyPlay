import { test } from "node:test";
import assert from "node:assert/strict";
import { fechaLima, resumen, estadoCelda, filtrar } from "./domain.js";
const horarios = [{ id: 1, horaInicio: "08:00:00", horaFin: "09:00:00", estado: "Disponible" }, { id: 2, horaInicio: "08:30:00", horaFin: "09:30:00", estado: "Disponible" }];
const cancha = { id: 1, estado: "Disponible" };
test("la fecha usa Lima incluso después de medianoche UTC", () => assert.equal(fechaLima(new Date("2026-10-10T02:00:00Z")), "2026-10-09"));
test("disponibilidad por fecha, cancelación e intervalos que se superponen", () => {
  const reservas = [{ id: 1, idCancha: 1, idHorario: 1, fechaReserva: "2026-10-09", estado: "Confirmada" }];
  assert.equal(estadoCelda(horarios[1], cancha, "2026-10-09", reservas, horarios), "Reservada");
  assert.equal(estadoCelda(horarios[1], cancha, "2026-10-10", reservas, horarios), "Disponible");
  assert.equal(estadoCelda(horarios[1], cancha, "2026-10-09", [{ ...reservas[0], estado: "Cancelada" }], horarios), "Disponible");
  assert.equal(estadoCelda(horarios[1], cancha, "2026-10-09", reservas, horarios, 1), "Disponible");
  assert.equal(estadoCelda(horarios[0], { ...cancha, estado: "Mantenimiento" }, "2026-10-10", [], horarios), "Mantenimiento");
});
test("resumen separa mes, reservas recientes y próximas", () => {
  const reservas = [
    { id: 8, idHorario: 1, fechaReserva: "2026-10-08", estado: "Confirmada" },
    { id: 1, idHorario: 1, fechaReserva: "2026-10-10", estado: "Confirmada" },
    { id: 3, idHorario: 1, fechaReserva: "2026-10-11", estado: "Cancelada" },
    { id: 2, idHorario: 1, fechaReserva: "2026-09-09", estado: "Confirmada" },
  ];
  const pagos = [{fechaPago:"2026-10-01",estado:"Pagado",monto:10.10},{fechaPago:"2026-10-02",estado:"Pagado",monto:20.20},{fechaPago:"2026-09-01",estado:"Pagado",monto:100},{fechaPago:"2026-10-01",estado:"Pendiente",monto:200}];
  const actual=resumen(reservas,pagos,horarios,new Date("2026-10-10T02:00:00Z"));
  assert.equal(actual.ingresos,30.30); assert.equal(actual.reservasMes,2);
  assert.deepEqual(actual.proximas.map(r=>r.id),[1]); assert.deepEqual(actual.recientes.map(r=>r.id),[8,3,2,1]);
});
test("búsqueda combina palabras e ignora tildes", () => assert.deepEqual(filtrar([{nombre:"María Pérez",dni:"12345678"}],"maria 1234").map(r=>r.nombre),["María Pérez"]));
test("turnos nocturnos detectan cruces con el día siguiente y respetan el límite", () => {
  const turnos = [
    {id:1,horaInicio:"23:00:00",horaFin:"01:00:00",estado:"Disponible"},
    {id:2,horaInicio:"00:30:00",horaFin:"01:30:00",estado:"Disponible"},
    {id:3,horaInicio:"01:00:00",horaFin:"02:00:00",estado:"Disponible"},
  ];
  const reservas = [{id:1,idCancha:1,idHorario:1,fechaReserva:"2026-10-09",estado:"Confirmada"}];
  assert.equal(estadoCelda(turnos[1],cancha,"2026-10-10",reservas,turnos),"Reservada");
  assert.equal(estadoCelda(turnos[1],cancha,"2026-10-09",reservas,turnos),"Disponible");
  assert.equal(estadoCelda(turnos[2],cancha,"2026-10-10",reservas,turnos),"Disponible");
  assert.equal(estadoCelda(turnos[0],cancha,"2026-10-09",[{...reservas[0],idHorario:2,fechaReserva:"2026-10-10"}],turnos),"Reservada");
});

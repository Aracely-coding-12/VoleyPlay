import EntityPage from "../components/EntityPage.jsx";
import Badge from "../components/Badge.jsx";
import { usePanel } from "../context/contexts.js";
import { fechaLima, nombre, money } from "../utils/domain.js";
export default function PagoPage() {
  const { pagos, reservas, clientes } = usePanel();
  const clienteDe = id => nombre(clientes, reservas.find(r=>r.id===Number(id))?.idCliente);
  const saldo = (reserva, exclude) => Number(reserva.total) - pagos.filter(p=>p.idReserva===reserva.id && p.id!==exclude && p.estado==="Pagado").reduce((sum,p)=>sum+Number(p.monto),0);
  return <EntityPage title="Pagos" description="Registra y consulta los pagos de las reservas." singular="Pago" path="/pago" rows={pagos}
    initial={()=>({idReserva:"",fechaPago:fechaLima(),monto:"",metodoPago:"Efectivo",estado:"Pagado"})} numeric={["idReserva","monto"]}
    searchValues={row=>[...Object.values(row),clienteDe(row.idReserva)]}
    columns={[{key:"id",label:"ID"},{key:"cliente",label:"Cliente",render:row=>clienteDe(row.idReserva)},{key:"idReserva",label:"Reserva"},
      {key:"monto",label:"Monto",render:row=>money(row.monto)},{key:"fechaPago",label:"Fecha"},{key:"metodoPago",label:"Método"},{key:"estado",label:"Estado",render:row=><Badge value={row.estado}/>} ]}
    onFieldChange={(form, field, id)=>field==="idReserva" ? {...form,monto:Math.max(0,saldo(reservas.find(r=>r.id===Number(form.idReserva)) || {total:0},id)).toFixed(2)} : form}
    fields={[{name:"idReserva",label:"Reserva",required:true,placeholder:"Seleccionar reserva",options:reservas.map(r=>({value:r.id,label:`#${r.id} · ${nombre(clientes,r.idCliente)} · ${r.fechaReserva} · ${r.estado}`}))},
      {name:"monto",label:"Monto",type:"number",min:.01,step:.01,required:true},{name:"fechaPago",label:"Fecha del pago",type:"date",max:fechaLima(),required:true},
      {name:"metodoPago",label:"Método",options:["Efectivo","Yape","Plin","Tarjeta"]},{name:"estado",label:"Estado",options:["Pagado","Pendiente","Cancelado"]}]}
    validate={(form,id)=>{
      const r=reservas.find(row=>row.id===Number(form.idReserva));
      if(!r) return "Selecciona una reserva.";
      if(r.estado==="Cancelada" && form.estado!=="Cancelado") return "No puedes registrar un pago en una reserva cancelada.";
      if(form.estado==="Pagado" && Math.round(Number(form.monto)*100)>Math.round(saldo(r,id)*100)) return "El monto supera el saldo pendiente de la reserva.";
    }} />;
}

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePanel } from "../context/contexts.js";
import EntityPage from "../components/EntityPage.jsx";
import Badge from "../components/Badge.jsx";
import { estadoCelda, fechaLima, horaLima, filtrar, hora, nombre, money } from "../utils/domain.js";
export default function HorariosReservasPage() {
  const { canchas,clientes,horarios,reservas }=usePanel();
  const [fecha,setFecha]=useState(fechaLima);
  const [tab,setTab]=useState("reservas");
  const [params]=useSearchParams();
  const ordered=[...horarios].sort((a,b)=>a.horaInicio.localeCompare(b.horaInicio));
  const visibleCourts=filtrar(canchas,params.get("q"));
  const search=row=>[...Object.values(row),nombre(clientes,row.idCliente),nombre(canchas,row.idCancha),hora(horarios.find(h=>h.id===row.idHorario))];
  return <section>
    <div className="pagina-encabezado"><div><h1>Horarios y reservas</h1><p>Gestiona los turnos y consulta la disponibilidad por fecha.</p></div>
      <div className="campo"><label htmlFor="availability-date">Fecha de disponibilidad</label><input id="availability-date" type="date" value={fecha} required onChange={e=>{if(e.target.value)setFecha(e.target.value);}}/></div>
    </div>
    <div className="tabla-caja"><div className="tabla-cabecera"><h3>Disponibilidad · {fecha}</h3></div><table className="tabla"><thead><tr><th>Horario</th>{visibleCourts.map(c=><th key={c.id}>{c.nombre}</th>)}</tr></thead><tbody>
      {(!ordered.length || !visibleCourts.length) && <tr><td className="tabla-vacio" colSpan={visibleCourts.length+1}>Registra canchas y horarios para consultar disponibilidad.{params.get("q") && " Revisa también la búsqueda."}</td></tr>}
      {visibleCourts.length>0 && ordered.map(h=><tr key={h.id}><td>{hora(h)}</td>{visibleCourts.map(c=><td key={c.id}><Badge value={estadoCelda(h,c,fecha,reservas,horarios)}/></td>)}</tr>)}
    </tbody></table></div>
    <div className="section-tabs" role="tablist" aria-label="Gestión de horarios y reservas">
      <button id="reservas-tab" role="tab" aria-selected={tab==="reservas"} aria-controls="gestion-panel" className={tab==="reservas"?"active":""} onClick={()=>setTab("reservas")}>Reservas</button>
      <button id="horarios-tab" role="tab" aria-selected={tab==="horarios"} aria-controls="gestion-panel" className={tab==="horarios"?"active":""} onClick={()=>setTab("horarios")}>Horarios</button>
    </div>
    <div id="gestion-panel" role="tabpanel" aria-labelledby={`${tab}-tab`}>
    {tab==="horarios" ? <EntityPage embedded key="horarios" title="Horarios" description="Define las horas y el precio de cada turno." singular="Horario" path="/horario" rows={ordered}
      initial={{horaInicio:"",horaFin:"",precio:"",estado:"Disponible"}} numeric={["precio"]}
      columns={[{key:"id",label:"ID"},{key:"hora",label:"Turno",render:hora},{key:"precio",label:"Precio",render:h=>money(h.precio)},{key:"estado",label:"Estado",render:h=><Badge value={h.estado}/>} ]}
      fields={[{name:"horaInicio",label:"Hora de inicio",type:"time",required:true},{name:"horaFin",label:"Hora de fin",type:"time",required:true},
        {name:"precio",label:"Precio del turno",type:"number",min:.01,step:.01,required:true},{name:"estado",label:"Estado",options:["Disponible","Inactivo","Ocupado","En proceso","Reservado"]}]}
      validate={form=>form.horaInicio===form.horaFin ? "Las horas de inicio y fin deben ser distintas." : null} /> :
    <EntityPage embedded key="reservas" title="Reservas" description="Registra, edita o cancela las reservas de tus clientes." singular="Reserva" path="/reserva" rows={[...reservas].sort((a,b)=>b.id-a.id)}
      initial={()=>({idCliente:"",idCancha:"",idHorario:"",fechaReserva:fecha,estado:"Pendiente"})} numeric={["idCliente","idCancha","idHorario"]} searchValues={search}
      columns={[{key:"id",label:"ID"},{key:"cliente",label:"Cliente",render:r=>nombre(clientes,r.idCliente)},{key:"cancha",label:"Cancha",render:r=>nombre(canchas,r.idCancha)},
        {key:"fechaReserva",label:"Fecha"},{key:"hora",label:"Turno",render:r=>hora(horarios.find(h=>h.id===r.idHorario))},{key:"total",label:"Total",render:r=>money(r.total)},{key:"estado",label:"Estado",render:r=><Badge value={r.estado}/>} ]}
      fields={[{name:"idCliente",label:"Cliente",required:true,placeholder:"Seleccionar cliente",options:clientes.map(c=>({value:c.id,label:nombre(clientes,c.id)}))},
        {name:"idCancha",label:"Cancha",required:true,placeholder:"Seleccionar cancha",options:canchas.map(c=>({value:c.id,label:`${c.nombre} · ${c.estado}`}))},
        {name:"fechaReserva",label:"Fecha de reserva",type:"date",required:true},
        {name:"idHorario",label:"Horario",required:true,placeholder:"Seleccionar horario",options:(form,id)=>ordered.map(h=>{
          const c=canchas.find(row=>row.id===Number(form.idCancha)); const state=c ? estadoCelda(h,c,form.fechaReserva,reservas,horarios,id) : h.estado;
          return {value:h.id,label:`${hora(h)} · ${money(h.precio)} · ${state}`};
        })},{name:"estado",label:"Estado",options:["Pendiente","Confirmada","Cancelada"]}]}
      validate={(form,id)=>{
        const old=reservas.find(r=>r.id===id);
        const changed=!old || old.idCancha!==Number(form.idCancha) || old.idHorario!==Number(form.idHorario) || old.fechaReserva!==form.fechaReserva;
        const reactivated=old?.estado==="Cancelada" && form.estado!=="Cancelada";
        if(form.estado==="Cancelada") return;
        if((changed || reactivated) && form.fechaReserva<fechaLima()) return "No puedes reservar una fecha pasada.";
        const c=canchas.find(row=>row.id===Number(form.idCancha)), h=horarios.find(row=>row.id===Number(form.idHorario));
        if(!c || !h) return "Selecciona cancha y horario.";
        if ((changed || reactivated) && form.fechaReserva===fechaLima() && h.horaInicio<=horaLima()) return "El horario seleccionado ya comenzó.";
        const state=estadoCelda(h,c,form.fechaReserva,reservas,horarios,id);
        if(state==="Reservada" || ((changed || reactivated) && state!=="Disponible")) return "La cancha o el turno seleccionado no están disponibles.";
      }} />}
    </div>
  </section>;
}

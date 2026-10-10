import { useSearchParams, Link } from "react-router-dom";
import { usePanel } from "../context/contexts.js";
import { resumen, filtrar, nombre, hora, money } from "../utils/domain.js";
import Badge from "../components/Badge.jsx";
import Icon from "../components/Icon.jsx";
export default function DashboardPage() {
  const { canchas, clientes, horarios, reservas, pagos }=usePanel();
  const [params]=useSearchParams();
  const totals=resumen(reservas,pagos,horarios);
  const search=row=>[...Object.values(row),nombre(clientes,row.idCliente),nombre(canchas,row.idCancha),hora(horarios.find(h=>h.id===row.idHorario))];
  const month=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",month:"long",year:"numeric"}).format(new Date());
  const cards=[
    ["users","azul","Clientes registrados",clientes.length],
    ["calendar","naranja","Reservas del mes",totals.reservasMes],
    ["court","verde","Canchas habilitadas",`${canchas.filter(c=>c.estado==="Disponible").length}/${canchas.length}`],
    ["wallet","ambar",`Ingresos del mes (${month})`,money(totals.ingresos)]
  ];
  return <section><div className="pagina-encabezado"><div><h1>Resumen general</h1><p>Consulta las operaciones y los ingresos del mes.</p></div></div>
    <div className="stats-grid">{cards.map(([icon,color,label,value])=><div className="stat-card" key={icon}><div className={`stat-icono ${color}`}><Icon name={icon} size={22}/></div><div><h4>{label}</h4><p className="stat-valor">{value}</p></div></div>)}</div>
    {[["Reservas recientes",totals.recientes],["Próximas reservas",totals.proximas]].map(([title,rows])=>{
      const visible=filtrar(rows,params.get("q"),search);
      return <div className="tabla-caja" key={title}><div className="tabla-cabecera"><h3>{title}</h3><Link to="/panel/horarios">Ver todas<Icon name="arrow" size={16}/></Link></div>
        <table className="tabla"><thead><tr><th>Cliente</th><th>Cancha</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead><tbody>
          {visible.length===0 && <tr><td colSpan={5} className="tabla-vacio">{params.get("q") ? "No hay coincidencias." : "No hay reservas para mostrar."}</td></tr>}
          {visible.map(r=><tr key={r.id}><td>{nombre(clientes,r.idCliente)}</td><td>{nombre(canchas,r.idCancha)}</td><td>{r.fechaReserva}</td><td>{hora(horarios.find(h=>h.id===r.idHorario))}</td><td><Badge value={r.estado}/></td></tr>)}
        </tbody></table></div>;
    })}
  </section>;
}

import EntityPage from "../components/EntityPage.jsx";
import Badge from "../components/Badge.jsx";
import { usePanel } from "../context/contexts.js";
export default function CanchaPage() {
  const { canchas } = usePanel();
  return <EntityPage title="Canchas" description="Administra las canchas y su estado." singular="Cancha" path="/cancha" rows={canchas}
    initial={{ numero: "", nombre: "", tipoSuperficie: "Arena", estado: "Disponible" }} numeric={["numero"]}
    columns={[{key:"id",label:"ID"},{key:"nombre",label:"Nombre"},{key:"numero",label:"Número"},{key:"tipoSuperficie",label:"Superficie"},{key:"estado",label:"Estado",render:row=><Badge value={row.estado}/>} ]}
    fields={[{name:"nombre",label:"Nombre de la cancha",required:true,maxLength:100},{name:"numero",label:"Número",type:"number",min:1,step:1,required:true},
      {name:"tipoSuperficie",label:"Superficie",options:["Arena","Cemento","Losa","Sintético","Grass Sintético"]},
      {name:"estado",label:"Estado",options:["Disponible","Ocupada","Mantenimiento"]}]} />;
}

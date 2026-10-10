import EntityPage from "../components/EntityPage.jsx";
import { usePanel } from "../context/contexts.js";
export default function ClientePage() {
  const { clientes } = usePanel();
  return <EntityPage title="Clientes" description="Gestiona los datos de tus clientes." singular="Cliente" path="/cliente" rows={clientes}
    initial={{nombre:"",apellido:"",dni:"",telefono:"",email:""}}
    columns={[{key:"id",label:"ID"},{key:"nombre",label:"Nombre"},{key:"apellido",label:"Apellido"},{key:"dni",label:"DNI"},{key:"telefono",label:"Teléfono"},{key:"email",label:"Email"}]}
    fields={[{name:"nombre",label:"Nombre",required:true,maxLength:100},{name:"apellido",label:"Apellido",required:true,maxLength:100},
      {name:"dni",label:"DNI",pattern:"[0-9]{8}",maxLength:8,help:"Opcional · 8 dígitos"},
      {name:"telefono",label:"Teléfono",type:"tel",maxLength:20},{name:"email",label:"Email",type:"email",maxLength:254}]} />;
}

function ClienteCard({ cliente }) {
  return (
    <div className="cliente-card">
      <h3>{cliente.nombre} {cliente.apellido}</h3>
      <p>DNI: {cliente.dni}</p>
      <p>Teléfono: {cliente.telefono}</p>
      <p>Email: {cliente.email}</p>
    </div>
  );
}

export default ClienteCard;

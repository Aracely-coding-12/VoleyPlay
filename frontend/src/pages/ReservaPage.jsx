import ReservaCard from "../components/ReservaCard.jsx";
import { obtenerReservas } from "../service/ReservaServise.js";
import { useEffect, useState } from "react";
import "../styles/Reserva.css";

function ReservaPage() {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    obtenerReservas()
      .then((data) => setReservas(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h2>Reservas</h2>
      <div className="reserva-grid">
        {reservas.map((reserva) => (
          <ReservaCard
              key={reserva.id}
              reserva={reserva} />
        ))}
      </div>
    </div>
  );
}

export default ReservaPage;

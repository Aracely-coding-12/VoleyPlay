import HorarioCard from "../components/HorarioCard.jsx";
import { obtenerHorarios } from "../service/HorarioServise.jsx";
import { useEffect, useState } from "react";
import "../styles/Horario.css";

function HorarioPage() {
  const [horarios, setHorarios] = useState([]);

  useEffect(() => {
    obtenerHorarios()
      .then((data) => setHorarios(data))
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h2>Horarios</h2>
      <div className="horario-grid">
        {horarios.map((horario) => (
          <HorarioCard
              key={horario.id}
              horario={horario} />
        ))}
      </div>
    </div>
  );
}

export default HorarioPage;

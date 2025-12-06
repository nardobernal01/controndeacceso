import React, { useState } from "react";
import RegisterEmployee from "./components/RegisterEmployee";
import EmployeeList from "./components/EmployeeList";
import DashboardMetrics from "./components/DashboardMetrics";
import "./App.css";

function App() {
  // Este "switch" nos ayudará a decirle a los componentes que se actualicen
  const [refreshKey, setRefreshKey] = useState(0);

  // Función que llamaremos cuando se registre un nuevo empleado
  const handleEmployeeRegistered = () => {
    // Cambiar este valor obliga a los componentes a recargarse
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app-container">
      <h1>Sistema de Control de Acceso</h1>

      {/* Le pasamos la "clave" (key) para que se actualice cuando cambie */}
      <DashboardMetrics key={`metrics-${refreshKey}`} />

      {/* Le pasamos la función para que nos avise cuando termine de registrar */}
      <RegisterEmployee onEmployeeRegistered={handleEmployeeRegistered} />

      {/* También actualizamos la lista */}
      <EmployeeList key={`list-${refreshKey}`} />
    </div>
  );
}

export default App;

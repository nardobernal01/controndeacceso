import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/persons");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error al obtener la lista de empleados:", error);
      }
    };
    fetchEmployees();
  }, []);

  // AÑADE ESTA FUNCIÓN PARA MANEJAR LA ELIMINACIÓN
  const handleDelete = async (id) => {
    try {
      await api.delete(`/persons/${id}`);
      // Actualiza la lista en el frontend para remover el empleado eliminado
      // sin necesidad de recargar la página. ¡Esta es la magia de React!
      setEmployees(employees.filter((employee) => employee.id !== id));
    } catch (error) {
      console.error("Error al eliminar el empleado:", error);
    }
  };

  return (
    <div className="employee-list-container">
      <h2>Empleados Registrados</h2>
      {employees.length === 0 ? (
        <p>Aún no hay empleados registrados.</p>
      ) : (
        <div className="employee-grid">
          {employees.map((employee) => (
            <div key={employee.id} className="employee-card">
              {/* MODIFICAMOS LA TARJETA PARA INCLUIR EL BOTÓN */}
              <div className="employee-info">
                <h3>{employee.name}</h3>
                <p>Edad: {employee.age}</p>
                <p>Horario: {employee.entryTime}</p>
              </div>
              <button
                onClick={() => handleDelete(employee.id)}
                className="delete-button"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmployeeList;

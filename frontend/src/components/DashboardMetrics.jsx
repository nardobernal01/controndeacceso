import React, { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalPersons: 0,
    onTimeToday: 0,
    lateToday: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get("/metrics/dashboard");
        setMetrics(response.data);
      } catch (error) {
        console.error("Error al obtener las métricas:", error);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="metrics-container">
      <div className="metric-card">
        <span className="metric-value">{metrics.totalPersons}</span>
        <span className="metric-label">Empleados Totales</span>
      </div>
      <div className="metric-card">
        <span className="metric-value on-time">{metrics.onTimeToday}</span>
        <span className="metric-label">A Tiempo (Hoy)</span>
      </div>
      <div className="metric-card">
        <span className="metric-value late">{metrics.lateToday}</span>
        <span className="metric-label">Tarde (Hoy)</span>
      </div>

      {/* --- BOTÓN NUEVO AÑADIDO AQUÍ --- */}
      <div className="metric-card report-button">
        <a
          href="http://localhost:3001/api/reports/employee-of-the-month"
          download="empleado-del-mes.pdf"
        >
          Generar Reporte del Mes
        </a>
      </div>
    </div>
  );
}

export default DashboardMetrics;

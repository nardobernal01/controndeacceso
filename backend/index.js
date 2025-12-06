const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cron = require("node-cron"); // Importar cron
const { generateWeeklyReport } = require("./src/jobs/report.job.js"); // Importar solo el generador

// Importar rutas
const personRoutes = require("./src/routes/person.routes.js");
const attendanceRoutes = require("./src/routes/attendance.routes.js");
const metricsRoutes = require("./src/routes/metrics.routes.js");

const app = express();
const port = process.env.PORT || 3001;

// Configuración
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/images")); // Servir imágenes

// Rutas
app.use("/api", personRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", metricsRoutes);

app.get("/", (req, res) => {
  res.send("Backend Server is running!");
});

// --- TAREA AUTOMÁTICA (SOLO LOCAL) ---
// Se ejecuta cada minuto para probar
cron.schedule("* * * * *", () => {
  generateWeeklyReport();
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

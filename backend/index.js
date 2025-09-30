const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Asumiendo que tus rutas están en src/routes/person.routes.js
// Asegúrate de que los nombres de las carpetas coincidan con tu proyecto
const personRoutes = require("./src/routes/person.routes.js");
const attendanceRoutes = require("./src/routes/attendance.routes.js");

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", personRoutes); // Esto usará las rutas que definimos para las personas
app.use("/api", attendanceRoutes);

app.get("/", (req, res) => {
  res.send("Backend Server is running!");
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

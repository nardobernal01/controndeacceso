const { Router } = require("express");
const {
  getDashboardMetrics,
  generateEmployeeOfTheMonthPDF,
} = require("../controllers/metrics.controller.js"); // <-- MODIFICA

const router = Router();

router.get("/metrics/dashboard", getDashboardMetrics);
router.get("/reports/employee-of-the-month", generateEmployeeOfTheMonthPDF); // <-- AÑADE

module.exports = router;

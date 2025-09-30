const { Router } = require("express");
const multer = require("multer");
const { checkIn } = require("../controllers/attendance.controller.js");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Definimos la ruta para el check-in
router.post("/attendance/check-in", upload.single("photo"), checkIn);

module.exports = router;

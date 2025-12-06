const { Router } = require("express");
const multer = require("multer");
const {
  createPerson,
  getAllPersons,
  deletePerson,
} = require("../controllers/person.controller.js");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para crear una persona
router.post("/persons", upload.single("photo"), createPerson);

// Ruta para obtener todas las personas
router.get("/persons", getAllPersons);

// Ruta para eliminar una persona por su ID
router.delete("/persons/:id", deletePerson);

module.exports = router;

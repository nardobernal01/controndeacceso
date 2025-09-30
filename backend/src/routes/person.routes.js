const { Router } = require("express");
const multer = require("multer");
const { createPerson } = require("../controllers/person.controller.js");

const router = Router();

// Configuración de Multer para guardar la imagen en memoria temporalmente
const upload = multer({ storage: multer.memoryStorage() });

// La ruta ahora usará el middleware 'upload.single("photo")'
// Esto significa que antes de ejecutar createPerson, Multer buscará un archivo llamado "photo"
router.post("/persons", upload.single("photo"), createPerson);

module.exports = router;

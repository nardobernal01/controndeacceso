const prisma = require("../../prisma/client");
const axios = require("axios");
const FormData = require("form-data");

const checkIn = async (req, res) => {
  const photoFile = req.file;
  if (!photoFile) {
    return res
      .status(400)
      .json({ error: "Photo file is required for check-in." });
  }

  try {
    // 1. Obtener todos los empleados y sus encodings de la base de datos
    const persons = await prisma.person.findMany({
      where: { facialEncoding: { not: null } },
    });

    if (persons.length === 0) {
      return res
        .status(404)
        .json({ error: "No registered persons with facial data found." });
    }

    // Preparamos los encodings para enviarlos al face-service
    const knownEncodings = {};
    persons.forEach((person) => {
      knownEncodings[person.id] = person.facialEncoding;
    });

    // 2. Enviar la foto y los encodings al face-service para el reconocimiento
    const formData = new FormData();
    formData.append("file", photoFile.buffer, {
      filename: photoFile.originalname,
    });
    formData.append("known_encodings", JSON.stringify(knownEncodings));

    const faceServiceUrl = `${process.env.FACE_SERVICE_URL}/recognize`;
    const response = await axios.post(faceServiceUrl, formData, {
      headers: { ...formData.getHeaders() },
    });

    const { match, person_id } = response.data;

    if (!match) {
      return res
        .status(404)
        .json({
          message: "No se pudo reconocer a la persona. Intente de nuevo.",
        });
    }

    // 3. Si hay una coincidencia, procesar la asistencia
    const recognizedPerson = persons.find((p) => p.id === person_id);

    // Lógica de puntualidad (15 minutos de tolerancia)
    const now = new Date();
    const [entryHour, entryMinute] = recognizedPerson.entryTime
      .split(":")
      .map(Number);

    const scheduledEntryTime = new Date();
    scheduledEntryTime.setHours(entryHour, entryMinute, 0, 0);

    const diffInMinutes = (now - scheduledEntryTime) / (1000 * 60);

    let status = "A tiempo";
    if (diffInMinutes > 15) {
      status = "Tarde";
    }

    // 4. Guardar el registro de asistencia en la base de datos
    await prisma.attendance.create({
      data: {
        personId: recognizedPerson.id,
        entryAt: now,
        status: status,
      },
    });

    // 5. Enviar la respuesta
    res.status(200).json({
      message: `¡Bienvenido, ${recognizedPerson.name}!`,
      status: status,
      entryTime: now.toLocaleTimeString(),
    });
  } catch (error) {
    console.error("Check-in error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "An error occurred during the check-in process." });
  }
};

module.exports = {
  checkIn,
};

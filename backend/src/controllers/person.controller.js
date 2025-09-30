const prisma = require("../../prisma/client");
const axios = require("axios");
const FormData = require("form-data");

const createPerson = async (req, res) => {
  try {
    // 1. Obtenemos los datos del cuerpo de la petición y el archivo de la foto
    const { name, age, entryTime } = req.body;
    const photoFile = req.file;

    if (!name || !entryTime || !photoFile) {
      return res
        .status(400)
        .json({ error: "Name, entryTime, and a photo file are required." });
    }

    // 2. Preparamos la imagen para enviarla al Face-Service
    const formData = new FormData();
    formData.append("file", photoFile.buffer, {
      filename: photoFile.originalname,
    });

    // 3. Llamamos a la API del Face-Service para obtener el encoding
    let facialEncoding;
    try {
      // La URL viene de la variable de entorno que definimos en docker-compose.yml
      const faceServiceUrl = `${process.env.FACE_SERVICE_URL}/encode`;

      const response = await axios.post(faceServiceUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      facialEncoding = response.data.encoding;
    } catch (error) {
      console.error(
        "Error from face-service:",
        error.response?.data || error.message
      );
      // Si el face-service no encuentra una cara, devolvemos un error claro
      if (error.response?.status === 400) {
        return res
          .status(400)
          .json({ error: "No face could be detected in the uploaded image." });
      }
      return res
        .status(500)
        .json({ error: "Could not process the face image." });
    }

    // 4. Guardamos la nueva persona en la base de datos CON el encoding
    const newPerson = await prisma.person.create({
      data: {
        name,
        age: parseInt(age, 10), // Convertimos la edad a número
        entryTime,
        facialEncoding, // ¡Guardamos el encoding como JSON!
      },
    });

    res.status(201).json(newPerson);
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Could not create person." });
  }
};

module.exports = {
  createPerson,
};

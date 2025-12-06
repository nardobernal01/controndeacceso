const prisma = require("../../prisma/client");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const createPerson = async (req, res) => {
  try {
    const { name, age, entryTime } = req.body;
    const photoFile = req.file;

    if (!name || !entryTime || !photoFile) {
      return res
        .status(400)
        .json({ error: "Name, entryTime, and photo are required." });
    }

    const photoFileName = `${Date.now()}-${photoFile.originalname}`;

    // --- ¡AQUÍ ESTÁ LA LÍNEA CORREGIDA! ---
    const photoPath = path.join(
      process.cwd(),
      "public",
      "images",
      photoFileName
    );

    fs.writeFileSync(photoPath, photoFile.buffer);

    const photoUrl = `/uploads/${photoFileName}`;

    const formData = new FormData();
    formData.append("file", photoFile.buffer, {
      filename: photoFile.originalname,
    });

    let facialEncoding;
    try {
      const faceServiceUrl = `${process.env.FACE_SERVICE_URL}/encode`;
      const response = await axios.post(faceServiceUrl, formData, {
        headers: { ...formData.getHeaders() },
      });
      facialEncoding = response.data.encoding;
    } catch (error) {
      console.error(
        "Error from face-service:",
        error.response?.data || error.message
      );
      if (error.response?.status === 400) {
        return res
          .status(400)
          .json({ error: "No face detected in the image." });
      }
      return res
        .status(500)
        .json({ error: "Could not process the face image." });
    }

    const newPerson = await prisma.person.create({
      data: {
        name,
        age: parseInt(age, 10),
        entryTime,
        facialEncoding,
        photoUrl: photoUrl,
      },
    });

    res.status(201).json(newPerson);
  } catch (error) {
    console.error("Error creating person:", error);
    res.status(500).json({ error: "Could not create person." });
  }
};

const getAllPersons = async (req, res) => {
  try {
    const allPersons = await prisma.person.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(allPersons);
  } catch (error) {
    console.error("Error fetching persons:", error);
    res.status(500).json({ error: "Could not fetch persons." });
  }
};

const deletePerson = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero, encuentra a la persona para obtener la ruta de la foto y borrarla
    const person = await prisma.person.findUnique({
      where: { id: parseInt(id) },
    });
    if (person && person.photoUrl) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        person.photoUrl.replace("/uploads", "")
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // Borra el archivo de imagen del disco
      }
    }

    // Luego, borra el registro de la persona de la base de datos
    await prisma.person.delete({
      where: {
        id: parseInt(id),
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting person:", error);
    res.status(500).json({ error: "Could not delete person." });
  }
};

module.exports = {
  createPerson,
  getAllPersons,
  deletePerson,
};

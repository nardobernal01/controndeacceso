const prisma = require("../../prisma/client");
const PDFDocument = require("pdfkit");
const path = require("path");

const getDashboardMetrics = async (req, res) => {
  /* ...código existente... */
};

// --- NUEVA FUNCIÓN PARA EL PDF ---
const generateEmployeeOfTheMonthPDF = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Query compleja para encontrar al empleado con más asistencias "A tiempo" del mes
    const topEmployee = await prisma.attendance.groupBy({
      by: ["personId"],
      where: {
        status: "A tiempo",
        entryAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: {
        personId: true,
      },
      orderBy: {
        _count: {
          personId: "desc",
        },
      },
      take: 1,
    });

    if (topEmployee.length === 0) {
      return res
        .status(404)
        .send("No hay datos de asistencia este mes para generar el reporte.");
    }

    const person = await prisma.person.findUnique({
      where: { id: topEmployee[0].personId },
    });

    // Crear el PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=empleado-del-mes.pdf"
    );
    doc.pipe(res);

    // Contenido del PDF
    doc.fontSize(25).text("¡Empleado del Mes!", { align: "center" });
    doc.moveDown();

    if (person.photoUrl) {
      const imagePath = path.join(
        __dirname,
        `../../../public${person.photoUrl.replace("/uploads", "")}`
      );
      doc.image(imagePath, {
        fit: [250, 300],
        align: "center",
        valign: "center",
      });
      doc.moveDown();
    }

    doc.fontSize(20).text(person.name, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(16)
      .text(
        "Por tu excelente puntualidad y compromiso durante este mes. ¡Sigue así!",
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error al generar el reporte.");
  }
};

module.exports = {
  getDashboardMetrics,
  generateEmployeeOfTheMonthPDF, // <-- Exportamos la nueva función
};

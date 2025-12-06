const prisma = require("../../prisma/client");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Solo generamos el reporte, no lo enviamos
const generateWeeklyReport = async () => {
  console.log("--- 📂 Iniciando generación de reporte local (Excel/PDF) ---");
  try {
    // 1. Calcular fechas (últimos 7 días)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    // 2. Buscar registros
    const attendanceRecords = await prisma.attendance.findMany({
      where: { entryAt: { gte: startDate, lte: endDate } },
      include: { person: true },
      orderBy: { entryAt: "asc" },
    });

    if (attendanceRecords.length === 0) {
      console.log("ℹ️ No hay registros nuevos para reportar hoy.");
      return;
    }

    // 3. Preparar carpeta
    const reportsDir = path.join(process.cwd(), "public", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
    const excelPath = path.join(reportsDir, `reporte-${timestamp}.xlsx`);
    const pdfPath = path.join(reportsDir, `reporte-${timestamp}.pdf`);

    // 4. Crear Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Asistencia");
    worksheet.columns = [
      { header: "Nombre", key: "name", width: 30 },
      { header: "Fecha", key: "date", width: 15 },
      { header: "Hora", key: "time", width: 15 },
      { header: "Estado", key: "status", width: 15 },
    ];
    attendanceRecords.forEach((r) => {
      worksheet.addRow({
        name: r.person.name,
        date: r.entryAt.toLocaleDateString(),
        time: r.entryAt.toLocaleTimeString(),
        status: r.status,
      });
    });
    await workbook.xlsx.writeFile(excelPath);

    // 5. Crear PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(20).text("Reporte de Asistencia", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    attendanceRecords.forEach((r) => {
      doc.text(
        `${r.person.name} | ${r.entryAt.toLocaleString()} | ${r.status}`
      );
    });
    doc.end();

    console.log(`✅ Reportes generados correctamente en: public/reports/`);
  } catch (error) {
    console.error("❌ Error generando reportes:", error);
  }
};

module.exports = { generateWeeklyReport };

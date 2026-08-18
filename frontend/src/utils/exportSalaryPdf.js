import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Helper Format Rupiah
const formatRupiah = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

/**
 * Export Laporan Rekap Gaji Karyawan (Bulanan) ke PDF
 */
export const exportRekapGajiPdf = ({
  slipList = [],
  bulanNama = "",
  tahun = "",
  totalGaji = 0,
  namaKantor = "SISTEM HRIS SASYA",
}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // --- HEADER PERUSAHAAN ---
  doc.setFillColor(16, 185, 129); // Emerald / Green Theme
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(namaKantor.toUpperCase(), 14, 11);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`LAPORAN REKAP GAJI KARYAWAN - PERIODE ${bulanNama.toUpperCase()} ${tahun}`, 14, 18);

  doc.setFontSize(8);
  doc.text(`Dicetak: ${todayStr}`, pageWidth - 14, 18, { align: "right" });

  // --- RINGKASAN RINGKAS ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Pengeluaran Gaji:", 14, 32);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const totalDraft = slipList.filter((s) => s.status === "draft").length;
  const totalFinal = slipList.filter((s) => s.status === "final").length;

  doc.text(`• Total Karyawan: ${slipList.length} orang`, 14, 38);
  doc.text(`• Status Slip: ${totalFinal} Final, ${totalDraft} Draft`, 70, 38);
  doc.text(`• Total Pengeluaran Gaji Bersih: ${formatRupiah(totalGaji)}`, 130, 38);

  // --- TABEL SLIP GAJI ---
  const tableData = slipList.map((slip, index) => [
    index + 1,
    slip.karyawan?.nama_lengkap || "-",
    slip.karyawan?.jabatan || "-",
    `${slip.total_hadir || 0}/${slip.total_hari_kerja || 0} Hari`,
    formatRupiah(slip.gaji_pokok),
    `+${formatRupiah(slip.total_pendapatan)}`,
    `-${formatRupiah(slip.total_potongan)}`,
    formatRupiah(slip.gaji_bersih),
    (slip.status || "draft").toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 44,
    head: [
      [
        "No",
        "Nama Karyawan",
        "Jabatan",
        "Kehadiran",
        "Gaji Pokok",
        "Pendapatan",
        "Potongan",
        "Gaji Bersih",
        "Status",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 45 },
      2: { cellWidth: 35 },
      3: { halign: "center", cellWidth: 25 },
      4: { halign: "right", cellWidth: 35 },
      5: { halign: "right", cellWidth: 35 },
      6: { halign: "right", cellWidth: 35 },
      7: { halign: "right", cellWidth: 38, fontStyle: "bold" },
      8: { halign: "center", cellWidth: 20 },
    },
    foot: [
      [
        "",
        "TOTAL",
        "",
        "",
        "",
        "",
        "",
        formatRupiah(totalGaji),
        "",
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 9,
    },
  });

  // Save File
  const filename = `Rekap_Gaji_${namaKantor.replace(/\s+/g, "_")}_${bulanNama}_${tahun}.pdf`;
  doc.save(filename);
};

/**
 * Export Slip Gaji Pribadi Karyawan ke PDF (berdasarkan bulan & tahun yang dipilih)
 */
export const exportSlipGajiKaryawanPdf = ({
  slipData,
  bulanNama = "",
  tahun = "",
  namaKantor = "SISTEM HRIS SASYA",
}) => {
  if (!slipData) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // --- KOP SURAT ---
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(namaKantor.toUpperCase(), 14, 13);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("SLIP GAJI KARYAWAN", 14, 21);

  doc.setFontSize(9);
  doc.text(`Periode: ${bulanNama} ${tahun}`, pageWidth - 14, 21, { align: "right" });

  // --- BIODATA KARYAWAN ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI KARYAWAN", 14, 36);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, pageWidth - 14, 38);

  doc.setFont("helvetica", "normal");
  doc.text(`Nama Lengkap   : ${slipData.karyawan?.nama_lengkap || "-"}`, 14, 45);
  doc.text(`Jabatan               : ${slipData.karyawan?.jabatan || "-"}`, 14, 51);
  doc.text(`Departemen       : ${slipData.karyawan?.department || "-"}`, 14, 57);

  doc.text(`Jumlah Hadir       : ${slipData.total_hadir || 0} / ${slipData.total_hari_kerja || 0} Hari`, 110, 45);
  doc.text(`Jumlah Terlambat : ${slipData.total_terlambat || 0} Kali`, 110, 51);
  doc.text(`Status Slip          : ${(slipData.status || "draft").toUpperCase()}`, 110, 57);

  // --- TABEL RINCIAN ---
  const rincianData = [];

  rincianData.push([
    "Gaji Pokok",
    "Pendapatan",
    formatRupiah(slipData.gaji_pokok),
  ]);

  if (slipData.details && Array.isArray(slipData.details)) {
    slipData.details
      .filter((d) => d.tipe === "bonus")
      .forEach((item) => {
        rincianData.push([
          item.nama_komponen,
          "Pendapatan (Tunjangan/Bonus)",
          `+${formatRupiah(item.nilai)}`,
        ]);
      });

    slipData.details
      .filter((d) => d.tipe === "potongan")
      .forEach((item) => {
        rincianData.push([
          item.nama_komponen,
          "Potongan",
          `-${formatRupiah(item.nilai)}`,
        ]);
      });
  }

  autoTable(doc, {
    startY: 64,
    head: [["Komponen Gaji", "Kategori", "Jumlah (IDR)"]],
    body: rincianData,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 50 },
      2: { halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // --- SUMMARY BOX ---
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, finalY, pageWidth - 28, 22, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 101, 52);
  doc.text(`Total Pendapatan : ${formatRupiah(slipData.total_pendapatan)}`, 18, finalY + 7);
  doc.text(`Total Potongan     : -${formatRupiah(slipData.total_potongan)}`, 18, finalY + 14);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`GAJI BERSIH (TAKE HOME PAY) : ${formatRupiah(slipData.gaji_bersih)}`, pageWidth - 20, finalY + 12, { align: "right" });

  // --- SIGNATURE AREA ---
  const signY = finalY + 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text(`Dicetak Pada: ${todayStr}`, 14, signY);
  doc.text("Penerima,", 14, signY + 6);
  doc.text(`( ${slipData.karyawan?.nama_lengkap || "Karyawan"} )`, 14, signY + 26);

  doc.text(`${namaKantor}`, pageWidth - 14, signY + 6, { align: "right" });
  doc.text("Departemen HRD & Finance", pageWidth - 14, signY + 12, { align: "right" });
  doc.text("( Tanda Tangan / Stempel Resmi )", pageWidth - 14, signY + 26, { align: "right" });

  // Save File
  const namaKaryawanClean = (slipData.karyawan?.nama_lengkap || "Karyawan").replace(/\s+/g, "_");
  const filename = `SlipGaji_${namaKaryawanClean}_${bulanNama}_${tahun}.pdf`;
  doc.save(filename);
};

/**
 * Export Slip Gaji Individu Per Karyawan ke PDF
 */
export const exportSlipGajiIndividuPdf = ({
  selectedSlip,
  bulanNama = "",
  tahun = "",
  namaKantor = "SISTEM HRIS SASYA",
}) => {
  if (!selectedSlip) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // --- KOP SURAT SLIP GAJI ---
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(namaKantor.toUpperCase(), 14, 13);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("SLIP GAJI KARYAWAN", 14, 21);

  doc.setFontSize(9);
  doc.text(`Periode: ${bulanNama} ${tahun}`, pageWidth - 14, 21, { align: "right" });

  // --- BIODATA KARYAWAN ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI KARYAWAN", 14, 36);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 38, pageWidth - 14, 38);

  doc.setFont("helvetica", "normal");
  doc.text(`Nama Lengkap   : ${selectedSlip.karyawan?.nama_lengkap || "-"}`, 14, 45);
  doc.text(`Jabatan               : ${selectedSlip.karyawan?.jabatan || "-"}`, 14, 51);
  doc.text(`Departemen       : ${selectedSlip.karyawan?.department || "-"}`, 14, 57);

  doc.text(`Jumlah Hadir       : ${selectedSlip.total_hadir || 0} / ${selectedSlip.total_hari_kerja || 0} Hari`, 110, 45);
  doc.text(`Jumlah Terlambat : ${selectedSlip.total_terlambat || 0} Kali`, 110, 51);
  doc.text(`Status Slip          : ${(selectedSlip.status || "draft").toUpperCase()}`, 110, 57);

  // --- TABEL RINCIAN PENDAPATAN & POTONGAN ---
  const rincianData = [];

  // Gaji Pokok
  rincianData.push([
    "Gaji Pokok",
    "Pendapatan",
    formatRupiah(selectedSlip.gaji_pokok),
  ]);

  // Bonus / Komponen Tambahan
  if (selectedSlip.details && Array.isArray(selectedSlip.details)) {
    selectedSlip.details
      .filter((d) => d.tipe === "bonus")
      .forEach((item) => {
        rincianData.push([
          item.nama_komponen,
          "Pendapatan (Tunjangan/Bonus)",
          `+${formatRupiah(item.nilai)}`,
        ]);
      });

    selectedSlip.details
      .filter((d) => d.tipe === "potongan")
      .forEach((item) => {
        rincianData.push([
          item.nama_komponen,
          "Potongan",
          `-${formatRupiah(item.nilai)}`,
        ]);
      });
  }

  autoTable(doc, {
    startY: 64,
    head: [["Komponen Gaji", "Kategori", "Jumlah (IDR)"]],
    body: rincianData,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9.5,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 50 },
      2: { halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // --- SUMMARY BOX ---
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, finalY, pageWidth - 28, 22, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 101, 52);
  doc.text(`Total Pendapatan : ${formatRupiah(selectedSlip.total_pendapatan)}`, 18, finalY + 7);
  doc.text(`Total Potongan     : -${formatRupiah(selectedSlip.total_potongan)}`, 18, finalY + 14);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`GAJI BERSIH (TAKE HOME PAY) : ${formatRupiah(selectedSlip.gaji_bersih)}`, pageWidth - 20, finalY + 12, { align: "right" });

  // --- SIGNATURE AREA ---
  const signY = finalY + 35;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text(`Dicetak Pada: ${todayStr}`, 14, signY);
  doc.text("Penerima,", 14, signY + 6);
  doc.text(`( ${selectedSlip.karyawan?.nama_lengkap || "Karyawan"} )`, 14, signY + 26);

  doc.text(`${namaKantor}`, pageWidth - 14, signY + 6, { align: "right" });
  doc.text("Departemen HRD & Finance", pageWidth - 14, signY + 12, { align: "right" });
  doc.text("( Tanda Tangan / Stempel Resmi )", pageWidth - 14, signY + 26, { align: "right" });

  // Save File
  const namaKaryawanClean = (selectedSlip.karyawan?.nama_lengkap || "Karyawan").replace(/\s+/g, "_");
  const filename = `SlipGaji_${namaKaryawanClean}_${bulanNama}_${tahun}.pdf`;
  doc.save(filename);
};

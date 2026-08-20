import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Status label mapper
const statusLabelMap = {
  masuk: "Hadir",
  terlambat: "Terlambat",
  tidak_hadir: "Tidak Hadir",
  izin: "Izin",
  sakit: "Sakit",
  cuti: "Cuti",
  libur: "Libur",
};

/**
 * Export Laporan Rekapitulasi Absensi Semua Karyawan (Bulanan) untuk HRD ke PDF
 */
export const exportRekapAbsensiBulananHrdPdf = ({
  list = [],
  bulanNama = "",
  tahun = "",
  totalHariKerja = 0,
  stats = {},
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

  // --- HEADER PERUSAHAAN (KOP BANNER) ---
  doc.setFillColor(16, 185, 129); // Emerald Theme Konsisten
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(namaKantor.toUpperCase(), 14, 11);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `LAPORAN REKAPITULASI ABSENSI KARYAWAN - PERIODE ${bulanNama.toUpperCase()} ${tahun}`,
    14,
    18
  );

  doc.setFontSize(8.5);
  doc.text(`Dicetak: ${todayStr}`, pageWidth - 14, 18, { align: "right" });

  // --- RINGKASAN REKAP BULANAN ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Presensi Perusahaan:", 14, 32);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  const totalKaryawan = list.length;
  const totalHadir = stats.total_hadir || 0;
  const totalTerlambat = stats.total_terlambat || 0;
  const totalIzin = stats.total_izin || 0;
  const totalSakit = stats.total_sakit || 0;
  const totalCuti = stats.total_cuti || 0;
  const totalAlpa = stats.total_tidak_hadir || 0;
  const rataRata = stats.rata_rata_kehadiran || 0;

  doc.text(`• Total Karyawan: ${totalKaryawan} Orang`, 14, 38);
  doc.text(`• Hari Kerja: ${totalHariKerja} Hari`, 70, 38);
  doc.text(`• Hadir (Tepat Waktu): ${totalHadir}`, 115, 38);
  doc.text(`• Terlambat: ${totalTerlambat}`, 165, 38);
  doc.text(`• Izin: ${totalIzin} | Sakit: ${totalSakit} | Cuti: ${totalCuti}`, 200, 38);
  doc.text(`• Rata-rata Kehadiran: ${rataRata}%`, 255, 38);

  // --- TABEL DATA REKAP ABSENSI ---
  const tableData = list.map((item, index) => [
    index + 1,
    item.nama_lengkap || "-",
    item.jabatan || "-",
    item.department || "-",
    item.hadir || 0,
    item.terlambat || 0,
    item.izin || 0,
    item.sakit || 0,
    item.cuti || 0,
    item.tidak_hadir || 0,
    item.total_kehadiran || 0,
    `${item.persentase_kehadiran || 0}%`,
  ]);

  autoTable(doc, {
    startY: 44,
    head: [
      [
        "No",
        "Nama Karyawan",
        "Jabatan",
        "Departemen",
        "Hadir",
        "Telat",
        "Izin",
        "Sakit",
        "Cuti",
        "Alpa",
        "Total Masuk",
        "% Hadir",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 45, fontStyle: "bold" },
      2: { cellWidth: 35 },
      3: { cellWidth: 30 },
      4: { halign: "center", cellWidth: 16 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "center", cellWidth: 15 },
      7: { halign: "center", cellWidth: 15 },
      8: { halign: "center", cellWidth: 15 },
      9: { halign: "center", cellWidth: 15 },
      10: { halign: "center", cellWidth: 24, fontStyle: "bold" },
      11: { halign: "center", cellWidth: 20, fontStyle: "bold" },
    },
    foot: [
      [
        "",
        "TOTAL KESELURUHAN",
        "",
        "",
        totalHadir,
        totalTerlambat,
        totalIzin,
        totalSakit,
        totalCuti,
        totalAlpa,
        totalHadir + totalTerlambat,
        `${rataRata}%`,
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
  });

  // --- AREA TANDA TANGAN ---
  const finalY = (doc.lastAutoTable.finalY || 160) + 12;
  const pageHeight = doc.internal.pageSize.getHeight();
  const signY = finalY > pageHeight - 40 ? pageHeight - 35 : finalY;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text(`Dicetak Pada: ${todayStr}`, 14, signY);
  doc.text("Dibuat Oleh,", 14, signY + 5);
  doc.text("Staf HRD & Personalia", 14, signY + 10);
  doc.text("( .................................................... )", 14, signY + 24);

  doc.text(`${namaKantor}`, pageWidth - 14, signY + 5, { align: "right" });
  doc.text("HR Manager / Pimpinan", pageWidth - 14, signY + 10, { align: "right" });
  doc.text("( .................................................... )", pageWidth - 14, signY + 24, {
    align: "right",
  });

  // Save File
  const namaKantorClean = namaKantor.replace(/\s+/g, "_");
  const filename = `Rekap_Absensi_${namaKantorClean}_${bulanNama}_${tahun}.pdf`;
  doc.save(filename);
};

/**
 * Export Lembar Rekap Presensi Individu Karyawan (Bulanan) ke PDF
 */
export const exportRekapAbsensiKaryawanPdf = ({
  karyawan = {},
  absensiList = [],
  stats = {},
  bulanNama = "",
  tahun = "",
  namaKantor = "SISTEM HRIS SASYA",
}) => {
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

  // --- KOP BANNER ---
  doc.setFillColor(16, 185, 129); // Emerald Theme Konsisten
  doc.rect(0, 0, pageWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(namaKantor.toUpperCase(), 14, 11);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("LEMBAR REKAPITULASI PRESENSI KARYAWAN", 14, 18);

  doc.setFontSize(8.5);
  doc.text(`Periode: ${bulanNama} ${tahun}`, pageWidth - 14, 18, { align: "right" });

  // --- INFORMASI KARYAWAN ---
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMASI KARYAWAN", 14, 34);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 36, pageWidth - 14, 36);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Nama Lengkap   : ${karyawan.nama_lengkap || "-"}`, 14, 42);
  doc.text(`Jabatan               : ${karyawan.jabatan || "-"}`, 14, 48);
  doc.text(`Departemen       : ${karyawan.department || "-"}`, 14, 54);

  const hadirCount = stats.hadir || 0;
  const terlambatCount = stats.terlambat || 0;
  const cutiCount = stats.cuti || 0;
  const izinCount = stats.izin || 0;
  const sakitCount = stats.sakit || 0;
  const alpaCount = stats.tidakHadir || 0;
  const totalHari = stats.totalHari || absensiList.length;

  doc.text(`Total Kehadiran : ${hadirCount + terlambatCount} / ${totalHari} Hari`, 110, 42);
  doc.text(`Terlambat           : ${terlambatCount} Kali`, 110, 48);
  doc.text(`Izin / Sakit / Cuti: ${izinCount} / ${sakitCount} / ${cutiCount} Hari`, 110, 54);

  // --- SUMMARY STATS BADGES (BOX) ---
  const startBoxY = 60;
  const boxWidth = (pageWidth - 28 - 15) / 6;
  const boxHeight = 14;

  const summaryBoxes = [
    { label: "HADIR", val: hadirCount, color: [240, 253, 244], textColor: [22, 101, 52] },
    { label: "TERLAMBAT", val: terlambatCount, color: [254, 252, 232], textColor: [161, 98, 7] },
    { label: "IZIN", val: izinCount, color: [239, 246, 255], textColor: [29, 78, 216] },
    { label: "SAKIT", val: sakitCount, color: [255, 247, 237], textColor: [194, 65, 12] },
    { label: "CUTI", val: cutiCount, color: [236, 254, 255], textColor: [14, 116, 144] },
    { label: "ALPA", val: alpaCount, color: [254, 242, 242], textColor: [185, 28, 28] },
  ];

  summaryBoxes.forEach((b, i) => {
    const x = 14 + i * (boxWidth + 3);
    doc.setFillColor(b.color[0], b.color[1], b.color[2]);
    doc.roundedRect(x, startBoxY, boxWidth, boxHeight, 1.5, 1.5, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(b.textColor[0], b.textColor[1], b.textColor[2]);
    doc.text(b.label, x + boxWidth / 2, startBoxY + 5, { align: "center" });

    doc.setFontSize(10);
    doc.text(String(b.val), x + boxWidth / 2, startBoxY + 11, { align: "center" });
  });

  // --- TABEL DETAIL PRESENSI HARIAN ---
  const tableData = absensiList.map((item, index) => [
    index + 1,
    item.tanggal || "-",
    item.hari || "-",
    item.jam_masuk || "-",
    item.jam_keluar || "-",
    statusLabelMap[item.status] || item.status || "-",
    item.menit_terlambat > 0 ? `${item.menit_terlambat} Menit` : "-",
    item.keterangan || "-",
  ]);

  autoTable(doc, {
    startY: startBoxY + boxHeight + 6,
    head: [
      [
        "No",
        "Tanggal",
        "Hari",
        "Jam Masuk",
        "Jam Keluar",
        "Status",
        "Keterlambatan",
        "Keterangan",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 24 },
      2: { halign: "center", cellWidth: 20 },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "center", cellWidth: 20 },
      5: { halign: "center", cellWidth: 22, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 26 },
      7: { cellWidth: 40 },
    },
  });

  // --- AREA TANDA TANGAN ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  const signY = finalY > pageHeight - 38 ? pageHeight - 35 : finalY;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  doc.text(`Dicetak Pada: ${todayStr}`, 14, signY);
  doc.text("Karyawan Bersangkutan,", 14, signY + 5);
  doc.text(`( ${karyawan.nama_lengkap || "Karyawan"} )`, 14, signY + 22);

  doc.text(`${namaKantor}`, pageWidth - 14, signY + 5, { align: "right" });
  doc.text("Departemen HRD", pageWidth - 14, signY + 10, { align: "right" });
  doc.text("( Tanda Tangan / Stempel Resmi )", pageWidth - 14, signY + 22, { align: "right" });

  // Save File
  const namaKaryawanClean = (karyawan.nama_lengkap || "Karyawan").replace(/\s+/g, "_");
  const filename = `Rekap_Presensi_${namaKaryawanClean}_${bulanNama}_${tahun}.pdf`;
  doc.save(filename);
};

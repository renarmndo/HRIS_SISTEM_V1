import SlipGajiModel from "../../models/slipGaji.model.js";
import DetailSlipGajiModel from "../../models/detailSlipGaji.model.js";
import KomponenGajiModel from "../../models/komponenGaji.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import KuotaCutiModel from "../../models/kuotaCutiModel.js";
import LemburModel from "../../models/lembur.model.js";
import sequelize from "../../config/sequelize.js";
import { Op } from "sequelize";
import audit from "../../utils/auditLogger.js";
import { parseBulan, parseTahun, isValidUUID } from "../../utils/validators.js";

export default class SlipGajiController {
  // HRD: Generate slip gaji untuk semua karyawan bulan tertentu
  static async generateSlipGaji(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { bulan, tahun } = req.body;

      const bulanNum = parseBulan(bulan);
      const tahunNum = parseTahun(tahun);

      if (bulanNum === null || Number.isNaN(bulanNum)) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Bulan tidak valid (harus berupa angka bulat 1-12)",
        });
      }

      if (tahunNum === null || Number.isNaN(tahunNum)) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Tahun tidak valid (harus berupa angka bulat)",
        });
      }

      // Ambil semua karyawan aktif
      const karyawanList = await KaryawanModel.findAll({
        where: { is_active: true },
        transaction,
      });

      if (karyawanList.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Tidak ada karyawan aktif",
        });
      }

      // Ambil komponen gaji aktif
      const komponenList = await KomponenGajiModel.findAll({
        where: { is_active: true },
        transaction,
      });

      // Ambil kuota cuti bulan ini (untuk total hari kerja)
      const kuotaCuti = await KuotaCutiModel.findOne({
        where: {
          bulan: bulanNum,
          tahun: tahunNum,
          is_active: true,
        },
        transaction,
      });

      const totalHariKerja = kuotaCuti ? kuotaCuti.total_hari_kerja : 22;

      // FIX (Task 3.9): gunakan helper localDate() untuk format YYYY-MM-DD
      // tanpa konversi UTC yang dapat menggeser tanggal 1-2 hari.
      const startOfMonth = new Date(tahunNum, bulanNum - 1, 1);
      const endOfMonth = new Date(tahunNum, bulanNum, 0);
      const startDate = formatLocalDate(startOfMonth);
      const endDate = formatLocalDate(endOfMonth);

      const slipGajiResults = [];

      for (const karyawan of karyawanList) {
        // Cek apakah slip sudah ada
        let slip = await SlipGajiModel.findOne({
          where: {
            karyawan_id: karyawan.id,
            bulan: bulanNum,
            tahun: tahunNum,
          },
          transaction,
        });

        // Jika sudah final, skip
        if (slip && slip.status === "final") {
          continue;
        }

        // Ambil data absensi bulan ini
        const absensiList = await AbsensiKaryawanModel.findAll({
          where: {
            karyawan_id: karyawan.id,
            tanggal: { [Op.between]: [startDate, endDate] },
          },
          transaction,
        });

        // Hitung statistik absensi
        let stats = {
          hadir: 0,
          terlambat: 0,
          cuti: 0,
          izin: 0,
          sakit: 0,
          absen: 0,
        };

        absensiList.forEach((item) => {
          switch (item.status) {
            case "masuk":
              stats.hadir++;
              break;
            case "terlambat":
              stats.terlambat++;
              break;
            case "cuti":
              stats.cuti++;
              break;
            case "izin":
              stats.izin++;
              break;
            case "sakit":
              stats.sakit++;
              break;
            case "tidak_hadir":
              stats.absen++;
              break;
          }
        });

        const totalHadir = stats.hadir + stats.terlambat;
        const totalAbsen = stats.absen;
        const totalCuti = stats.cuti + stats.izin + stats.sakit;

        const gajiPokok = parseFloat(karyawan.gaji_pokok) || 0;

        // INTEGRASI LEMBUR: Ambil data lembur bulan ini yang sudah approved
        const lemburData = await LemburModel.findAll({
          where: {
            karyawan_id: karyawan.id,
            tanggal: { [Op.between]: [startDate, endDate] },
            status: "approved",
          },
          transaction,
        });

        // Hitung total jam lembur
        const totalLemburJam = lemburData.reduce(
          (sum, l) => sum + parseFloat(l.total_jam),
          0,
        );

        // Hitung bonus dan potongan
        let totalBonus = 0;
        let totalPotongan = 0;
        const detailItems = [];

        for (const komponen of komponenList) {
          let nilai = 0;
          const nilaiDefault = parseFloat(komponen.nilai_default) || 0;

          switch (komponen.metode) {
            case "nominal":
              nilai = nilaiDefault;
              break;
            case "persentase":
              nilai = (gajiPokok * nilaiDefault) / 100;
              break;
            case "per_hari":
              if (komponen.tipe === "bonus") {
                nilai = nilaiDefault * totalHadir;
              } else {
                nilai = nilaiDefault * totalAbsen;
              }
              break;
            case "per_jam":
              // INTEGRASI LEMBUR: Hitung otomatis jika ada komponen lembur (per_jam + bonus)
              if (komponen.tipe === "bonus" && totalLemburJam > 0) {
                nilai = nilaiDefault * totalLemburJam;
              } else {
                nilai = 0;
              }
              break;
          }

          if (nilai > 0) {
            if (komponen.tipe === "bonus") {
              totalBonus += nilai;
            } else {
              totalPotongan += nilai;
            }

            detailItems.push({
              komponen_id: komponen.id,
              nama_komponen: komponen.nama,
              tipe: komponen.tipe,
              nilai: nilai,
              keterangan:
                komponen.metode === "per_jam"
                  ? `${totalLemburJam} jam x ${nilaiDefault}`
                  : `${komponen.metode}: ${nilaiDefault}`,
            });
          }
        }

        const totalPendapatan = gajiPokok + totalBonus;
        const gajiBersihRaw = totalPendapatan - totalPotongan;
        // FIX (Task 3.6): gaji_bersih tidak boleh negatif (floor 0).
        const gajiBersih = Math.max(0, gajiBersihRaw);

        // Create atau Update slip gaji
        if (slip) {
          // Update existing slip
          await slip.update(
            {
              total_hari_kerja: totalHariKerja,
              total_hadir: totalHadir,
              total_terlambat: stats.terlambat,
              total_absen: totalAbsen,
              total_cuti: totalCuti,
              total_lembur_jam: totalLemburJam,
              gaji_pokok: gajiPokok,
              total_pendapatan: totalPendapatan,
              total_potongan: totalPotongan,
              gaji_bersih: gajiBersih,
            },
            { transaction },
          );

          // Hapus detail lama
          await DetailSlipGajiModel.destroy({
            where: { slip_gaji_id: slip.id },
            transaction,
          });
        } else {
          // Create new slip
          slip = await SlipGajiModel.create(
            {
              karyawan_id: karyawan.id,
              bulan: parseInt(bulan),
              tahun: parseInt(tahun),
              total_hari_kerja: totalHariKerja,
              total_hadir: totalHadir,
              total_terlambat: stats.terlambat,
              total_absen: totalAbsen,
              total_cuti: totalCuti,
              total_lembur_jam: totalLemburJam,
              gaji_pokok: gajiPokok,
              total_pendapatan: totalPendapatan,
              total_potongan: totalPotongan,
              gaji_bersih: gajiBersih,
              status: "draft",
            },
            { transaction },
          );
        }

        // Create detail items
        for (const item of detailItems) {
          await DetailSlipGajiModel.create(
            {
              slip_gaji_id: slip.id,
              ...item,
            },
            { transaction },
          );
        }

        slipGajiResults.push({
          karyawan: karyawan.nama_lengkap,
          gaji_bersih: gajiBersih,
        });
      }

      // Commit hanya jika SEMUA slip berhasil di-generate.
      await transaction.commit();

      return res.status(201).json({
        msg: `Berhasil generate ${slipGajiResults.length} slip gaji`,
        data: slipGajiResults,
      });
    } catch (error) {
      // Auto-rollback bila transaksi masih aktif.
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
        error: error.message,
      });
    }
  }

  // HRD: Get semua slip gaji per bulan
  static async getAllByBulan(req, res) {
    try {
      const { bulan, tahun, status } = req.query;

      // SECURITY (Task 4.5): validasi parseInt(NaN) → return 400
      const bulanTarget =
        bulan === undefined || bulan === ""
          ? new Date().getMonth() + 1
          : parseBulan(bulan);
      if (bulan === "" || bulan === undefined ? false : Number.isNaN(bulanTarget)) {
        return res.status(400).json({ msg: "Bulan harus antara 1-12" });
      }
      const tahunTarget =
        tahun === undefined || tahun === ""
          ? new Date().getFullYear()
          : parseTahun(tahun);
      if (tahun === "" || tahun === undefined ? false : Number.isNaN(tahunTarget)) {
        return res.status(400).json({ msg: "Tahun tidak valid" });
      }

      const whereClause = {
        bulan: bulanTarget,
        tahun: tahunTarget,
      };

      if (status) whereClause.status = status;

      const data = await SlipGajiModel.findAll({
        where: whereClause,
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["id", "nama_lengkap", "jabatan", "department"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data slip gaji",
        data: {
          bulan: bulanTarget,
          tahun: tahunTarget,
          slipGaji: data,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Get detail slip gaji by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({ msg: "ID slip gaji tidak valid" });
      }

      const slip = await SlipGajiModel.findByPk(id, {
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["id", "nama_lengkap", "jabatan", "department"],
          },
          {
            model: DetailSlipGajiModel,
            as: "details",
            order: [["tipe", "ASC"]],
          },
        ],
      });

      if (!slip) {
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      return res.status(200).json({
        msg: "Berhasil mengambil detail slip gaji",
        data: slip,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Update slip gaji (tambah/edit komponen manual)
  static async update(req, res) {
    // FIX (Task 3.2): wrap destroy + recreate dalam transaction
    // agar atomic (gagal satu = rollback semua).
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { total_lembur_jam, catatan, details } = req.body;

      // SECURITY (Task 4.2): UUID validation
      if (!isValidUUID(id)) {
        await transaction.rollback();
        return res.status(400).json({ msg: "ID slip gaji tidak valid" });
      }

      const slip = await SlipGajiModel.findByPk(id, { transaction });

      if (!slip) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      // FIX (Task 3.3): tolak edit jika status sudah final.
      if (slip.status === "final") {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Slip gaji sudah final dan tidak dapat diubah",
        });
      }

      // Update field dasar
      if (total_lembur_jam !== undefined) {
        slip.total_lembur_jam = total_lembur_jam;
      }
      if (catatan !== undefined) {
        slip.catatan = catatan;
      }

      // Update details jika ada
      if (details && Array.isArray(details)) {
        // Hapus detail lama
        await DetailSlipGajiModel.destroy({
          where: { slip_gaji_id: slip.id },
          transaction,
        });

        let totalBonus = 0;
        let totalPotongan = 0;

        // FIX (Task 3.8): drop item dengan nilai 0 atau tidak valid;
        // audit trail disimpan via response.data.auditTrail di bawah.
        const auditTrail = [];
        for (const item of details) {
          const nilaiRaw = parseFloat(item.nilai);
          const nilai = Number.isFinite(nilaiRaw) ? nilaiRaw : 0;

          if (nilai === 0) {
            auditTrail.push({
              action: "skipped_zero",
              nama_komponen: item.nama_komponen,
              tipe: item.tipe,
              original: item.nilai,
            });
            continue;
          }

          await DetailSlipGajiModel.create(
            {
              slip_gaji_id: slip.id,
              komponen_id: item.komponen_id || null,
              nama_komponen: item.nama_komponen,
              tipe: item.tipe,
              nilai: nilai,
              keterangan: item.keterangan,
            },
            { transaction },
          );

          if (item.tipe === "bonus") {
            totalBonus += nilai;
          } else {
            totalPotongan += nilai;
          }
        }

        // Recalculate totals
        const gajiPokok = parseFloat(slip.gaji_pokok) || 0;
        const totalPendapatan = gajiPokok + totalBonus;
        // FIX (Task 3.5): recompute gaji_bersih saat details berubah.
        // FIX (Task 3.6): gaji_bersih floor 0 (tidak boleh negatif).
        const gajiBersihRaw = totalPendapatan - totalPotongan;
        const gajiBersih = Math.max(0, gajiBersihRaw);

        slip.total_pendapatan = totalPendapatan;
        slip.total_potongan = totalPotongan;
        slip.gaji_bersih = gajiBersih;

        // FIX (Task 3.5): jika user mengirim total_lembur_jam (tanpa details),
        // recompute gaji_bersih dari total_pendapatan - total_potongan saat ini
        // sehingga konsistensi dengan komponen lembur per_jam di-generate ulang
        // pada generateSlipGaji berikutnya.
        if (total_lembur_jam !== undefined && !Array.isArray(details)) {
          const existingPotongan = parseFloat(slip.total_potongan) || 0;
          const newPendapatan = gajiPokok + parseFloat(total_lembur_jam || 0);
          slip.total_pendapatan = newPendapatan;
          slip.gaji_bersih = Math.max(0, newPendapatan - existingPotongan);
        }

        slip._auditTrail = auditTrail;
      }

      await slip.save({ transaction });
      await transaction.commit();

      // FIX (Task 3.4): audit log perubahan slip gaji.
      await audit({
        req,
        entity: "slip_gaji",
        entityId: slip.id,
        action: "update",
        before: {
          total_lembur_jam: slip._previousDataValues?.total_lembur_jam,
          total_pendapatan: slip._previousDataValues?.total_pendapatan,
          total_potongan: slip._previousDataValues?.total_potongan,
          gaji_bersih: slip._previousDataValues?.gaji_bersih,
        },
        after: {
          total_lembur_jam: slip.total_lembur_jam,
          total_pendapatan: slip.total_pendapatan,
          total_potongan: slip.total_potongan,
          gaji_bersih: slip.gaji_bersih,
        },
      });

      const responseData = slip.toJSON();
      if (slip._auditTrail) {
        responseData.auditTrail = slip._auditTrail;
      }

      return res.status(200).json({
        msg: "Berhasil memperbarui slip gaji",
        data: responseData,
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Finalize slip gaji
  static async finalize(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        await transaction.rollback();
        return res.status(400).json({ msg: "ID slip gaji tidak valid" });
      }

      const slip = await SlipGajiModel.findByPk(id, { transaction });

      if (!slip) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      if (slip.status === "final") {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Slip gaji sudah final",
        });
      }

      await slip.update({ status: "final" }, { transaction });
      await transaction.commit();

      // Audit log (Task 3.4)
      await audit({
        req,
        entity: "slip_gaji",
        entityId: slip.id,
        action: "finalize",
        before: { status: "draft" },
        after: { status: "final" },
      });

      return res.status(200).json({
        msg: "Slip gaji berhasil difinalisasi",
        data: slip,
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Bulk finalize all draft slips
  static async bulkFinalize(req, res) {
    // FIX (Task 3.7): pakai transaction + update via single SQL statement
    // agar atomic (semua final ATAU tidak sama sekali).
    const transaction = await sequelize.transaction();
    try {
      const { bulan, tahun } = req.body;

      if (!bulan || !tahun) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Bulan dan tahun wajib diisi",
        });
      }

      // Find all draft slips for this month
      const draftSlips = await SlipGajiModel.findAll({
        where: {
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          status: "draft",
        },
        transaction,
        lock: transaction.LOCK?.UPDATE,
      });

      if (draftSlips.length === 0) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Tidak ada slip gaji draft untuk difinalisasi",
        });
      }

      // FIX (Task 3.7): gunakan bulk UPDATE dalam satu query, bukan
      // Promise.all(update[]) yang tidak atomic pada sebagian DB.
      const [updatedCount] = await SlipGajiModel.update(
        { status: "final" },
        {
          where: {
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
            status: "draft",
          },
          transaction,
        },
      );

      await transaction.commit();

      // Audit log (Task 3.4)
      await audit({
        req,
        entity: "slip_gaji",
        entityId: null,
        action: "bulk_finalize",
        before: { status: "draft", count: updatedCount },
        after: { status: "final", count: updatedCount, bulan, tahun },
      });

      return res.status(200).json({
        msg: `Berhasil finalisasi ${updatedCount} slip gaji`,
        data: {
          total_finalized: updatedCount,
        },
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Get slip gaji sendiri
  static async getSlipGajiSaya(req, res) {
    try {
      const userId = req.user.id;
      const { bulan, tahun } = req.query;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const whereClause = {
        karyawan_id: karyawan.id,
        status: "final", // Karyawan hanya bisa lihat yang sudah final
      };

      if (bulan) whereClause.bulan = parseInt(bulan);
      if (tahun) whereClause.tahun = parseInt(tahun);

      const data = await SlipGajiModel.findAll({
        where: whereClause,
        include: [
          {
            model: DetailSlipGajiModel,
            as: "details",
          },
        ],
        order: [
          ["tahun", "DESC"],
          ["bulan", "DESC"],
        ],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data slip gaji",
        data: data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Get detail slip gaji by ID (hanya milik sendiri)
  static async getSlipGajiSayaById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const slip = await SlipGajiModel.findOne({
        where: {
          id: id,
          karyawan_id: karyawan.id,
          status: "final",
        },
        include: [
          {
            model: DetailSlipGajiModel,
            as: "details",
          },
        ],
      });

      if (!slip) {
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      return res.status(200).json({
        msg: "Berhasil mengambil detail slip gaji",
        data: slip,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}

// FIX (Task 3.9): helper format tanggal lokal (YYYY-MM-DD) tanpa konversi
// UTC. toISOString() menggeser tanggal -1 atau -2 hari untuk zona +07:00
// (mis. new Date(2024, 0, 1) di WIB jadi "2023-12-31" lewat toISOString()).
function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

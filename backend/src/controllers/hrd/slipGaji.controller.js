import SlipGajiModel from "../../models/slipGaji.model.js";
import DetailSlipGajiModel from "../../models/detailSlipGaji.model.js";
import KomponenGajiModel from "../../models/komponenGaji.model.js";
import KaryawanModel from "../../models/karyawan.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import KuotaCutiModel from "../../models/kuotaCutiModel.js";
import { Op } from "sequelize";

export default class SlipGajiController {
  // HRD: Generate slip gaji untuk semua karyawan bulan tertentu
  static async generateSlipGaji(req, res) {
    try {
      const { bulan, tahun } = req.body;

      if (!bulan || !tahun) {
        return res.status(400).json({
          msg: "Bulan dan tahun wajib diisi",
        });
      }

      // Ambil semua karyawan aktif
      const karyawanList = await KaryawanModel.findAll({
        where: { is_active: true },
      });

      if (karyawanList.length === 0) {
        return res.status(404).json({
          msg: "Tidak ada karyawan aktif",
        });
      }

      // Ambil komponen gaji aktif
      const komponenList = await KomponenGajiModel.findAll({
        where: { is_active: true },
      });

      // Ambil kuota cuti bulan ini (untuk total hari kerja)
      const kuotaCuti = await KuotaCutiModel.findOne({
        where: {
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          is_active: true,
        },
      });

      const totalHariKerja = kuotaCuti ? kuotaCuti.total_hari_kerja : 22;

      // Tanggal range untuk query absensi
      const startOfMonth = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
      const endOfMonth = new Date(parseInt(tahun), parseInt(bulan), 0);
      const startDate = startOfMonth.toISOString().split("T")[0];
      const endDate = endOfMonth.toISOString().split("T")[0];

      const slipGajiResults = [];

      for (const karyawan of karyawanList) {
        // Cek apakah slip sudah ada
        let slip = await SlipGajiModel.findOne({
          where: {
            karyawan_id: karyawan.id,
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
          },
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
              // Untuk lembur, default 0 (bisa di-edit manual)
              nilai = 0;
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
              keterangan: `${komponen.metode}: ${nilaiDefault}`,
            });
          }
        }

        const totalPendapatan = gajiPokok + totalBonus;
        const gajiBersih = totalPendapatan - totalPotongan;

        // Create atau Update slip gaji
        if (slip) {
          // Update existing slip
          await slip.update({
            total_hari_kerja: totalHariKerja,
            total_hadir: totalHadir,
            total_terlambat: stats.terlambat,
            total_absen: totalAbsen,
            total_cuti: totalCuti,
            gaji_pokok: gajiPokok,
            total_pendapatan: totalPendapatan,
            total_potongan: totalPotongan,
            gaji_bersih: gajiBersih,
          });

          // Hapus detail lama
          await DetailSlipGajiModel.destroy({
            where: { slip_gaji_id: slip.id },
          });
        } else {
          // Create new slip
          slip = await SlipGajiModel.create({
            karyawan_id: karyawan.id,
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
            total_hari_kerja: totalHariKerja,
            total_hadir: totalHadir,
            total_terlambat: stats.terlambat,
            total_absen: totalAbsen,
            total_cuti: totalCuti,
            total_lembur_jam: 0,
            gaji_pokok: gajiPokok,
            total_pendapatan: totalPendapatan,
            total_potongan: totalPotongan,
            gaji_bersih: gajiBersih,
            status: "draft",
          });
        }

        // Create detail items
        for (const item of detailItems) {
          await DetailSlipGajiModel.create({
            slip_gaji_id: slip.id,
            ...item,
          });
        }

        slipGajiResults.push({
          karyawan: karyawan.nama_lengkap,
          gaji_bersih: gajiBersih,
        });
      }

      return res.status(201).json({
        msg: `Berhasil generate ${slipGajiResults.length} slip gaji`,
        data: slipGajiResults,
      });
    } catch (error) {
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

      const bulanTarget = bulan ? parseInt(bulan) : new Date().getMonth() + 1;
      const tahunTarget = tahun ? parseInt(tahun) : new Date().getFullYear();

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
            attributes: ["id", "nama_lengkap", "jabatan", "departement"],
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

      const slip = await SlipGajiModel.findByPk(id, {
        include: [
          {
            model: KaryawanModel,
            as: "karyawan",
            attributes: ["id", "nama_lengkap", "jabatan", "departement"],
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
    try {
      const { id } = req.params;
      const { total_lembur_jam, catatan, details } = req.body;

      const slip = await SlipGajiModel.findByPk(id);

      if (!slip) {
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      if (slip.status === "final") {
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
        });

        let totalBonus = 0;
        let totalPotongan = 0;

        // Create detail baru
        for (const item of details) {
          await DetailSlipGajiModel.create({
            slip_gaji_id: slip.id,
            komponen_id: item.komponen_id || null,
            nama_komponen: item.nama_komponen,
            tipe: item.tipe,
            nilai: item.nilai,
            keterangan: item.keterangan,
          });

          if (item.tipe === "bonus") {
            totalBonus += parseFloat(item.nilai);
          } else {
            totalPotongan += parseFloat(item.nilai);
          }
        }

        // Recalculate totals
        slip.total_pendapatan = parseFloat(slip.gaji_pokok) + totalBonus;
        slip.total_potongan = totalPotongan;
        slip.gaji_bersih = slip.total_pendapatan - slip.total_potongan;
      }

      await slip.save();

      return res.status(200).json({
        msg: "Berhasil memperbarui slip gaji",
        data: slip,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Finalize slip gaji
  static async finalize(req, res) {
    try {
      const { id } = req.params;

      const slip = await SlipGajiModel.findByPk(id);

      if (!slip) {
        return res.status(404).json({
          msg: "Slip gaji tidak ditemukan",
        });
      }

      if (slip.status === "final") {
        return res.status(400).json({
          msg: "Slip gaji sudah final",
        });
      }

      await slip.update({ status: "final" });

      return res.status(200).json({
        msg: "Slip gaji berhasil difinalisasi",
        data: slip,
      });
    } catch (error) {
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

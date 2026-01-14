import PengajuanCutiModel from "../../models/pengajuanCutiModel.js";
import KuotaCutiModel from "../../models/kuotaCutiModel.js";
import KaryawanModel from "../../models/karyawan.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import { Op } from "sequelize";

export default class PengajuanCutiController {
  // Helper function untuk menghitung jumlah hari
  static hitungJumlahHari(tanggalMulai, tanggalSelesai) {
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  // Karyawan: Ajukan cuti
  static async ajukanCuti(req, res) {
    try {
      const userId = req.user.id;
      const { tanggal_mulai, tanggal_selesai, jenis_cuti, alasan } = req.body;

      if (!tanggal_mulai || !tanggal_selesai || !alasan) {
        return res.status(400).json({
          msg: "Tanggal mulai, tanggal selesai, dan alasan wajib diisi",
        });
      }

      // Cari karyawan berdasarkan user_id
      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Hitung jumlah hari cuti yang diajukan
      const jumlahHari = PengajuanCutiController.hitungJumlahHari(
        tanggal_mulai,
        tanggal_selesai
      );

      // Validasi tanggal (tanggal selesai harus setelah tanggal mulai)
      if (new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
        return res.status(400).json({
          msg: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
        });
      }

      // Ambil bulan dan tahun dari tanggal mulai cuti
      const tanggalMulaiDate = new Date(tanggal_mulai);
      const bulan = tanggalMulaiDate.getMonth() + 1;
      const tahun = tanggalMulaiDate.getFullYear();

      // Cek kuota cuti bulan tersebut
      const kuotaCuti = await KuotaCutiModel.findOne({
        where: {
          bulan: bulan,
          tahun: tahun,
          is_active: true,
        },
      });

      if (!kuotaCuti) {
        return res.status(400).json({
          msg: `Kuota cuti untuk bulan ${bulan} tahun ${tahun} belum diatur oleh admin`,
        });
      }

      // Hitung total cuti yang sudah diajukan (disetujui/pending) bulan ini
      const startOfMonth = new Date(tahun, bulan - 1, 1);
      const endOfMonth = new Date(tahun, bulan, 0);

      const cutiSudahDiajukan = await PengajuanCutiModel.findAll({
        where: {
          karyawan_id: karyawan.id,
          status: {
            [Op.in]: ["pending", "disetujui"],
          },
          tanggal_mulai: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      });

      const totalHariSudahDiajukan = cutiSudahDiajukan.reduce((acc, cuti) => {
        return acc + cuti.jumlah_hari;
      }, 0);

      // Cek apakah melebihi kuota
      if (totalHariSudahDiajukan + jumlahHari > kuotaCuti.kuota_cuti) {
        const sisaKuota = kuotaCuti.kuota_cuti - totalHariSudahDiajukan;
        return res.status(400).json({
          msg: `Kuota cuti tidak mencukupi. Kuota bulan ini: ${kuotaCuti.kuota_cuti} hari, sudah digunakan: ${totalHariSudahDiajukan} hari, sisa: ${sisaKuota} hari, Anda mengajukan: ${jumlahHari} hari`,
        });
      }

      // Buat pengajuan cuti
      const pengajuan = await PengajuanCutiModel.create({
        karyawan_id: karyawan.id,
        tanggal_mulai,
        tanggal_selesai,
        jumlah_hari: jumlahHari,
        jenis_cuti: jenis_cuti || "tahunan",
        alasan,
        status: "pending",
      });

      return res.status(201).json({
        msg: "Berhasil mengajukan cuti",
        data: pengajuan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Get pengajuan cuti sendiri
  static async getCutiSaya(req, res) {
    try {
      const userId = req.user.id;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const data = await PengajuanCutiModel.findAll({
        where: { karyawan_id: karyawan.id },
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        msg: "Berhasil mengambil data pengajuan cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Get sisa kuota cuti bulan ini
  static async getSisaKuota(req, res) {
    try {
      const userId = req.user.id;
      const { bulan, tahun } = req.query;

      const bulanTarget = bulan ? parseInt(bulan) : new Date().getMonth() + 1;
      const tahunTarget = tahun ? parseInt(tahun) : new Date().getFullYear();

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Ambil kuota cuti bulan tersebut
      const kuotaCuti = await KuotaCutiModel.findOne({
        where: {
          bulan: bulanTarget,
          tahun: tahunTarget,
          is_active: true,
        },
      });

      if (!kuotaCuti) {
        return res.status(404).json({
          msg: `Kuota cuti untuk bulan ${bulanTarget} tahun ${tahunTarget} belum diatur`,
        });
      }

      // Hitung cuti yang sudah digunakan
      const startOfMonth = new Date(tahunTarget, bulanTarget - 1, 1);
      const endOfMonth = new Date(tahunTarget, bulanTarget, 0);

      const cutiSudahDiajukan = await PengajuanCutiModel.findAll({
        where: {
          karyawan_id: karyawan.id,
          status: {
            [Op.in]: ["pending", "disetujui"],
          },
          tanggal_mulai: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
      });

      const totalHariSudahDiajukan = cutiSudahDiajukan.reduce((acc, cuti) => {
        return acc + cuti.jumlah_hari;
      }, 0);

      const sisaKuota = kuotaCuti.kuota_cuti - totalHariSudahDiajukan;

      return res.status(200).json({
        msg: "Berhasil mengambil sisa kuota cuti",
        data: {
          bulan: bulanTarget,
          tahun: tahunTarget,
          kuota_cuti: kuotaCuti.kuota_cuti,
          total_hari_kerja: kuotaCuti.total_hari_kerja,
          sudah_digunakan: totalHariSudahDiajukan,
          sisa_kuota: sisaKuota,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Get semua pengajuan cuti
  static async getAllPengajuan(req, res) {
    try {
      const { status, bulan, tahun } = req.query;

      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (bulan && tahun) {
        const startOfMonth = new Date(parseInt(tahun), parseInt(bulan) - 1, 1);
        const endOfMonth = new Date(parseInt(tahun), parseInt(bulan), 0);
        whereClause.tanggal_mulai = {
          [Op.between]: [startOfMonth, endOfMonth],
        };
      }

      const data = await PengajuanCutiModel.findAll({
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
        msg: "Berhasil mengambil data pengajuan cuti",
        data: data,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // HRD: Approve/Reject pengajuan cuti
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, catatan_approval } = req.body;
      const approverId = req.user.id;

      if (!status || !["disetujui", "ditolak"].includes(status)) {
        return res.status(400).json({
          msg: "Status harus 'disetujui' atau 'ditolak'",
        });
      }

      const pengajuan = await PengajuanCutiModel.findByPk(id);

      if (!pengajuan) {
        return res.status(404).json({
          msg: "Pengajuan cuti tidak ditemukan",
        });
      }

      if (pengajuan.status !== "pending") {
        return res.status(400).json({
          msg: "Pengajuan cuti sudah diproses sebelumnya",
        });
      }

      await pengajuan.update({
        status: status,
        catatan_approval: catatan_approval || null,
        approved_by: approverId,
        approved_at: new Date(),
      });

      // Jika disetujui, otomatis buat record absensi untuk setiap hari cuti
      if (status === "disetujui") {
        const startDate = new Date(pengajuan.tanggal_mulai);
        const endDate = new Date(pengajuan.tanggal_selesai);
        const cutiRecords = [];

        // Loop dari tanggal mulai sampai tanggal selesai
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          const tanggal = date.toISOString().split("T")[0];

          // Cek apakah sudah ada record absensi untuk tanggal tersebut
          const existingAbsensi = await AbsensiKaryawanModel.findOne({
            where: {
              karyawan_id: pengajuan.karyawan_id,
              tanggal: tanggal,
            },
          });

          // Jika belum ada, buat record baru
          if (!existingAbsensi) {
            cutiRecords.push({
              karyawan_id: pengajuan.karyawan_id,
              tanggal: tanggal,
              status: "cuti",
              keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
            });
          } else {
            // Jika sudah ada, update status menjadi cuti
            await existingAbsensi.update({
              status: "cuti",
              keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
            });
          }
        }

        // Bulk create records cuti
        if (cutiRecords.length > 0) {
          await AbsensiKaryawanModel.bulkCreate(cutiRecords);
        }

        console.log(
          `Created/Updated ${pengajuan.jumlah_hari} absensi records for cuti`
        );
      }

      return res.status(200).json({
        msg: `Pengajuan cuti berhasil ${
          status === "disetujui" ? "disetujui" : "ditolak"
        }`,
        data: pengajuan,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }

  // Karyawan: Cancel pengajuan cuti (hanya jika masih pending)
  static async cancelPengajuan(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
      });

      if (!karyawan) {
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      const pengajuan = await PengajuanCutiModel.findOne({
        where: {
          id: id,
          karyawan_id: karyawan.id,
        },
      });

      if (!pengajuan) {
        return res.status(404).json({
          msg: "Pengajuan cuti tidak ditemukan",
        });
      }

      if (pengajuan.status !== "pending") {
        return res.status(400).json({
          msg: "Hanya pengajuan dengan status pending yang bisa dibatalkan",
        });
      }

      await pengajuan.destroy();

      return res.status(200).json({
        msg: "Berhasil membatalkan pengajuan cuti",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Terjadi kesalahan pada server",
      });
    }
  }
}

import PengajuanCutiModel from "../../models/pengajuanCutiModel.js";
import KuotaCutiModel from "../../models/kuotaCutiModel.js";
import KaryawanModel from "../../models/karyawan.model.js";
import AbsensiKaryawanModel from "../../models/absensiModel.js";
import sequelize from "../../config/sequelize.js";
import { Op } from "sequelize";

export default class PengajuanCutiController {
  // FIX (Task 3.14): hitung jumlah hari cuti dengan exclude weekend
  // (Sabtu=6, Minggu=0). Hari libur nasional masih dihitung; sistem
  // bisa ditambah dengan tabel hari_libur jika diperlukan.
  static hitungJumlahHari(tanggalMulai, tanggalSelesai) {
    const start = new Date(tanggalMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tanggalSelesai);
    end.setHours(0, 0, 0, 0);

    if (end < start) return 0;

    let count = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
      const day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return count;
  }

  // FIX (Task 3.15): hitung total hari cuti existing yang overlap dengan
  // range yang diajukan, dipecah per bulan (cross-bulan aware).
  static async hitungCutiTerpakaiPerBulan(karyawanId, tanggalMulai, tanggalSelesai) {
    const result = {};
    const start = new Date(tanggalMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tanggalSelesai);
    end.setHours(0, 0, 0, 0);

    // Kumpulkan semua cuti yang overlap dengan range
    const cutiList = await PengajuanCutiModel.findAll({
      where: {
        karyawan_id: karyawanId,
        status: { [Op.in]: ["pending", "disetujui"] },
        [Op.or]: [
          { tanggal_mulai: { [Op.between]: [start, end] } },
          { tanggal_selesai: { [Op.between]: [start, end] } },
          {
            [Op.and]: [
              { tanggal_mulai: { [Op.lte]: start } },
              { tanggal_selesai: { [Op.gte]: end } },
            ],
          },
        ],
      },
    });

    for (const cuti of cutiList) {
      const cutiStart = new Date(cuti.tanggal_mulai);
      cutiStart.setHours(0, 0, 0, 0);
      const cutiEnd = new Date(cuti.tanggal_selesai);
      cutiEnd.setHours(0, 0, 0, 0);

      const overlapStart = cutiStart > start ? cutiStart : start;
      const overlapEnd = cutiEnd < end ? cutiEnd : end;

      const cursor = new Date(overlapStart);
      while (cursor <= overlapEnd) {
        const day = cursor.getDay();
        if (day !== 0 && day !== 6) {
          const bulan = cursor.getMonth() + 1;
          const tahun = cursor.getFullYear();
          const key = `${tahun}-${bulan}`;
          result[key] = (result[key] || 0) + 1;
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    return result;
  }

  // Karyawan: Ajukan cuti
  static async ajukanCuti(req, res) {
    const transaction = await sequelize.transaction();
    try {
      const userId = req.user.id;
      const { tanggal_mulai, tanggal_selesai, jenis_cuti, alasan } = req.body;

      if (!tanggal_mulai || !tanggal_selesai || !alasan) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Tanggal mulai, tanggal selesai, dan alasan wajib diisi",
        });
      }

      // Cari karyawan berdasarkan user_id
      const karyawan = await KaryawanModel.findOne({
        where: { user_id: userId },
        transaction,
      });

      if (!karyawan) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Data karyawan tidak ditemukan",
        });
      }

      // Validasi tanggal (tanggal selesai harus setelah tanggal mulai)
      if (new Date(tanggal_selesai) < new Date(tanggal_mulai)) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Tanggal selesai harus setelah atau sama dengan tanggal mulai",
        });
      }

      // Hitung jumlah hari kerja (exclude weekend, Task 3.14)
      const jumlahHari = PengajuanCutiController.hitungJumlahHari(
        tanggal_mulai,
        tanggal_selesai
      );

      if (jumlahHari === 0) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Tidak ada hari kerja dalam rentang cuti (semua weekend).",
        });
      }

      // FIX (Task 3.16): Deteksi double-booking. Tolak jika ada pengajuan
      // existing yang overlap dengan rentang cuti yang baru.
      const startCek = new Date(tanggal_mulai);
      startCek.setHours(0, 0, 0, 0);
      const endCek = new Date(tanggal_selesai);
      endCek.setHours(0, 0, 0, 0);
      const overlapCek = await PengajuanCutiModel.findOne({
        where: {
          karyawan_id: karyawan.id,
          status: { [Op.in]: ["pending", "disetujui"] },
          [Op.or]: [
            { tanggal_mulai: { [Op.between]: [startCek, endCek] } },
            { tanggal_selesai: { [Op.between]: [startCek, endCek] } },
            {
              [Op.and]: [
                { tanggal_mulai: { [Op.lte]: startCek } },
                { tanggal_selesai: { [Op.gte]: endCek } },
              ],
            },
          ],
        },
        transaction,
      });
      if (overlapCek) {
        await transaction.rollback();
        return res.status(400).json({
          msg: `Anda sudah memiliki pengajuan cuti yang overlap dengan rentang ini (${overlapCek.tanggal_mulai} s/d ${overlapCek.tanggal_selesai}, status: ${overlapCek.status}).`,
        });
      }

      // FIX (Task 3.15): Validasi kuota per bulan untuk cuti cross-bulan.
      // Hitung total hari yang akan dipakai di tiap bulan yang dilewati.
      const cutiPerBulan = await PengajuanCutiController.hitungCutiTerpakaiPerBulan(
        karyawan.id,
        tanggal_mulai,
        tanggal_selesai
      );

      // Kumpulkan bulan-bulan yang relevan (bulan mulai + setiap bulan
      // sampai bulan selesai).
      const startMonth = new Date(tanggal_mulai);
      const endMonth = new Date(tanggal_selesai);
      const monthsToCheck = [];
      const cursor = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
      while (cursor <= endMonth) {
        const bulan = cursor.getMonth() + 1;
        const tahun = cursor.getFullYear();
        // Hari cuti di bulan ini = jumlah hari kerja yang jatuh di bulan tsb
        let hariDiBulanIni = 0;
        const monthStart = new Date(tahun, bulan - 1, 1);
        const monthEnd = new Date(tahun, bulan, 0);
        const rangeStart = new Date(tanggal_mulai);
        rangeStart.setHours(0, 0, 0, 0);
        const rangeEnd = new Date(tanggal_selesai);
        rangeEnd.setHours(0, 0, 0, 0);
        const dStart = rangeStart > monthStart ? rangeStart : monthStart;
        const dEnd = rangeEnd < monthEnd ? rangeEnd : monthEnd;
        const d = new Date(dStart);
        while (d <= dEnd) {
          const dow = d.getDay();
          if (dow !== 0 && dow !== 6) hariDiBulanIni++;
          d.setDate(d.getDate() + 1);
        }
        monthsToCheck.push({ bulan, tahun, hari: hariDiBulanIni });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      // Untuk setiap bulan, cek kuota
      for (const { bulan, tahun, hari } of monthsToCheck) {
        if (hari === 0) continue;
        const kuotaCuti = await KuotaCutiModel.findOne({
          where: { bulan, tahun, is_active: true },
          transaction,
        });
        if (!kuotaCuti) {
          await transaction.rollback();
          return res.status(400).json({
            msg: `Kuota cuti untuk bulan ${bulan} tahun ${tahun} belum diatur oleh admin`,
          });
        }
        const key = `${tahun}-${bulan}`;
        const sudahDipakai = cutiPerBulan[key] || 0;
        if (sudahDipakai + hari > kuotaCuti.kuota_cuti) {
          const sisa = kuotaCuti.kuota_cuti - sudahDipakai;
          await transaction.rollback();
          return res.status(400).json({
            msg: `Kuota cuti bulan ${bulan}/${tahun} tidak mencukupi. Kuota: ${kuotaCuti.kuota_cuti} hari, sudah digunakan: ${sudahDipakai} hari, sisa: ${sisa} hari, Anda mengajukan: ${hari} hari`,
          });
        }
      }

      // Buat pengajuan cuti
      const pengajuan = await PengajuanCutiModel.create(
        {
          karyawan_id: karyawan.id,
          tanggal_mulai,
          tanggal_selesai,
          jumlah_hari: jumlahHari,
          jenis_cuti: jenis_cuti || "tahunan",
          alasan,
          status: "pending",
        },
        { transaction },
      );

      await transaction.commit();

      return res.status(201).json({
        msg: "Berhasil mengajukan cuti",
        data: pengajuan,
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
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
      // FIX (Task 3.21): gunakan string YYYY-MM-DD untuk DATEONLY column
      const startOfMonth = `${tahunTarget}-${String(bulanTarget).padStart(2, "0")}-01`;
      const endOfMonthDate = new Date(tahunTarget, bulanTarget, 0);
      const endOfMonth = `${tahunTarget}-${String(bulanTarget).padStart(2, "0")}-${String(endOfMonthDate.getDate()).padStart(2, "0")}`;

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
        // FIX (Task 3.21): gunakan string DATEONLY-friendly
        const bulanInt = parseInt(bulan);
        const tahunInt = parseInt(tahun);
        const startOfMonth = `${tahunInt}-${String(bulanInt).padStart(2, "0")}-01`;
        const endOfMonthDate = new Date(tahunInt, bulanInt, 0);
        const endOfMonth = `${tahunInt}-${String(bulanInt).padStart(2, "0")}-${String(endOfMonthDate.getDate()).padStart(2, "0")}`;
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
    // FIX (Task 3.11): wrap update + create absensi dalam transaction
    // agar atomic (kalau 1 hari gagal insert, semua di-rollback).
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status, catatan_approval } = req.body;
      const approverId = req.user.id;

      if (!status || !["disetujui", "ditolak"].includes(status)) {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Status harus 'disetujui' atau 'ditolak'",
        });
      }

      const pengajuan = await PengajuanCutiModel.findByPk(id, { transaction });

      if (!pengajuan) {
        await transaction.rollback();
        return res.status(404).json({
          msg: "Pengajuan cuti tidak ditemukan",
        });
      }

      if (pengajuan.status !== "pending") {
        await transaction.rollback();
        return res.status(400).json({
          msg: "Pengajuan cuti sudah diproses sebelumnya",
        });
      }

      await pengajuan.update(
        {
          status: status,
          catatan_approval: catatan_approval || null,
          approved_by: approverId,
          approved_at: new Date(),
        },
        { transaction },
      );

      // Jika disetujui, otomatis buat record absensi untuk setiap hari cuti
      if (status === "disetujui") {
        const startDate = new Date(pengajuan.tanggal_mulai);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(pengajuan.tanggal_selesai);
        endDate.setHours(0, 0, 0, 0);
        const cutiRecords = [];
        const skippedRecords = [];
        const overwrittenRecords = [];

        // Loop dari tanggal mulai sampai tanggal selesai
        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + 1)
        ) {
          // FIX (Task 3.21): format YYYY-MM-DD lokal (tanpa UTC shift)
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          const tanggal = `${y}-${m}-${d}`;

          // Cek apakah sudah ada record absensi untuk tanggal tersebut
          const existingAbsensi = await AbsensiKaryawanModel.findOne({
            where: {
              karyawan_id: pengajuan.karyawan_id,
              tanggal: tanggal,
            },
            transaction,
          });

          if (!existingAbsensi) {
            cutiRecords.push({
              karyawan_id: pengajuan.karyawan_id,
              tanggal: tanggal,
              status: "cuti",
              keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
            });
          } else if (existingAbsensi.status === "masuk" || existingAbsensi.status === "terlambat") {
            // FIX (Task 3.12): JANGAN timpa record "masuk"/"terlambat" existing.
            // Karyawan sudah hadir; cuti approved terlambat, jadi kita
            // skip saja untuk tanggal tsb. Audit trail disimpan.
            skippedRecords.push({
              tanggal,
              existing_status: existingAbsensi.status,
              existing_jam_masuk: existingAbsensi.jam_masuk,
            });
          } else {
            // Status lain (izin/sakit/libur/dll): aman di-overwrite menjadi cuti
            await existingAbsensi.update(
              {
                status: "cuti",
                keterangan: `Cuti ${pengajuan.jenis_cuti}: ${pengajuan.alasan}`,
              },
              { transaction },
            );
            overwrittenRecords.push(tanggal);
          }
        }

        // Bulk create records cuti
        if (cutiRecords.length > 0) {
          await AbsensiKaryawanModel.bulkCreate(cutiRecords, { transaction });
        }

        console.log(
          `[Cuti ${id}] created=${cutiRecords.length} skipped=${skippedRecords.length} overwritten=${overwrittenRecords.length}`,
        );

        await transaction.commit();

        return res.status(200).json({
          msg: `Pengajuan cuti berhasil disetujui`,
          data: {
            ...pengajuan.toJSON(),
            absensi_summary: {
              created: cutiRecords.length,
              skipped_existing_attendance: skippedRecords,
              overwritten: overwrittenRecords,
            },
          },
        });
      }

      await transaction.commit();
      return res.status(200).json({
        msg: `Pengajuan cuti berhasil ditolak`,
        data: pengajuan,
      });
    } catch (error) {
      try {
        await transaction.rollback();
      } catch (rbErr) {
        console.error("Rollback gagal:", rbErr.message);
      }
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

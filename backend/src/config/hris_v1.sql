-- HRIS Sasya v2 - Clean SQL Baseline
-- Database: hris_v1
-- Engine: MySQL 8.0+
-- Charset: utf8mb4 / utf8mb4_unicode_ci

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;

-- --------------------------------------------------------
-- Tabel: m_users
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('hrd','karyawan') DEFAULT 'karyawan',
  `status` enum('aktif','tidak_aktif') DEFAULT 'aktif',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_m_users_username` (`username`),
  UNIQUE KEY `uniq_m_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_karyawan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `tanggal_masuk` date NOT NULL,
  `alamat` text NOT NULL,
  `department` varchar(255) DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `gaji_pokok` decimal(15,2) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_m_karyawan_user_id` (`user_id`),
  CONSTRAINT `fk_karyawan_user` FOREIGN KEY (`user_id`) REFERENCES `m_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: detail_face_karyawan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `detail_face_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `face_embedding` json NOT NULL,
  `face_image_url` varchar(255) DEFAULT NULL,
  `training_count` int NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_detail_face_karyawan_karyawan_id` (`karyawan_id`),
  CONSTRAINT `fk_detail_face_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_lokasi_perusahan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_lokasi_perusahan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama_perusahaan` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `radius_absen_meter` int NOT NULL DEFAULT 100,
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_absensi_karyawan
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_absensi_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal` date NOT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `status` enum('masuk','tidak_hadir','izin','sakit','libur','cuti','terlambat') NOT NULL DEFAULT 'tidak_hadir',
  `keterangan` varchar(255) DEFAULT NULL,
  `latitude_masuk` decimal(11,8) DEFAULT NULL,
  `latitude_keluar` decimal(11,8) DEFAULT NULL,
  `longitude_masuk` decimal(11,8) DEFAULT NULL,
  `longitude_keluar` decimal(11,8) DEFAULT NULL,
  `face_embedding_masuk` json DEFAULT NULL,
  `face_embedding_keluar` json DEFAULT NULL,
  `distance_masuk` decimal(8,2) DEFAULT NULL,
  `distance_keluar` decimal(8,2) DEFAULT NULL,
  `menit_terlambat` int DEFAULT NULL,
  `validasi_lokasi_masuk` tinyint(1) DEFAULT '0',
  `validasi_lokasi_keluar` tinyint(1) DEFAULT '0',
  `diabsen_oleh` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_manual` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_absensi_karyawan_tanggal` (`karyawan_id`, `tanggal`),
  KEY `idx_absensi_diabsen_oleh` (`diabsen_oleh`),
  CONSTRAINT `fk_absensi_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_absensi_diabsen_oleh` FOREIGN KEY (`diabsen_oleh`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: lembur
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lembur` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `total_jam` decimal(4,2) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `approved_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lembur_karyawan_id` (`karyawan_id`),
  KEY `idx_lembur_approved_by` (`approved_by`),
  CONSTRAINT `fk_lembur_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lembur_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_kuota_cuti
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_kuota_cuti` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bulan` int NOT NULL,
  `tahun` int NOT NULL,
  `total_hari_kerja` int NOT NULL DEFAULT 22,
  `kuota_cuti` int NOT NULL DEFAULT 7,
  `keterangan` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_m_kuota_cuti_bulan_tahun` (`bulan`, `tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_pengajuan_cuti
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_pengajuan_cuti` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `jumlah_hari` int NOT NULL,
  `jenis_cuti` enum('tahunan','sakit','melahirkan','penting','lainnya') NOT NULL DEFAULT 'tahunan',
  `alasan` text NOT NULL,
  `status` enum('pending','disetujui','ditolak') NOT NULL DEFAULT 'pending',
  `catatan_approval` text DEFAULT NULL,
  `approved_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pengajuan_cuti_karyawan_id` (`karyawan_id`),
  KEY `idx_pengajuan_cuti_approved_by` (`approved_by`),
  CONSTRAINT `fk_pengajuan_cuti_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_pengajuan_cuti_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_komponen_gaji
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_komponen_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama` varchar(255) NOT NULL,
  `tipe` enum('bonus','potongan') NOT NULL,
  `metode` enum('nominal','persentase','per_hari','per_jam') NOT NULL DEFAULT 'nominal',
  `nilai_default` decimal(15,2) NOT NULL DEFAULT 0,
  `keterangan` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_m_komponen_gaji_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_slip_gaji
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_slip_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bulan` int NOT NULL,
  `tahun` int NOT NULL,
  `total_hari_kerja` int NOT NULL DEFAULT 0,
  `total_hadir` int NOT NULL DEFAULT 0,
  `total_terlambat` int NOT NULL DEFAULT 0,
  `total_absen` int NOT NULL DEFAULT 0,
  `total_cuti` int NOT NULL DEFAULT 0,
  `total_lembur_jam` decimal(10,2) NOT NULL DEFAULT 0,
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT 0,
  `total_pendapatan` decimal(15,2) NOT NULL DEFAULT 0,
  `total_potongan` decimal(15,2) NOT NULL DEFAULT 0,
  `gaji_bersih` decimal(15,2) NOT NULL DEFAULT 0,
  `status` enum('draft','final') DEFAULT 'draft',
  `catatan` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_m_slip_gaji_karyawan_bulan_tahun` (`karyawan_id`, `bulan`, `tahun`),
  CONSTRAINT `fk_slip_gaji_karyawan` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_detail_slip_gaji
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_detail_slip_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `slip_gaji_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `komponen_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `nama_komponen` varchar(255) NOT NULL,
  `tipe` enum('bonus','potongan') NOT NULL,
  `nilai` decimal(15,2) NOT NULL DEFAULT 0,
  `keterangan` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_detail_slip_gaji_slip_id` (`slip_gaji_id`),
  KEY `idx_detail_slip_gaji_komponen_id` (`komponen_id`),
  CONSTRAINT `fk_detail_slip_gaji_slip` FOREIGN KEY (`slip_gaji_id`) REFERENCES `m_slip_gaji` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detail_slip_gaji_komponen` FOREIGN KEY (`komponen_id`) REFERENCES `m_komponen_gaji` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tabel: m_audit_log
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `m_audit_log` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `actor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `before` json DEFAULT NULL,
  `after` json DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_log_actor_id` (`actor_id`),
  KEY `idx_audit_log_entity` (`entity`, `entity_id`),
  KEY `idx_audit_log_created_at` (`createdAt`),
  CONSTRAINT `fk_audit_log_actor` FOREIGN KEY (`actor_id`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

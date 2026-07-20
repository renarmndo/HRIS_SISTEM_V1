-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 20 Jul 2026 pada 02.28
-- Versi server: 8.0.30
-- Versi PHP: 8.4.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `hris_final`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `detail_face_karyawan`
--

CREATE TABLE `detail_face_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `face_embedding` json NOT NULL,
  `face_image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `training_count` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `detail_face_karyawan`
--

INSERT INTO `detail_face_karyawan` (`id`, `karyawan_id`, `face_embedding`, `face_image_url`, `training_count`, `createdAt`, `updatedAt`) VALUES
('6d78a0cf-45be-4487-aece-12b43794f5a7', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '[-0.07558117344856463, -0.05019929396043524, 0.04392684928857146, 0.01654422457002762, 0.07507764818642801, -0.07349163695680588, 0.06126163151253347, 0.09573991494546225, 0.025169624837041216, 0.07634624792356845, -0.07624062598627275, -0.0743744642368745, -0.06711916730710862, 0.06873035106221903, -0.08731272389894609, 0.06177105985901446, 0.07478394513787298, 0.09458644182670586, 0.0877538881235567, -0.005687893743356653, -0.06326721534720092, 0.09996952193705674, -0.03639305815148171, 0.03964827322747508, -0.07192783949591688, 0.05863738901656698, -0.05597134076675612, 0.05021436690122533, 0.07064256988856774, 0.0013313199968766345, 0.05552848845678898, 0.01115850889469383, 0.019071455411371854, 0.06662887962657821, 0.014546796655919876, 0.04898221431216715, 0.07075316819709712, 0.08126157635192774, 0.050733779593347184, -0.024329631761059803, 0.0457340503699602, 0.090845922948759, -0.023164268153809897, -0.005810596177484542, -0.0628920505136327, -0.01795250783141822, 0.019511839608950577, -0.08841118820350446, -0.022232771883772193, -0.01781372982756771, -0.06826047579802026, -0.03157470021137865, 0.08200296384874092, -0.0021373329564581683, 0.04943569106481535, 0.05101337463448341, -0.004092001469650455, -0.004625302403635595, 0.008160079517493424, -0.0008322583006850071, 0.07573616695005461, 0.016667200186836456, -0.06727348898737029, 0.07053263061635939, 0.06600966191656538, 0.02753512086659432, -0.039949435403884515, -0.08775015172519283, 0.03903574817969102, -0.04179661377803712, -0.0349264465053708, 0.07676477390671685, -0.0901716055705899, 0.0868220569534911, -0.0025882811187704496, 0.006502726288676985, -0.04714656552734167, 0.043420612475037895, -0.032544478551160855, -0.0625716255820566, 0.004133486464385716, -0.030567861861659745, -0.028077304214003007, 0.07075855417717655, -0.009524346392293851, -0.06552313515127833, 0.03610761033850876, -0.0989449617164911, -0.07116650235604388, 0.02190980256815989, -0.009510259778199331, -0.09961974773172418, -0.049869890183003966, -0.032281825786049476, -0.012846673183531832, 0.07962975174252437, 0.0973217598109225, 0.0003154181963067326, 0.0000991818340459194, 0.06786737056459544, 0.07741567398516402, 0.09234344400259376, -0.07058517481122505, 0.0677596335469107, 0.045258219069937794, -0.03648599999969607, -0.005644880198702323, 0.09146272806414152, 0.043072825201153686, 0.039080952127803104, 0.07398907798949297, -0.026784439289704184, 0.06595433572376938, 0.0040055048639005275, -0.07422286405130363, -0.08054297592248164, 0.006664983986020362, 0.05344487019203631, -0.026306651277679324, -0.03339913347570289, 0.001419032620076227, -0.00911980562494022, -0.07614155010852619, 0.04179684814506607, 0.05454436374397939, -0.03993806277293646, 0.08693531513807057, 0.07022430644999889]', 'http://localhost:5000/uploads/faces/dummy_face_3.jpg', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('de65b480-9100-4550-9303-9cb56ebda939', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '[0.05525723231693333, -0.05519363158353683, -0.06454046196175744, 0.05417301221101031, 0.02029026614501787, 0.012976140920347712, -0.07054383337362297, -0.07258513958690793, 0.04123377077195198, 0.05951336286859035, -0.04520737540137261, 0.025641826806965945, -0.017364989294756022, 0.0814387352359455, -0.008584786487835408, -0.06768124807811624, 0.07667149887393498, 0.08851159161081043, 0.0999895792994058, -0.048798315297545504, 0.08760090603759485, 0.06049851149752225, 0.005151837671677886, 0.03633827915599505, -0.050340793324283054, 0.0006046073355964465, 0.01595251962909261, 0.04310068222930177, -0.0991142002508314, 0.049605322765839455, -0.04378655015872732, 0.0004860274572241474, 0.007843143993952209, 0.07458026016946726, 0.02448544000916139, -0.07186252138158018, -0.03857112024482621, 0.07216896328807684, -0.0003234880667519757, -0.06056209639100638, -0.09123036201655092, -0.04056457380595207, 0.08193747250298988, -0.016758065065942546, 0.003304982775912707, 0.04374307033558627, 0.0876212540900766, -0.03440992644221297, -0.06283589487337156, 0.09409188070179653, -0.07195768467885813, -0.002926190957929828, 0.07125967783638654, 0.06214993977715025, -0.09238803116410632, 0.0646762867437301, 0.028742444490975128, -0.055661265667135675, -0.056443699096255906, 0.01062079692213054, -0.09000070778840526, -0.02033791796884113, -0.041237613368030585, -0.05736726427861086, 0.0002684741418322867, 0.0636399365684378, 0.04722885911529964, -0.0688599516762378, 0.06521456919791149, -0.0483616658738, 0.04140704016947591, -0.08951718858884102, -0.08873236868268622, 0.011324275794891037, 0.009828783248079648, 0.013772572883660586, 0.011356915881760646, -0.09010922727152666, -0.02929008373681992, -0.059413971952684566, -0.08865322098457257, 0.03481775688857966, -0.0403738038363044, 0.02878945508075506, -0.02501526554642862, -0.09798867761267964, 0.009998317216376812, -0.04760685439131469, 0.01790841456397267, -0.061305811583883645, 0.08885501239825036, 0.0922947933984761, 0.059334964717630584, 0.035402073013156676, -0.0098261336044915, 0.08691292265554923, -0.09981845352713298, 0.05462992590966073, -0.07433467162327577, 0.03525970653525634, -0.043965249298042734, -0.028159363435279916, 0.08821162997225415, 0.08226187846970212, -0.0015615366738054026, -0.064847428006302, 0.09152979029705864, -0.04637485468219918, 0.057021748411037715, -0.055404813094462595, -0.04890678668805322, 0.0906757008642376, -0.00941722928370234, 0.011123848881071874, -0.08884501573337966, 0.09282582911372564, 0.04559119369852166, -0.02124774080882004, 0.0022345152023308945, 0.08973517611653095, -0.05126909479722004, 0.001369364325581282, 0.061936126733768165, 0.04352457459955725, 0.08260744971263476, 0.08414460921130815, -0.05395075744267357, -0.07374342659150224]', 'http://localhost:5000/uploads/faces/dummy_face_2.jpg', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('eed8983f-68ee-4375-a615-1948b00fccd2', '54d21af6-3503-45dc-8255-44646bf99f51', '[0.031303888644562294, -0.09511382224574104, -0.06460028857722638, 0.042029133323677526, -0.015623570558125646, 0.025929843726295365, 0.04466184266872694, -0.062442084398736025, 0.03624732860987817, 0.03636548975302592, -0.027902642206247524, 0.0014320719120764769, -0.031360517975472194, -0.04595182955949644, 0.04487876105290248, 0.054666047697480735, -0.02258658114595076, 0.04001989568051703, 0.010648950706841132, 0.06463458353086957, -0.01692382792960148, 0.030666664212762207, -0.035629567555500646, 0.03900015995016737, -0.08226230244788767, -0.06169458419594223, -0.02592650713492066, -0.03716799619307898, -0.016211261831882887, 0.04411679535806173, -0.006466969382252288, 0.02936125791954025, -0.01989384399322236, -0.05365779471567316, 0.013686723668328502, -0.06646507976353158, 0.01831295900954541, -0.07762847829194622, 0.01044304431990066, 0.007897975657766149, -0.04800547903417512, -0.005201466216244177, -0.0346560857746272, -0.07849521176437302, 0.08644456029991249, -0.013758716428346404, 0.05308585792909146, 0.06814309308895436, 0.0819037910653575, 0.05703010475867129, 0.027907336090392504, -0.04121007621022397, 0.053492025705357715, 0.0494360492097255, 0.020901152677717905, 0.04973174577457434, -0.07825619590078921, -0.07185589070612304, 0.06664144793696677, 0.09046969437266378, 0.03527048934681959, 0.06323591602030279, 0.02198693472340818, -0.051037906071325016, 0.048240274948968265, -0.05803433147822337, 0.03341052856253937, -0.049329522281452376, 0.02909804127663232, -0.008898721498177276, -0.060441973525668824, 0.021232387151031124, 0.08339484363739885, -0.012115931331075844, -0.0645991154410061, 0.04259440709448675, 0.05652428451460573, -0.07580446301547153, 0.021547133960666057, -0.08029700253793814, 0.09738899450930212, -0.055332711642844104, -0.03275874670762183, 0.00997702814365313, -0.02954546204046174, -0.0729618083276445, 0.05742255907582866, 0.00760634864268743, 0.07080444345387019, 0.07992445727024508, 0.03569084566684805, -0.0783309384837918, -0.07571090077799475, -0.02370733273705894, -0.0987029672507047, 0.014439986875038112, 0.09505933322941472, 0.09464398798972944, -0.0473128255480517, -0.09762612046980068, -0.094709127513941, 0.049216860085667835, 0.07670782451353586, 0.02719833832253532, -0.058846391334802274, 0.053489907276057375, -0.011723172651430414, 0.0587838768693601, 0.07466362456956815, -0.02686769280535549, 0.06026745579948997, -0.059829243660759146, 0.07263670290947274, -0.0389264432952164, 0.02069363674731964, -0.04652427284637713, 0.08906140773970389, 0.02090590440762105, -0.02167701576945029, -0.03972752805385585, -0.03846990096906342, -0.0416195562698237, -0.079618761089409, 0.06379255066103723, 0.00767558239250879, 0.04290299253733315, -0.024562755253998137, 0.03935669391863347]', 'http://localhost:5000/uploads/faces/dummy_face_1.jpg', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `lembur`
--

CREATE TABLE `lembur` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `total_jam` decimal(4,2) NOT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `approved_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lembur`
--

INSERT INTO `lembur` (`id`, `karyawan_id`, `tanggal`, `jam_mulai`, `jam_selesai`, `total_jam`, `keterangan`, `status`, `approved_by`, `approved_at`, `rejection_reason`, `createdAt`, `updatedAt`) VALUES
('0fb8786c-b2bb-42f9-a884-96d5f5cd7765', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-15', '18:00:00', '20:30:00', 2.50, 'Penyelesaian deployment sistem release v2.0', 'approved', '2a25f184-cc79-4c17-8cc7-852a80fbc5e0', '2026-07-20 09:27:20', NULL, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('b44c8f2f-efb6-46d0-86c9-908dfc6c643c', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-15', '18:00:00', '20:30:00', 2.50, 'Penyelesaian deployment sistem release v2.0', 'pending', NULL, NULL, NULL, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('fee1149c-4e82-4d91-b2dc-ab7ac154ddbb', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-15', '18:00:00', '20:30:00', 2.50, 'Penyelesaian deployment sistem release v2.0', 'rejected', NULL, NULL, 'Keterangan kurang spesifik', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_absensi_karyawan`
--

CREATE TABLE `m_absensi_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal` date NOT NULL,
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `status` enum('masuk','tidak_hadir','izin','sakit','libur','cuti','terlambat') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tidak_hadir',
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `diabsen_oleh` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'User ID HRD yang mengabsenkan manual',
  `is_manual` tinyint(1) DEFAULT '0' COMMENT 'True jika diabsen manual oleh HRD',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_absensi_karyawan`
--

INSERT INTO `m_absensi_karyawan` (`id`, `karyawan_id`, `tanggal`, `jam_masuk`, `jam_keluar`, `status`, `keterangan`, `latitude_masuk`, `latitude_keluar`, `longitude_masuk`, `longitude_keluar`, `face_embedding_masuk`, `face_embedding_keluar`, `distance_masuk`, `distance_keluar`, `menit_terlambat`, `validasi_lokasi_masuk`, `validasi_lokasi_keluar`, `diabsen_oleh`, `is_manual`, `createdAt`, `updatedAt`) VALUES
('00591399-553d-4050-9c28-d9252ff4ca8b', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-15', '08:18:00', '17:05:00', 'terlambat', 'Terlambat karena macet lalu lintas', -6.20857931, -6.20881880, 106.84564125, 106.84557907, NULL, NULL, 17.16, 8.23, 18, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('01321093-3510-4977-ae66-52f0386aca4f', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-13', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20888569, -6.20874664, 106.84575333, 106.84565156, NULL, NULL, 37.86, 14.57, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('0a8fcfa7-08e8-4fb3-abbe-3340f85af211', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-17', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20883639, -6.20896033, 106.84579716, 106.84573828, NULL, NULL, 13.07, 3.69, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('378b89f2-fc7c-4677-bef3-ce45a5db5f13', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-14', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20900505, -6.20861320, 106.84571191, 106.84566790, NULL, NULL, 29.23, 1.93, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('49decc86-b9a9-4e8a-a7de-2768023f6fc1', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-14', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20865604, -6.20872656, 106.84565085, 106.84537294, NULL, NULL, 33.01, 30.78, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('62ef012c-e449-4140-926a-84b3dd011760', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-16', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20856976, -6.20895593, 106.84538745, 106.84561305, NULL, NULL, 7.03, 34.86, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('7e290c0c-7d6e-4df5-a6ab-5819dea7b27b', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-17', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20901039, -6.20856156, 106.84557508, 106.84573128, NULL, NULL, 40.64, 27.97, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('86ecec0c-5fcc-4a4b-b9f0-000b1278e989', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-16', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20878121, -6.20864978, 106.84568987, 106.84554542, NULL, NULL, 0.79, 10.88, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('8c98c821-ea00-4989-9ebf-6eac5513ea2f', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-15', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20887757, -6.20881986, 106.84558849, 106.84566948, NULL, NULL, 38.53, 4.40, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('95e74099-4a67-4702-86a6-7e099c24cba9', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-13', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20899983, -6.20898200, 106.84537261, 106.84583968, NULL, NULL, 42.97, 31.31, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('b1698863-f376-4a0e-bdc0-cb45d5978fe8', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-17', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20873384, -6.20858547, 106.84573649, 106.84544697, NULL, NULL, 36.98, 30.85, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('cd9cc7a6-6ed7-48ee-9d30-ed7e5228dca4', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-07-16', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20893846, -6.20857872, 106.84573204, 106.84565434, NULL, NULL, 48.25, 33.15, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('d997cf71-8692-49e4-977e-615a2368e5e9', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-14', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20860676, -6.20862236, 106.84583875, 106.84558717, NULL, NULL, 36.37, 0.83, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('de601f9a-0eea-43df-87a8-ea9786185946', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-07-13', NULL, NULL, 'izin', 'Izin keperluan keluarga mendesak', -6.20903005, NULL, 106.84536890, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('ec7296b0-e960-4cf8-90c4-59c11d391d9a', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-07-15', '07:55:00', '17:05:00', 'masuk', 'Hadir tepat waktu', -6.20894911, -6.20902430, 106.84566799, 106.84568540, NULL, NULL, 47.18, 7.18, NULL, 1, 1, NULL, 0, '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_audit_log`
--

CREATE TABLE `m_audit_log` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `actor_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `actor_role` varchar(50) DEFAULT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `before` json DEFAULT NULL,
  `after` json DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_detail_slip_gaji`
--

CREATE TABLE `m_detail_slip_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `slip_gaji_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `komponen_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `nama_komponen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('bonus','potongan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nilai` decimal(15,2) NOT NULL DEFAULT '0.00',
  `keterangan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_detail_slip_gaji`
--

INSERT INTO `m_detail_slip_gaji` (`id`, `slip_gaji_id`, `komponen_id`, `nama_komponen`, `tipe`, `nilai`, `keterangan`, `createdAt`, `updatedAt`) VALUES
('0bbdc7f0-2de6-4030-91a8-34c02b2d1edf', '4ad1de1c-f842-47a4-bec0-f2dcf6eb9fdb', 'f380ec2b-e810-40df-9bb5-99c9116bff23', 'Potongan BPJS Kesehatan', 'potongan', 120000.00, 'Iuran BPJS Kesehatan bulanan', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('24dd022f-83a9-4e20-8a6b-777dda702780', 'aa3e47f1-b72e-42c3-847a-65ddb1bbe519', 'f380ec2b-e810-40df-9bb5-99c9116bff23', 'Potongan BPJS Kesehatan', 'potongan', 120000.00, 'Iuran BPJS Kesehatan bulanan', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('ddb4ce3a-c37b-46d7-a3ae-719343a13472', '4ad1de1c-f842-47a4-bec0-f2dcf6eb9fdb', 'db723a44-b3a8-4d7f-83d9-9496de4e00df', 'Tunjangan Transport', 'bonus', 350000.00, 'Tunjangan transport bulanan standard', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('e7ee1cac-8d7a-481a-891e-b064d04e0118', 'bf030bce-6fe9-4d12-b082-fb73d7f86c5c', 'db723a44-b3a8-4d7f-83d9-9496de4e00df', 'Tunjangan Transport', 'bonus', 350000.00, 'Tunjangan transport bulanan standard', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('ea38e0b3-0cc1-4fb5-9ad2-0043d489cd95', 'bf030bce-6fe9-4d12-b082-fb73d7f86c5c', 'f380ec2b-e810-40df-9bb5-99c9116bff23', 'Potongan BPJS Kesehatan', 'potongan', 120000.00, 'Iuran BPJS Kesehatan bulanan', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('f4e771cc-a767-4c1d-967e-0c13bd399daa', 'aa3e47f1-b72e-42c3-847a-65ddb1bbe519', 'db723a44-b3a8-4d7f-83d9-9496de4e00df', 'Tunjangan Transport', 'bonus', 350000.00, 'Tunjangan transport bulanan standard', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_karyawan`
--

CREATE TABLE `m_karyawan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama_lengkap` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal_masuk` date NOT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jabatan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gaji_pokok` decimal(15,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_karyawan`
--

INSERT INTO `m_karyawan` (`id`, `user_id`, `nama_lengkap`, `tanggal_masuk`, `alamat`, `department`, `jabatan`, `gaji_pokok`, `is_active`, `createdAt`, `updatedAt`) VALUES
('199d894d-e90d-46e5-8764-0c0a45a22b4e', '3ae76545-ab51-4b79-9fb2-cb0506774725', 'Karyawan Sari', '2025-01-11', 'Jl. Kemang Timur Raya No. 16, Jakarta Selatan', 'Software Engineering', 'Tech Lead', 5750000.00, 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('4d359dea-bc7e-4675-bfd6-35bf5290427e', '9bbb20e2-00dd-4848-aae9-91f1538890c2', 'Karyawan Wijaya', '2025-01-12', 'Jl. Kemang Timur Raya No. 17, Jakarta Selatan', 'Human Resource', 'HR Staff', 6500000.00, 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('54d21af6-3503-45dc-8255-44646bf99f51', '385cd762-d270-4384-8f95-b25ec0ae6dd7', 'Karyawan Pratama', '2025-01-10', 'Jl. Kemang Timur Raya No. 15, Jakarta Selatan', 'IT Support', 'Junior Support', 5000000.00, 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_komponen_gaji`
--

CREATE TABLE `m_komponen_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe` enum('bonus','potongan') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metode` enum('nominal','persentase','per_hari','per_jam') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'nominal',
  `nilai_default` decimal(15,2) NOT NULL DEFAULT '0.00',
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_komponen_gaji`
--

INSERT INTO `m_komponen_gaji` (`id`, `nama`, `tipe`, `metode`, `nilai_default`, `keterangan`, `is_active`, `createdAt`, `updatedAt`) VALUES
('028a03c0-aad1-424f-a366-a4d9aa9b6d4a', 'Potongan BPJS Ketenagakerjaan', 'potongan', 'nominal', 180000.00, 'Potongan iuran JHT BPJS Ketenagakerjaan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('4e4ac5c7-f446-4000-b45c-c44a987046c5', 'Potongan Absen Tanpa Kabar', 'potongan', 'nominal', 150000.00, 'Potongan tidak hadir tanpa keterangan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('54cd718f-b7cc-4405-aee5-324be3f40e69', 'Potongan PPh21 Pajak', 'potongan', 'nominal', 100000.00, 'Potongan estimasi pajak penghasilan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('72099c86-8903-489b-b30c-b0f34886a0d4', 'Potongan Keterlambatan', 'potongan', 'nominal', 50000.00, 'Potongan karena telat hadir', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('85c5390d-8a7c-462d-89c3-e4ac4a908133', 'Tunjangan Makan', 'bonus', 'nominal', 500000.00, 'Uang makan bulanan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('8f6ab337-d72d-40a3-b18c-f17e1069a850', 'Tunjangan Kesehatan', 'bonus', 'nominal', 300000.00, 'Tunjangan asuransi kesehatan mandiri', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('a80dc64e-3563-4e65-949c-16b9beaa825f', 'Insentif Kerajinan', 'bonus', 'nominal', 200000.00, 'Diberikan untuk yang tidak pernah absen', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('bb0bb768-3609-4ae3-a441-87621dc39a0d', 'Bonus Kinerja', 'bonus', 'nominal', 1500000.00, 'Apresiasi kinerja bulanan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('db723a44-b3a8-4d7f-83d9-9496de4e00df', 'Tunjangan Transport', 'bonus', 'nominal', 350000.00, 'Tunjangan biaya transport bulanan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('f380ec2b-e810-40df-9bb5-99c9116bff23', 'Potongan BPJS Kesehatan', 'potongan', 'nominal', 120000.00, 'Potongan iuran BPJS Kesehatan', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_kuota_cuti`
--

CREATE TABLE `m_kuota_cuti` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bulan` int NOT NULL,
  `tahun` int NOT NULL,
  `total_hari_kerja` int NOT NULL DEFAULT '22',
  `kuota_cuti` int NOT NULL DEFAULT '7',
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_kuota_cuti`
--

INSERT INTO `m_kuota_cuti` (`id`, `bulan`, `tahun`, `total_hari_kerja`, `kuota_cuti`, `keterangan`, `is_active`, `createdAt`, `updatedAt`) VALUES
('0b30bdff-79f2-4113-9d44-e995ec91c6e1', 1, 2026, 22, 2, 'Kuota cuti bulan Januari 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('0bb3b5ca-5870-41e9-83b7-4cfb3a69c194', 8, 2026, 22, 2, 'Kuota cuti bulan Agustus 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('1d0f7949-aa51-4192-89bf-7d2b901e8bca', 7, 2026, 22, 2, 'Kuota cuti bulan Juli 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('2f7b1026-a842-4988-96f8-eff8b87eb406', 2, 2026, 22, 2, 'Kuota cuti bulan Februari 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('65401acc-f697-4e75-96f0-93f614c6832f', 5, 2026, 22, 2, 'Kuota cuti bulan Mei 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('8abd07f8-f452-4dfb-967c-c73ef3b3ce9d', 4, 2026, 22, 2, 'Kuota cuti bulan April 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('9eb7f7a7-a3bb-4e40-977d-a1f8c65e1d41', 10, 2026, 22, 2, 'Kuota cuti bulan Oktober 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('b5439b8a-3254-4ed5-82b8-1a06f5f0061d', 6, 2026, 22, 2, 'Kuota cuti bulan Juni 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('f4cf20ae-ea15-4d1a-877c-513ebca3cd15', 3, 2026, 22, 2, 'Kuota cuti bulan Maret 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('fa06fc45-f1bb-4cda-b6a9-a24968d27381', 9, 2026, 22, 2, 'Kuota cuti bulan September 2026', 1, '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_lokasi_perusahan`
--

CREATE TABLE `m_lokasi_perusahan` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nama_perusahaan` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `radius_absen_meter` int NOT NULL DEFAULT '100',
  `jam_masuk` time DEFAULT NULL,
  `jam_keluar` time DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_lokasi_perusahan`
--

INSERT INTO `m_lokasi_perusahan` (`id`, `nama_perusahaan`, `latitude`, `longitude`, `radius_absen_meter`, `jam_masuk`, `jam_keluar`, `createdAt`, `updatedAt`) VALUES
('3623b0c2-96b0-4747-bd19-a200e3f34f69', 'Cabang Semarang', -6.96670000, 110.41670000, 100, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('405d7b02-4d91-41c5-a708-ed33ae140eab', 'Cabang Medan', 3.59520000, 98.67220000, 200, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('5427a1ea-e18b-4ffb-9f3c-d2155db06980', 'Cabang Palembang', -2.99090000, 104.75660000, 100, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('702460cf-2a8a-4fa6-b858-06480fa6573f', 'HQ Jakarta', -6.20880000, 106.84560000, 100, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('7e6f08f0-907e-4d49-85e9-91792ab781fd', 'Cabang Bandung', -6.91750000, 107.61910000, 150, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('8de44eae-c512-40af-90c7-4a6ee413831f', 'Cabang Yogyakarta', -7.79560000, 110.36950000, 120, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('c8d6b67b-024d-43b1-a676-cc2ac5a30e53', 'Cabang Bali', -8.67050000, 115.21260000, 150, '08:30:00', '17:30:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('ca64a998-8bd7-4f90-b834-42f63c1111ba', 'Cabang Balikpapan', -1.26540000, 116.83120000, 100, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('cc87521f-db20-45b5-83d2-e6afd9b71158', 'Cabang Makassar', -5.14770000, 119.43270000, 100, '08:00:00', '17:00:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('d106c108-1ad1-4e02-8ddf-347f09efc1ee', 'Cabang Surabaya', -7.25750000, 112.75210000, 100, '08:30:00', '17:30:00', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_pengajuan_cuti`
--

CREATE TABLE `m_pengajuan_cuti` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `jumlah_hari` int NOT NULL,
  `jenis_cuti` enum('tahunan','sakit','melahirkan','penting','lainnya') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'tahunan',
  `alasan` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','disetujui','ditolak') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `catatan_approval` text COLLATE utf8mb4_unicode_ci,
  `approved_by` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_pengajuan_cuti`
--

INSERT INTO `m_pengajuan_cuti` (`id`, `karyawan_id`, `tanggal_mulai`, `tanggal_selesai`, `jumlah_hari`, `jenis_cuti`, `alasan`, `status`, `catatan_approval`, `approved_by`, `approved_at`, `createdAt`, `updatedAt`) VALUES
('64273aa4-9d14-49d2-89ae-ee6cf7042785', '4d359dea-bc7e-4675-bfd6-35bf5290427e', '2026-08-10', '2026-08-12', 3, 'penting', 'Acara keluarga penting / pemeriksaan medis berkala', 'ditolak', 'SDM departemen sedang minim di tanggal tersebut', NULL, NULL, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('b72d78d3-9e3c-47b3-a5ab-e8c302589329', '54d21af6-3503-45dc-8255-44646bf99f51', '2026-08-10', '2026-08-12', 3, 'tahunan', 'Acara keluarga penting / pemeriksaan medis berkala', 'pending', NULL, NULL, NULL, '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('e7ffb1eb-e60c-4f6b-ae5f-2320750ba3c8', '199d894d-e90d-46e5-8764-0c0a45a22b4e', '2026-08-10', '2026-08-12', 3, 'sakit', 'Acara keluarga penting / pemeriksaan medis berkala', 'disetujui', 'Silakan serah terima pekerjaan sebelum cuti', '2a25f184-cc79-4c17-8cc7-852a80fbc5e0', '2026-07-20 09:27:20', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_slip_gaji`
--

CREATE TABLE `m_slip_gaji` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `karyawan_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `bulan` int NOT NULL,
  `tahun` int NOT NULL,
  `total_hari_kerja` int NOT NULL DEFAULT '0',
  `total_hadir` int NOT NULL DEFAULT '0',
  `total_terlambat` int NOT NULL DEFAULT '0',
  `total_absen` int NOT NULL DEFAULT '0',
  `total_cuti` int NOT NULL DEFAULT '0',
  `total_lembur_jam` decimal(10,2) NOT NULL DEFAULT '0.00',
  `gaji_pokok` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_pendapatan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `total_potongan` decimal(15,2) NOT NULL DEFAULT '0.00',
  `gaji_bersih` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('draft','final') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_slip_gaji`
--

INSERT INTO `m_slip_gaji` (`id`, `karyawan_id`, `bulan`, `tahun`, `total_hari_kerja`, `total_hadir`, `total_terlambat`, `total_absen`, `total_cuti`, `total_lembur_jam`, `gaji_pokok`, `total_pendapatan`, `total_potongan`, `gaji_bersih`, `status`, `catatan`, `createdAt`, `updatedAt`) VALUES
('4ad1de1c-f842-47a4-bec0-f2dcf6eb9fdb', '4d359dea-bc7e-4675-bfd6-35bf5290427e', 6, 2026, 22, 20, 1, 1, 0, 3.50, 6500000.00, 7350000.00, 300000.00, 7050000.00, 'final', 'Slip gaji bulan Juni 2026 untuk Karyawan Wijaya', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('aa3e47f1-b72e-42c3-847a-65ddb1bbe519', '54d21af6-3503-45dc-8255-44646bf99f51', 6, 2026, 22, 20, 1, 1, 0, 3.50, 5000000.00, 5850000.00, 300000.00, 5550000.00, 'final', 'Slip gaji bulan Juni 2026 untuk Karyawan Pratama', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('bf030bce-6fe9-4d12-b082-fb73d7f86c5c', '199d894d-e90d-46e5-8764-0c0a45a22b4e', 6, 2026, 22, 20, 1, 1, 0, 3.50, 5750000.00, 6600000.00, 300000.00, 6300000.00, 'draft', 'Slip gaji bulan Juni 2026 untuk Karyawan Sari', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `m_users`
--

CREATE TABLE `m_users` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('hrd','karyawan') COLLATE utf8mb4_unicode_ci DEFAULT 'karyawan',
  `status` enum('aktif','tidak_aktif') COLLATE utf8mb4_unicode_ci DEFAULT 'aktif',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `m_users`
--

INSERT INTO `m_users` (`id`, `username`, `email`, `password`, `role`, `status`, `createdAt`, `updatedAt`) VALUES
('2a25f184-cc79-4c17-8cc7-852a80fbc5e0', 'hrd_1', 'hrd1@company.com', '$argon2id$v=19$m=65536,t=3,p=4$h3Jl5Zosbpgfe+jpLisIJg$AW1821dTingVy2f/lkioRhuoJnSLxMHifkxlKQEokag', 'hrd', 'aktif', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('385cd762-d270-4384-8f95-b25ec0ae6dd7', 'karyawan_1', 'karyawan1@company.com', '$argon2id$v=19$m=65536,t=3,p=4$h3Jl5Zosbpgfe+jpLisIJg$AW1821dTingVy2f/lkioRhuoJnSLxMHifkxlKQEokag', 'karyawan', 'aktif', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('3ae76545-ab51-4b79-9fb2-cb0506774725', 'karyawan_2', 'karyawan2@company.com', '$argon2id$v=19$m=65536,t=3,p=4$h3Jl5Zosbpgfe+jpLisIJg$AW1821dTingVy2f/lkioRhuoJnSLxMHifkxlKQEokag', 'karyawan', 'aktif', '2026-07-20 09:27:20', '2026-07-20 09:27:20'),
('9bbb20e2-00dd-4848-aae9-91f1538890c2', 'karyawan_3', 'karyawan3@company.com', '$argon2id$v=19$m=65536,t=3,p=4$h3Jl5Zosbpgfe+jpLisIJg$AW1821dTingVy2f/lkioRhuoJnSLxMHifkxlKQEokag', 'karyawan', 'aktif', '2026-07-20 09:27:20', '2026-07-20 09:27:20');

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `detail_face_karyawan`
--
ALTER TABLE `detail_face_karyawan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `karyawan_id` (`karyawan_id`);

--
-- Indeks untuk tabel `lembur`
--
ALTER TABLE `lembur`
  ADD PRIMARY KEY (`id`),
  ADD KEY `karyawan_id` (`karyawan_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indeks untuk tabel `m_absensi_karyawan`
--
ALTER TABLE `m_absensi_karyawan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_absensi_karyawan_tanggal` (`karyawan_id`,`tanggal`),
  ADD KEY `diabsen_oleh` (`diabsen_oleh`);

--
-- Indeks untuk tabel `m_audit_log`
--
ALTER TABLE `m_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_actor_id` (`actor_id`),
  ADD KEY `idx_audit_log_entity` (`entity`,`entity_id`),
  ADD KEY `idx_audit_log_created_at` (`createdAt`);

--
-- Indeks untuk tabel `m_detail_slip_gaji`
--
ALTER TABLE `m_detail_slip_gaji`
  ADD PRIMARY KEY (`id`),
  ADD KEY `slip_gaji_id` (`slip_gaji_id`),
  ADD KEY `komponen_id` (`komponen_id`);

--
-- Indeks untuk tabel `m_karyawan`
--
ALTER TABLE `m_karyawan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `m_komponen_gaji`
--
ALTER TABLE `m_komponen_gaji`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indeks untuk tabel `m_kuota_cuti`
--
ALTER TABLE `m_kuota_cuti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `m_kuota_cuti_bulan_tahun` (`bulan`,`tahun`);

--
-- Indeks untuk tabel `m_lokasi_perusahan`
--
ALTER TABLE `m_lokasi_perusahan`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `m_pengajuan_cuti`
--
ALTER TABLE `m_pengajuan_cuti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `karyawan_id` (`karyawan_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indeks untuk tabel `m_slip_gaji`
--
ALTER TABLE `m_slip_gaji`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `m_slip_gaji_karyawan_id_bulan_tahun` (`karyawan_id`,`bulan`,`tahun`);

--
-- Indeks untuk tabel `m_users`
--
ALTER TABLE `m_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `detail_face_karyawan`
--
ALTER TABLE `detail_face_karyawan`
  ADD CONSTRAINT `detail_face_karyawan_ibfk_1` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lembur`
--
ALTER TABLE `lembur`
  ADD CONSTRAINT `lembur_ibfk_1` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lembur_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_absensi_karyawan`
--
ALTER TABLE `m_absensi_karyawan`
  ADD CONSTRAINT `m_absensi_karyawan_ibfk_1` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `m_absensi_karyawan_ibfk_2` FOREIGN KEY (`diabsen_oleh`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_audit_log`
--
ALTER TABLE `m_audit_log`
  ADD CONSTRAINT `fk_audit_log_actor` FOREIGN KEY (`actor_id`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_detail_slip_gaji`
--
ALTER TABLE `m_detail_slip_gaji`
  ADD CONSTRAINT `m_detail_slip_gaji_ibfk_1` FOREIGN KEY (`slip_gaji_id`) REFERENCES `m_slip_gaji` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `m_detail_slip_gaji_ibfk_2` FOREIGN KEY (`komponen_id`) REFERENCES `m_komponen_gaji` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_karyawan`
--
ALTER TABLE `m_karyawan`
  ADD CONSTRAINT `m_karyawan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `m_users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_pengajuan_cuti`
--
ALTER TABLE `m_pengajuan_cuti`
  ADD CONSTRAINT `m_pengajuan_cuti_ibfk_1` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `m_pengajuan_cuti_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `m_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `m_slip_gaji`
--
ALTER TABLE `m_slip_gaji`
  ADD CONSTRAINT `m_slip_gaji_ibfk_1` FOREIGN KEY (`karyawan_id`) REFERENCES `m_karyawan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

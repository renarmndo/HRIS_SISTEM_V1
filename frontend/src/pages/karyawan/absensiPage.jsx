import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Camera,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  TrendingUp,
  Award,
  ScanFace,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner"; // Pastikan install sonner atau ganti dengan library toast lain

// Hooks
import useAbsensiHook from "../../hooks/karyawan/useAbsensi.hook";
import useFaceAPI from "../../hooks/karyawan/useFaceapi.hook";

const AbsensiPage = () => {
  // --- STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());

  // State Kamera & Face API
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    lat: null,
    long: null,
  });
  const [locationError, setLocationError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // --- CUSTOM HOOKS ---
  const {
    handleAbsensiMasuk,
    absensiLoading: backendLoading,
    handleAbsensiKeluar,
    fetchDataAbsensi,
    absensiHariIni,
    fetchDataAbsensiHariIni,
    absensiMasuk,
  } = useAbsensiHook();

  const {
    modelLoaded,
    isLoading: faceApiLoading,
    loadModels,
    detectFace,
  } = useFaceAPI();

  const employeeData = {
    name: "Dimas Adiputra",
    isInRadius: true,
    todayCheckOut: null,
  };

  // --- USE EFFECTS ---

  // 1. Jam Digital
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Load Model FaceAPI
  useEffect(() => {
    const initModel = async () => {
      if (!modelLoaded && !faceApiLoading) {
        try {
          await loadModels();
        } catch (error) {
          console.error("Model load error:", error);
          toast.error("Gagal memuat model wajah");
        }
      }
    };
    initModel();
  }, [loadModels, modelLoaded, faceApiLoading]);

  // 3. Ambil Lokasi Saat Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error location:", error);
          setLocationError("Gagal mengambil lokasi. Pastikan GPS aktif.");
        }
      );
    } else {
      setLocationError("Browser tidak mendukung Geolocation.");
    }

    // Cleanup kamera saat unmount
    return () => stopCamera();
  }, []);

  // 4. Attach Stream ke Video
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch((e) => console.error(e));
    }
  }, [isCameraActive]);

  // --- FORMATTERS ---
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(currentTime);

  // --- CAMERA & FACE LOGIC ---

  const startCamera = async () => {
    if (!modelLoaded) {
      toast.warning("Tunggu sebentar, model AI sedang dimuat...");
      return;
    }

    try {
      setIsVideoReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      startScanningFace();
    } catch (err) {
      toast.error("Gagal akses kamera: " + err.message);
    }
  };

  const startCameraKeluar = async () => {
    if (!modelLoaded) {
      toast.warning("Tunggu sebentar, model AI sedang dimuat...");
      return;
    }

    try {
      setIsVideoReady(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);

      startScanningFaceKeluar();
    } catch (err) {
      toast.error("Gagal akses kamera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setIsDetecting(false);
    setIsVideoReady(false);
    setIsProcessing(false);
  };

  const startScanningFace = () => {
    setIsDetecting(true);
    let attempts = 0;
    const maxAttempts = 60; // 30 detik (jika interval 500ms)

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      attempts++;

      if (
        !videoRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended ||
        !modelLoaded
      ) {
        return;
      }

      try {
        // Deteksi wajah
        const result = await detectFace(videoRef.current);

        if (result && result.descriptor) {
          // WAJAH DITEMUKAN -> STOP SCAN & KIRIM DATA
          clearInterval(scanIntervalRef.current);

          await processAbsensi(result.descriptor);
        } else if (attempts >= maxAttempts) {
          // TIMEOUT
          clearInterval(scanIntervalRef.current);
          stopCamera();
        }
      } catch (error) {
        console.error("Detection error", error);
      }
    }, 500);
  };

  const processAbsensi = async (faceDescriptor) => {
    setIsProcessing(true);
    // Persiapan Payload sesuai Controller
    const payload = {
      face_embedding_masuk: Array.from(faceDescriptor), // Konversi Float32Array ke Array biasa
      latitude_masuk: currentLocation.lat,
      longitude_masuk: currentLocation.long,
    };

    try {
      // Panggil Hook API Absen Masuk
      await handleAbsensiMasuk(payload);
      stopCamera();
    } catch (error) {
      console.error("Gagal Absen:", error);
      setIsProcessing(false);
      stopCamera();
    }
  };

  const startScanningFaceKeluar = () => {
    setIsDetecting(true);
    let attempts = 0;
    const maxAttempts = 60; // 30 detik (jika interval 500ms)

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      attempts++;

      if (
        !videoRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended ||
        !modelLoaded
      ) {
        return;
      }

      try {
        // Deteksi wajah
        const result = await detectFace(videoRef.current);

        if (result && result.descriptor) {
          // WAJAH DITEMUKAN -> STOP SCAN & KIRIM DATA
          clearInterval(scanIntervalRef.current);

          await absensiKeluar(result.descriptor);
        } else if (attempts >= maxAttempts) {
          // TIMEOUT
          clearInterval(scanIntervalRef.current);
          stopCamera();
        }
      } catch (error) {
        console.error("Detection error", error);
      }
    }, 500);
  };

  const absensiKeluar = async (faceDescriptor) => {
    setIsProcessing(true);
    const payload = {
      face_embedding_keluar: Array.from(faceDescriptor), // Konversi Float32Array ke Array biasa
      latitude_keluar: currentLocation.lat,
      longitude_keluar: currentLocation.long,
    };

    try {
      await handleAbsensiKeluar(payload);
      stopCamera();
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      stopCamera();
    }
  };

  // --- UI HANDLERS ---
  const handleKlikAbsenMasuk = () => {
    if (!employeeData.isInRadius && locationError) {
      toast.error("Anda berada di luar jangkauan atau GPS mati.");
      return;
    }
    startCamera();
  };

  const handleKlikAbsenKeluar = () => {
    if (!employeeData.isInRadius && locationError) {
      toast.error("Anda Berada diluar jangkauan atau GPS tidak diaktifkan");
      return;
    }
    startCameraKeluar(); // Perbaikan: memanggil startCameraKeluar
  };

  useEffect(() => {
    fetchDataAbsensiHariIni();
  }, []);

  useEffect(() => {
    fetchDataAbsensi();
  }, []);

  // --- HITUNGAN STATUS KEHADIRAN ---
  const calculateAttendanceStatus = () => {
    if (!absensiHariIni?.checkIn) {
      return { status: "belum_absen", minutesLate: 0, message: "" };
    }

    // Ambil jam masuk dari absensiHariIni
    const checkInTime = new Date(absensiHariIni.checkIn);
    const jamMasuk = checkInTime.getHours();
    const menitMasuk = checkInTime.getMinutes();

    // Ambil jam sekarang
    const now = new Date();
    const jamSekarang = now.getHours();
    const menitSekarang = now.getMinutes();

    // Hitung selisih menit
    let totalMenitMasuk = jamMasuk * 60 + menitMasuk;
    let totalMenitSekarang = jamSekarang * 60 + menitSekarang;
    let selisihMenit = totalMenitSekarang - totalMenitMasuk;

    // Asumsi jam masuk normal adalah 08:00 (480 menit)
    const jamMasukNormal = 8 * 60; // 08:00 = 480 menit
    let menitTerlambat = totalMenitMasuk - jamMasukNormal;

    if (menitTerlambat < 0) menitTerlambat = 0; // Tidak terlambat jika masuk lebih awal

    return {
      status: menitTerlambat > 0 ? "terlambat" : "tepat_waktu",
      minutesLate: menitTerlambat,
      message:
        menitTerlambat > 0
          ? `Anda datang ${menitTerlambat} menit terlambat dari jam yang ditentukan.`
          : "Anda hadir tepat waktu hari ini.",
    };
  };

  const formatLateMinutes = (minutes) => {
    if (!minutes || minutes <= 0) return "Tepat waktu";

    const jam = Math.floor(minutes / 60);
    const menit = minutes % 60;

    return `${jam} jam ${menit} menit`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Dashboard Absensi
          </h1>
          <p className="text-gray-500 text-sm">Scan Wajah anda disini</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1">
          {/* Left Column - Camera & Actions */}
          <div className="lg:col-span-2 space-y-3">
            {/* Camera Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <ScanFace size={18} className="text-gray-600" />
                    Verifikasi Kehadiran
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Posisikan wajah Anda di tengah area pemindaian
                  </p>
                </div>

                {/* Indikator Status Face API */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${
                      modelLoaded
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}
                  >
                    AI: {modelLoaded ? "Ready" : "Loading"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Camera Preview Area */}
                <div className="mb-4">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video max-w-full mx-auto shadow-inner ring-1 ring-gray-200">
                    {/* KONDISI 1: KAMERA MATI (Placeholder) */}
                    {!isCameraActive && (
                      <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
                        <Camera size={56} className="text-gray-600 mb-3" />
                        <p className="text-gray-400 text-sm font-medium">
                          Kamera Nonaktif
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Klik tombol absen untuk memulai
                        </p>
                      </div>
                    )}

                    {/* KONDISI 2: KAMERA HIDUP (Video Stream) */}
                    {isCameraActive && (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
                          onPlaying={() => setIsVideoReady(true)}
                        />

                        {/* Overlay Scanning Animation */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div
                            className={`w-48 h-60 border-2 rounded-2xl transition-all duration-300 ${
                              isDetecting
                                ? "border-[#00b4dd] animate-pulse shadow-[0_0_20px_rgba(0,180,221,0.5)]"
                                : "border-white/30"
                            }`}
                          >
                            {isDetecting && (
                              <div className="absolute top-0 left-0 w-full h-1 bg-[#00b4dd]/80 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 z-10">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isDetecting
                            ? "bg-green-500 animate-pulse"
                            : isCameraActive
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {isDetecting
                        ? "Memindai Wajah..."
                        : isProcessing
                        ? "Mengirim Data..."
                        : backendLoading
                        ? "Mengirim Data..."
                        : isCameraActive
                        ? "Mencari Wajah"
                        : "Kamera Off"}
                    </div>

                    {/* Time Display Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
                      <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-lg inline-block border border-white/10">
                        <p className="text-2xl font-mono font-bold tracking-wider">
                          {formattedTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Status */}
                <div className="mb-4">
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      employeeData.isInRadius
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          employeeData.isInRadius
                            ? "bg-white text-green-600"
                            : "bg-white text-red-500"
                        }`}
                      >
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-0.5">
                          Status Lokasi
                        </p>
                        <p className="text-sm font-semibold text-gray-700">
                          {employeeData.isInRadius
                            ? "✓ Kantor Pusat"
                            : "✗ Di Luar Jangkauan"}
                        </p>
                        {/* Debug Lokasi (Optional) */}
                        <p className="text-[10px] text-gray-400 mt-1">
                          Lat: {currentLocation.lat?.toFixed(4)}, Long:{" "}
                          {currentLocation.long?.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Jarak</p>
                      <p
                        className={`text-lg font-bold ${
                          employeeData.isInRadius
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {employeeData.distance}m
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* TOMBOL ABSEN MASUK */}
                  <button
                    onClick={handleKlikAbsenMasuk}
                    disabled={
                      !employeeData.isInRadius ||
                      isCameraActive ||
                      backendLoading ||
                      !modelLoaded ||
                      employeeData.todayCheckIn ||
                      isProcessing
                    }
                    className="py-4 bg-[#00b4dd] text-white font-semibold rounded-lg hover:bg-[#0099cc] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]"
                  >
                    {backendLoading || isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Memproses...
                      </>
                    ) : isDetecting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} />
                        {employeeData.todayCheckIn
                          ? "Sudah Absen Masuk"
                          : "Absen Masuk"}
                      </>
                    )}
                  </button>

                  {/* TOMBOL BATAL (Muncul hanya saat kamera aktif) */}
                  {isCameraActive && (
                    <button
                      onClick={stopCamera}
                      className="col-span-2 py-2 mt-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle size={18} /> Batalkan Scan
                    </button>
                  )}

                  {/* TOMBOL ABSEN KELUAR */}
                  {!isCameraActive && (
                    <button
                      onClick={handleKlikAbsenKeluar}
                      disabled={
                        !absensiMasuk?.kantor?.radius ||
                        isCameraActive ||
                        !absensiHariIni?.checkIn ||
                        absensiHariIni?.checkOut ||
                        isProcessing
                      }
                      className="py-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <LogOut size={18} />
                          {absensiHariIni?.checkOut
                            ? "Sudah Absen Keluar"
                            : "Absen Keluar"}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Panduan Singkat */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-xs text-blue-800 font-medium mb-1">
                    💡 Tips Absensi
                  </p>
                  <ul className="text-xs text-blue-700 space-y-0.5 list-disc pl-4">
                    <li>Pastikan GPS aktif dan diizinkan browser</li>
                    <li>Wajah harus terlihat jelas (tanpa masker)</li>
                    <li>Jaga jarak wajah dengan kamera (sekitar 30-50cm)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 space-y-6">
          {/* Today's Attendance Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-gray-600" />
                Absensi Hari Ini
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {/* Check In Info */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  absensiHariIni?.checkIn
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      absensiHariIni?.checkIn ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <LogIn
                      size={18}
                      className={
                        absensiHariIni?.checkIn
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Jam Masuk
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {absensiHariIni?.checkIn || "Belum Presensi"}
                    </p>
                  </div>
                </div>
                {absensiHariIni?.checkIn && (
                  <CheckCircle2 size={20} className="text-green-500" />
                )}
              </div>

              {/* Check Out Info */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  absensiHariIni?.checkOut
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      absensiHariIni?.checkOut ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <LogOut
                      size={18}
                      className={
                        absensiHariIni?.checkOut
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">
                      Jam Keluar
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {absensiHariIni?.checkOut || "Belum Presensi"}
                    </p>
                  </div>
                </div>
                {absensiHariIni?.checkOut && (
                  <CheckCircle2 size={20} className="text-blue-500" />
                )}
              </div>
            </div>
          </div>

          {/* --- STATUS KETERANGAN ABSENSI (Baru) --- */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-4">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-gray-600" />
                Status Kehadiran
              </h3>
            </div>

            <div className="p-4">
              {/* KONDISI 1: Belum Melakukan Absen Masuk */}
              {!absensiMasuk?.hariIni?.checkIn ? (
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <div className="inline-flex p-3 bg-gray-100 rounded-full mb-3 text-gray-400">
                    <Clock size={24} />
                  </div>
                  <h4 className="text-gray-900 font-medium text-sm">
                    Belum Ada Data
                  </h4>
                  <p className="text-gray-500 text-xs mt-1">
                    Silakan lakukan absen masuk terlebih dahulu untuk melihat
                    status kehadiran Anda hari ini.
                  </p>
                </div>
              ) : (
                <>
                  {/* Logic Variable (Bisa ditaruh di atas return, tapi disini agar mudah dicopy) */}
                  {(() => {
                    const lateMinutes = absensiMasuk?.hariIni?.lateMinutes || 0;
                    const isLate = lateMinutes > 0;
                    const jam = Math.floor(lateMinutes / 60);
                    const menit = lateMinutes % 60;

                    return (
                      <div
                        className={`rounded-xl p-5 border flex items-start gap-4 transition-all ${
                          isLate
                            ? "bg-amber-50 border-amber-200" // Style Terlambat
                            : "bg-green-50 border-green-200" // Style Tepat Waktu
                        }`}
                      >
                        {/* Icon Kiri */}
                        <div
                          className={`p-3 rounded-full flex-shrink-0 ${
                            isLate
                              ? "bg-amber-100 text-amber-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {isLate ? (
                            <AlertCircle size={24} />
                          ) : (
                            <CheckCircle2 size={24} />
                          )}
                        </div>

                        {/* Text Kanan */}
                        <div className="flex-1">
                          <p
                            className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                              isLate ? "text-amber-600" : "text-green-600"
                            }`}
                          >
                            {isLate ? "Terlambat" : "Tepat Waktu"}
                          </p>

                          <h4
                            className={`text-xl font-bold ${
                              isLate ? "text-gray-800" : "text-gray-800"
                            }`}
                          >
                            {isLate
                              ? `${formatLateMinutes(lateMinutes)}`
                              : "Disiplin Sangat Baik"}
                          </h4>

                          <p
                            className={`text-sm mt-1 leading-snug ${
                              isLate ? "text-amber-800" : "text-green-800"
                            }`}
                          >
                            {isLate
                              ? "Anda datang terlambat dari jam yang ditentukan. Mohon perbaiki kehadiran Anda esok hari."
                              : "Terima kasih telah hadir tepat waktu hari ini. Pertahankan kinerja Anda!"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Styles for Animation */}
      <style>{`
        @keyframes scan {
          0% { top: 0; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default AbsensiPage;

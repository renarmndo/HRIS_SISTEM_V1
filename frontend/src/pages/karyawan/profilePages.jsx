import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import useProfile from "../../hooks/karyawan/profile.hook";
import useFaceProfile from "../../hooks/karyawan/useFaceProfile";
import useFaceAPI from "../../hooks/karyawan/useFaceapi.hook";
import {
  Camera,
  User,
  Building,
  Briefcase,
  CheckCircle,
  Edit3,
  Save,
  X,
  Trash2,
  Shield,
  Activity,
  Eye,
  Key,
  RefreshCw,
  Clock,
  Calendar,
  Loader2,
  ScanFace, // Icon visualisasi scan
} from "lucide-react";

export default function ProfilePages() {
  // --- STATE MANAGEMENT ---
  const [isEditing, setIsEditing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // STATE PENTING: Menandakan video sudah siap render frame
  const [isVideoReady, setIsVideoReady] = useState(false);

  const [capturedImage, setCapturedImage] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState(null); // 'scanning', 'success', 'no_face', 'error'
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- REFS ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // --- CUSTOM HOOKS ---
  const {
    loading,
    fetchProfile,
    profile,
    fetchEditProfile,
    fetchCreateProfile,
  } = useProfile();

  const { faceProfile, fetchProfileFace, saveFaceProfile, hasFaceProfile } =
    useFaceProfile();

  const {
    modelLoaded,
    isLoading: faceAPILoading,
    loadModels,
    detectFace,
  } = useFaceAPI();

  const [formData, setFormData] = useState({
    nama_lengkap: "",
    alamat: "",
  });

  // 1. Load Model FaceAPI
  useEffect(() => {
    const initModel = async () => {
      if (!modelLoaded && !faceAPILoading) {
        try {
          await loadModels();
        } catch (error) {
          console.error("Model load error:", error);
        }
      }
    };
    initModel();
  }, [loadModels, modelLoaded, faceAPILoading]);

  // 2. Initialize Data Profil
  useEffect(() => {
    fetchProfile();
    fetchProfileFace();

    // Cleanup saat halaman ditutup
    return () => stopCamera();
  }, []);

  // 3. Update Form Data
  useEffect(() => {
    if (profile) {
      setFormData({
        nama_lengkap: profile.nama_lengkap || "",
        alamat: profile.alamat || "",
      });
    }
  }, [profile]);

  // 4. Attach Stream ke Video Element (PERBAIKAN UTAMA VIEW KAMERA)
  useEffect(() => {
    if (isCapturing && videoRef.current && streamRef.current) {
      console.log("Attaching stream...");
      videoRef.current.srcObject = streamRef.current;

      // Kita panggil play, tapi state isVideoReady dihandle oleh event listener di JSX
      videoRef.current.play().catch((e) => {
        console.error("Error playing video:", e);
      });
    }
  }, [isCapturing]);

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    try {
      setIsVideoReady(false); // Reset status ready

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Browser tidak mendukung kamera");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsCapturing(true); // Ini akan memicu useEffect no.4

      // Reset state scan
      setFaceDetectionStatus(null);
      setCapturedImage(null);
      setFaceDescriptor(null);
    } catch (error) {
      console.error("Error start camera:", error);
      toast.error("Gagal akses kamera: " + error.message);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
    setIsDetecting(false);
    setIsVideoReady(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Sesuaikan ukuran canvas dengan video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");

      // Flip horizontal (mirror effect) agar sesuai preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);

      ctx.drawImage(video, 0, 0);
      setCapturedImage(canvas.toDataURL("image/jpeg"));
    }
  };

  // --- LOGIKA SCANNING WAJAH ---
  const handleScanFace = async () => {
    // Validasi: Pastikan kamera benar-benar siap
    if (!videoRef.current || !isVideoReady) {
      toast.warning("Tunggu sebentar, kamera sedang memuat...");
      return;
    }

    if (!modelLoaded) {
      toast.error("Model AI belum siap. Coba refresh halaman.");
      return;
    }

    setIsDetecting(true);
    setFaceDetectionStatus("scanning");
    toast.info("Tahan posisi wajah, sedang memindai...");

    let attempts = 0;
    const maxAttempts = 20; // +- 10 detik

    // Bersihkan interval lama jika ada
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      attempts++;

      // Cek apakah video masih berjalan
      if (
        !videoRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended
      ) {
        return;
      }

      try {
        const result = await detectFace(videoRef.current);

        if (result && result.descriptor) {
          // WAJAH DITEMUKAN
          clearInterval(scanIntervalRef.current);

          setFaceDescriptor(result.descriptor);
          setFaceDetectionStatus("success");
          toast.success("Wajah berhasil dipindai!");

          captureSnapshot();
          stopCamera();
        } else if (attempts >= maxAttempts) {
          // TIMEOUT
          clearInterval(scanIntervalRef.current);
          setFaceDetectionStatus("no_face");
          toast.warning("Wajah tidak terdeteksi. Pastikan pencahayaan cukup.");
          setIsDetecting(false);
        }
      } catch (error) {
        console.error("Scan error:", error);
        clearInterval(scanIntervalRef.current);
        setFaceDetectionStatus("error");
        setIsDetecting(false);
      }
    }, 500); // Scan setiap 500ms
  };

  const handleSaveOrUpdate = async () => {
    if (!faceDescriptor) return toast.error("Data wajah kosong");

    try {
      setIsSaving(true);

      // CUKUP PANGGIL HOOK LANGSUNG
      // Hook yang akan mengurus konversi Array.from() dan payload { face_embedding: ... }
      if (hasFaceProfile()) {
        await saveFaceProfile(faceDescriptor);
        toast.success("Data wajah diperbarui!");
      } else {
        await saveFaceProfile(faceDescriptor);
        toast.success("Wajah berhasil didaftarkan!");
      }
    } catch (e) {
      console.error(e);
      // Toast error sudah dihandle di dalam hook, jadi optional di sini
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (profile && profile.id) {
        await fetchEditProfile(formData);
      } else {
        await fetchCreateProfile(formData);
      }
      setIsEditing(false);
    } catch (error) {
      toast.error("Gagal menyimpan profil");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Profil Karyawan
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola data pribadi dan pengaturan pengenalan wajah
          </p>
        </div>

        <div className="space-y-6">
          {/* Bagian Kamera */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <ScanFace size={18} className="text-gray-600" />
                    Registrasi Wajah
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Scan wajah Anda untuk keperluan absensi
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    hasFaceProfile()
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {hasFaceProfile() ? (
                    <CheckCircle size={12} />
                  ) : (
                    <Eye size={12} />
                  )}
                  {hasFaceProfile() ? "Terverifikasi" : "Belum Terdaftar"}
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Area Kamera / Preview */}
              <div className="mb-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video max-w-md mx-auto shadow-inner">
                  {isCapturing ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        // EVENT LISTENERS PENTING UNTUK STATE BUTTON
                        onLoadedMetadata={() => {
                          console.log("Video metadata loaded");
                          setIsVideoReady(true);
                        }}
                        onPlaying={() => setIsVideoReady(true)}
                        className="w-full h-full object-cover"
                        style={{ transform: "scaleX(-1)" }} // Efek cermin
                      />

                      {/* Overlay Animasi Scanning */}
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

                      {/* Status Badge di atas video */}
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDetecting
                              ? "bg-green-500 animate-pulse"
                              : isVideoReady
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        {isDetecting
                          ? "Memindai Wajah..."
                          : isVideoReady
                          ? "Kamera Siap"
                          : "Loading..."}
                      </div>
                    </>
                  ) : (
                    // Tampilan saat kamera mati atau sudah ada hasil scan
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      {capturedImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={capturedImage}
                            alt="Hasil Scan"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="bg-green-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md shadow-lg">
                              <CheckCircle size={18} />
                              <span className="text-sm font-bold">
                                Scan Berhasil
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="w-16 h-16 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                            <ScanFace size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-300 text-sm font-medium mb-1">
                            {hasFaceProfile()
                              ? "Wajah Terdaftar"
                              : "Belum Ada Data Wajah"}
                          </p>
                          <p className="text-gray-400 text-xs max-w-[200px] mx-auto">
                            Klik tombol di bawah untuk memulai pemindaian wajah.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              {/* Kontrol Tombol */}
              <div className="space-y-3 max-w-md mx-auto">
                {!isCapturing ? (
                  // Tombol Kondisi Awal (Kamera Mati)
                  <button
                    onClick={startCamera}
                    disabled={faceAPILoading || !modelLoaded}
                    className="w-full py-3 bg-[#00b4dd] text-white font-medium rounded-lg hover:bg-[#0099cc] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-[0.98]"
                  >
                    {faceAPILoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Memuat Model AI...
                      </>
                    ) : (
                      <>
                        <Camera size={18} />
                        {hasFaceProfile()
                          ? "Perbarui Data Wajah"
                          : "Mulai Registrasi Wajah"}
                      </>
                    )}
                  </button>
                ) : (
                  // Tombol Kondisi Kamera Hidup
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={handleScanFace}
                      // DISABLED JIKA DETECTING ATAU VIDEO BELUM READY
                      disabled={isDetecting || !isVideoReady}
                      className={`w-full py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md ${
                        isDetecting || !isVideoReady
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-[#00b4dd] text-white hover:bg-[#0099cc]"
                      }`}
                    >
                      {isDetecting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sedang Memindai...
                        </>
                      ) : !isVideoReady ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Menunggu Kamera...
                        </>
                      ) : (
                        <>
                          <ScanFace size={18} />
                          Scan Wajah Sekarang
                        </>
                      )}
                    </button>

                    <button
                      onClick={stopCamera}
                      className="w-full py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <X size={16} />
                      Batal
                    </button>
                  </div>
                )}

                {/* Tombol Simpan (Muncul setelah berhasil scan) */}
                {capturedImage && !isCapturing && faceDescriptor && (
                  <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                      onClick={handleSaveOrUpdate}
                      disabled={isSaving}
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-green-500/30"
                    >
                      {isSaving ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      {isSaving
                        ? "Menyimpan Data..."
                        : hasFaceProfile()
                        ? "Simpan Perubahan"
                        : "Simpan Wajah"}
                    </button>

                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        setFaceDescriptor(null);
                        setFaceDetectionStatus(null);
                        startCamera(); // Scan ulang
                      }}
                      className="w-full mt-2 py-2 text-gray-500 text-xs hover:text-gray-700 underline"
                    >
                      Scan Ulang
                    </button>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Status Model AI</span>
                  <span
                    className={`text-xs font-semibold ${
                      modelLoaded ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {modelLoaded ? "Siap Digunakan" : "Memuat..."}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-500">Status Deteksi</span>
                  <span
                    className={`text-xs font-semibold ${
                      faceDetectionStatus === "success"
                        ? "text-green-600"
                        : faceDetectionStatus === "scanning"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {faceDetectionStatus === "success"
                      ? "Berhasil"
                      : faceDetectionStatus === "scanning"
                      ? "Memindai..."
                      : "Menunggu"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bagian Data Diri (Formulir) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <User size={18} /> Data Pribadi
                    </h2>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateProfile}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#00b4dd] text-white rounded-lg text-sm hover:bg-[#0099cc]"
                      >
                        <Save size={14} /> Simpan
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-2 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {loading || !profile ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin text-[#00b4dd]" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Form Inputs */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama Lengkap
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="nama_lengkap"
                            value={formData.nama_lengkap}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:border-[#00b4dd] outline-none"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-100">
                            {profile.nama_lengkap}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alamat
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:border-[#00b4dd] outline-none"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-100">
                            {profile.alamat}
                          </div>
                        )}
                      </div>

                      {/* Info Readonly Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                            <Building size={12} /> Departemen
                          </div>
                          <div className="text-sm font-medium">
                            {profile.departement}
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                          <div className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                            <Briefcase size={12} /> Jabatan
                          </div>
                          <div className="text-sm font-medium">
                            {profile.jabatan}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Kanan (Statistik & Info) */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Shield size={14} /> Status Akun
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500 text-xs">Keaktifan</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        profile?.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profile?.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2 pt-1">
                    <span className="text-gray-500 text-xs">Bergabung</span>
                    <span className="text-xs font-medium">
                      {profile?.tanggal_masuk
                        ? new Date(profile.tanggal_masuk).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Key size={14} /> Panduan Scan
                </h3>
                <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
                  <li>
                    Pastikan wajah terlihat jelas dan tidak tertutup
                    masker/kacamata hitam.
                  </li>
                  <li>Pencahayaan ruangan harus cukup terang.</li>
                  <li>Posisikan wajah di tengah area kotak pemindaian.</li>
                  <li>Tunggu hingga sistem memberikan konfirmasi berhasil.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tambahan style animasi scan */}
      <style>{`
        @keyframes scan {
            0% { top: 0; opacity: 0.8; }
            50% { top: 100%; opacity: 0.8; }
            100% { top: 0; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import useProfile from "../../hooks/karyawan/profile.hook";
import useFaceProfile from "../../hooks/karyawan/useFaceProfile";
import useFaceAPI from "../../hooks/karyawan/useFaceapi.hook";
import * as faceapi from "face-api.js";
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
  ScanFace,
  MapPin, // Icon for address
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
  const [stableCount, setStableCount] = useState(0);

  // --- REFS ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
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

  // Helper: Cek apakah data pribadi sudah lengkap
  const isProfileComplete = () => {
    return profile?.nama_lengkap && profile?.alamat;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const startCamera = async () => {
    // Validasi: Pastikan data pribadi sudah lengkap
    if (!isProfileComplete()) {
      toast.error("Harap lengkapi data pribadi Anda terlebih dahulu", {
        duration: 3000,
        id: "face-profile-incomplete",
        description: "Isi Nama Lengkap dan Alamat sebelum registrasi wajah",
      });
      return;
    }

    try {
      setIsVideoReady(false); // Reset status ready

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Browser tidak mendukung kamera", { id: "camera-error" });
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
      toast.error("Gagal akses kamera: " + error.message, {
        id: "camera-error",
      });
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
    setStableCount(0); // Reset progress stabilisasi

    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext("2d");
      ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    }
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
      toast.warning("Tunggu sebentar, kamera sedang memuat...", {
        id: "face-scan",
      });
      return;
    }

    if (!modelLoaded) {
      toast.error("Model AI belum siap. Coba refresh halaman.", {
        id: "face-scan",
      });
      return;
    }

    setIsDetecting(true);
    setStableCount(0);
    setFaceDetectionStatus("scanning");
    toast.info("Tahan posisi wajah, sedang memindai...", { id: "face-scan" });

    let attempts = 0;
    const maxAttempts = 100; // 30 detik (jika interval 300ms)
    let localStableCount = 0;

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

        if (result) {
          // --- DRAW LANDMARKS ---
          if (overlayRef.current && videoRef.current) {
            const displaySize = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            };
            faceapi.matchDimensions(overlayRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(result.rawDetection, displaySize);
            const ctx = overlayRef.current.getContext('2d');
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
            faceapi.draw.drawDetections(overlayRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(overlayRef.current, resizedDetections);
          }

          if (result.hasMask) {
            localStableCount = 0;
            setStableCount(0);
            toast.warning("Masker terdeteksi! Silakan lepas masker Anda sebelum meregistrasi wajah.", {
              id: "profile-face-scan-warning",
              duration: 2000,
            });
            return;
          }
          if (result.hasGlasses) {
            localStableCount = 0;
            setStableCount(0);
            toast.warning("Kacamata terdeteksi! Silakan lepas kacamata Anda sebelum meregistrasi wajah.", {
              id: "profile-face-scan-warning",
              duration: 2000,
            });
            return;
          }

          // Hapus warning jika wajah bersih
          toast.dismiss("profile-face-scan-warning");

          if (result.descriptor) {
            localStableCount++;
            setStableCount(localStableCount);

            if (localStableCount >= 4) {
              // WAJAH STABIL -> SELESAI
              clearInterval(scanIntervalRef.current);

              setFaceDescriptor(result.descriptor);
              setFaceDetectionStatus("success");
              toast.success("Wajah berhasil dipindai!", { id: "face-scan" });

              captureSnapshot();
              // Delay penutupan kamera agar user bisa melihat status sukses
              setTimeout(() => {
                stopCamera();
              }, 1500);
            }
          } else {
            localStableCount = 0;
            setStableCount(0);
          }
        } else {
          localStableCount = 0;
          setStableCount(0);
          if (overlayRef.current) {
            const ctx = overlayRef.current.getContext('2d');
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
          }
          if (attempts >= maxAttempts) {
            // TIMEOUT
            clearInterval(scanIntervalRef.current);
            setFaceDetectionStatus("no_face");
            toast.warning("Wajah tidak terdeteksi. Pastikan pencahayaan cukup.", {
              id: "face-scan",
            });
            setIsDetecting(false);
          }
        }
      } catch (error) {
        console.error("Scan error:", error);
        clearInterval(scanIntervalRef.current);
        setFaceDetectionStatus("error");
        setIsDetecting(false);
      }
    }, 300); // Scan setiap 300ms
  };

  const handleSaveOrUpdate = async () => {
    if (!faceDescriptor)
      return toast.error("Data wajah kosong", { id: "face-register" });

    try {
      setIsSaving(true);

      // CUKUP PANGGIL HOOK LANGSUNG
      // Hook yang akan mengurus konversi Array.from() dan payload { face_embedding: ... }
      // Toast sudah dihandle di dalam hook, tidak perlu toast di sini
      await saveFaceProfile(faceDescriptor);
    } catch (e) {
      console.error(e);
      // Toast error sudah dihandle di dalam hook
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
      <div className="max-w-7xl mx-auto">
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
          {/* Bagian Registrasi Wajah - Centered Top */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#00b4dd]/10 flex items-center justify-center">
                    <ScanFace size={20} className="text-[#00b4dd]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Registrasi Wajah
                    </h2>
                    <p className="text-xs text-gray-500">
                      Scan wajah Anda untuk keperluan absensi
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 ${
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

            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                {/* Warning jika data pribadi belum lengkap */}
                {!isProfileComplete() && (
                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <ScanFace size={16} className="text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 text-sm mb-1">
                          Data Pribadi Belum Lengkap
                        </h4>
                        <p className="text-xs text-amber-700 mb-2">
                          Harap lengkapi <strong>Nama Lengkap</strong> dan{" "}
                          <strong>Alamat</strong> Anda di bagian{" "}
                          <em>"Informasi Karyawan"</em> di bawah sebelum
                          melakukan registrasi wajah.
                        </p>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            // Scroll ke bagian form
                            setTimeout(() => {
                              document
                                .querySelector('[name="nama_lengkap"]')
                                ?.focus();
                            }, 100);
                          }}
                          className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
                        >
                          Lengkapi Data Sekarang →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Camera Preview - Centered */}
                <div className="mb-4">
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video shadow-inner">
                    {isCapturing ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          onLoadedMetadata={() => {
                            console.log("Video metadata loaded");
                            setIsVideoReady(true);
                          }}
                          onPlaying={() => setIsVideoReady(true)}
                          className="w-full h-full object-cover"
                          style={{ transform: "scaleX(-1)" }}
                        />

                        <canvas
                          ref={overlayRef}
                          className="absolute inset-0 w-full h-full"
                          style={{ transform: "scaleX(-1)" }}
                        />

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

                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2">
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
                            ? stableCount > 0
                              ? `Menyelaraskan (${stableCount * 25}%)...`
                              : "Memindai Wajah..."
                            : isVideoReady
                              ? "Kamera Siap"
                              : "Loading..."}
                        </div>
                      </>
                    ) : (
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
                          <div className="text-center p-6">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                              <ScanFace size={40} className="text-gray-400" />
                            </div>
                            <p className="text-gray-300 text-base font-medium mb-1">
                              {hasFaceProfile()
                                ? "Wajah Terdaftar"
                                : "Belum Ada Data Wajah"}
                            </p>
                            <p className="text-gray-500 text-sm">
                              Klik tombol di bawah untuk memulai pemindaian
                              wajah
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </div>

                {/* Controls - Centered */}
                <div className="space-y-3">
                  {!isCapturing ? (
                    <button
                      onClick={startCamera}
                      disabled={
                        faceAPILoading || !modelLoaded || !isProfileComplete()
                      }
                      className="w-full py-3 bg-[#00b4dd] text-white font-semibold rounded-lg hover:bg-[#0099cc] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {faceAPILoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Memuat Model AI...
                        </>
                      ) : !isProfileComplete() ? (
                        <>
                          <Camera size={18} />
                          Lengkapi Data Pribadi Terlebih Dahulu
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
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleScanFace}
                        disabled={isDetecting || !isVideoReady}
                        className={`w-full py-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md ${
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

                  {capturedImage && !isCapturing && faceDescriptor && (
                    <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <button
                        onClick={handleSaveOrUpdate}
                        disabled={isSaving}
                        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-sm shadow-lg"
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
                          startCamera();
                        }}
                        className="w-full mt-2 py-2 text-gray-500 text-sm hover:text-gray-700 hover:underline"
                      >
                        Scan Ulang
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Grid */}
                <div className="mt-5 pt-4 border-t border-gray-200 grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Status Model AI
                    </p>
                    <p
                      className={`text-sm font-bold ${modelLoaded ? "text-green-600" : "text-red-500"}`}
                    >
                      {modelLoaded ? "✓ Siap Digunakan" : "Memuat..."}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status Deteksi</p>
                    <p
                      className={`text-sm font-bold ${
                        faceDetectionStatus === "success"
                          ? "text-green-600"
                          : faceDetectionStatus === "scanning"
                            ? "text-blue-600"
                            : "text-gray-600"
                      }`}
                    >
                      {faceDetectionStatus === "success"
                        ? "✓ Berhasil"
                        : faceDetectionStatus === "scanning"
                          ? "Memindai..."
                          : "Menunggu"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Panduan - Below controls */}
              <div className="max-w-2xl mx-auto mt-6 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Key size={16} className="text-amber-600" /> Panduan Scan
                  Wajah
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-none">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>
                      Pastikan wajah terlihat jelas dan tidak tertutup masker
                      atau kacamata hitam
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>
                      Pencahayaan ruangan harus cukup terang untuk hasil optimal
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>Posisikan wajah di tengah area kotak pemindaian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>
                      Tunggu hingga sistem memberikan konfirmasi berhasil
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bagian Data Pribadi - Full Width Below */}
          <div className="bg-gradient-to-br from-[#00b4dd]/5 to-white rounded-lg border border-[#00b4dd]/20 shadow-sm">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User size={20} className="text-[#00b4dd]" /> Informasi
                  Karyawan
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Data pribadi dan informasi kepegawaian
                </p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-[#00b4dd] text-[#00b4dd] rounded-lg text-sm hover:bg-[#00b4dd] hover:text-white transition-all"
                >
                  <Edit3 size={14} /> Edit Profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00b4dd] text-white rounded-lg text-sm hover:bg-[#0099cc] transition-all shadow-sm"
                  >
                    <Save size={14} /> Simpan
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-6">
              {loading || !profile ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-[#00b4dd]" size={32} />
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Nama Lengkap */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <User size={12} /> Nama Lengkap
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nama_lengkap"
                          value={formData.nama_lengkap}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#00b4dd] focus:ring-2 focus:ring-[#00b4dd]/20 outline-none transition-all"
                          placeholder="Masukkan nama lengkap"
                        />
                      ) : (
                        <div className="px-4 py-2.5 bg-white rounded-lg text-sm text-gray-900 border border-gray-200 font-medium">
                          {profile.nama_lengkap || "-"}
                        </div>
                      )}
                    </div>

                    {/* Departemen */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Building size={12} /> Departemen
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100 font-medium">
                        {profile.department || "-"}
                      </div>
                    </div>

                    {/* Jabatan */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Briefcase size={12} /> Jabatan
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100 font-medium">
                        {profile.jabatan || "-"}
                      </div>
                    </div>

                    {/* Alamat - Spans 2 columns */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <MapPin size={12} /> Alamat
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="alamat"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-[#00b4dd] focus:ring-2 focus:ring-[#00b4dd]/20 outline-none transition-all"
                          placeholder="Masukkan alamat lengkap"
                        />
                      ) : (
                        <div className="px-4 py-2.5 bg-white rounded-lg text-sm text-gray-900 border border-gray-200">
                          {profile.alamat || "-"}
                        </div>
                      )}
                    </div>

                    {/* Tanggal Bergabung */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Calendar size={12} /> Tanggal Bergabung
                      </label>
                      <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border border-gray-100 font-medium">
                        {profile.tanggal_masuk
                          ? new Date(profile.tanggal_masuk).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Activity size={14} /> Status Kepegawaian
                      </span>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                          profile?.is_active
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        <CheckCircle size={14} />
                        {profile?.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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

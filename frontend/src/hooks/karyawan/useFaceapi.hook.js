import * as faceapi from "face-api.js";
import { useState, useCallback, useRef } from "react";

// Helper untuk menghitung deviasi standar intensitas abu-abu (grayscale) dari piksel
function getGrayscaleStdDev(pixels) {
  let sum = 0;
  const count = pixels.length / 4;
  if (count === 0) return 0;

  const grays = new Float32Array(count);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grays[i / 4] = gray;
    sum += gray;
  }

  const mean = sum / count;
  let varianceSum = 0;
  for (let i = 0; i < count; i++) {
    varianceSum += Math.pow(grays[i] - mean, 2);
  }

  return Math.sqrt(varianceSum / count);
}

// Helper untuk menganalisis adanya masker dan kacamata secara adaptif
function detectOcclusions(landmarks, videoElement) {
  try {
    const width = videoElement.videoWidth || videoElement.width;
    const height = videoElement.videoHeight || videoElement.height;
    if (!width || !height) {
      return { hasMask: false, hasGlasses: false, details: { mouthStdDev: 0, bridgeStdDev: 0 } };
    }

    // Buat canvas off-screen untuk ekstraksi piksel
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, width, height);

    const mouth = landmarks.getMouth();
    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const jaw = landmarks.getJawOutline();

    // 1. DETEKSI MASKER (Variansi warna pada area mulut)
    const mouthXs = mouth.map(p => p.x);
    const mouthYs = mouth.map(p => p.y);
    const minMouthX = Math.max(0, Math.min(...mouthXs));
    const maxMouthX = Math.min(width, Math.max(...mouthXs));
    const minMouthY = Math.max(0, Math.min(...mouthYs));
    const maxMouthY = Math.min(height, Math.max(...mouthYs));
    const mouthW = Math.round(maxMouthX - minMouthX);
    const mouthH = Math.round(maxMouthY - minMouthY);

    let mouthStdDev = 0;
    if (mouthW > 0 && mouthH > 0) {
      const mouthData = ctx.getImageData(minMouthX, minMouthY, mouthW, mouthH);
      mouthStdDev = getGrayscaleStdDev(mouthData.data);
    }

    // 2. DETEKSI KACAMATA (Variansi warna jembatan hidung di antara kedua mata)
    // Titik sudut dalam mata kiri (leftEye[3] = index 39)
    // Titik sudut dalam mata kanan (rightEye[0] = index 42)
    // Titik atas hidung (nose[0] = index 27)
    const p39 = leftEye[3];
    const p42 = rightEye[0];
    const p27 = nose[0];

    const bridgeMinX = Math.max(0, Math.min(p39.x, p42.x));
    const bridgeMaxX = Math.min(width, Math.max(p39.x, p42.x));
    const bridgeMinY = Math.max(0, Math.round(p27.y - (Math.max(p39.y, p42.y) - p27.y) * 0.5));
    const bridgeMaxY = Math.min(height, Math.round(Math.max(p39.y, p42.y) + 2));
    const bridgeW = Math.round(bridgeMaxX - bridgeMinX);
    const bridgeH = Math.round(bridgeMaxY - bridgeMinY);

    let bridgeStdDev = 0;
    if (bridgeW > 0 && bridgeH > 0) {
      const bridgeData = ctx.getImageData(bridgeMinX, bridgeMinY, bridgeW, bridgeH);
      bridgeStdDev = getGrayscaleStdDev(bridgeData.data);
    }

    // 3. Ekstraksi area control kulit (forehead dan kedua pipi) untuk kalibrasi pencahayaan
    // Forehead patch
    const foreheadX = Math.round((p39.x + p42.x) / 2);
    const foreheadY = Math.max(0, Math.round(p27.y - 15));
    let foreheadStdDev = 999;
    if (foreheadX > 6 && foreheadY > 6) {
      const data = ctx.getImageData(foreheadX - 6, foreheadY - 6, 12, 12);
      foreheadStdDev = getGrayscaleStdDev(data.data);
    }

    // Left Cheek patch
    const leftCheekX = Math.round((p39.x + jaw[4].x) / 2);
    const leftCheekY = Math.round(nose[4].y);
    let leftCheekStdDev = 999;
    if (leftCheekX > 6 && leftCheekY > 6 && leftCheekX < width && leftCheekY < height) {
      const data = ctx.getImageData(leftCheekX - 6, leftCheekY - 6, 12, 12);
      leftCheekStdDev = getGrayscaleStdDev(data.data);
    }

    // Right Cheek patch
    const rightCheekX = Math.round((p42.x + jaw[12].x) / 2);
    const rightCheekY = Math.round(nose[4].y);
    let rightCheekStdDev = 999;
    if (rightCheekX > 6 && rightCheekY > 6 && rightCheekX < width && rightCheekY < height) {
      const data = ctx.getImageData(rightCheekX - 6, rightCheekY - 6, 12, 12);
      rightCheekStdDev = getGrayscaleStdDev(data.data);
    }

    // Ambil kontrol kulit terbaik (variansi terkecil untuk hindari rambut/bayangan/aksesoris)
    const controlStdDev = Math.max(1.5, Math.min(foreheadStdDev, leftCheekStdDev, rightCheekStdDev));

    const mouthRatio = mouthStdDev / controlStdDev;
    const bridgeRatio = bridgeStdDev / controlStdDev;

    // KETENTUAN MASKER:
    // - Secara absolut: standard deviasi mulut sangat rendah (< 7.5)
    // - Secara relatif: standard deviasi mulut mendekati kulit control (ratio < 1.25) di pencahayaan normal
    const hasMask = mouthStdDev < 7.5 || (mouthStdDev < 10.0 && mouthRatio < 1.25);

    // KETENTUAN KACAMATA:
    // - Secara absolut: jembatan hidung sangat kontras (> 14.5)
    // - Secara relatif: jembatan hidung memiliki variasi jauh lebih tinggi dari kulit control (ratio > 2.0)
    const hasGlasses = bridgeStdDev > 14.5 || (bridgeStdDev > 11.0 && bridgeRatio > 2.0);

    return {
      hasMask,
      hasGlasses,
      details: { mouthStdDev, bridgeStdDev, controlStdDev, mouthRatio, bridgeRatio }
    };
  } catch (err) {
    console.error("Error in detectOcclusions:", err);
    return { hasMask: false, hasGlasses: false, details: { mouthStdDev: 0, bridgeStdDev: 0 } };
  }
}

export default function useFaceAPI() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const modelsLoadedRef = useRef(false);

  const loadModels = useCallback(async () => {
    if (modelsLoadedRef.current) {
      console.log("Models already loaded, skipping...");
      setModelLoaded(true);
      return;
    }

    console.log("Starting to load FaceAPI models...");
    setIsLoading(true);
    setError(null);

    try {
      const MODEL_URL = "/models";
      console.log("Loading models from:", MODEL_URL);

      console.log("Loading ssdMobilenetv1...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      console.log("ssdMobilenetv1 loaded");

      console.log("Loading faceLandmark68Net...");
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log("faceLandmark68Net loaded");

      console.log("Loading faceRecognitionNet...");
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("faceRecognitionNet loaded");

      modelsLoadedRef.current = true;
      setModelLoaded(true);
      console.log("✅ All FaceAPI models loaded successfully");
    } catch (err) {
      console.error("❌ Error loading FaceAPI models:", err);
      setError(`Gagal memuat model: ${err.message}`);
      setModelLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectFace = useCallback(
    async (videoElement) => {
      if (!modelLoaded || !videoElement) {
        console.warn("Model not loaded or video element missing");
        return null;
      }

      try {
        // Gunakan SsdMobilenetv1Options untuk akurasi maksimal
        const detection = await faceapi
          .detectSingleFace(
            videoElement,
            new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.75, // Ambang deteksi wajah yang solid
            }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          const { width, height } = detection.detection.box;
          const minFaceSize = 80;

          if (width < minFaceSize || height < minFaceSize) {
            console.log(
              `⚠️ Face too small: ${Math.round(width)}x${Math.round(height)}px (min: ${minFaceSize}px)`,
            );
            return null;
          }

          const score = detection.detection.score;
          if (score < 0.75) {
            console.log(`⚠️ Low confidence: ${(score * 100).toFixed(1)}%`);
            return null;
          }

          // Cek penutup wajah (masker & kacamata)
          const occlusions = detectOcclusions(detection.landmarks, videoElement);

          console.log(
            `✅ Face detected: ${Math.round(width)}x${Math.round(height)}px, confidence: ${(score * 100).toFixed(1)}%, mask: ${occlusions.hasMask}, glasses: ${occlusions.hasGlasses}`
          );

          return {
            descriptor: detection.descriptor,
            detection: detection.detection,
            landmarks: detection.landmarks,
            hasMask: occlusions.hasMask,
            hasGlasses: occlusions.hasGlasses,
            details: occlusions.details,
          };
        }

        return null;
      } catch (err) {
        console.error("❌ Error detecting face:", err);
        return null;
      }
    },
    [modelLoaded],
  );

  return {
    modelLoaded,
    isLoading,
    error,
    loadModels,
    detectFace,
  };
}

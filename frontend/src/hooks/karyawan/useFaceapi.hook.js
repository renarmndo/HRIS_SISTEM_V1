import * as faceapi from "face-api.js";
import { useState, useCallback, useRef } from "react";

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
      // Pastikan model path benar
      const MODEL_URL = "/models"; // atau process.env.PUBLIC_URL + "/models"
      console.log("Loading models from:", MODEL_URL);

      // Load models satu per satu untuk debugging
      console.log("Loading tinyFaceDetector...");
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log("tinyFaceDetector loaded");

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
      // Tetap set loaded untuk melanjutkan tanpa FaceAPI
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
        // Tidak set loading untuk mencegah flicker
        const detection = await faceapi
          .detectSingleFace(
            videoElement,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416, // Lebih besar = lebih akurat
              scoreThreshold: 0.7, // Lebih tinggi = lebih ketat
            }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          // Validasi ukuran wajah - minimal 100x100 px untuk memastikan wajah cukup dekat
          const { width, height } = detection.detection.box;
          const minFaceSize = 80; // Ukuran minimal wajah dalam pixel

          if (width < minFaceSize || height < minFaceSize) {
            console.log(
              `⚠️ Face too small: ${Math.round(width)}x${Math.round(height)}px (min: ${minFaceSize}px)`,
            );
            return null;
          }

          // Validasi confidence score
          const score = detection.detection.score;
          if (score < 0.75) {
            console.log(`⚠️ Low confidence: ${(score * 100).toFixed(1)}%`);
            return null;
          }

          console.log(
            `✅ Face detected: ${Math.round(width)}x${Math.round(height)}px, confidence: ${(score * 100).toFixed(1)}%`,
          );
          return {
            descriptor: detection.descriptor,
            detection: detection.detection,
            landmarks: detection.landmarks,
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

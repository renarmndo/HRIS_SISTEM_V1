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
        setIsLoading(true);

        const detection = await faceapi
          .detectSingleFace(
            videoElement,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.5,
            })
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          console.log("✅ Face detected successfully");
          return {
            descriptor: detection.descriptor,
            detection: detection.detection,
            landmarks: detection.landmarks,
          };
        }

        console.log("❌ No face detected");
        return null;
      } catch (err) {
        console.error("❌ Error detecting face:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [modelLoaded]
  );

  return {
    modelLoaded,
    isLoading,
    error,
    loadModels,
    detectFace,
  };
}

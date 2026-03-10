"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, SwitchCamera, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  const startCamera = useCallback(async (facing: "environment" | "user") => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setStarting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Could not access camera. Please check your permissions.");
      }
    } finally {
      setStarting(false);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    const newFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacing);
    setCapturedImage(null);
    startCamera(newFacing);
  };

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror if using front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/jpeg", 0.85));
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.85
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </button>
        <span className="text-sm font-medium text-white">Take Photo</span>
        <button
          type="button"
          onClick={handleSwitchCamera}
          className="rounded-full p-2 text-white hover:bg-white/20"
          disabled={!!capturedImage || starting}
        >
          <SwitchCamera className="h-6 w-6" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <Camera className="h-12 w-12 text-white/50" />
            <p className="text-white/80 text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startCamera(facingMode)}
              className="text-white border-white/30 bg-white/10 hover:bg-white/20"
            >
              Retry
            </Button>
          </div>
        ) : starting ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <span className="text-sm text-white/70">Starting camera...</span>
          </div>
        ) : null}

        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${
            capturedImage || error || starting ? "hidden" : ""
          } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
        />

        {capturedImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Captured"
            className="h-full w-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-8 bg-black/80 px-4 py-6">
        {capturedImage ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRetake}
              className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              Retake
            </Button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-colors"
            >
              <Check className="h-8 w-8" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSnap}
            disabled={starting || !!error}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 text-white shadow-lg hover:bg-white/30 transition-colors disabled:opacity-40"
          >
            <div className="h-12 w-12 rounded-full bg-white" />
          </button>
        )}
      </div>
    </div>
  );
}

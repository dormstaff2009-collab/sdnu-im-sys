import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'ถ่ายภาพครุภัณฑ์'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Start Camera
  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('ไม่สามารถเปิดใช้งานกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้องในเบราว์เซอร์ของคุณ หรือใช้วิธีอัปโหลดไฟล์รูปภาพ');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    // Stop video preview stream while reviewing captured photo
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[320px] relative">
          {cameraError ? (
            <div className="text-center p-6 text-white max-w-xs space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-200">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full flex items-center justify-center">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="max-h-[340px] w-auto rounded-lg object-contain shadow-lg"
              />
              <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[11px] px-2 py-0.5 rounded shadow">
                บันทึกภาพแล้ว
              </div>
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[340px] object-cover rounded-lg"
              />
              {/* Camera Grid Lines Guide */}
              <div className="absolute inset-0 border border-white/20 rounded-lg pointer-events-none grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-r border-b border-white/10"></div>
                <div className="border-b border-white/10"></div>
              </div>

              {/* Switch Camera Button */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition"
                title="สลับกล้องหน้า/หลัง"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            ยกเลิก
          </button>

          {capturedImage ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ถ่ายใหม่</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-xs transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>ใช้ภาพนี้</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!!cameraError}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>กดชัตเตอร์</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

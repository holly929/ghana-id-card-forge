
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  children: React.ReactNode;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCapture, children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera for selfies
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    onPhotoCapture(photoDataUrl);
    handleClose();
    toast.success('Photo captured successfully!');
  }, [onPhotoCapture]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    setIsOpen(false);
    setIsCapturing(false);
  }, [stopCamera]);

  const switchCamera = useCallback(async () => {
    if (stream) {
      stopCamera();
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: stream.getVideoTracks()[0].getSettings().facingMode === 'user' ? 'environment' : 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (error) {
        console.error('Error switching camera:', error);
        toast.error('Unable to switch camera.');
      }
    }
  }, [stream, stopCamera]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => open ? handleOpen() : handleClose()}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take Photo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
          
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={switchCamera}
              disabled={!stream}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={capturePhoto}
              disabled={!stream}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Capture Photo
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCapture;

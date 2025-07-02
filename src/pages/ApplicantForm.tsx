// ...existing imports...
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Add this if you have a Popover component

// ...inside ApplicantForm component...

const [showCamera, setShowCamera] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);
const [cameraLoading, setCameraLoading] = useState(false);

const openCamera = async () => {
  setShowCamera(true);
  setCameraLoading(true);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  } catch (err) {
    toast.error("Unable to access camera");
    setShowCamera(false);
  } finally {
    setCameraLoading(false);
  }
};

const closeCamera = () => {
  setShowCamera(false);
  if (videoRef.current && videoRef.current.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
  }
};

const capturePhoto = async () => {
  if (videoRef.current && canvasRef.current) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          handleImageUpload(
            file,
            async (result) => {
              try {
                const optimized = await optimizeImage(result);
                setFormData(prev => ({
                  ...prev,
                  photo: optimized
                }));
                toast.success("Photo captured successfully");
              } catch (error) {
                setFormData(prev => ({
                  ...prev,
                  photo: result
                }));
                toast.success("Photo captured successfully");
              }
            },
            { maxSizeMB: 1 }
          );
        }
      }, "image/jpeg", 0.95);
    }
    closeCamera();
  }
};

// ...in your return JSX, replace the photo upload section with:

<div className="space-y-4">
  <Label>Applicant Photo</Label>
  <div className="flex items-center gap-4">
    {formData.photo ? (
      <div className="relative">
        <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden">
          <img 
            src={formData.photo} 
            alt="Applicant" 
            className="w-full h-full object-cover"
          />
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2"
          onClick={removePhoto}
        >
          ×
        </Button>
      </div>
    ) : (
      <div className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No photo</p>
        </div>
      </div>
    )}
    
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handlePhotoUpload}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={openCamera}
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Use Camera
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        Max size: 1MB. Formats: JPG, PNG
      </p>
    </div>
    
    <Input 
      type="file" 
      ref={photoInputRef}
      accept="image/*" 
      className="hidden" 
      onChange={handlePhotoFileSelected}
    />
  </div>

  {/* Camera Modal/Popover */}
  {showCamera && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-[350px]">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={closeCamera}
          type="button"
        >
          ×
        </button>
        <div className="flex flex-col items-center">
          <video
            ref={videoRef}
            className="w-64 h-48 bg-black rounded mb-4"
            autoPlay
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          <Button
            type="button"
            onClick={capturePhoto}
            disabled={cameraLoading}
            className="w-full"
          >
            {cameraLoading ? "Loading..." : "Capture Photo"}
          </Button>
        </div>
      </div>
    </div>
  )}
</div>

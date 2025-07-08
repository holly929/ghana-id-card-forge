
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { handleImageUpload, optimizeImage } from '@/lib/utils';
import { Camera, Upload, X, ArrowLeft } from 'lucide-react';

interface ApplicantData {
  id: string;
  fullName?: string;
  full_name?: string;
  nationality?: string;
  area?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  visaType?: string;
  visa_type?: string;
  status?: string;
  dateCreated?: string;
  date_created?: string;
  occupation?: string;
  phoneNumber?: string;
  phone_number?: string;
  photo?: string;
}

const ApplicantEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    nationality: '',
    phoneNumber: '',
    occupation: '',
    area: '',
    visaType: '',
    photo: ''
  });

  // Camera functionality states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) {
      toast.error('No applicant ID provided');
      navigate('/applicants');
      return;
    }

    // Load applicant data
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const applicants = JSON.parse(storedApplicants);
        const applicant = applicants.find((a: ApplicantData) => a.id === id);
        
        if (applicant) {
          // Handle both camelCase and snake_case properties
          setFormData({
            fullName: applicant.fullName || applicant.full_name || '',
            dateOfBirth: applicant.dateOfBirth || applicant.date_of_birth || '',
            nationality: applicant.nationality || '',
            phoneNumber: applicant.phoneNumber || applicant.phone_number || '',
            occupation: applicant.occupation || '',
            area: applicant.area || '',
            visaType: applicant.visaType || applicant.visa_type || '',
            photo: applicant.photo || ''
          });

          // Check for stored photo
          const storedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
          if (storedPhoto) {
            setFormData(prev => ({ ...prev, photo: storedPhoto }));
          }
        } else {
          toast.error('Applicant not found');
          navigate('/applicants');
        }
      } catch (error) {
        toast.error('Error loading applicant data');
        navigate('/applicants');
      }
    } else {
      toast.error('No applicant data found');
      navigate('/applicants');
    }
    
    setLoading(false);
  }, [id, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(
        file,
        async (result) => {
          try {
            const optimized = await optimizeImage(result);
            setFormData(prev => ({ ...prev, photo: optimized }));
            toast.success("Photo updated successfully");
          } catch (error) {
            setFormData(prev => ({ ...prev, photo: result }));
            toast.success("Photo updated successfully");
          }
        },
        { maxSizeMB: 1 }
      );
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

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
                  setFormData(prev => ({ ...prev, photo: optimized }));
                  toast.success("Photo captured successfully");
                } catch (error) {
                  setFormData(prev => ({ ...prev, photo: result }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.dateOfBirth || !formData.nationality || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Get existing applicants from localStorage
      const existingApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      
      // Find and update the applicant
      const applicantIndex = existingApplicants.findIndex((a: ApplicantData) => a.id === id);
      
      if (applicantIndex === -1) {
        toast.error("Applicant not found");
        return;
      }

      // Preserve existing data and update with new values
      const updatedApplicant = {
        ...existingApplicants[applicantIndex],
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        occupation: formData.occupation,
        area: formData.area,
        visaType: formData.visaType,
        photo: formData.photo
      };

      existingApplicants[applicantIndex] = updatedApplicant;
      localStorage.setItem('applicants', JSON.stringify(existingApplicants));

      // Store photo separately if exists
      if (formData.photo) {
        localStorage.setItem(`applicantPhoto_${id}`, formData.photo);
      } else {
        localStorage.removeItem(`applicantPhoto_${id}`);
      }

      toast.success("Applicant updated successfully");
      navigate(`/applicants/${id}`);
    } catch (error) {
      toast.error("Failed to update applicant");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Loading applicant...</h2>
            <p>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(`/applicants/${id}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Edit Applicant</h1>
          <p className="text-gray-600">Update applicant information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Select value={formData.visaType} onValueChange={(value) => handleInputChange('visaType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tourist">Tourist</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo Upload Section */}
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
                      <X className="h-4 w-4" />
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
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Update Applicant
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/applicants/${id}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-[350px]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeCamera}
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Capture Photo</h3>
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
  );
};

export default ApplicantEdit;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { toast } from "sonner";
import { handleImageUpload, optimizeImage } from '@/lib/utils';

const ApplicantForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    area: '',
    dateOfBirth: '',
    expiryDate: '',
    visaType: '',
    occupation: '',
    phoneNumber: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    photo: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [isLoadingApplicant, setIsLoadingApplicant] = useState(isEditing);

  // Set default expiry date to 2 years from now
  useEffect(() => {
    if (!isEditing) {
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 2);
      setFormData(prev => ({
        ...prev,
        expiryDate: defaultExpiryDate.toISOString().split('T')[0]
      }));
    }
  }, [isEditing]);

  // Load existing applicant data if editing
  useEffect(() => {
    if (isEditing && id) {
      setIsLoadingApplicant(true);
      const storedApplicants = localStorage.getItem('applicants');
      
      if (storedApplicants) {
        try {
          const applicants = JSON.parse(storedApplicants);
          const applicant = applicants.find((app: any) => app.id === id);
          
          if (applicant) {
            // Load saved photo from localStorage if available
            const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
            
            setFormData({
              fullName: applicant.fullName || '',
              nationality: applicant.nationality || '',
              area: applicant.area || '',
              dateOfBirth: applicant.dateOfBirth || '',
              expiryDate: applicant.expiryDate || '',
              visaType: applicant.visaType || '',
              occupation: applicant.occupation || '',
              phoneNumber: applicant.phoneNumber || '',
              status: applicant.status || 'pending',
              photo: savedPhoto || applicant.photo || null,
            });
          } else {
            toast.error('Applicant not found');
            navigate('/applicants');
          }
        } catch (error) {
          console.error('Error loading applicant:', error);
          toast.error('Failed to load applicant data');
        }
      }
      setIsLoadingApplicant(false);
    }
  }, [id, isEditing, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const handlePhotoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    try {
      handleImageUpload(
        file,
        async (result) => {
          try {
            const optimized = await optimizeImage(result);
            setFormData(prev => ({
              ...prev,
              photo: optimized
            }));
            toast.success("Photo uploaded successfully");
          } catch (error) {
            console.error("Error optimizing image:", error);
            setFormData(prev => ({
              ...prev,
              photo: result
            }));
            toast.success("Photo uploaded successfully");
          }
        },
        { maxSizeMB: 1 }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload photo");
      }
    }
    
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
    toast.success("Photo removed");
  };

  // Generate a unique applicant ID
  const generateApplicantId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `GIS-${timestamp}${random}`.slice(0, 13);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    if (!formData.nationality.trim()) {
      toast.error('Nationality is required');
      return;
    }
    
    if (!formData.dateOfBirth) {
      toast.error('Date of birth is required');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate expiry date (should be in the future)
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate <= today) {
        toast.error('Expiry date must be in the future');
        return;
      }
    }

    setLoading(true);

    try {
      const storedApplicants = localStorage.getItem('applicants');
      const applicants = storedApplicants ? JSON.parse(storedApplicants) : [];

      const applicantData = {
        ...formData,
        id: isEditing ? id : generateApplicantId(),
        dateCreated: isEditing ? 
          (applicants.find((app: any) => app.id === id)?.dateCreated || new Date().toISOString().split('T')[0]) : 
          new Date().toISOString().split('T')[0],
        idCardApproved: false,
      };

      // Save photo separately in localStorage if it exists
      if (formData.photo && applicantData.id) {
        localStorage.setItem(`applicantPhoto_${applicantData.id}`, formData.photo);
      }

      let updatedApplicants;
      
      if (isEditing) {
        updatedApplicants = applicants.map((app: any) => 
          app.id === id ? applicantData : app
        );
        toast.success('Applicant updated successfully');
      } else {
        updatedApplicants = [...applicants, applicantData];
        toast.success('Applicant added successfully');
      }

      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Navigate back to applicants list
      navigate('/applicants');
    } catch (error) {
      console.error('Error saving applicant:', error);
      toast.error('Failed to save applicant');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingApplicant) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading applicant data...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/applicants')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? 'Edit Applicant' : 'Add New Applicant'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update applicant information' : 'Enter applicant details below'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handlePhotoUpload}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo
                  </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality *</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Enter area/location"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Enter phone number (e.g., +233123456789)"
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
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  placeholder="ID expiry date"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">Must be a future date</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Select
                  value={formData.visaType}
                  onValueChange={(value) => handleInputChange('visaType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tourist">Tourist</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    <SelectItem value="Transit">Transit</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value as 'pending' | 'approved' | 'rejected')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Applicant' : 'Add Applicant')}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/applicants')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantForm;

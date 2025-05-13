import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Upload, Trash, Camera } from 'lucide-react';
import { toast } from "sonner";
import { generateUniqueId } from '@/lib/utils';

interface ApplicantFormProps {
  isEditing?: boolean;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state with all fields including phoneNumber and notes
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    nationality: '',
    area: '',   
    dateOfBirth: '',
    visaType: 'Tourist',
    phoneNumber: '',
    occupation: '',
    status: 'pending',
    idCardApproved: false,
    dateCreated: new Date().toISOString().split('T')[0],
    notes: '', // added notes
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load applicant data if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const storedApplicants = localStorage.getItem('applicants');
      if (storedApplicants) {
        try {
          const applicants = JSON.parse(storedApplicants);
          const applicant = applicants.find((a: any) => a.id === id);
          if (applicant) {
            setFormData({
              id: applicant.id,
              fullName: applicant.fullName || '',
              nationality: applicant.nationality || '',
              area: applicant.area || applicant.passportNumber || '',
              dateOfBirth: applicant.dateOfBirth || '',
              visaType: applicant.visaType || 'None',
              phoneNumber: applicant.phoneNumber || '',
              occupation: applicant.occupation || '',
              status: applicant.status || 'pending',
              idCardApproved: applicant.idCardApproved || false,
              dateCreated: applicant.dateCreated || new Date().toISOString().split('T')[0],
              notes: applicant.notes || '',
            });
            // Load photo if exists
            const storedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
            if (storedPhoto) {
              setPhoto(storedPhoto);
            } else if (applicant.photo) {
              setPhoto(applicant.photo);
            }
          } else {
            toast.error('Applicant not found');
            navigate('/applicants');
          }
        } catch (error) {
          console.error('Error parsing applicant data:', error);
          toast.error('Error loading applicant data');
        }
      }
      setLoading(false);
    } else {
      // Generate new ID for new applicant
      setFormData(prev => ({
        ...prev,
        id: generateUniqueId()
      }));
    }
  }, [id, isEditing, navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      idCardApproved: checked
    }));
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
        toast.success('Photo uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // Take photo with camera
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'user';
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const storedApplicants = localStorage.getItem('applicants');
    let applicants = [];
    if (storedApplicants) {
      try {
        applicants = JSON.parse(storedApplicants);
      } catch (error) {
        console.error('Error parsing applicant data:', error);
      }
    }

    if (isEditing && id) {
      const index = applicants.findIndex((a: any) => a.id === id);
      if (index !== -1) {
        const applicantData = {
          ...formData
        };
        applicants[index] = applicantData;
        localStorage.setItem('applicants', JSON.stringify(applicants));
        if (photo) {
          localStorage.setItem(`applicantPhoto_${id}`, photo);
        } else {
          localStorage.removeItem(`applicantPhoto_${id}`);
        }
        toast.success('Applicant updated successfully');
        navigate('/applicants');
      } else {
        toast.error('Failed to update applicant');
      }
    } else {
      const applicantData = {
        ...formData
      };
      applicants.push(applicantData);
      localStorage.setItem('applicants', JSON.stringify(applicants));
      if (photo && formData.id) {
        localStorage.setItem(`applicantPhoto_${formData.id}`, photo);
      }
      toast.success('Applicant created successfully');
      navigate('/applicants');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            {isEditing ? 'Edit Applicant' : 'New Applicant'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update applicant information' : 'Create a new applicant record'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name and Nationality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  placeholder="Enter nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Location and Expiry Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="area">Location</Label>
                <Input
                  id="area"
                  name="area"
                  placeholder="Enter residential area"
                  value={formData.area}
                  onChange={handleChange}
                  required
                />
              </div>
              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Expiry Date</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                name="occupation"
                placeholder="Enter occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>

            {/* Status and ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* ID Number (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="id">ID Number</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* ID Card Approval */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="idCardApproved"
                checked={formData.idCardApproved}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                htmlFor="idCardApproved"
                className="font-medium text-sm cursor-pointer"
              >
                Approve for ID Card issuance
              </Label>
            </div>
            <p className="text-xs text-gray-500">
              Check this box to approve this applicant for ID card generation, even if status is pending
            </p>
          </CardContent>
        </Card>

        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo Preview & Upload */}
              <div className="flex-1">
                <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                  {photo ? (
                    <div className="relative">
                      <img
                        src={photo}
                        alt="Applicant"
                        className="w-32 h-40 object-cover border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => setPhoto(null)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-40 border flex flex-col items-center justify-center text-gray-400">
                      <p className="text-xs text-center">No photo uploaded</p>
                    </div>
                  )}
                </div>
                {/* Upload buttons */}
                <div className="mt-4 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTakePhoto}
                      className="w-full cursor-pointer"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Passport-style photo, front-facing on white background
                  </p>
                </div>
              </div>
              {/* Notes */}
              <div className="flex-1">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes or observations about the applicant"
                    rows={6}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/applicants')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Applicant' : 'Save Applicant'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicantForm;

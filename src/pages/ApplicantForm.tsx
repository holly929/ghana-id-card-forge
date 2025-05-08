
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ApplicantFormProps {
  isEditing?: boolean;
  applicantId?: string;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ isEditing = false, applicantId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    nationality: '',
    dateOfBirth: '',
    passportNumber: '',
    visaType: '',
    visaExpiryDate: '',
    occupation: '',
    address: '',
    phoneNumber: '',
    email: '',
  });
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Generate a unique ID for the new applicant (for demo purposes)
      const newId = Math.floor(Math.random() * 10000).toString();
      
      // Get existing applicants or initialize empty array
      const existingApplicantsString = localStorage.getItem('applicants');
      const existingApplicants = existingApplicantsString ? JSON.parse(existingApplicantsString) : [];
      
      // Create the new applicant object
      const newApplicant = {
        id: isEditing && applicantId ? applicantId : newId,
        ...formData,
        status: 'pending',
        dateCreated: new Date().toISOString(),
      };
      
      // Update or add to the applicants array
      if (isEditing && applicantId) {
        const updatedApplicants = existingApplicants.map((app: any) => 
          app.id === applicantId ? newApplicant : app
        );
        localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      } else {
        existingApplicants.push(newApplicant);
        localStorage.setItem('applicants', JSON.stringify(existingApplicants));
      }
      
      // Save photo separately
      if (photo) {
        localStorage.setItem(`applicantPhoto_${newApplicant.id}`, photo);
      }
      
      toast.success(
        isEditing 
          ? 'Applicant information updated successfully!' 
          : 'New applicant added successfully!'
      );
      
      // Navigate back to applicants list
      navigate('/applicants');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
            {isEditing ? 'Edit Applicant' : 'New Applicant'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update the applicant\'s information' 
              : 'Add a new non-citizen applicant to the system'}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter the applicant's personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input 
                    id="nationality"
                    name="nationality" 
                    placeholder="Enter nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input 
                    id="passportNumber"
                    name="passportNumber"
                    placeholder="Enter passport number"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    // Removed required attribute to make passport optional
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visaType">Visa Type</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange('visaType', value)}
                    defaultValue={formData.visaType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tourist">Tourist</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="visaExpiryDate">Visa Expiry Date</Label>
                  <Input 
                    id="visaExpiryDate"
                    name="visaExpiryDate"
                    type="date"
                    value={formData.visaExpiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input 
                  id="occupation"
                  name="occupation"
                  placeholder="Enter occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address in Ghana</Label>
                <Textarea 
                  id="address"
                  name="address"
                  placeholder="Enter address (optional)"
                  value={formData.address}
                  onChange={handleInputChange}
                  // Removed required attribute to make address optional
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Information and Photo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Enter the applicant's contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address (optional)"
                    value={formData.email}
                    onChange={handleInputChange}
                    // Already optional as it had no required attribute
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Applicant Photo</CardTitle>
                <CardDescription>Upload a clear passport-sized photo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-gray-50">
                  {photo ? (
                    <div className="mb-4 relative">
                      <Avatar className="w-32 h-40 rounded-md">
                        <AvatarImage src={photo} className="object-cover" />
                        <AvatarFallback className="bg-gray-200 rounded-md">Photo</AvatarFallback>
                      </Avatar>
                    </div>
                  ) : (
                    <div className="w-32 h-40 bg-gray-200 mb-4 flex items-center justify-center text-gray-400 rounded-md">
                      No photo
                    </div>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {photo ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    JPEG or PNG, max 5MB
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate('/applicants')} 
            className="mr-2"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                {isEditing ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Applicant' : 'Save Applicant'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplicantForm;

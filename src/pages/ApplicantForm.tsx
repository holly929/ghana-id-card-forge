
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { generateUniqueId, handleImageUpload, optimizeImage } from '@/lib/utils';
import { useAuth, UserRole } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const ApplicantForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    full_name: '',
    nationality: '',
    phoneNumber: '',
    phone_number: '',
    dateOfBirth: '',
    date_of_birth: '',
    visaType: '',
    visa_type: '',
    occupation: '',
    area: '',
    expiryDate: '',
    expiry_date: ''
  });
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();

  // Check permissions
  const canCreateApplicants = user && [UserRole.ADMIN, UserRole.DATA_ENTRY].includes(user.role);

  if (!canCreateApplicants) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to create applicants.</p>
        <Button onClick={() => navigate('/applicants')}>
          Return to Applicants
        </Button>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Set both camelCase and snake_case versions
      ...(field === 'fullName' && { full_name: value }),
      ...(field === 'full_name' && { fullName: value }),
      ...(field === 'phoneNumber' && { phone_number: value }),
      ...(field === 'phone_number' && { phoneNumber: value }),
      ...(field === 'dateOfBirth' && { date_of_birth: value }),
      ...(field === 'date_of_birth' && { dateOfBirth: value }),
      ...(field === 'visaType' && { visa_type: value }),
      ...(field === 'visa_type' && { visaType: value }),
      ...(field === 'expiryDate' && { expiry_date: value }),
      ...(field === 'expiry_date' && { expiryDate: value })
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo size should be less than 5MB');
        return;
      }
      
      handleImageUpload(file, async (result) => {
        try {
          const optimized = await optimizeImage(result);
          setPhoto(optimized);
          toast.success('Photo uploaded successfully');
        } catch (error) {
          console.error('Error optimizing image:', error);
          setPhoto(result);
          toast.success('Photo uploaded successfully');
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.nationality || !formData.phoneNumber || !formData.dateOfBirth) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Generate unique ID
      const applicantId = generateUniqueId();
      
      // Create applicant object with both formats for compatibility
      const applicantData = {
        id: applicantId,
        fullName: formData.fullName,
        full_name: formData.fullName,
        nationality: formData.nationality,
        phoneNumber: formData.phoneNumber,
        phone_number: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        date_of_birth: formData.dateOfBirth,
        visaType: formData.visaType || 'Not specified',
        visa_type: formData.visaType || 'Not specified',
        occupation: formData.occupation || 'Not specified',
        area: formData.area || 'Not provided',
        expiryDate: formData.expiryDate,
        expiry_date: formData.expiryDate,
        status: 'pending',
        dateCreated: new Date().toISOString().split('T')[0],
        date_created: new Date().toISOString().split('T')[0],
        idCardApproved: false,
        id_card_approved: false,
        photo: photo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating applicant with data:', applicantData);

      // Get existing applicants
      const existingApplicants = JSON.parse(localStorage.getItem('applicants') || '[]');
      
      // Add new applicant
      const updatedApplicants = [...existingApplicants, applicantData];
      
      // Save to localStorage
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Save photo separately if exists
      if (photo) {
        localStorage.setItem(`applicantPhoto_${applicantId}`, photo);
      }

      console.log('Applicant saved successfully:', applicantId);
      console.log('Total applicants now:', updatedApplicants.length);
      
      toast.success('Applicant created successfully!');
      
      // Navigate to applicants list
      navigate('/applicants');
      
    } catch (error) {
      console.error('Error creating applicant:', error);
      toast.error('Failed to create applicant. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold text-gray-800">New Applicant</h1>
          <p className="text-gray-600">Create a new non-citizen applicant record</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Information</CardTitle>
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
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+233123456789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={(date) => {
                        setDateOfBirth(date);
                        if (date) {
                          const dateString = date.toISOString().split('T')[0];
                          handleInputChange('dateOfBirth', dateString);
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Select onValueChange={(value) => handleInputChange('visaType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tourist">Tourist</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="transit">Transit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <Label htmlFor="area">Area/Region</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="Enter area or region"
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Pick expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={(date) => {
                        setExpiryDate(date);
                        if (date) {
                          const dateString = date.toISOString().split('T')[0];
                          handleInputChange('expiryDate', dateString);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              {photo && (
                <div className="mt-4">
                  <img
                    src={photo}
                    alt="Preview"
                    className="w-32 h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Applicant'}
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

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Camera, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn, generateUniqueId } from '@/lib/utils';
import { toast } from 'sonner';
import CameraCapture from '@/components/CameraCapture';

interface ApplicantData {
  id: string;
  fullName: string;
  nationality: string;
  area: string;
  passportNumber: string;
  dateOfBirth: string;
  visaType: string;
  status: string;
  dateCreated: string;
  occupation: string;
  idCardApproved: boolean;
  expiryDate: string;
  phoneNumber: string;
  photo: string;
}

const defaultValues: ApplicantData = {
  id: generateUniqueId(),
  fullName: '',
  nationality: '',
  area: '',
  passportNumber: '',
  dateOfBirth: '',
  visaType: '',
  status: 'pending',
  dateCreated: new Date().toISOString().split('T')[0],
  occupation: '',
  idCardApproved: false,
  expiryDate: '',
  phoneNumber: '',
  photo: '',
};

const nationalities = [
  "Ghanaian", "Nigerian", "Egyptian", "American", "Canadian", "British", "German", "French", "Chinese", "Japanese",
  "Indian", "Brazilian", "Mexican", "Australian", "South African", "Kenyan", "Moroccan", "Algerian", "Tunisian", "Libyan",
  "Sudanese", "Ethiopian", "Congolese", "Angolan", "Ivorian", "Senegalese", "Malian", "Burkinabe", "Nigerien", "Chadian",
  "Somali", "Cameroonian", "Zambian", "Zimbabwean", "Malawian", "Mozambican", "Madagascan", "Ugandan", "Rwandan", "Burundian",
  "Tanzanian", "Guinean", "Liberian", "Sierra Leonean", "Gambian", "Togolese", "Beninese", "Gabonese", "Congolese", "Central African",
  "Eritrean", "Djiboutian", "Comoran", "Seychellois", "Mauritian", "Cape Verdean", "Sao Tomean", "Equatorial Guinean", "Guinean Bissauan", "Other"
];

const visaTypes = [
  "Tourist", "Student", "Work", "Business", "Diplomatic", "Transit", "Medical", "Family", " সাংবাদিক", "Other"
];

const areas = [
  "Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast", "Obuasi", "Tema", "Koforidua", "Sunyani", "Ho",
  "Wa", "Bolgatanga", "Mampong", "Techiman", "Nkawkaw", "Akim Oda", "Winneba", "Suhum", "Konongo", "Nsawam",
  "Dome", "Teshie", "Madina", "Achimota", "Spintex", "East Legon", "Cantonments", "Labadi", "Osu", "Airport Residential",
  "Roman Ridge", "Dzorwulu", "Abelemkpe", "Kanda", "Nima", "Mamobi", "New Town", "Darkuman", "Odorkor", "Kaneshie",
  "North Kaneshie", "South Kaneshie", "Kokomlemle", "Tesano", "Avenor", "Alajo", "Kotobabi", "Circle", "Adabraka", "Asylum Down",
  "Ridge", "West Ridge", "North Ridge", "Cedi House Area", "Ministries Area", "High Street", "James Town", "Usshertown", "Other"
];

const ApplicantForm: React.FC = () => {
  const [fullName, setFullName] = useState(defaultValues.fullName);
  const [nationality, setNationality] = useState(defaultValues.nationality);
  const [area, setArea] = useState(defaultValues.area);
  const [passportNumber, setPassportNumber] = useState(defaultValues.passportNumber);
  const [dateOfBirth, setDateOfBirth] = useState(defaultValues.dateOfBirth);
  const [visaType, setVisaType] = useState(defaultValues.visaType);
  const [occupation, setOccupation] = useState(defaultValues.occupation);
  const [phoneNumber, setPhoneNumber] = useState(defaultValues.phoneNumber);
  const [expiryDate, setExpiryDate] = useState(defaultValues.expiryDate);
  const [photo, setPhoto] = useState(defaultValues.photo);
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDateOfBirth(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleExpiryDateChange = (date: Date | undefined) => {
    if (date) {
      setExpiryDate(format(date, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !nationality || !area || !passportNumber || !dateOfBirth || !visaType || !occupation || !phoneNumber) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const newApplicant: ApplicantData = {
      id: generateUniqueId(),
      fullName,
      nationality,
      area,
      passportNumber,
      dateOfBirth,
      visaType,
      status: 'pending',
      dateCreated: new Date().toISOString().split('T')[0],
      occupation,
      idCardApproved: false,
      expiryDate,
      phoneNumber,
      photo,
    };

    // Get existing applicants from localStorage
    const storedApplicants = localStorage.getItem('applicants');
    const existingApplicants = storedApplicants ? JSON.parse(storedApplicants) : [];

    // Add the new applicant to the existing list
    const updatedApplicants = [...existingApplicants, newApplicant];

    // Save the updated list back to localStorage
    localStorage.setItem('applicants', JSON.stringify(updatedApplicants));

    // Optionally, show a success message
    toast.success('Applicant added successfully!');

    // Redirect to the ID Cards page
    navigate('/id-cards');
  };

  const handlePhotoCapture = (photoDataUrl: string) => {
    setPhoto(photoDataUrl);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>New Applicant Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Nationality */}
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Select onValueChange={setNationality} defaultValue={nationality}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a nationality" />
                </SelectTrigger>
                <SelectContent>
                  {nationalities.map((nation) => (
                    <SelectItem key={nation} value={nation}>
                      {nation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select onValueChange={setArea} defaultValue={area}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Passport Number */}
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                type="text"
                id="passportNumber"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateOfBirth && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth ? format(new Date(dateOfBirth), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Visa Type */}
            <div className="space-y-2">
              <Label htmlFor="visaType">Visa Type</Label>
              <Select onValueChange={setVisaType} defaultValue={visaType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a visa type" />
                </SelectTrigger>
                <SelectContent>
                  {visaTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Occupation */}
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                type="text"
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label>Visa Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !expiryDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(new Date(expiryDate), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate ? new Date(expiryDate) : undefined}
                    onSelect={handleExpiryDateChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
                
                <CameraCapture onPhotoCapture={handlePhotoCapture}>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Use Camera
                  </Button>
                </CameraCapture>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {photo && (
                <div className="relative w-32 h-40 border border-gray-300 rounded-md overflow-hidden">
                  <img 
                    src={photo} 
                    alt="Applicant" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setPhoto('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit">Register Applicant</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantForm;

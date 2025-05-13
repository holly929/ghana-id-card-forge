import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from "sonner";
import { generateUniqueId } from '@/lib/utils';

interface ApplicantFormProps {
  isEditing?: boolean;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data, including phoneNumber
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    nationality: '',
    area: '',
    dateOfBirth: '',
    visaType: 'NONE',
    occupation: '',
    status: 'pending',
    idCardApproved: false,
    dateCreated: new Date().toISOString().split('T')[0],
    phoneNumber: '',
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
              area: applicant.area || '',
              dateOfBirth: applicant.dateOfBirth || '',
              visaType: applicant.visaType || 'NONE',
              occupation: applicant.occupation || '',
              status: applicant.status || 'pending',
              idCardApproved: applicant.idCardApproved || false,
              dateCreated: applicant.dateCreated || new Date().toISOString().split('T')[0],
              phoneNumber: applicant.phoneNumber || '',
            });
            const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
            if (savedPhoto) setPhoto(savedPhoto);
            else if (applicant.photo) setPhoto(applicant.photo);
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
      // Creating new applicant, generate ID
      setFormData(prev => ({
        ...prev,
        id: generateUniqueId(),
      }));
    }
  }, [id, isEditing, navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Photo upload
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
    reader.onload = () => {
      if (reader.result) {
        setPhoto(reader.result as string);
        toast.success('Photo uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // Print HTML generation
  const generatePrintHTML = () => {
    const { fullName, nationality, area, dateOfBirth, visaType, occupation, id, dateCreated, phoneNumber } = formData;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

    const applicantPhoto = photo || '';

    return `
    <html>
    <head>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 10mm;
            font-family: Arial, sans-serif;
          }
          .card {
            width: 180mm;
            height: 54mm;
            background: linear-gradient(to right, #006b3f, #006b3f99);
            color: white;
            border-radius: 8px;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            margin-bottom: 10mm;
            page-break-inside: avoid;
          }
          .front, .back {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 5mm;
            box-sizing: border-box;
            position: relative;
          }
          .logo { text-align: center; margin-bottom: 5mm; }
          .photo {
            width: 70px; height: 85px; border: 2px solid #fff; overflow: hidden; margin: 0 auto 5mm auto;
          }
          .photo img { width: 100%; height: 100%; object-fit: cover; }
          .red { background: #ce1126; height: 12px; }
          .yellow { background: #fcd116; height: 12px; }
          .green { background: #006b3f; height: 12px; }
        }
      </style>
    </head>
    <body>
      <div style="transform: scale(1); transform-origin: top left;">
        <div class="card">
          <!-- Front -->
          <div class="front">
            <div class="logo"></div>
            <div class="photo">${applicantPhoto ? `<img src="${applicantPhoto}" />` : '<span>No Photo</span>'}</div>
            <div style="text-align:center; background:#fcd116; padding:2px 4px; border-radius:2px; font-weight:bold;">${visaType.toUpperCase()}</div>
            <div style="text-align:center;">
              <div style="font-weight:bold;">REPUBLIC OF GHANA</div>
              <div>NON-CITIZEN IDENTITY CARD</div>
            </div>
            <div>
              <div><strong>Name:</strong> ${fullName}</div>
              <div><strong>Nationality:</strong> ${nationality}</div>
              <div><strong>ID No:</strong> ${id}</div>
              <div><strong>Expiry Date:</strong> ${formatDate(dateOfBirth)}</div>
              <div><strong>Issue Date:</strong> ${formatDate(dateCreated)}</div>
              <div><strong>Phone:</strong> ${phoneNumber}</div>
            </div>
            <div class="red"></div>
            <div class="yellow"></div>
            <div class="green"></div>
          </div>
          <!-- Back -->
          <div class="back" style="margin-top:10px;">
            <div style="text-align:center;">
              <div style="font-weight:bold;">GHANA IMMIGRATION SERVICE-KWAHU EAST</div>
              <div>This card remains the property of the Ghana Immigration Service</div>
            </div>
            <div>
              <div><strong>Occupation:</strong> ${occupation || 'N/A'}</div>
              <div><strong>Date of Issue:</strong> ${formatDate(new Date().toISOString())}</div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.3); margin-top:10px; padding-top:10px;">
              <div style="text-align:center; font-size:8px;">If found, please return to the nearest Ghana Immigration Service office</div>
            </div>
            <div style="display:flex; justify-content: space-between; margin-top:10px;">
              <div style="border-top:1px solid rgba(255,255,255,0.5); width:70px; text-align:center; font-size:7px;">Holder's Signature</div>
              <div style="border-top:1px solid rgba(255,255,255,0.5); width:70px; text-align:center; font-size:7px;">Issuing Officer</div>
            </div>
            <div class="red"></div>
            <div class="yellow"></div>
            <div class="green"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups.');
      return;
    }
    const htmlContent = generatePrintHTML();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    };
  };

  if (loading) return <div>Loading...</div>;

  if (!formData) {
    return (
      <div>
        <h2>Applicant not found</h2>
        <Button onClick={() => navigate('/applicants')}>Back to Applicants</Button>
      </div>
    );
  }

  const { fullName, nationality, area, dateOfBirth, visaType, occupation, id, dateCreated, phoneNumber } = formData;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => navigate('/applicants')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-2 text-xl font-semibold">Preview & Print ID Card</h1>
      </div>

      {/* Print Button */}
      <div className="mb-4">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Print ID Card
        </Button>
      </div>

      {/* Applicant Details & Inputs */}
      <div className="border p-4 rounded-md space-y-4">
        <h2 className="text-lg font-semibold mb-2">Applicant Details</h2>

        {/* Full Name */}
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
          />
        </div>

        {/* Nationality */}
        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            placeholder="Nationality"
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="area">Location</Label>
          <Input
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            placeholder="Location"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <Label htmlFor="dateOfBirth">Expiry Date</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        {/* Add other fields as needed */}
      </div>
    </div>
  );
};

export default ApplicantForm;

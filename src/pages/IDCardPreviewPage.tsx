import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import IDCardPreview from '@/components/IDCardPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Default applicants with expiryDate added
const defaultApplicants = [
  {
    id: 'GIS-123456789',
    fullName: 'Ahmed Mohammed',
    nationality: 'Egyptian',
    passportNumber: 'A12345678',
    dateOfBirth: '1985-03-15',
    visaType: 'Work',
    status: 'approved',
    dateCreated: '2023-07-10',
    occupation: 'Engineer',
    photo: null,
    expiryDate: '2025-07-10', // <-- added expiry date
  },
  {
    id: 'GIS-234567890',
    fullName: 'Maria Sanchez',
    nationality: 'Mexican',
    passportNumber: 'B87654321',
    dateOfBirth: '1990-11-22',
    visaType: 'Student',
    status: 'pending',
    dateCreated: '2023-08-05',
    occupation: 'Student',
    photo: null,
    expiryDate: '2024-11-22',
  },
  {
    id: '3',
    fullName: 'John Smith',
    nationality: 'American',
    passportNumber: 'C45678912',
    dateOfBirth: '1978-06-30',
    visaType: 'Tourist',
    status: 'rejected',
    dateCreated: '2023-08-15',
    occupation: 'Consultant',
    photo: null,
    expiryDate: '2023-08-30',
  },
  {
    id: '4',
    fullName: 'Li Wei',
    nationality: 'Chinese',
    passportNumber: 'D98765432',
    dateOfBirth: '1992-09-18',
    visaType: 'Business',
    status: 'approved',
    dateCreated: '2023-08-20',
    occupation: 'Business Owner',
    photo: null,
    expiryDate: '2026-09-18',
  },
  {
    id: '5',
    fullName: 'Amit Patel',
    nationality: 'Indian',
    passportNumber: 'E12378945',
    dateOfBirth: '1983-12-10',
    visaType: 'Work',
    status: 'pending',
    dateCreated: '2023-08-25',
    occupation: 'Software Developer',
    photo: null,
    expiryDate: '2024-12-10',
  },
];

const IDCardPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load applicants from localStorage or default
  useEffect(() => {
    setLoading(true);
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        setApplicants(parsedApplicants);
      } catch (error) {
        console.error('Error parsing applicants data:', error);
        setApplicants(defaultApplicants);
        toast.error('Failed to load applicant data');
      }
    } else {
      setApplicants(defaultApplicants);
    }
    setLoading(false);
  }, []);

  // Find applicant by ID and load photo & expiryDate
  useEffect(() => {
    if (applicants.length > 0 && id) {
      const found = applicants.find((a) => a.id === id);
      if (found) {
        // Load saved photo if exists
        if (!found.photo) {
          const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
          if (savedPhoto) {
            found.photo = savedPhoto;
          }
        }
        // Ensure expiryDate exists
        if (!found.expiryDate) {
          found.expiryDate = '2025-12-31'; // default expiry if missing
        }
        setApplicant({ ...found });
      } else {
        toast.error(`Applicant with ID ${id} not found`);
      }
    }
  }, [applicants, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading applicant data...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Applicant Not Found</h1>
        <p className="mb-6">The applicant you're looking for could not be found.</p>
        <Button onClick={() => navigate('/id-cards')}>
          Return to ID Cards
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/id-cards')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">ID Card Preview</h1>
          <p className="text-gray-600">Preview the ID card for {applicant?.fullName}</p>
        </div>
      </div>

      {/* Button to go to print page */}
      <div>
        <Button variant="outline" asChild>
          <Link to={`/id-cards/${applicant.id}/print`}>
            <Printer className="h-4 w-4" />
            Go to Print Page
          </Link>
        </Button>
      </div>

      {/* Applicant info & ID Card */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Applicant info */}
        <Card className="xl:order-2">
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p>{applicant?.fullName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
                  <p>{applicant?.nationality}</p>
                </div>
              </div>
              {/* DOB & Passport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p>{new Date(applicant?.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Passport Number</h3>
                  <p>{applicant?.passportNumber || 'Not provided'}</p>
                </div>
              </div>
              {/* Visa & Occupation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visa Type</h3>
                  <p>{applicant?.visaType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                  <p>{applicant?.occupation || 'Not provided'}</p>
                </div>
              </div>
              {/* Status, ID Number, Date Created */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="capitalize">{applicant?.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                  <p>{applicant?.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                  <p>{new Date(applicant?.dateCreated).toLocaleDateString()}</p>
                </div>
              </div>
              {/* Expiry Date */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                <p>{new Date(applicant?.expiryDate).toLocaleDateString()}</p>
              </div>
              {/* Photo */}
              {applicant?.photo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
                  <div className="w-32 h-40 border overflow-hidden">
                    <img
                      src={applicant.photo}
                      alt="Applicant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* ID Card Preview */}
        <Card className="xl:order-1">
          <CardHeader>
            <CardTitle>ID Card Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <IDCardPreview applicant={applicant} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IDCardPreviewPage;

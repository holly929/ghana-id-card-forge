
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer, Users } from 'lucide-react';
import IDCardPreview from '@/components/IDCardPreview';
import ConnectionStatus from '@/components/ConnectionStatus';
import BulkPrintModal from '@/components/BulkPrintModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dataSyncService } from '@/services/dataSync';

// Type definition for applicant data that handles both camelCase and snake_case
interface ApplicantData {
  id: string;
  fullName?: string;
  full_name?: string;
  nationality?: string;
  area?: string;
  passportNumber?: string;
  passport_number?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
  visaType?: string;
  visa_type?: string;
  status?: string;
  dateCreated?: string;
  date_created?: string;
  occupation?: string;
  idCardApproved?: boolean;
  id_card_approved?: boolean;
  expiryDate?: string;
  expiry_date?: string;
  phoneNumber?: string;
  phone_number?: string;
  photo?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely get property values
const getApplicantProperty = (applicant: ApplicantData, camelCase: string, snakeCase: string): string => {
  return (applicant as any)[camelCase] || (applicant as any)[snakeCase] || '';
};

const IDCardPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [applicant, setApplicant] = useState<ApplicantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [allApplicants, setAllApplicants] = useState<ApplicantData[]>([]);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  
  // Load applicant data using sync service
  useEffect(() => {
    const loadApplicant = async () => {
      setLoading(true);
      try {
        const applicants = await dataSyncService.getApplicants();
        const found = applicants.find(a => a.id === id);
        
        if (found) {
          console.log('Found applicant:', found);
          
          // Load saved photo from localStorage if not already in the applicant data
          if (!found.photo) {
            const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
            if (savedPhoto) {
              found.photo = savedPhoto;
            }
          }
          
          setApplicant({...found});
        } else {
          console.log('Applicant not found with ID:', id);
          toast.error(`Applicant with ID ${id} not found`);
        }
      } catch (error) {
        console.error('Error loading applicant:', error);
        toast.error('Failed to load applicant data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadApplicant();
    }
  }, [id]);

  // Load all approved applicants for bulk printing
  useEffect(() => {
    const loadAllApplicants = async () => {
      try {
        const applicants = await dataSyncService.getApplicants();
        // Filter for approved applicants only
        const approved = applicants.filter(app => 
          app.status === 'approved' || app.id_card_approved
        );
        setAllApplicants(approved);
      } catch (error) {
        console.error('Error loading all applicants:', error);
      }
    };

    loadAllApplicants();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  
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

  const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
  const dateOfBirth = getApplicantProperty(applicant, 'dateOfBirth', 'date_of_birth');
  const phoneNumber = getApplicantProperty(applicant, 'phoneNumber', 'phone_number');
  const visaType = getApplicantProperty(applicant, 'visaType', 'visa_type');
  const expiryDate = getApplicantProperty(applicant, 'expiryDate', 'expiry_date');
  const dateCreated = getApplicantProperty(applicant, 'dateCreated', 'date_created');
  const passportNumber = getApplicantProperty(applicant, 'passportNumber', 'passport_number');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/id-cards')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">ID Card Preview</h1>
            <p className="text-gray-600">
              Preview the ID card for {fullName}
            </p>
          </div>
        </div>
        <ConnectionStatus />
      </div>
      
      {/* Action buttons row */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link to={`/id-cards/${applicant.id}/print`}>
            <Printer className="h-4 w-4" />
            Go to Print Page
          </Link>
        </Button>
        
        {/* Add Bulk Print Button */}
        <Button 
          variant="secondary" 
          onClick={() => setShowBulkPrintModal(true)}
          className="flex items-center gap-2"
          disabled={allApplicants.length === 0}
        >
          <Users className="h-4 w-4" />
          Bulk Print ({allApplicants.length} available)
        </Button>
      </div>
      
      {/* grid with applicant information and ID card preview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="xl:order-2">
          <CardHeader>
            <CardTitle>Applicant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                  <p>{fullName || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
                  <p>{applicant.nationality || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p>{formatDate(dateOfBirth)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p>{phoneNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Passport Number</h3>
                  <p>{passportNumber || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visa Type</h3>
                  <p>{visaType || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                  <p>{applicant.occupation || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Area</h3>
                  <p>{applicant.area || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="capitalize">{applicant.status || 'Pending'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                  <p>{applicant.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                  <p>{formatDate(expiryDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                  <p>{formatDate(dateCreated)}</p>
                </div>
              </div>
              
              {applicant.photo && (
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
        
        <Card className="xl:order-1">
          <CardHeader>
            <CardTitle>ID Card Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <IDCardPreview applicant={{
              id: applicant.id,
              fullName: fullName,
              nationality: applicant.nationality,
              dateOfBirth: dateOfBirth,
              expiryDate: expiryDate,
              visaType: visaType,
              occupation: applicant.occupation,
              photo: applicant.photo,
              phoneNumber: phoneNumber,
              area: applicant.area,
              passportNumber: passportNumber
            }} />
          </CardContent>
        </Card>
      </div>
      
      {/* Bulk Print Modal */}
      <BulkPrintModal
        open={showBulkPrintModal}
        onClose={() => setShowBulkPrintModal(false)}
        applicants={allApplicants}
      />
    </div>
  );
};

export default IDCardPreviewPage;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import IDCardPreview from '@/components/IDCardPreview';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { dataSyncService } from '@/services/dataSync';

const IDCardPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
              Preview the ID card for {applicant?.fullName || applicant?.full_name}
            </p>
          </div>
        </div>
        <ConnectionStatus />
      </div>
      
      {/* Add Print Page Button */}
      <div>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link to={`/id-cards/${applicant.id}/print`}>
            <Printer className="h-4 w-4" />
            Go to Print Page
          </Link>
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
                  <p>{applicant?.fullName || applicant?.full_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
                  <p>{applicant?.nationality}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p>{applicant?.dateOfBirth || applicant?.date_of_birth ? new Date(applicant.dateOfBirth || applicant.date_of_birth).toLocaleDateString() : "Not provided"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                  <p>{applicant?.phoneNumber || applicant?.phone_number || "Not provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visa Type</h3>
                  <p>{applicant?.visaType || applicant?.visa_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                  <p>{applicant?.occupation || "Not provided"}</p>
                </div>
              </div>
              
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
                  <h3 className="text-sm font-medium text-gray-500">Expiry Date</h3>
                  <p>{applicant?.expiryDate || applicant?.expiry_date ? new Date(applicant.expiryDate || applicant.expiry_date).toLocaleDateString() : "Not set"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Area</h3>
                  <p>{applicant?.area || "Not provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                  <p>{applicant?.dateCreated || applicant?.date_created ? new Date(applicant.dateCreated || applicant.date_created).toLocaleDateString() : "Not set"}</p>
                </div>
              </div>
              
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
        
        <Card className="xl:order-1">
          <CardHeader>
            <CardTitle>ID Card Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <IDCardPreview applicant={{
              id: applicant.id,
              fullName: applicant.fullName || applicant.full_name,
              nationality: applicant.nationality,
              dateOfBirth: applicant.dateOfBirth || applicant.date_of_birth,
              expiryDate: applicant.expiryDate || applicant.expiry_date,
              visaType: applicant.visaType || applicant.visa_type,
              occupation: applicant.occupation,
              photo: applicant.photo,
              phoneNumber: applicant.phoneNumber || applicant.phone_number,
              area: applicant.area,
            }} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IDCardPreviewPage;

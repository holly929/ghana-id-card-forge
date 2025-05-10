
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const ApplicantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    
    // Fetch from localStorage
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants && id) {
      try {
        const applicants = JSON.parse(storedApplicants);
        const foundApplicant = applicants.find((a: any) => a.id === id);
        
        if (foundApplicant) {
          setApplicant(foundApplicant);
          
          // Check for stored photo
          const storedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
          if (storedPhoto) {
            setPhoto(storedPhoto);
          } else if (foundApplicant.photo) {
            setPhoto(foundApplicant.photo);
          }
        } else {
          toast.error('Applicant not found');
          navigate('/applicants');
        }
      } catch (error) {
        console.error('Error parsing applicant data:', error);
        toast.error('Error loading applicant data');
        navigate('/applicants');
      }
    } else {
      toast.error('No applicant data found');
      navigate('/applicants');
    }
    
    setLoading(false);
  }, [id, navigate]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <Button onClick={() => navigate('/applicants')}>
          Return to Applicants
        </Button>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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
          <h1 className="text-2xl font-semibold text-gray-800">Applicant Details</h1>
          <p className="text-gray-600">
            Viewing information for {applicant.fullName}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link to={`/applicants/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Applicant
          </Link>
        </Button>
        
        <Button asChild>
          <Link to={`/id-cards/${id}/preview`}>
            <CreditCard className="mr-2 h-4 w-4" />
            View ID Card
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Photo and basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Applicant Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {photo ? (
              <div className="w-full max-w-[200px] mb-4">
                <img 
                  src={photo} 
                  alt={applicant.fullName} 
                  className="w-full h-auto rounded-md border"
                />
              </div>
            ) : (
              <div className="w-32 h-40 border rounded-md flex items-center justify-center bg-gray-50 mb-4">
                <p className="text-gray-400 text-xs text-center p-2">No photo available</p>
              </div>
            )}
            
            <div className="w-full text-center">
              <h2 className="font-medium text-xl">{applicant.fullName}</h2>
              <p className="text-gray-500 mt-1">{applicant.nationality}</p>
              <div className="mt-2">
                {getStatusBadge(applicant.status)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Middle column - Personal details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="text-base">{applicant.fullName}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nationality</h3>
                  <p className="text-base">{applicant.nationality}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                  <p className="text-base">{formatDate(applicant.dateOfBirth)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Passport Number</h3>
                  <p className="text-base">{applicant.passportNumber || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID Number</h3>
                  <p className="text-base font-mono">{applicant.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Visa Type</h3>
                  <p className="text-base">{applicant.visaType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                  <p className="text-base">{applicant.occupation || 'Not specified'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Application Status</h3>
                  <p className="text-base capitalize">{applicant.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                  <p className="text-base">{formatDate(applicant.dateCreated)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicantDetails;

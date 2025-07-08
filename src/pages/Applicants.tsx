
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye, 
  CreditCard,
  FileImage,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Type definition for applicant data that handles both camelCase and snake_case
interface ApplicantData {
  id: string;
  fullName?: string;
  full_name?: string;
  nationality?: string;
  area?: string;
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

// Default mock data (used when no localStorage data exists)
const defaultApplicants: ApplicantData[] = [
  {
    id: 'GIS-DEFAULT-001',
    fullName: 'Ahmed Mohammed',
    full_name: 'Ahmed Mohammed',
    nationality: 'Egyptian',
    area: 'Downtown',
    dateOfBirth: '1985-03-15',
    date_of_birth: '1985-03-15',
    visaType: 'Work',
    visa_type: 'Work',
    status: 'approved',
    dateCreated: '2023-07-10',
    date_created: '2023-07-10',
    occupation: 'Engineer',
    idCardApproved: true,
    id_card_approved: true,
    phoneNumber: '+233123456789',
    phone_number: '+233123456789'
  },
  {
    id: 'GIS-DEFAULT-002',
    fullName: 'Maria Sanchez',
    full_name: 'Maria Sanchez',
    nationality: 'Mexican',
    area: 'North District',
    dateOfBirth: '1990-11-22',
    date_of_birth: '1990-11-22',
    visaType: 'Student',
    visa_type: 'Student',
    status: 'pending',
    dateCreated: '2023-08-05',
    date_created: '2023-08-05',
    occupation: 'Student',
    idCardApproved: false,
    id_card_approved: false,
    phoneNumber: '+233987654321',
    phone_number: '+233987654321'
  }
];

const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [applicants, setApplicants] = useState<ApplicantData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load applicants from localStorage on component mount
  useEffect(() => {
    console.log('Loading applicants from localStorage...');
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsed = JSON.parse(storedApplicants);
        console.log('Loaded applicants:', parsed);
        console.log('Total applicants:', parsed.length);
        setApplicants(parsed);
      } catch (error) {
        console.error('Error parsing applicants data:', error);
        toast.error('Failed to load applicant data');
        // Fallback to default data
        setApplicants(defaultApplicants);
        localStorage.setItem('applicants', JSON.stringify(defaultApplicants));
      }
    } else {
      console.log('No applicants in localStorage, using defaults');
      setApplicants(defaultApplicants);
      localStorage.setItem('applicants', JSON.stringify(defaultApplicants));
    }
    setLoading(false);
  }, []);
  
  // Filter applicants based on search term with safe null checking
  const filteredApplicants = applicants.filter(applicant => {
    if (!applicant) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    // Safely check each field for null/undefined before calling toLowerCase
    const fullNameMatch = getApplicantProperty(applicant, 'fullName', 'full_name').toLowerCase().includes(searchTermLower);
    const nationalityMatch = (applicant.nationality || '').toLowerCase().includes(searchTermLower);
    const areaMatch = (applicant.area || '').toLowerCase().includes(searchTermLower);
    const phoneMatch = getApplicantProperty(applicant, 'phoneNumber', 'phone_number').toLowerCase().includes(searchTermLower);
    const idMatch = (applicant.id || '').toLowerCase().includes(searchTermLower);
    
    return fullNameMatch || nationalityMatch || areaMatch || phoneMatch || idMatch;
  });
  
  // Handle applicant deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this applicant?')) {
      const updatedApplicants = applicants.filter(applicant => applicant.id !== id);
      setApplicants(updatedApplicants);
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Also remove any associated photo
      localStorage.removeItem(`applicantPhoto_${id}`);
      
      toast.success('Applicant deleted successfully');
      console.log('Deleted applicant:', id);
    }
  };

  // Handle approval/rejection
  const handleApproval = (id: string, approve: boolean) => {
    console.log(`${approve ? 'Approving' : 'Rejecting'} applicant:`, id);
    const updatedApplicants = applicants.map(applicant => {
      if (applicant.id === id) {
        const updated = {
          ...applicant,
          status: approve ? 'approved' : 'rejected',
          idCardApproved: approve,
          id_card_approved: approve
        };
        console.log('Updated applicant:', updated);
        return updated;
      }
      return applicant;
    });
    
    setApplicants(updatedApplicants);
    localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
    
    toast.success(`Applicant ${approve ? 'approved' : 'rejected'} successfully`);
  };
  
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
  
  // Check if ID card is available
  const canViewIDCard = (applicant: ApplicantData) => {
    return applicant.status === 'approved' || applicant.idCardApproved === true || applicant.id_card_approved === true;
  };

  const canEditApplicants = user && [UserRole.ADMIN, UserRole.DATA_ENTRY].includes(user.role);
  const canApprove = user && user.role === UserRole.ADMIN;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading applicants...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Applicants</h1>
          <p className="text-gray-600">Manage non-citizen applicants and their ID cards ({applicants.length} total)</p>
        </div>
        
        {canEditApplicants && (
          <Link to="/applicants/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Applicant
            </Button>
          </Link>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search applicants by name, nationality, area, phone, or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ID Card</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {applicants.length === 0 
                        ? "No applicants found. Click 'New Applicant' to add one."
                        : "No applicants found matching your search."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">
                        {getApplicantProperty(applicant, 'fullName', 'full_name') || 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{applicant.id}</TableCell>
                      <TableCell>{applicant.nationality || 'N/A'}</TableCell>
                      <TableCell>{applicant.area || 'Not provided'}</TableCell>
                      <TableCell>{getApplicantProperty(applicant, 'visaType', 'visa_type') || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(applicant.status || 'pending')}</TableCell>
                      <TableCell>
                        {(applicant.idCardApproved || applicant.id_card_approved) ? (
                          <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/applicants/${applicant.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </Link>
                            </DropdownMenuItem>
                            {canEditApplicants && (
                              <>
                                <DropdownMenuItem asChild>
                                  <Link to={`/applicants/${applicant.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                  </Link>
                                </DropdownMenuItem>
                                {canApprove && applicant.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem 
                                      className="text-green-600"
                                      onClick={() => handleApproval(applicant.id, true)}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      <span>Approve</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => handleApproval(applicant.id, false)}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      <span>Reject</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {user?.role === UserRole.ADMIN && (
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDelete(applicant.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            {canViewIDCard(applicant) ? (
                              <DropdownMenuItem asChild>
                                <Link to={`/id-cards/${applicant.id}/preview`}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  <span>View ID Card</span>
                                </Link>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-gray-400"
                                disabled
                              >
                                <FileImage className="mr-2 h-4 w-4" />
                                <span>Approval Required for ID</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Applicants;

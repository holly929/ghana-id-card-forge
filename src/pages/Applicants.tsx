
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
  FileImage
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Default mock data (used when no localStorage data exists)
const defaultApplicants = [
  {
    id: '1',
    fullName: 'Ahmed Mohammed',
    nationality: 'Egyptian',
    area: 'Downtown',
    passportNumber: 'A12345678', // Keep for backwards compatibility
    dateOfBirth: '1985-03-15',
    visaType: 'Work',
    status: 'approved',
    dateCreated: '2023-07-10',
    occupation: 'Engineer',
    idCardApproved: true,
  },
  {
    id: '2',
    fullName: 'Maria Sanchez',
    nationality: 'Mexican',
    area: 'North District',
    passportNumber: 'B87654321',
    dateOfBirth: '1990-11-22',
    visaType: 'Student',
    status: 'pending',
    dateCreated: '2023-08-05',
    occupation: 'Student',
    idCardApproved: false,
  },
  {
    id: '3',
    fullName: 'John Smith',
    nationality: 'American',
    area: 'West Side',
    passportNumber: 'C45678912',
    dateOfBirth: '1978-06-30',
    visaType: 'Tourist',
    status: 'rejected',
    dateCreated: '2023-08-15',
    idCardApproved: false,
  },
  {
    id: '4',
    fullName: 'Li Wei',
    nationality: 'Chinese',
    area: 'East District',
    passportNumber: 'D98765432',
    dateOfBirth: '1992-09-18',
    visaType: 'Business',
    status: 'approved',
    dateCreated: '2023-08-20',
    idCardApproved: true,
  },
  {
    id: '5',
    fullName: 'Amit Patel',
    nationality: 'Indian',
    area: 'South Area',
    passportNumber: 'E12378945',
    dateOfBirth: '1983-12-10',
    visaType: 'Work',
    status: 'pending',
    dateCreated: '2023-08-25',
    idCardApproved: false,
  },
];

const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [applicants, setApplicants] = useState(defaultApplicants);
  
  // Load applicants from localStorage on component mount
  useEffect(() => {
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        setApplicants(JSON.parse(storedApplicants));
      } catch (error) {
        console.error('Error parsing applicants data:', error);
        toast.error('Failed to load applicant data');
      }
    }
  }, []);
  
  // Filter applicants based on search term
  const filteredApplicants = applicants.filter(applicant => 
    applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (applicant.area && applicant.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (applicant.passportNumber && applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Handle applicant deletion
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this applicant?')) {
      const updatedApplicants = applicants.filter(applicant => applicant.id !== id);
      setApplicants(updatedApplicants);
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Also remove any associated photo
      localStorage.removeItem(`applicantPhoto_${id}`);
      
      toast.success('Applicant deleted successfully');
    }
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
  const canViewIDCard = (applicant: any) => {
    return applicant.status === 'approved' || applicant.idCardApproved === true;
  };

  const canEditApplicants = user && [UserRole.ADMIN, UserRole.DATA_ENTRY].includes(user.role);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Applicants</h1>
          <p className="text-gray-600">Manage non-citizen applicants and their ID cards</p>
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
                placeholder="Search applicants by name, nationality, or area..."
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
                  <TableHead>Nationality</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ID Card</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No applicants found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.fullName}</TableCell>
                      <TableCell>{applicant.nationality}</TableCell>
                      <TableCell>{applicant.area || applicant.passportNumber || 'Not provided'}</TableCell>
                      <TableCell>{applicant.visaType}</TableCell>
                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                      <TableCell>
                        {applicant.idCardApproved && (
                          <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
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

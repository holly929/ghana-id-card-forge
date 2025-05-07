
import React, { useState } from 'react';
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
  File
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data for applicants
const mockApplicants = [
  {
    id: '1',
    fullName: 'Ahmed Mohammed',
    nationality: 'Egyptian',
    passportNumber: 'A12345678',
    dateOfBirth: '1985-03-15',
    visaType: 'Work',
    status: 'approved',
    dateCreated: '2023-07-10',
  },
  {
    id: '2',
    fullName: 'Maria Sanchez',
    nationality: 'Mexican',
    passportNumber: 'B87654321',
    dateOfBirth: '1990-11-22',
    visaType: 'Student',
    status: 'pending',
    dateCreated: '2023-08-05',
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
  },
];

const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter applicants based on search term
  const filteredApplicants = mockApplicants.filter(applicant => 
    applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
                placeholder="Search applicants by name, nationality, or passport number..."
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
                  <TableHead>Passport Number</TableHead>
                  <TableHead>Visa Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No applicants found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.fullName}</TableCell>
                      <TableCell>{applicant.nationality}</TableCell>
                      <TableCell>{applicant.passportNumber}</TableCell>
                      <TableCell>{applicant.visaType}</TableCell>
                      <TableCell>{getStatusBadge(applicant.status)}</TableCell>
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
                                {user.role === UserRole.ADMIN && (
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            <DropdownMenuItem asChild>
                              <Link to={`/id-cards/${applicant.id}/generate`}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Generate ID Card</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/id-cards/${applicant.id}/preview`}>
                                <File className="mr-2 h-4 w-4" />
                                <span>Preview ID Card</span>
                              </Link>
                            </DropdownMenuItem>
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


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Search, 
  CreditCard,
  Eye,
  Printer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

// Reusing the same mock data from Applicants page
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

const IDCards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  
  // Filter applicants based on search term
  const filteredApplicants = mockApplicants.filter(applicant => 
    applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Only show approved applicants for ID cards
  const approvedApplicants = filteredApplicants.filter(applicant => 
    applicant.status === 'approved'
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">ID Cards</h1>
          <p className="text-gray-600">Manage and print non-citizen ID cards</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ID Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, nationality, or passport number..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isMobile ? (
            // Mobile view - card layout
            <div className="space-y-4">
              {approvedApplicants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No approved applicants found for ID cards.
                </div>
              ) : (
                approvedApplicants.map((applicant) => (
                  <Card key={applicant.id} className="overflow-hidden border-l-4 border-ghana-green">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{applicant.fullName}</h3>
                          <p className="text-sm text-gray-500">{applicant.nationality}</p>
                          <p className="text-sm">Passport: {applicant.passportNumber}</p>
                          <p className="text-sm">Visa: {applicant.visaType}</p>
                        </div>
                        
                        <Badge className="bg-ghana-green text-white hover:bg-ghana-green/80">
                          Ready for Print
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/id-cards/${applicant.id}/preview`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Desktop view - table layout
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Passport Number</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>ID Card Status</TableHead>
                    <TableHead className="w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedApplicants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No approved applicants found for ID cards.
                      </TableCell>
                    </TableRow>
                  ) : (
                    approvedApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">{applicant.fullName}</TableCell>
                        <TableCell>{applicant.nationality}</TableCell>
                        <TableCell>{applicant.passportNumber}</TableCell>
                        <TableCell>{applicant.visaType}</TableCell>
                        <TableCell>
                          <Badge className="bg-ghana-green text-white hover:bg-ghana-green/80">
                            Ready for Print
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/id-cards/${applicant.id}/preview`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IDCards;

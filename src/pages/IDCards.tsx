import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Eye,
  Printer,
  FileImage,
  Files,
  Download,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import BulkPrintSelector from '@/components/BulkPrintSelector';
import BulkPrintModal from '@/components/BulkPrintModal';

// Default mock data
const mockApplicants = [
  {
    id: 'GIS-123456789',
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
  const [printFormat, setPrintFormat] = useState('standard');
  const isMobile = useIsMobile();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [showBulkSelector, setShowBulkSelector] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<any>(null);
  const navigate = useNavigate();
  
  // Load applicants from localStorage
  useEffect(() => {
    setLoading(true);
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        setApplicants(parsedApplicants);
      } catch (error) {
        console.error('Error parsing applicants data:', error);
        setApplicants(mockApplicants);
        toast.error('Failed to load applicants data');
      }
    } else {
      setApplicants(mockApplicants);
    }
    setLoading(false);
  }, []);
  
  // Filter applicants based on search term
  const filteredApplicants = applicants.filter(applicant => 
    applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (applicant.passportNumber && applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Only show approved applicants for ID cards
  const approvedApplicants = filteredApplicants.filter(applicant => 
    applicant.status === 'approved'
  );

  // Handle printing with different formats
  const handlePrint = (applicant: any) => {
    // Get logo if available
    const logo = localStorage.getItem('systemLogo');
    // Get photo if available
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
    
    // Get scale based on the print format
    let scale = 1;
    switch(printFormat) {
      case 'small':
        scale = 0.7;
        break;
      case 'large':
        scale = 1.5;
        break;
      case 'standard':
      default:
        scale = 1;
        break;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }
    
    // Add CSS and content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>${applicant.fullName} - ID Card</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .card-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                transform: scale(${scale});
                transform-origin: top center;
                margin-bottom: ${scale > 1 ? '100px' : '20px'};
              }
              .card {
                width: 85.6mm;
                height: 53.98mm;
                background: linear-gradient(to right, #006b3f, #006b3f99);
                color: white;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
              }
              .logo-container {
                text-align: center;
                margin-bottom: 10px;
              }
              .logo-image {
                max-height: 40px;
                max-width: 100px;
              }
              .photo-container {
                width: 80px;
                height: 100px;
                border: 2px solid white;
                overflow: hidden;
                margin: 5px auto;
              }
              .photo-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              .color-band {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 16px;
                display: flex;
              }
              .color-band div {
                flex: 1;
              }
              .red-band {
                background-color: #ce1126;
              }
              .yellow-band {
                background-color: #fcd116;
              }
              .green-band {
                background-color: #006b3f;
              }
              .page-break {
                page-break-after: always;
              }
              @page {
                size: auto;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <h2 style="text-align:center;margin-bottom:20px;">${applicant.fullName} - ID Card</h2>
            <div class="card">
              <!-- Card content with photo and logo -->
              <div style="display: flex; height: 100%;">
                <div style="width: 33%; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                  <div class="logo-container">
                    ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
                  </div>
                  <div class="photo-container">
                    ${photo ? `<img src="${photo}" alt="Applicant" class="photo-image" />` : ''}
                  </div>
                  <div style="margin-top: 5px; text-align: center;">
                    <div style="background: #fcd116; color: black; padding: 3px 8px; border-radius: 2px; font-weight: bold; font-size: 10px;">
                      ${applicant.visaType.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style="width: 67%; padding-left: 10px;">
                  <div style="text-align: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
                    <div style="font-size: 10px;">NON-CITIZEN IDENTITY CARD</div>
                  </div>
                  <div style="font-size: 10px;">
                    <div><strong>Name:</strong> ${applicant.fullName}</div>
                    <div><strong>Nationality:</strong> ${applicant.nationality}</div>
                    <div><strong>Expiry Date:</strong> ${new Date(applicant.dateOfBirth).toLocaleDateString()}</div>
                    <div><strong>ID No:</strong> ${applicant.id}</div>
                    <div><strong>GPS No:</strong> ${applicant.passportNumber || 'Not provided'}</div>
                    
                  </div>
                </div>
              </div>
              <div class="color-band">
                <div class="red-band"></div>
                <div class="yellow-band"></div>
                <div class="green-band"></div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    toast.success(`Printing ID card for ${applicant.fullName} in ${printFormat} format`);
  };
  
  // Handle bulk print selection
  const handleBulkPrintSelection = (selectedApplicants: any[]) => {
    // Store the selected applicants in localStorage for the print page
    try {
      localStorage.setItem('selectedApplicantsForPrint', JSON.stringify(selectedApplicants));
      // Navigate to the bulk print page
      navigate('/id-cards/print');
      toast.success(`${selectedApplicants.length} applicants selected for printing`);
    } catch (error) {
      console.error('Error storing selected applicants:', error);
      toast.error('Failed to prepare selected applicants for printing');
    }
    
    // Close the selector
    setShowBulkSelector(false);
  };
  
  // Handle delete ID card
  const handleDeleteClick = (applicant: any) => {
    setApplicantToDelete(applicant);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (applicantToDelete) {
      // Find and remove the applicant from the list
      const updatedApplicants = applicants.filter(app => app.id !== applicantToDelete.id);
      
      // Update state and localStorage
      setApplicants(updatedApplicants);
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Show success message
      toast.success(`ID card for ${applicantToDelete.fullName} has been deleted`);
      
      // Close dialog and clear selected applicant
      setDeleteDialogOpen(false);
      setApplicantToDelete(null);
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">ID Cards</h1>
          <p className="text-gray-600">Manage and print non-citizen ID cards</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={showBulkSelector} onOpenChange={setShowBulkSelector}>
            <DialogTrigger asChild>
              <Button>
                <Files className="mr-2 h-4 w-4" />
                Select & Print
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Select Applicants to Print</DialogTitle>
              </DialogHeader>
              <BulkPrintSelector 
                applicants={approvedApplicants}
                onPrintSelection={handleBulkPrintSelection} 
              />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" asChild>
            <Link to="/id-cards/print">
              <Printer className="mr-2 h-4 w-4" />
              Print All Cards
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>ID Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, nationality, or area..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="sm:w-[150px]">
              <Select
                value={printFormat}
                onValueChange={setPrintFormat}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Print Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
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
                          <p className="text-sm">Passport: {applicant.passportNumber || 'Not provided'}</p>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handlePrint(applicant)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print {printFormat}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full"
                          onClick={() => handleDeleteClick(applicant)}
                        >
                          <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                          Delete
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
                    <TableHead>Area</TableHead>
                    <TableHead>Visa Type</TableHead>
                    <TableHead>ID Card Status</TableHead>
                    <TableHead className="w-[280px]">Actions</TableHead>
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
                        <TableCell>{applicant.area || applicant.passportNumber || "Not provided"}</TableCell>
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePrint(applicant)}
                            >
                              <Printer className="h-4 w-4 mr-1" />
                              Print
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/id-cards/${applicant.id}/print`}>
                                <Download className="h-4 w-4 mr-1" />
                                Print Page
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteClick(applicant)}
                            >
                              <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                              Delete
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
      
      {/* Bulk Print Modal - Keep for backwards compatibility */}
      <BulkPrintModal
        open={showBulkPrintModal}
        onClose={() => setShowBulkPrintModal(false)}
        applicants={approvedApplicants}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ID Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the ID card for {applicantToDelete?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApplicantToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IDCards;

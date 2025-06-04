import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import BulkPrintModal from '@/components/BulkPrintModal';

const IDCards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [printFormat, setPrintFormat] = useState('standard');
  const isMobile = useIsMobile();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<any>(null);
  const [bulkPrintModalOpen, setBulkPrintModalOpen] = useState(false);
  const navigate = useNavigate();

  // Load applicants from localStorage
  useEffect(() => {
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        setApplicants(parsedApplicants);
      } catch (error) {
        console.error('Error parsing applicants:', error);
        toast.error('Failed to load applicants data');
      }
    }
    setLoading(false);
  }, []);

  const filteredApplicants = applicants.filter(applicant => 
    applicant.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (applicant.phoneNumber && applicant.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (applicant.id && applicant.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const approvedApplicants = filteredApplicants.filter(applicant => 
    applicant.status === 'approved'
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePrint = (applicant: any) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;

    let scale = 1;
    switch (printFormat) {
      case 'small': scale = 0.7; break;
      case 'large': scale = 1.5; break;
      default: scale = 1; break;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }

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
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <h2 style="text-align:center;margin-bottom:20px;">${applicant.fullName} - ID Card</h2>
            <div class="card">
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
                      ${(applicant.visaType || 'NONE').toUpperCase()}
                    </div>
                  </div>
                </div>
                <div style="width: 67%; padding-left: 10px;">
                  <div style="text-align: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
                    <div style="font-size: 10px;">NON-CITIZEN IDENTITY CARD</div>
                  </div>
                  <div style="font-size: 10px;">
                    <div><strong>Name:</strong> ${applicant.fullName || 'Not provided'}</div>
                    <div><strong>Nationality:</strong> ${applicant.nationality || 'Not provided'}</div>
                    <div><strong>Date of Birth:</strong> ${formatDate(applicant.dateOfBirth)}</div>
                    <div><strong>Phone Number:</strong> ${applicant.phoneNumber || 'Not provided'}</div>
                    <div><strong>ID No:</strong> ${applicant.id || 'Not provided'}</div>
                    <div><strong>Expiry Date:</strong> ${formatDate(applicant.expiryDate)}</div>
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

  const handleDelete = (applicant: any) => {
    setApplicantToDelete(applicant);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (applicantToDelete) {
      const updatedApplicants = applicants.filter(app => app.id !== applicantToDelete.id);
      setApplicants(updatedApplicants);
      localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      
      // Also remove the photo
      localStorage.removeItem(`applicantPhoto_${applicantToDelete.id}`);
      
      toast.success(`Deleted ${applicantToDelete.fullName}'s record`);
      setDeleteDialogOpen(false);
      setApplicantToDelete(null);
    }
  };

  const handleBulkPrint = () => {
    if (approvedApplicants.length === 0) {
      toast.error("No approved applicants to print");
      return;
    }
    setBulkPrintModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading ID cards...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">ID Cards</h1>
          <p className="text-gray-600">
            Manage and print ID cards for approved applicants
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            ID Card Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, nationality, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select
                value={printFormat}
                onValueChange={setPrintFormat}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Print Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleBulkPrint} className="flex items-center gap-2">
                <Files className="h-4 w-4" />
                Bulk Print
              </Button>
            </div>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {approvedApplicants.map((applicant) => (
                <Card key={applicant.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{applicant.fullName}</h3>
                      <Badge variant="secondary">{applicant.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>ID:</strong> {applicant.id}</p>
                      <p><strong>Nationality:</strong> {applicant.nationality}</p>
                      <p><strong>Phone:</strong> {applicant.phoneNumber || 'Not provided'}</p>
                      <p><strong>Expiry:</strong> {formatDate(applicant.expiryDate)}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/id-cards/${applicant.id}/preview`)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handlePrint(applicant)}
                        className="flex items-center gap-1"
                      >
                        <Printer className="h-3 w-3" />
                        Print
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(applicant)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedApplicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="font-medium">{applicant.fullName}</TableCell>
                    <TableCell>{applicant.id}</TableCell>
                    <TableCell>{applicant.nationality}</TableCell>
                    <TableCell>{applicant.phoneNumber || 'Not provided'}</TableCell>
                    <TableCell>{formatDate(applicant.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{applicant.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/id-cards/${applicant.id}/preview`)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePrint(applicant)}
                          className="flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3" />
                          Print
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(applicant)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {approvedApplicants.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No approved applicants found.</p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Applicant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {applicantToDelete?.fullName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkPrintModal 
        open={bulkPrintModalOpen}
        onClose={() => setBulkPrintModalOpen(false)}
        applicants={approvedApplicants}
      />
    </div>
  );
};

export default IDCards;

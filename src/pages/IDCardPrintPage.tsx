import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText, Files, Copy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  },
  // ... other default applicants
];

const IDCardPrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<string | null>(null);
  const [singleSidedPrint, setSingleSidedPrint] = useState(true);
  const [printFormat, setPrintFormat] = useState('standard');

  // Load applicants and related data
  useEffect(() => {
    let isMounted = true; // to prevent state update if unmounted

    const loadData = () => {
      setLoading(true);
      const savedLogo = localStorage.getItem('systemLogo');
      if (savedLogo && isMounted) {
        setLogo(savedLogo);
      }

      const selectedForPrint = localStorage.getItem('selectedApplicantsForPrint');
      if (selectedForPrint && !id) {
        try {
          const parsedSelected = JSON.parse(selectedForPrint);
          if (Array.isArray(parsedSelected) && parsedSelected.length > 0 && isMounted) {
            const withPhotos = parsedSelected.map((a: any) => {
              if (!a.photo) {
                const savedPhoto = localStorage.getItem(`applicantPhoto_${a.id}`);
                if (savedPhoto) {
                  return { ...a, photo: savedPhoto };
                }
              }
              return a;
            });
            setSelectedApplicants(withPhotos);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error parsing selectedApplicants:', err);
        }
      }

      const storedApplicantsStr = localStorage.getItem('applicants');
      if (storedApplicantsStr) {
        try {
          const storedApplicants = JSON.parse(storedApplicantsStr);
          const approvedApplicants = storedApplicants.filter((a: any) => a.status === 'approved');

          if (id) {
            const found = storedApplicants.find((a: any) => a.id === id && a.status === 'approved');
            if (found && isMounted) {
              if (!found.photo) {
                const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
                if (savedPhoto) {
                  found.photo = savedPhoto;
                }
              }
              setSelectedApplicants([found]);
            } else {
              toast.error(`Applicant with ID ${id} not found or not approved`);
              navigate('/id-cards');
            }
          } else {
            if (isMounted) {
              const preparedApplicants = approvedApplicants.map((a: any) => {
                if (!a.photo) {
                  const savedPhoto = localStorage.getItem(`applicantPhoto_${a.id}`);
                  if (savedPhoto) {
                    return { ...a, photo: savedPhoto };
                  }
                }
                return a;
              });
              setSelectedApplicants(preparedApplicants);
            }
          }
          if (isMounted) setApplicants(approvedApplicants);
        } catch (err) {
          console.error('Error parsing applicants:', err);
          if (isMounted) setApplicants(defaultApplicants);
        }
      } else {
        // fallback to default data
        if (isMounted) {
          const approvedApplicants = defaultApplicants.filter(a => a.status === 'approved');
          setApplicants(approvedApplicants);
          if (id) {
            const found = defaultApplicants.find(a => a.id === id && a.status === 'approved');
            if (found) {
              setSelectedApplicants([found]);
            } else {
              toast.error(`Applicant with ID ${id} not found or not approved`);
              navigate('/id-cards');
            }
          } else {
            setSelectedApplicants(approvedApplicants);
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false; // cleanup
    };
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };

  // Printing functions...
  const handlePrintAllCards = () => {
    if (selectedApplicants.length === 0) {
      toast.error('No approved applicants to print');
      return;
    }
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print.');
      return;
    }

    // scale based on format
    let scale = 1;
    switch (printFormat) {
      case 'small':
        scale = 0.8;
        break;
      case 'large':
        scale = 1.2;
        break;
      default:
        scale = 1;
    }

    printWindow.document.write(`
      <html><head><title>ID Cards - Bulk Print</title>
      <style>
        /* ... Your print styles ... */
        @media print {
          body { margin: 0; padding: 10mm; font-family: Arial, sans-serif; }
          /* your styles... */
        }
        /* (Keep your style block from your original code here) */
      </style></head><body>
      <div class="page-container">
        ${selectedApplicants.map(applicant => `
          <div class="scale-container">
            <!-- Front -->
            <div class="card-front"> ... your existing card HTML ... </div>
            <!-- Back -->
            <div class="card-back"> ... your existing card back HTML ... </div>
          </div>
        `).join('')}
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
      </body></html>
    `);
    printWindow.document.close();
    toast.success(`Printing ${selectedApplicants.length} ID cards`);
  };

  // Other functions omitted for brevity...

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading ID card data...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  if (selectedApplicants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">No Approved Applicants Found</h1>
        <p className="mb-6">No approved applicants are available for ID card printing.</p>
        <Button onClick={() => navigate('/id-cards')}>Return to ID Cards</Button>
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
          <h1 className="text-2xl font-semibold text-gray-800">ID Card Print Page</h1>
          <p className="text-gray-600">
            {selectedApplicants.length === 1
              ? `Print ID card for ${selectedApplicants[0]?.fullName}`
              : `Print ${selectedApplicants.length} ID cards on one page`}
          </p>
        </div>
      </div>

      {/* Controls: layout, format, actions */}
      {/* Your controls code here... */}

      {/* Print Preview and other UI elements */}
      {/* Your existing UI code... */}

      {/* Add the new Expiry Date field in the print preview if needed */}
    </div>
  );
};

export default IDCardPrintPage;

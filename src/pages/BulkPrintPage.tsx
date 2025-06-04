
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'sonner';

const BulkPrintPage: React.FC = () => {
  const [selectedApplicants, setSelectedApplicants] = useState<any[]>([]);
  const [printFormat, setPrintFormat] = useState('standard');
  const [layout, setLayout] = useState<'multiple' | 'single'>('multiple');
  const navigate = useNavigate();

  useEffect(() => {
    // Get selected applicants from localStorage
    const storedApplicants = localStorage.getItem('selectedApplicantsForPrint');
    if (storedApplicants) {
      try {
        const applicants = JSON.parse(storedApplicants);
        setSelectedApplicants(applicants);
      } catch (error) {
        console.error('Error parsing selected applicants:', error);
        toast.error('Failed to load selected applicants');
        navigate('/id-cards');
      }
    } else {
      toast.error('No applicants selected for printing');
      navigate('/id-cards');
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const generateCardHTML = (applicant: any) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;

    return `
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
    `;
  };

  const handlePrint = () => {
    if (selectedApplicants.length === 0) {
      toast.error('No applicants to print');
      return;
    }

    let scale = 1;
    switch (printFormat) {
      case 'small': scale = 0.7; break;
      case 'large': scale = 1.5; break;
      default: scale = 1; break;
    }

    const cardsPerPage = layout === 'multiple' ? 6 : 1;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }

    let cardsHTML = '';
    selectedApplicants.forEach((applicant, index) => {
      if (layout === 'multiple' && index % cardsPerPage === 0 && index > 0) {
        cardsHTML += '<div class="page-break"></div>';
      }
      cardsHTML += generateCardHTML(applicant);
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk ID Cards Print</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .card-container {
                display: ${layout === 'multiple' ? 'grid' : 'flex'};
                ${layout === 'multiple' 
                  ? 'grid-template-columns: repeat(2, 1fr); gap: 20px;' 
                  : 'flex-direction: column; align-items: center;'
                }
                transform: scale(${scale});
                transform-origin: top left;
                margin-bottom: ${scale > 1 ? '100px' : '20px'};
              }
              .card {
                width: 85.6mm;
                height: 53.98mm;
                background: linear-gradient(to right, #006b3f, #006b3f99);
                color: white;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: ${layout === 'single' ? '30px' : '0'};
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
                page-break-before: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            ${cardsHTML}
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
    toast.success(`Printing ${selectedApplicants.length} ID cards in ${printFormat} format`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/id-cards')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ID Cards
          </Button>
          <h1 className="text-2xl font-semibold">Bulk Print ID Cards</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Print Format</label>
              <Select value={printFormat} onValueChange={setPrintFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Layout</label>
              <Select value={layout} onValueChange={(value: 'multiple' | 'single') => setLayout(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple">Multiple per page</SelectItem>
                  <SelectItem value="single">Single per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Ready to print {selectedApplicants.length} ID card{selectedApplicants.length !== 1 ? 's' : ''}
            </p>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print All Cards
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Selected Applicants</h2>
          <div className="space-y-3">
            {selectedApplicants.map((applicant, index) => (
              <div key={applicant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{applicant.fullName}</div>
                  <div className="text-sm text-gray-500">
                    {applicant.nationality} • ID: {applicant.id}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Card {index + 1} of {selectedApplicants.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPrintPage;

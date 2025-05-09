import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";

// Default mock data (used as a fallback)
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
  
  // Load applicants from localStorage
  useEffect(() => {
    setLoading(true);
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        console.log('Loaded applicants from storage:', parsedApplicants);
        
        // Filter for approved applicants only
        const approvedApplicants = parsedApplicants.filter((a: any) => a.status === 'approved');
        setApplicants(approvedApplicants);
        
        // If we have an ID parameter, find that specific applicant
        if (id) {
          const found = parsedApplicants.find((a: any) => a.id === id);
          if (found && found.status === 'approved') {
            // Load saved photo from localStorage if not already in the applicant data
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
          // If no ID specified, use all approved applicants
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
      } catch (error) {
        console.error('Error parsing applicants data:', error);
        setApplicants(defaultApplicants);
        toast.error('Failed to load applicant data');
      }
    } else {
      console.log('No stored applicants found, using default data');
      const approvedApplicants = defaultApplicants.filter(a => a.status === 'approved');
      setApplicants(approvedApplicants);
      
      if (id) {
        const found = defaultApplicants.find(a => a.id === id);
        if (found && found.status === 'approved') {
          setSelectedApplicants([found]);
        } else {
          toast.error(`Applicant with ID ${id} not found or not approved`);
          navigate('/id-cards');
        }
      } else {
        setSelectedApplicants(approvedApplicants);
      }
    }
    setLoading(false);
  }, [id, navigate]);
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Calculate expiry date (2 years from now)
  const getExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };
  
  // Handle printing all cards
  const handlePrintAllCards = () => {
    if (selectedApplicants.length === 0) {
      toast.error("No approved applicants to print");
      return;
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
          <title>ID Cards - Bulk Print</title>
          <style>
            @media print {
              body {
                margin: 0;
                padding: 10px;
                font-family: Arial, sans-serif;
              }
              .page-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
              }
              .card-container {
                display: flex;
                flex-direction: column;
                width: 85.6mm;
                margin-bottom: 5mm;
                page-break-inside: avoid;
              }
              .card-front, .card-back {
                width: 85.6mm;
                height: 53.98mm;
                background: linear-gradient(to right, #006b3f, #006b3f99);
                color: white;
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 5px;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
              }
              .logo-container {
                text-align: center;
                margin-bottom: 5px;
              }
              .logo-image {
                max-height: 30px;
                max-width: 80px;
              }
              .photo-container {
                width: 70px;
                height: 85px;
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
                height: 12px;
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
              @page {
                size: auto;
                margin: 10mm;
              }
              .card-content {
                display: flex;
                height: calc(100% - 12px);
              }
              .left-side {
                width: 33%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
              }
              .right-side {
                width: 67%;
                padding-left: 5px;
                font-size: 9px;
              }
              .card-title {
                text-align: center;
                margin-bottom: 5px;
              }
              .card-title div:first-child {
                font-weight: bold;
                font-size: 10px;
              }
              .card-title div:last-child {
                font-size: 8px;
              }
              .visa-type {
                background: #fcd116;
                color: black;
                padding: 2px 6px;
                border-radius: 2px;
                font-weight: bold;
                font-size: 8px;
                text-align: center;
              }
              .card-info div {
                margin-bottom: 2px;
              }
              .card-info strong {
                font-weight: bold;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            ${selectedApplicants.map(applicant => `
              <div class="card-container">
                <!-- Front of ID Card -->
                <div class="card-front">
                  <div class="card-content">
                    <div class="left-side">
                      <div class="logo-container">
                        ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
                      </div>
                      <div class="photo-container">
                        ${applicant.photo ? `<img src="${applicant.photo}" alt="Applicant" class="photo-image" />` : ''}
                      </div>
                      <div style="margin-top: 3px;">
                        <div class="visa-type">
                          ${applicant.visaType.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div class="right-side">
                      <div class="card-title">
                        <div>REPUBLIC OF GHANA</div>
                        <div>NON-CITIZEN IDENTITY CARD</div>
                      </div>
                      <div class="card-info">
                        <div><strong>Name:</strong> ${applicant.fullName}</div>
                        <div><strong>Nationality:</strong> ${applicant.nationality}</div>
                        <div><strong>Date of Birth:</strong> ${formatDate(applicant.dateOfBirth)}</div>
                        <div><strong>ID No:</strong> ${applicant.id}</div>
                        <div><strong>Passport No:</strong> ${applicant.passportNumber || 'Not provided'}</div>
                        <div><strong>Expiry Date:</strong> ${formatDate(getExpiryDate())}</div>
                      </div>
                    </div>
                  </div>
                  <div class="color-band">
                    <div class="red-band"></div>
                    <div class="yellow-band"></div>
                    <div class="green-band"></div>
                  </div>
                </div>
                
                <!-- Back of ID Card -->
                <div class="card-back">
                  <div style="text-align: center; margin-bottom: 8px;">
                    <div style="font-weight: bold; font-size: 10px;">REPUBLIC OF GHANA</div>
                    <div style="font-size: 8px;">This card remains the property of the Ghana Immigration Service</div>
                  </div>
                  <div style="font-size: 9px; margin-bottom: 8px;">
                    <div><strong>Occupation:</strong> ${applicant.occupation || 'Not specified'}</div>
                    <div><strong>Date of Issue:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</div>
                  </div>
                  <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 4px; margin-top: 8px;">
                    <div style="text-align: center; font-size: 8px;">If found, please return to the nearest Ghana Immigration Service office</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: auto; position: absolute; bottom: 20px; left: 10px; right: 10px;">
                    <div style="width: 70px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 7px; padding-top: 2px;">
                      Holder's Signature
                    </div>
                    <div style="width: 70px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 7px; padding-top: 2px;">
                      Issuing Officer
                    </div>
                  </div>
                  <div class="color-band">
                    <div class="red-band"></div>
                    <div class="yellow-band"></div>
                    <div class="green-band"></div>
                  </div>
                </div>
              </div>
            `).join('')}
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
    toast.success(`Printing ${selectedApplicants.length} ID cards`);
  };
  
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
        <Button onClick={() => navigate('/id-cards')}>
          Return to ID Cards
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/id-cards')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">ID Card Print Page</h1>
          <p className="text-gray-600">
            {selectedApplicants.length === 1 
              ? `Print ID card for ${selectedApplicants[0]?.fullName}`
              : `Print ${selectedApplicants.length} ID cards on one page`
            }
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button onClick={handlePrintAllCards} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print All Cards ({selectedApplicants.length})
        </Button>
        
        <Button variant="outline" onClick={() => navigate('/id-cards')} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Back to ID Cards
        </Button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Print Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click the Print button above to print all {selectedApplicants.length} cards on a single page. 
          The cards will be arranged to maximize space usage on standard A4 paper.
        </p>
        
        <div className="bg-white p-4 rounded border border-gray-300 text-center">
          <p className="text-gray-500">
            {selectedApplicants.length} ID cards will be printed with front and back sides.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IDCardPrintPage;

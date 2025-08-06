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
import { ArrowLeft, Printer, Eye, Files } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const ViewAllIDCards: React.FC = () => {
  const [applicants, setApplicants] = useState<ApplicantData[]>([]);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [printFormat, setPrintFormat] = useState('standard');
  const [layout, setLayout] = useState<'multiple' | 'single'>('multiple');
  const navigate = useNavigate();

  useEffect(() => {
    // Load applicants from localStorage
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        // Filter only approved applicants
        const approvedApplicants = parsedApplicants.filter((applicant: ApplicantData) => 
          applicant.status === 'approved' || applicant.idCardApproved === true || applicant.id_card_approved === true
        );
        setApplicants(approvedApplicants);
      } catch (error) {
        console.error('Error parsing applicants:', error);
        toast.error('Failed to load applicants data');
        navigate('/id-cards');
      }
    } else {
      toast.error('No applicants found');
      navigate('/id-cards');
    }
  }, [navigate]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getExpiryDate = (applicant: ApplicantData) => {
    const expiryDate = getApplicantProperty(applicant, 'expiryDate', 'expiry_date');
    if (expiryDate) {
      return expiryDate;
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };

  const generateCardHTML = (applicant: ApplicantData) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
    const globalSignature = localStorage.getItem('issuingOfficerSignature');
    const countryName = localStorage.getItem('countryName') || '';
    const companyName = localStorage.getItem('companyName') || '';
    const cardType = localStorage.getItem('cardType') || 'NON-CITIZEN IDENTITY CARD';
    const cardLabels = JSON.parse(localStorage.getItem('cardLabels') || '{}');
    const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
    const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
    const dateOfBirth = getApplicantProperty(applicant, 'dateOfBirth', 'date_of_birth');
    const visaType = getApplicantProperty(applicant, 'visaType', 'visa_type');

    return `
      <div class="id-card-preview" data-applicant-id="${applicant.id}">
        <div class="card-content">
          <div class="left-side">
            <div class="logo-container">
              ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
            </div>
            <div class="photo-container">
              ${photo ? `<img src="${photo}" alt="Photo" class="photo-image" />` : ''}
            </div>
            <div class="visa-type">
              ${(visaType || 'NONE').toUpperCase()}
            </div>
          </div>
          <div class="right-side">
            <div class="card-title">
              ${countryName ? `<div class="country-name">${countryName}</div>` : ''}
              ${companyName ? `<div class="company-name">${companyName}</div>` : ''}
              <div class="card-type">${cardType}</div>
            </div>
            <div class="card-info">
              <div class="info-row">
                <span class="label">${cardLabels.name || 'Name'}:</span>
                <span class="value">${fullName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.nationality || 'Nationality'}:</span>
                <span class="value">${applicant.nationality || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.dateOfBirth || 'Date of Birth'}:</span>
                <span class="value">${dateOfBirth ? formatDate(dateOfBirth) : 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.occupation || 'Occupation'}:</span>
                <span class="value">${applicant.occupation || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.idNo || 'ID No'}:</span>
                <span class="value">${applicant.id || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.issueDate || 'Date of Issue'}:</span>
                <span class="value">${applicant.dateCreated ? formatDate(applicant.dateCreated) : 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="label">${cardLabels.expiryDate || 'Expiry Date'}:</span>
                <span class="value">${formatDate(getExpiryDate(applicant))}</span>
              </div>
              ${customFields.filter((field: any) => field.position === 'front').map((field: any) => `
                <div class="info-row">
                  <span class="label">${field.label}:</span>
                  <span class="value">${field.value}</span>
                </div>
              `).join('')}
            </div>
            
            <!-- Issuing Officer Signature Section -->
            <div class="signature-container">
              <div class="signature-box">
                ${globalSignature ? 
                  `<div class="signature-image-container">
                     <img src="${globalSignature}" alt="Officer Signature" class="signature-image" />
                   </div>` : 
                  '<div class="signature-line"></div>'
                }
                <div class="signature-label">${cardLabels.issuingOfficer || 'Issuing Officer'}</div>
              </div>
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

  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map(app => app.id));
    }
  };

  const handleSelectApplicant = (id: string) => {
    setSelectedApplicants(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handlePrintSelected = () => {
    if (selectedApplicants.length === 0) {
      toast.error('Please select at least one applicant to print');
      return;
    }

    const selectedApplicantData = applicants.filter(app => selectedApplicants.includes(app.id));
    
    // Print directly without navigating to bulk print page
    printSelectedCards(selectedApplicantData);
  };

  const printSelectedCards = (selectedCards: any[]) => {
    let scale = 1;
    switch (printFormat) {
      case 'small': scale = 0.7; break;
      case 'large': scale = 1.5; break;
      default: scale = 1; break;
    }

    const cardsPerPage = layout === 'multiple' ? 9 : 1;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }

    // Generate all cards with proper page breaks
    let allCardsHTML = '';
    let currentPageCards = '';
    let cardsOnCurrentPage = 0;

    selectedCards.forEach((applicant, index) => {
      const cardHTML = generatePrintCardHTML(applicant);
      
      if (layout === 'single') {
        if (index > 0) {
          allCardsHTML += '<div class="page-break"></div>';
        }
        allCardsHTML += cardHTML;
      } else {
        currentPageCards += cardHTML;
        cardsOnCurrentPage++;
        
        if (cardsOnCurrentPage === cardsPerPage || index === selectedCards.length - 1) {
          if (allCardsHTML !== '') {
            allCardsHTML += '<div class="page-break"></div>';
          }
          allCardsHTML += `<div class="card-page">${currentPageCards}</div>`;
          currentPageCards = '';
          cardsOnCurrentPage = 0;
        }
      }
    });

    const printHTML = `
      <html>
        <head>
          <title>ID Cards Print - ${selectedCards.length} cards</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
              padding: 10px;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 10px;
              }
              
              @page {
                size: auto;
                margin: 10mm;
              }
            }
            
            .card-page {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              justify-content: center;
              max-width: 100%;
              margin-bottom: 20px;
            }
            
            .card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(135deg, #006b3f 0%, #004d2e 100%);
              color: white;
              padding: 8px;
              border-radius: 6px;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              border: 1px solid #003d26;
              transform: scale(${scale});
              transform-origin: top left;
              page-break-inside: avoid;
              margin: 5px;
            }
            
            .card-content {
              display: flex;
              height: calc(100% - 12px);
              position: relative;
              z-index: 2;
            }
            
            .left-side {
              width: 33%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding-top: 5px;
              gap: 5px;
            }
            
            .right-side {
              width: 67%;
              padding-left: 8px;
              font-size: 8px;
              display: flex;
              flex-direction: column;
            }
            
            .logo-container {
              text-align: center;
              margin-bottom: 8px;
              height: 25px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .logo-image {
              max-height: 25px;
              max-width: 60px;
              object-fit: contain;
            }
            
            .photo-container {
              width: 55px;
              height: 70px;
              border: 2px solid white;
              overflow: hidden;
              margin: 5px 0;
              background: rgba(255,255,255,0.1);
            }
            
            .photo-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .visa-type {
              background: #fcd116;
              color: #000;
              padding: 2px 4px;
              border-radius: 2px;
              font-weight: bold;
              font-size: 7px;
              text-align: center;
              min-width: 50px;
            }
            
            .signature-section {
              text-align: center;
              margin-top: 8px;
            }
            
            .signature-image-wrapper {
              height: 25px;
              width: 60px;
              margin: 0 auto 3px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(255,255,255,0.15);
              border: 1px solid rgba(255,255,255,0.4);
              border-radius: 3px;
            }
            
            .signature-line {
              height: 25px;
              width: 60px;
              margin: 0 auto 3px;
              border-bottom: 1px solid white;
            }
            
            .signature-label {
              font-size: 7px;
              text-align: center;
              border-top: 1px solid rgba(255,255,255,0.5);
              padding-top: 2px;
              font-weight: bold;
              color: white;
            }
            
            .card-title {
              text-align: center;
              margin-bottom: 8px;
            }
            
            .country-name {
              font-weight: bold;
              font-size: 10px;
              line-height: 1.1;
              color: #fcd116;
            }
            
            .company-name {
              font-size: 8px;
              line-height: 1.1;
              margin-top: 1px;
              color: #fcd116;
            }
            
            .card-type {
              font-size: 9px;
              line-height: 1.2;
              margin-top: 2px;
              font-weight: bold;
              color: white;
            }
            
            .card-info {
              flex: 1;
              margin-bottom: 5px;
            }
            
            .info-columns {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 5px;
              height: 100%;
            }
            
            .info-column {
              display: flex;
              flex-direction: column;
              gap: 1px;
            }
            
            .card-info .info-row {
              margin-bottom: 1px;
              line-height: 1.1;
              display: flex;
              flex-direction: column;
              font-size: 6px;
            }
            
            .card-info .label {
              font-weight: bold;
              color: #fcd116;
              font-size: 5px;
            }
            
            .card-info .value {
              word-break: break-word;
              margin-top: 1px;
            }
            
            .footer-text {
              border-top: 1px solid rgba(255,255,255,0.3);
              padding-top: 2px;
              text-align: center;
              font-size: 5px;
              line-height: 1.2;
              margin-top: auto;
            }
            
            .signature-image {
              max-height: 100%;
              max-width: 100%;
              object-fit: contain;
            }
            
            .color-band {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 12px;
              display: flex;
              z-index: 1;
            }
            
            .red-band { background-color: #ce1126; flex: 1; }
            .yellow-band { background-color: #fcd116; flex: 1; }
            .green-band { background-color: #006b3f; flex: 1; }
            
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              .card-page {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 5mm;
                width: 100%;
                margin-bottom: 0;
                page-break-inside: avoid;
              }
              
              ${layout === 'single' ? `
                .card-page {
                  grid-template-columns: 1fr;
                  justify-items: center;
                }
                .card {
                  margin: 20mm auto;
                }
              ` : ''}
            }
          </style>
        </head>
        <body>
          ${allCardsHTML}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  const generatePrintCardHTML = (applicant: ApplicantData) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
    const globalSignature = localStorage.getItem('issuingOfficerSignature');
    const countryName = localStorage.getItem('countryName') || '';
    const companyName = localStorage.getItem('companyName') || '';
    const cardType = localStorage.getItem('cardType') || 'NON-CITIZEN IDENTITY CARD';
    const cardLabels = JSON.parse(localStorage.getItem('cardLabels') || '{}');
    const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
    const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
    const dateOfBirth = getApplicantProperty(applicant, 'dateOfBirth', 'date_of_birth');
    const visaType = getApplicantProperty(applicant, 'visaType', 'visa_type');

    return `
      <div class="card">
        <div class="card-content">
          <div class="left-side">
            <div class="logo-container">
              ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
            </div>
            <div class="photo-container">
              ${photo ? `<img src="${photo}" alt="Photo" class="photo-image" />` : ''}
            </div>
            <div class="visa-type">
              ${(visaType || 'NONE').toUpperCase()}
            </div>
            <div class="signature-section">
              ${globalSignature ? 
                `<div class="signature-image-wrapper">
                   <img src="${globalSignature}" alt="Officer Signature" class="signature-image" />
                 </div>` : 
                '<div class="signature-line"></div>'
              }
              <div class="signature-label">${cardLabels.issuingOfficer || 'Issuing Officer'}</div>
            </div>
          </div>
          <div class="right-side">
            <div class="card-title">
              ${countryName ? `<div class="country-name">${countryName}</div>` : ''}
              ${companyName ? `<div class="company-name">${companyName}</div>` : ''}
              <div class="card-type">${cardType}</div>
            </div>
            <div class="card-info">
              <div class="info-columns">
                <div class="info-column">
                  <div class="info-row">
                    <span class="label">${cardLabels.name || 'Name'}:</span>
                    <span class="value">${fullName || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.nationality || 'Nationality'}:</span>
                    <span class="value">${applicant.nationality || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.dateOfBirth || 'Date of Birth'}:</span>
                    <span class="value">${dateOfBirth ? formatDate(dateOfBirth) : 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.occupation || 'Occupation'}:</span>
                    <span class="value">${applicant.occupation || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.issueDate || 'Date of Issue'}:</span>
                    <span class="value">${applicant.dateCreated ? formatDate(applicant.dateCreated) : 'N/A'}</span>
                  </div>
                </div>
                <div class="info-column">
                  <div class="info-row">
                    <span class="label">${cardLabels.idNo || 'ID No'}:</span>
                    <span class="value">${applicant.id || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.expiryDate || 'Expiry Date'}:</span>
                    <span class="value">${formatDate(getExpiryDate(applicant))}</span>
                  </div>
                  ${customFields.filter((field: any) => field.position === 'front').map((field: any) => `
                    <div class="info-row">
                      <span class="label">${field.label}:</span>
                      <span class="value">${field.value || 'N/A'}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
            
            <div class="footer-text">
              <div>This card remains the property of the issuing authority</div>
              <div>If found, please return to the nearest issuing authority office</div>
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

  const handlePreviewApplicant = (applicant: ApplicantData) => {
    navigate(`/id-cards/${applicant.id}/preview`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/id-cards')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ID Cards
          </Button>
          <h1 className="text-2xl font-semibold">View All ID Cards</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Print Options & Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                    <SelectItem value="multiple">Multiple per page (9 cards)</SelectItem>
                    <SelectItem value="single">Single per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {selectedApplicants.length === applicants.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-gray-600 flex items-center">
                  {selectedApplicants.length} of {applicants.length} selected
                </span>
              </div>
              
              <Button 
                onClick={handlePrintSelected}
                disabled={selectedApplicants.length === 0}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Selected ({selectedApplicants.length})
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {applicants.map((applicant) => {
            const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
            const isSelected = selectedApplicants.includes(applicant.id);
            
            return (
              <Card 
                key={applicant.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-lg'
                }`}
                onClick={() => handleSelectApplicant(applicant.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-sm truncate">{fullName}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewApplicant(applicant);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mini ID Card Preview */}
                  <div 
                    className="w-full aspect-[1.6/1] bg-gradient-to-r from-green-700 to-green-600 text-white text-xs rounded overflow-hidden relative"
                    dangerouslySetInnerHTML={{ __html: generateCardHTML(applicant) }}
                  />
                  
                  <div className="mt-3 text-xs text-gray-600">
                    <p><strong>ID:</strong> {applicant.id}</p>
                    <p><strong>Nationality:</strong> {applicant.nationality}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {applicants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No approved applicants found for ID card generation.</p>
            <Button
              variant="outline"
              onClick={() => navigate('/id-cards')}
              className="mt-4"
            >
              Go Back to ID Cards
            </Button>
          </div>
        )}

        <style>{`
          .id-card-preview {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #006b3f 0%, #004d2e 100%);
            color: white;
            padding: 4px;
            border-radius: 3px;
            position: relative;
            overflow: hidden;
            box-sizing: border-box;
            border: 1px solid #003d26;
            font-size: 4px;
          }
          
          .card-content {
            display: flex;
            height: calc(100% - 6px);
            position: relative;
            z-index: 2;
          }
          
          .left-side {
            width: 35%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 2px;
          }
          
          .right-side {
            width: 65%;
            padding-left: 4px;
            font-size: 4px;
            display: flex;
            flex-direction: column;
          }
          
          .logo-container {
            text-align: center;
            margin-bottom: 3px;
            height: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .logo-image {
            max-height: 8px;
            max-width: 20px;
            object-fit: contain;
          }
          
          .photo-container {
            width: 18px;
            height: 22px;
            border: 1px solid white;
            overflow: hidden;
            margin: 2px 0;
            background: rgba(255,255,255,0.1);
          }
          
          .photo-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .visa-type {
            background: #fcd116;
            color: #000;
            padding: 1px 2px;
            border-radius: 1px;
            font-weight: bold;
            font-size: 3px;
            text-align: center;
            margin-top: 2px;
            min-width: 16px;
          }
          
          .card-title {
            text-align: center;
            margin-bottom: 3px;
          }
          
          .country-name {
            font-weight: bold;
            font-size: 4px;
            line-height: 1.1;
            color: #fcd116;
          }
          
          .company-name {
            font-size: 3px;
            line-height: 1.1;
            margin-top: 0.5px;
            color: #fcd116;
          }
          
          .card-type {
            font-size: 3px;
            line-height: 1.1;
            margin-top: 1px;
          }
          
          .card-info {
            flex: 1;
          }
          
          .card-info .info-row {
            margin-bottom: 1px;
            line-height: 1.2;
            display: flex;
            font-size: 3px;
          }
          
          .card-info .label {
            font-weight: bold;
            min-width: 12px;
            margin-right: 1px;
          }
          
          .card-info .value {
            flex: 1;
            word-break: break-word;
          }
          
          .signature-container {
            display: flex;
            justify-content: center;
            margin-top: 2px;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-image-container {
            height: 6px;
            width: 16px;
            margin-bottom: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .signature-image {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
          }
          
          .signature-line {
            height: 6px;
            margin-bottom: 1px;
            border-bottom: 0.5px solid white;
            width: 16px;
          }
          
          .signature-label {
            font-size: 2.5px;
            text-align: center;
            border-top: 0.5px solid rgba(255,255,255,0.5);
            padding-top: 0.5px;
          }
          
          .color-band {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 6px;
            display: flex;
            z-index: 1;
          }
          
          .red-band { background-color: #ce1126; flex: 1; }
          .yellow-band { background-color: #fcd116; flex: 1; }
          .green-band { background-color: #006b3f; flex: 1; }
        `}</style>
      </div>
    </div>
  );
};

export default ViewAllIDCards;
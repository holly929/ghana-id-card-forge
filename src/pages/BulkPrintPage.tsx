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

  const getExpiryDate = (applicant: any) => {
    if (applicant.expiryDate || applicant.expiry_date) {
      return applicant.expiryDate || applicant.expiry_date;
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };

  const generateCardHTML = (applicant: any) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
    const cardLabels = JSON.parse(localStorage.getItem('cardLabels') || '{}');
    const customFields = JSON.parse(localStorage.getItem('customFields') || '[]');
    const globalSignature = localStorage.getItem('issuingOfficerSignature');
    const countryName = localStorage.getItem('countryName') || '';
    const companyName = localStorage.getItem('companyName') || '';
    const cardType = localStorage.getItem('cardType') || cardLabels.subtitle || 'NON-CITIZEN IDENTITY CARD';
    
    // Debug logging to identify the issue
    console.log('=== BULK PRINT DEBUG ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('globalSignature exists:', globalSignature ? 'YES' : 'NO');
    console.log('globalSignature length:', globalSignature ? globalSignature.length : 0);
    console.log('cardType value:', `"${cardType}"`);
    console.log('countryName value:', `"${countryName}"`);
    console.log('companyName value:', `"${companyName}"`);
    console.log('cardLabels object:', cardLabels);
    console.log('========================');

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
              ${(applicant.visaType || 'NONE').toUpperCase()}
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
                    <span class="value">${applicant.fullName || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.nationality || 'Nationality'}:</span>
                    <span class="value">${applicant.nationality || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.dateOfBirth || 'Date of Birth'}:</span>
                    <span class="value">${formatDate(applicant.dateOfBirth)}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.occupation || 'Occupation'}:</span>
                    <span class="value">${applicant.occupation || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">${cardLabels.issueDate || 'Date of Issue'}:</span>
                    <span class="value">${formatDate(applicant.dateCreated)}</span>
                  </div>
                </div>
                <div class="info-column">
                  <div class="info-row">
                    <span class="label">${cardLabels.idNo || 'ID No'}:</span>
                    <span class="value">${applicant.id || 'Not provided'}</span>
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

  const handlePrint = () => {
    if (selectedApplicants.length === 0) {
      toast.error('No applicants to print');
      return;
    }

    console.log(`Starting bulk print for ${selectedApplicants.length} applicants`);

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

    selectedApplicants.forEach((applicant, index) => {
      console.log(`Processing card ${index + 1} for applicant: ${applicant.fullName}`);
      
      const cardHTML = generateCardHTML(applicant);
      
      if (layout === 'single') {
        // For single layout, each card gets its own page
        if (index > 0) {
          allCardsHTML += '<div class="page-break"></div>';
        }
        allCardsHTML += cardHTML;
      } else {
        // For multiple layout, group cards by page
        currentPageCards += cardHTML;
        cardsOnCurrentPage++;
        
        // If we've reached the cards per page limit or this is the last card
        if (cardsOnCurrentPage === cardsPerPage || index === selectedApplicants.length - 1) {
          if (allCardsHTML !== '') {
            allCardsHTML += '<div class="page-break"></div>';
          }
          allCardsHTML += `<div class="card-page">${currentPageCards}</div>`;
          currentPageCards = '';
          cardsOnCurrentPage = 0;
        }
      }
    });

    console.log('Generated HTML for all cards, opening print window');

    const printHTML = `
      <html>
        <head>
          <title>Bulk ID Cards Print - ${selectedApplicants.length} cards</title>
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
            console.log('Print window loaded with ${selectedApplicants.length} cards');
            window.onload = function() {
              console.log('Starting print process...');
              setTimeout(function() {
                window.print();
                setTimeout(function() { 
                  console.log('Print dialog closed, closing window');
                  window.close(); 
                }, 1000);
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    toast.success(`Printing ${selectedApplicants.length} ID cards in ${printFormat} format with ${layout} layout`);
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
                  <SelectItem value="multiple">Multiple per page (9 cards)</SelectItem>
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

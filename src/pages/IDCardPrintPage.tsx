import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText, Files, Copy } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Default mock data (used as a fallback)
const defaultApplicants = [
  {
    id: 'GIS-123456789',
    fullName: 'Ahmed Mohammed',
    nationality: 'Egyptian',
    dateOfBirth: '1985-03-15',
    visaType: 'Work',
    status: 'approved',
    dateCreated: '2023-07-10',
    occupation: 'Engineer',
    photo: null,
  },
];

interface CustomField {
  id: string;
  label: string;
  value: string;
  position: 'front' | 'back';
}

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
  
  // Add state for customization settings
  const [cardLabels, setCardLabels] = useState({
    title: 'REPUBLIC OF GHANA',
    subtitle: 'NON-CITIZEN IDENTITY CARD',
    name: 'Name:',
    nationality: 'Nationality:',
    dateOfBirth: 'Date of Birth:',
    idNo: 'ID No:',
    expiryDate: 'Expiry Date:',
    occupation: 'Occupation:',
    issueDate: 'Date of Issue:',
    issuingOfficer: 'Issuing Officer',
  });

  const [footerSettings, setFooterSettings] = useState({
    mainFooter: 'If found, please return to the nearest Ghana Immigration Service office',
    backFooter: 'This card remains the property of the Ghana Immigration Service',
    showMainFooter: true,
    showBackFooter: true
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Load applicants from localStorage
  useEffect(() => {
    setLoading(true);
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    // Load customization settings
    const savedLabels = localStorage.getItem('cardLabels');
    if (savedLabels) {
      try {
        setCardLabels(JSON.parse(savedLabels));
      } catch (e) {
        console.error("Error parsing card labels:", e);
      }
    }

    const savedFooterSettings = localStorage.getItem('footerSettings');
    if (savedFooterSettings) {
      try {
        setFooterSettings(JSON.parse(savedFooterSettings));
      } catch (e) {
        console.error("Error parsing footer settings:", e);
      }
    }

    const savedCustomFields = localStorage.getItem('customFields');
    if (savedCustomFields) {
      try {
        setCustomFields(JSON.parse(savedCustomFields));
      } catch (e) {
        console.error("Error parsing custom fields:", e);
      }
    }
    
    // First check if we have selected applicants for bulk printing
    const selectedForPrint = localStorage.getItem('selectedApplicantsForPrint');
    if (selectedForPrint && !id) {
      try {
        const parsedSelected = JSON.parse(selectedForPrint);
        if (Array.isArray(parsedSelected) && parsedSelected.length > 0) {
          // Update their photos if needed
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
          return; // Exit early since we already have what we need
        }
      } catch (error) {
        console.error('Error parsing selected applicants:', error);
        // Continue with normal loading
      }
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
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Calculate expiry date helper - UPDATED
  const getExpiryDate = (applicant: any) => {
    // Use provided expiry date or calculate default (2 years from now)
    if (applicant.expiryDate || applicant.expiry_date) {
      return applicant.expiryDate || applicant.expiry_date;
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };
  
  // Handle printing all cards - UPDATED to use global signature
  const handlePrintAllCards = () => {
    if (selectedApplicants.length === 0) {
      toast.error("No approved applicants to print");
      return;
    }
    
    console.log('Starting print process with applicants:', selectedApplicants.length);
    
    try {
      // Create a new window for printing with better dimensions
      const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print.");
        return;
      }

      // Get the global issuing officer signature
      const globalSignature = localStorage.getItem('issuingOfficerSignature');
      
      // Get scale based on the print format
      let scale = 1;
      switch(printFormat) {
        case 'small':
          scale = 0.8;
          break;
        case 'large':
          scale = 1.2;
          break;
        case 'standard':
        default:
          scale = 1;
          break;
      }

      // Get front and back custom fields
      const frontCustomFields = customFields.filter(field => field.position === 'front');
      const backCustomFields = customFields.filter(field => field.position === 'back');
      
      // Simplified and more reliable HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>ID Cards - Bulk Print</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
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
                
                .no-print {
                  display: none !important;
                }
                
                @page {
                  size: auto;
                  margin: 10mm;
                }
              }
              
              .page-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
                max-width: 100%;
              }
              
              .card-container {
                display: flex;
                flex-direction: ${singleSidedPrint ? 'row' : 'column'};
                width: ${singleSidedPrint ? 'auto' : '90mm'};
                margin-bottom: 10mm;
                page-break-inside: avoid;
                gap: 5px;
                transform: scale(${scale});
                transform-origin: top left;
              }
              
              .card-front, .card-back {
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
              }
              
              .card-content {
                display: flex;
                height: calc(100% - 12px);
                position: relative;
                z-index: 2;
              }
              
              .left-side {
                width: 35%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding-top: 5px;
              }
              
              .right-side {
                width: 65%;
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
                margin-top: 5px;
                min-width: 50px;
              }
              
              .card-title {
                text-align: center;
                margin-bottom: 8px;
              }
              
              .card-title .main-title {
                font-weight: bold;
                font-size: 9px;
                line-height: 1.1;
              }
              
              .card-title .sub-title {
                font-size: 7px;
                line-height: 1.1;
                margin-top: 2px;
              }
              
              .card-info {
                flex: 1;
              }
              
              .card-info .info-row {
                margin-bottom: 2px;
                line-height: 1.2;
                display: flex;
                font-size: 7px;
              }
              
              .card-info .label {
                font-weight: bold;
                min-width: 35px;
                margin-right: 2px;
              }
              
              .card-info .value {
                flex: 1;
                word-break: break-word;
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
              
              .back-content {
                width: 100%;
                display: flex;
                flex-direction: column;
                height: 100%;
              }
              
              .back-footer {
                border-top: 1px solid rgba(255,255,255,0.3);
                padding-top: 4px;
                margin-top: auto;
                text-align: center;
                font-size: 6px;
              }
              
              .signature-area {
                display: flex;
                justify-content: space-between;
                margin-top: auto;
                position: absolute;
                bottom: 20px;
                left: 8px;
                right: 8px;
              }
              
              .signature-box {
                width: 60px;
                border-top: 1px solid rgba(255,255,255,0.5);
                text-align: center;
                font-size: 6px;
                padding-top: 2px;
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="text-align: center; margin-bottom: 20px; padding: 10px; background: #f0f0f0;">
              <h2>ID Cards Print Preview - ${selectedApplicants.length} cards</h2>
              <p>Click Print when ready or close this window to cancel</p>
              <button onclick="window.print()" style="margin: 10px; padding: 10px 20px; font-size: 16px;">Print Cards</button>
              <button onclick="window.close()" style="margin: 10px; padding: 10px 20px; font-size: 16px;">Cancel</button>
            </div>
            
            <div class="page-container">
              ${selectedApplicants.map(applicant => `
                <div class="card-container">
                  <!-- Front of ID Card -->
                  <div class="card-front">
                    <div class="card-content">
                      <div class="left-side">
                        <div class="logo-container">
                          ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : '<div style="font-size: 8px; color: rgba(255,255,255,0.7);">LOGO</div>'}
                        </div>
                        <div class="photo-container">
                          ${applicant.photo ? `<img src="${applicant.photo}" alt="Photo" class="photo-image" />` : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 6px; color: rgba(255,255,255,0.7);">PHOTO</div>'}
                        </div>
                        <div class="visa-type">
                          ${((applicant.visaType || applicant.visa_type) || 'NONE').toUpperCase()}
                        </div>
                      </div>
                      <div class="right-side">
                        <div class="card-title">
                          <div class="main-title">${cardLabels.title}</div>
                          <div class="sub-title">${cardLabels.subtitle}</div>
                        </div>
                         <div class="card-info" style="flex: 1;">
                          <div class="info-row">
                            <span class="label">${cardLabels.name}</span>
                            <span class="value">${(applicant.fullName || applicant.full_name) || 'Not provided'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">${cardLabels.nationality}</span>
                            <span class="value">${applicant.nationality || 'Not provided'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">${cardLabels.dateOfBirth}</span>
                            <span class="value">${formatDate(applicant.dateOfBirth || applicant.date_of_birth)}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">Phone:</span>
                            <span class="value">${(applicant.phoneNumber || applicant.phone_number) || 'Not provided'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">${cardLabels.idNo}</span>
                            <span class="value">${applicant.id || 'Not provided'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">${cardLabels.expiryDate}</span>
                            <span class="value">${formatDate(getExpiryDate(applicant))}</span>
                          </div>
                          ${frontCustomFields.map(field => `
                            <div class="info-row">
                              <span class="label">${field.label}:</span>
                              <span class="value">${field.value}</span>
                            </div>
                          `).join('')}
                        </div>
                        
                        <!-- Issuing Officer Signature Section - Moved to Front -->
                        <div style="display: flex; justify-content: center; margin-top: 5px;">
                          <div style="text-align: center;">
                            ${globalSignature ? 
                              `<div style="height: 15px; width: 40px; margin-bottom: 2px; display: flex; align-items: center; justify-content: center;">
                                 <img src="${globalSignature}" alt="Officer Signature" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
                               </div>` : 
                              '<div style="height: 15px; margin-bottom: 2px; border-bottom: 1px solid white; width: 40px;"></div>'
                            }
                            <div style="font-size: 6px; text-align: center; border-top: 1px solid rgba(255,255,255,0.5); padding-top: 1px;">${cardLabels.issuingOfficer}</div>
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
                  
                  <!-- Back of ID Card -->
                  <div class="card-back">
                    <div class="card-content">
                      <div class="back-content">
                        <div class="card-title">
                          <div class="main-title">${cardLabels.title}</div>
                          ${footerSettings.showBackFooter ? `<div class="sub-title">${footerSettings.backFooter}</div>` : ''}
                        </div>
                        <div class="card-info">
                          <div class="info-row">
                            <span class="label">${cardLabels.occupation}</span>
                            <span class="value">${applicant.occupation || 'Not specified'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">Area:</span>
                            <span class="value">${applicant.area || 'Not provided'}</span>
                          </div>
                          <div class="info-row">
                            <span class="label">${cardLabels.issueDate}</span>
                            <span class="value">${formatDate(new Date().toISOString().split('T')[0])}</span>
                          </div>
                          ${backCustomFields.map(field => `
                            <div class="info-row">
                              <span class="label">${field.label}:</span>
                              <span class="value">${field.value}</span>
                            </div>
                          `).join('')}
                        </div>
                        ${footerSettings.showMainFooter ? `
                          <div class="back-footer">
                            ${footerSettings.mainFooter}
                          </div>
                        ` : ''}
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
              console.log('Print window loaded with ${selectedApplicants.length} cards');
              
              // Auto-print after a short delay (optional - can be removed if not desired)
              setTimeout(function() {
                // Uncomment the next line to enable auto-print
                // window.print();
              }, 1000);
              
              // Close window after printing (if auto-print is enabled)
              window.addEventListener('afterprint', function() {
                setTimeout(function() { 
                  window.close(); 
                }, 1000);
              });
            </script>
          </body>
        </html>
      `;
      
      console.log('Writing HTML content to print window');
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      console.log('Print window setup complete');
      toast.success(`Print window opened with ${selectedApplicants.length} ID cards`);
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to open print dialog. Error: ' + error.message);
    }
  };
  
  // Handle duplicate printing - print multiple copies
  const handleDuplicatePrint = () => {
    toast.info('Preparing duplicate print...');
    // Simply call the existing print function
    handlePrintAllCards();
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
              ? `Print ID card for ${selectedApplicants[0]?.fullName || selectedApplicants[0]?.full_name}`
              : `Print ${selectedApplicants.length} ID cards on one page`
            }
          </p>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <div className="text-sm font-medium">Print Layout</div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="single-sided" 
              checked={singleSidedPrint}
              onCheckedChange={setSingleSidedPrint} 
            />
            <Label htmlFor="single-sided">Single-sided layout (save paper)</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Size</div>
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
        
        <div className="space-y-2 sm:col-span-2 md:col-span-1">
          <div className="text-sm font-medium">Actions</div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePrintAllCards} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print All Cards ({selectedApplicants.length})
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/id-cards')} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Back to ID Cards
            </Button>
            
            <Button variant="secondary" onClick={handleDuplicatePrint} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Print Duplicates
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Print Preview</h3>
        <p className="text-sm text-gray-600 mb-4">
          {singleSidedPrint 
            ? "Cards will be printed with front and back side-by-side on the same page to save paper."
            : "Cards will be printed with front and back sides stacked (traditional layout)."
          }
        </p>
        
        <div className="bg-white p-4 rounded border border-gray-300">
          {singleSidedPrint ? (
            <div className="flex items-center justify-center">
              <div className="relative h-24 w-80 bg-gradient-to-r from-ghana-green to-ghana-green/70 rounded-md flex">
                <div className="w-1/2 border-r border-white/20 flex items-center justify-center text-white text-xs">
                  Front Side
                </div>
                <div className="w-1/2 flex items-center justify-center text-white text-xs">
                  Back Side
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                  <div className="flex-1 bg-red-600"></div>
                  <div className="flex-1 bg-yellow-400"></div>
                  <div className="flex-1 bg-green-600"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative h-16 w-40 bg-gradient-to-r from-ghana-green to-ghana-green/70 rounded-md flex items-center justify-center text-white text-xs">
                Front Side
                <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                  <div className="flex-1 bg-red-600"></div>
                  <div className="flex-1 bg-yellow-400"></div>
                  <div className="flex-1 bg-green-600"></div>
                </div>
              </div>
              <div className="relative h-16 w-40 bg-gradient-to-r from-ghana-green to-ghana-green/70 rounded-md flex items-center justify-center text-white text-xs">
                Back Side
                <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                  <div className="flex-1 bg-red-600"></div>
                  <div className="flex-1 bg-yellow-400"></div>
                  <div className="flex-1 bg-green-600"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h3 className="text-lg font-medium mb-3">Cards to Print ({selectedApplicants.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {selectedApplicants.map(applicant => (
            <div key={applicant.id} className="border rounded-md p-2 bg-white flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {applicant.photo ? (
                  <img src={applicant.photo} alt={applicant.fullName || applicant.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500">No photo</span>
                )}
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium text-sm">{applicant.fullName || applicant.full_name}</div>
                <div className="text-xs text-gray-500">{applicant.nationality} • {applicant.area || 'No area'}</div>
                <div className="text-xs text-gray-400">Expires: {formatDate(getExpiryDate(applicant))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IDCardPrintPage;

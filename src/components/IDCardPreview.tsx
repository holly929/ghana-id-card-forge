
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Printer, Download, Upload, Camera, Edit, Save, Archive, Files } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { handleImageUpload, optimizeImage } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";

interface IDCardPreviewProps {
  applicant: {
    id: string;
    fullName: string;
    nationality: string;
    passportNumber?: string;
    dateOfBirth: string;
    expiryDate?: string; // Make expiry date optional but available
    visaType: string;
    occupation?: string;
    photo?: string | null;
  };
}

const IDCardPreview: React.FC<IDCardPreviewProps> = ({ applicant }) => {
  const isMobile = useIsMobile();
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  // State for customizable fields
  const [cardLabels, setCardLabels] = useState({
    title: 'REPUBLIC OF GHANA',
    subtitle: 'NON-CITIZEN IDENTITY CARD',
    name: 'Name:',
    nationality: 'Nationality:',
    dateOfBirth: 'Date of Birth:',
    idNo: 'ID No:',
    passportNo: 'Passport No:',
    expiryDate: 'Expiry Date:',
    occupation: 'Occupation:',
    issueDate: 'Date of Issue:',
    footer: 'If found, please return to the nearest Ghana Immigration Service office',
    holderSignature: 'Holder\'s Signature',
    issuingOfficer: 'Issuing Officer',
  });

  // State for editable footer
  const [footer, setFooter] = useState('If found, please return to the nearest Ghana Immigration Service office');
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(false);
  
  // State for photo
  const [photo, setPhoto] = useState<string | null>(null);
  
  // State for logo
  const [logo, setLogo] = useState<string | null>(null);
  
  // State for print format
  const [printFormat, setPrintFormat] = useState('standard');
  
  // State for single-page print option
  const [singlePagePrint, setSinglePagePrint] = useState(true);
  
  // Load system logo and settings from localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    const savedLabels = localStorage.getItem('cardLabels');
    if (savedLabels) {
      try {
        const parsedLabels = JSON.parse(savedLabels);
        setCardLabels(parsedLabels);
      } catch (e) {
        console.error("Error parsing card labels:", e);
      }
    }
    
    const savedFooter = localStorage.getItem('cardFooter');
    if (savedFooter) {
      setFooter(savedFooter);
    }
    
    // Load applicant photo if available
    if (applicant && applicant.id) {
      // Try loading from localStorage
      const savedPhoto = localStorage.getItem(`applicantPhoto_${applicant.id}`);
      if (savedPhoto) {
        setPhoto(savedPhoto);
      } else if (applicant.photo) {
        // If not in localStorage but provided in props
        setPhoto(applicant.photo);
      }
    }
  }, [applicant]);
  
  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('cardLabels', JSON.stringify(cardLabels));
    localStorage.setItem('cardFooter', footer);
    setIsEditing(false);
    toast.success("Card customizations saved successfully");
  };

  // Backup current settings
  const backupSettings = () => {
    const backup = {
      cardLabels,
      footer,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cardSettingsBackup', JSON.stringify(backup));
    toast.success("Settings backed up successfully");
  };

  // Restore settings from backup
  const restoreSettings = () => {
    const backup = localStorage.getItem('cardSettingsBackup');
    if (backup) {
      try {
        const backupData = JSON.parse(backup);
        setCardLabels(backupData.cardLabels);
        setFooter(backupData.footer);
        localStorage.setItem('cardLabels', JSON.stringify(backupData.cardLabels));
        localStorage.setItem('cardFooter', backupData.footer);
        toast.success("Settings restored successfully");
      } catch (e) {
        toast.error("Failed to restore settings");
      }
    } else {
      toast.error("No backup found");
    }
  };
  
  // Calculate expiry date (2 years from now) - fallback if not provided
  const getExpiryDate = () => {
    if (applicant.expiryDate) {
      return applicant.expiryDate;
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Handle photo upload - Fixed for reliability
  const handlePhotoUpload = async () => {
    // Fix: Manually trigger the file input click
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };
  
  // Handle the actual file selection
  const handlePhotoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    try {
      handleImageUpload(
        file,
        async (result) => {
          try {
            // Optimize image before saving
            const optimized = await optimizeImage(result);
            
            setPhoto(optimized);
            // Save photo for this specific applicant
            localStorage.setItem(`applicantPhoto_${applicant.id}`, optimized);
            // Update the applicant data in localStorage too
            updateApplicantPhotoInStorage(applicant.id, optimized);
            toast.success("Photo uploaded successfully");
          } catch (error) {
            console.error("Error optimizing image:", error);
            setPhoto(result);
            localStorage.setItem(`applicantPhoto_${applicant.id}`, result);
            updateApplicantPhotoInStorage(applicant.id, result);
            toast.success("Photo uploaded successfully");
          }
        },
        { maxSizeMB: 1 }  // Smaller size limit for ID photos
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload photo");
      }
    }
    
    // Reset the input value to allow selecting the same file again
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };
  
  // Update applicant photo in the localStorage applicants array
  const updateApplicantPhotoInStorage = (id: string, photoData: string) => {
    try {
      const storedApplicants = localStorage.getItem('applicants');
      if (storedApplicants) {
        const applicants = JSON.parse(storedApplicants);
        const updatedApplicants = applicants.map((app: any) => {
          if (app.id === id) {
            return { ...app, photo: photoData };
          }
          return app;
        });
        localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      }
    } catch (error) {
      console.error("Error updating applicant photo in storage:", error);
    }
  };
  
  // Handle printing with different formats and single/double page option
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }
    
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
    
    // Add CSS and content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card Print</title>
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
              .card-front, .card-back {
                width: 85.6mm;
                height: 53.98mm;
                background: linear-gradient(to right, #006b3f, #006b3f99);
                color: white;
                padding: 16px;
                border-radius: 8px;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
              }
              .card-front {
                margin-bottom: ${singlePagePrint ? '5px' : '20px'};
              }
              .card-layout {
                display: ${singlePagePrint ? 'flex' : 'block'};
                flex-direction: ${singlePagePrint ? 'row' : 'column'};
                gap: ${singlePagePrint ? '10px' : '0'};
                justify-content: ${singlePagePrint ? 'center' : 'flex-start'};
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
                ${singlePagePrint ? 'display: none;' : 'page-break-after: always;'}
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
            <div class="card-layout">
              <div class="card-front">
                <!-- Front card content with photo and logo -->
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
                      <div style="font-weight: bold; font-size: 12px;">${cardLabels.title}</div>
                      <div style="font-size: 10px;">${cardLabels.subtitle}</div>
                    </div>
                    <div style="font-size: 10px;">
                      <div><strong>${cardLabels.name}</strong> ${applicant.fullName}</div>
                      <div><strong>${cardLabels.nationality}</strong> ${applicant.nationality}</div>
                      <div><strong>${cardLabels.dateOfBirth}</strong> ${formatDate(applicant.dateOfBirth)}</div>
                      <div><strong>${cardLabels.idNo}</strong> ${applicant.id}</div>
                      <div><strong>${cardLabels.passportNo}</strong> ${applicant.passportNumber || 'Not provided'}</div>
                      <div><strong>${cardLabels.expiryDate}</strong> ${formatDate(getExpiryDate())}</div>
                    </div>
                  </div>
                </div>
                <div class="color-band">
                  <div class="red-band"></div>
                  <div class="yellow-band"></div>
                  <div class="green-band"></div>
                </div>
              </div>
              <div class="page-break"></div>
              <div class="card-back">
                <!-- Back card content -->
                <div style="text-align: center; margin-bottom: 10px;">
                  <div style="font-weight: bold; font-size: 12px;">${cardLabels.title}</div>
                  <div style="font-size: 9px;">This card remains the property of the Ghana Immigration Service</div>
                </div>
                <div style="font-size: 10px; margin-bottom: 10px;">
                  <div><strong>${cardLabels.occupation}</strong> ${applicant.occupation || 'Not specified'}</div>
                  <div><strong>${cardLabels.issueDate}</strong> ${formatDate(new Date().toISOString().split('T')[0])}</div>
                </div>
                <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px; margin-top: 10px;">
                  <div style="text-align: center; font-size: 9px;">${footer}</div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: auto; position: absolute; bottom: 25px; left: 10px; right: 10px;">
                  <div style="width: 80px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 8px; padding-top: 2px;">
                    ${cardLabels.holderSignature}
                  </div>
                  <div style="width: 80px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 8px; padding-top: 2px;">
                    ${cardLabels.issuingOfficer}
                  </div>
                </div>
                <div class="color-band">
                  <div class="red-band"></div>
                  <div class="yellow-band"></div>
                  <div class="green-band"></div>
                </div>
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
    toast.success(`Printing ID card in ${printFormat} format${singlePagePrint ? ' on single page' : ''}`);
  };
  
  // Fixed version of download PDF functionality
  const handleDownloadPDF = () => {
    toast.info("Preparing PDF for download...");
    handlePrint();
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Action Buttons - Now more responsive */}
      <div className="mb-6 flex flex-wrap items-center gap-2 justify-center w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className={`${isMobile ? 'w-full' : ''}`}>
              <Printer className="mr-2 h-4 w-4" />
              Print ID Card
            </Button>
            <Select
              value={printFormat}
              onValueChange={setPrintFormat}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className={`${isMobile ? 'w-full' : ''}`} 
            onClick={handleDownloadPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          {/* Add single page print toggle */}
          <Button 
            variant={singlePagePrint ? "secondary" : "outline"}
            onClick={() => setSinglePagePrint(!singlePagePrint)}
            className={`${isMobile ? 'w-full' : ''}`}
          >
            <Files className="mr-2 h-4 w-4" />
            {singlePagePrint ? "Single Page" : "Double Page"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button 
            variant={isEditing ? "secondary" : "outline"}
            onClick={() => isEditing ? saveSettings() : setIsEditing(true)}
            className={`${isMobile ? 'w-full' : ''}`}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Customizations
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Customize Card
              </>
            )}
          </Button>
          
          {/* Fixed photo upload button */}
          <Button 
            variant="secondary" 
            className={`${isMobile ? 'w-full' : ''}`}
            onClick={handlePhotoUpload}
          >
            <Camera className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
          <Input 
            type="file" 
            ref={photoInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={handlePhotoFileSelected}
          />
        </div>
      </div>
      
      {/* Backup and Restore buttons */}
      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={backupSettings}
          className={`${isMobile ? 'w-[48%]' : ''}`}
        >
          <Archive className="mr-2 h-4 w-4" />
          Backup Settings
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={restoreSettings}
          className={`${isMobile ? 'w-[48%]' : ''}`}
        >
          <Upload className="mr-2 h-4 w-4" />
          Restore Settings
        </Button>
      </div>
      
      {isEditing && (
        <div className="mb-6 p-4 border rounded-lg w-full max-w-xl">
          <h3 className="font-medium mb-3">Customize Card Labels</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">Title</label>
              <Input 
                value={cardLabels.title}
                onChange={(e) => setCardLabels({...cardLabels, title: e.target.value})}
                className="mb-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Subtitle</label>
              <Input 
                value={cardLabels.subtitle}
                onChange={(e) => setCardLabels({...cardLabels, subtitle: e.target.value})}
                className="mb-2"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Name Label</label>
              <Input 
                value={cardLabels.name}
                onChange={(e) => setCardLabels({...cardLabels, name: e.target.value})}
                className="mb-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Nationality Label</label>
              <Input 
                value={cardLabels.nationality}
                onChange={(e) => setCardLabels({...cardLabels, nationality: e.target.value})}
                className="mb-2"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">DOB Label</label>
              <Input 
                value={cardLabels.dateOfBirth}
                onChange={(e) => setCardLabels({...cardLabels, dateOfBirth: e.target.value})}
                className="mb-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">ID Number Label</label>
              <Input 
                value={cardLabels.idNo}
                onChange={(e) => setCardLabels({...cardLabels, idNo: e.target.value})}
                className="mb-2"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Passport Label</label>
              <Input 
                value={cardLabels.passportNo}
                onChange={(e) => setCardLabels({...cardLabels, passportNo: e.target.value})}
                className="mb-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Expiry Date Label</label>
              <Input 
                value={cardLabels.expiryDate}
                onChange={(e) => setCardLabels({...cardLabels, expiryDate: e.target.value})}
                className="mb-2"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-500">Occupation Label</label>
              <Input 
                value={cardLabels.occupation}
                onChange={(e) => setCardLabels({...cardLabels, occupation: e.target.value})}
                className="mb-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Issue Date Label</label>
              <Input 
                value={cardLabels.issueDate}
                onChange={(e) => setCardLabels({...cardLabels, issueDate: e.target.value})}
                className="mb-2"
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <label className="text-xs text-gray-500">Footer Text</label>
              <Input 
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                className="mb-2"
              />
            </div>
            
            <div className="col-span-1 sm:col-span-2">
              <Button onClick={saveSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Customizations
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* ID Card Front - Responsive adjustments */}
      <div className={`w-full max-w-[350px] ${isMobile ? 'scale-90 origin-top' : ''}`}>
        <Card className="w-full h-[220px] p-4 mb-6 bg-gradient-to-r from-ghana-green to-ghana-green/70 text-white overflow-hidden relative">
          {/* Security pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute text-white text-xs"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              >
                GHANA IMMIGRATION SERVICE
              </div>
            ))}
          </div>
          
          <div className="relative z-10 flex h-full">
            {/* Left side - Photo and logo */}
            <div className="w-1/3 flex flex-col justify-between items-center">
              <div className="flex items-center justify-center">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-6 w-auto" />
                ) : (
                  <Shield className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="w-24 h-28 bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
                {photo ? (
                  <img src={photo} alt="Applicant" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-white/70">Photo</span>
                )}
              </div>
              
              <div className="mt-2 flex flex-col items-center">
                <div className="w-20 h-8 bg-ghana-yellow flex items-center justify-center rounded-sm">
                  <div className="text-xs font-bold text-ghana-black">
                    {applicant.visaType.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Card details */}
            <div className="w-2/3 pl-2">
              <div className="text-center mb-2">
                <h3 className="text-sm font-bold text-white">{cardLabels.title}</h3>
                <h4 className="text-xs font-bold">{cardLabels.subtitle}</h4>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.name}</span>
                  <span className="col-span-2">{applicant.fullName}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.nationality}</span>
                  <span className="col-span-2">{applicant.nationality}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.dateOfBirth}</span>
                  <span className="col-span-2">{formatDate(applicant.dateOfBirth)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.idNo}</span>
                  <span className="col-span-2">{applicant.id}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.passportNo}</span>
                  <span className="col-span-2">{applicant.passportNumber || 'Not provided'}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.expiryDate}</span>
                  <span className="col-span-2">{formatDate(getExpiryDate())}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Color band at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex h-4">
            <div className="flex-1 bg-ghana-red"></div>
            <div className="flex-1 bg-ghana-yellow"></div>
            <div className="flex-1 bg-ghana-green"></div>
          </div>
        </Card>
      </div>
      
      {/* ID Card Back - Responsive adjustments */}
      <div className={`w-full max-w-[350px] ${isMobile ? 'scale-90 origin-top' : ''}`}>
        <Card className="w-full h-[220px] p-4 bg-gradient-to-r from-ghana-green to-ghana-green/70 text-white overflow-hidden relative">
          {/* Security pattern */}
          <div className="absolute inset-0 opacity-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute text-white text-xs"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              >
                GHANA IMMIGRATION SERVICE
              </div>
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-white">{cardLabels.title}</h3>
              <p className="text-xs">This card remains the property of the Ghana Immigration Service</p>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-white">{cardLabels.occupation}</span>
                <span className="col-span-2">{applicant.occupation || 'Not specified'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-white">{cardLabels.issueDate}</span>
                <span className="col-span-2">{formatDate(new Date().toISOString().split('T')[0])}</span>
              </div>
            </div>
            
            <div className="mt-4 border-t border-white/20 pt-2">
              <p className="text-xs text-center">{footer}</p>
            </div>
            
            <div className="mt-auto flex justify-between items-end">
              <div className="w-1/3 border-t border-white/40 pt-1 text-center">
                <p className="text-xs">{cardLabels.holderSignature}</p>
              </div>
              
              <div className="w-1/3 border-t border-white/40 pt-1 text-center">
                <p className="text-xs">{cardLabels.issuingOfficer}</p>
              </div>
            </div>
          </div>
          
          {/* Color band at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex h-4">
            <div className="flex-1 bg-ghana-red"></div>
            <div className="flex-1 bg-ghana-yellow"></div>
            <div className="flex-1 bg-ghana-green"></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IDCardPreview;

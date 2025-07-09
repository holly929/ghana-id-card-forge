import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Printer, Download, Upload, Camera, Edit, Save, Archive, Files, Plus, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface IDCardPreviewProps {
  applicant: {
    id: string;
    fullName: string;
    nationality: string;
    passportNumber?: string;
    dateOfBirth: string;
    expiryDate?: string;
    visaType?: string;
    occupation?: string;
    photo?: string | null;
    phoneNumber?: string;
    area?: string;
    issuingOfficerSignature?: string;
  };
}

interface CustomField {
  id: string;
  label: string;
  value: string;
  position: 'front' | 'back';
}

const IDCardPreview: React.FC<IDCardPreviewProps> = ({ applicant }) => {
  const isMobile = useIsMobile();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  
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

  // State for custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newCustomField, setNewCustomField] = useState({
    label: '',
    value: '',
    position: 'front' as 'front' | 'back'
  });

  // State for footer settings
  const [footerSettings, setFooterSettings] = useState({
    mainFooter: 'If found, please return to the nearest Ghana Immigration Service office',
    backFooter: 'This card remains the property of the Ghana Immigration Service',
    showMainFooter: true,
    showBackFooter: true
  });
  
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
  
  // State for issuing officer signature
  const [issuingOfficerSignature, setIssuingOfficerSignature] = useState<string | null>(null);
  
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
    
    // Load footer settings
    const savedFooterSettings = localStorage.getItem('footerSettings');
    if (savedFooterSettings) {
      try {
        const parsedFooterSettings = JSON.parse(savedFooterSettings);
        setFooterSettings(parsedFooterSettings);
      } catch (e) {
        console.error("Error parsing footer settings:", e);
      }
    }
    
    // Load custom fields
    const savedCustomFields = localStorage.getItem('customFields');
    if (savedCustomFields) {
      try {
        const parsedCustomFields = JSON.parse(savedCustomFields);
        setCustomFields(parsedCustomFields);
      } catch (e) {
        console.error("Error parsing custom fields:", e);
      }
    }
    
    // Load applicant photo if available
    if (applicant && applicant.id) {
      const savedPhoto = localStorage.getItem(`applicantPhoto_${applicant.id}`);
      if (savedPhoto) {
        setPhoto(savedPhoto);
      } else if (applicant.photo) {
        setPhoto(applicant.photo);
      }
    }

    // Load applicant signature if available
    if (applicant && applicant.id) {
      const savedSignature = localStorage.getItem(`applicantSignature_${applicant.id}`);
      if (savedSignature) {
        setIssuingOfficerSignature(savedSignature);
      } else if (applicant.issuingOfficerSignature) {
        setIssuingOfficerSignature(applicant.issuingOfficerSignature);
      }
    }
  }, [applicant]);
  
  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('cardLabels', JSON.stringify(cardLabels));
    localStorage.setItem('footerSettings', JSON.stringify(footerSettings));
    localStorage.setItem('customFields', JSON.stringify(customFields));
    setIsEditing(false);
    toast.success("Card customizations saved successfully");
  };

  // Add custom field
  const addCustomField = () => {
    if (newCustomField.label.trim() && newCustomField.value.trim()) {
      const newField: CustomField = {
        id: Date.now().toString(),
        label: newCustomField.label.trim(),
        value: newCustomField.value.trim(),
        position: newCustomField.position
      };
      setCustomFields([...customFields, newField]);
      setNewCustomField({ label: '', value: '', position: 'front' });
      toast.success("Custom field added");
    } else {
      toast.error("Please fill in both label and value");
    }
  };

  // Remove custom field
  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
    toast.success("Custom field removed");
  };

  // Backup current settings
  const backupSettings = () => {
    const backup = {
      cardLabels,
      footerSettings,
      customFields,
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
        setFooterSettings(backupData.footerSettings || footerSettings);
        setCustomFields(backupData.customFields || []);
        localStorage.setItem('cardLabels', JSON.stringify(backupData.cardLabels));
        localStorage.setItem('footerSettings', JSON.stringify(backupData.footerSettings || footerSettings));
        localStorage.setItem('customFields', JSON.stringify(backupData.customFields || []));
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
  
  // Get visa type with fallback
  const getVisaType = () => {
    return applicant.visaType || 'None';
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
            const optimized = await optimizeImage(result);
            setPhoto(optimized);
            localStorage.setItem(`applicantPhoto_${applicant.id}`, optimized);
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
        { maxSizeMB: 1 }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload photo");
      }
    }
    
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };
  
  // Handle signature upload
  const handleSignatureUpload = async () => {
    if (signatureInputRef.current) {
      signatureInputRef.current.click();
    }
  };
  
  // Handle the actual signature file selection
  const handleSignatureFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    try {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Signature size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setIssuingOfficerSignature(result);
        localStorage.setItem(`applicantSignature_${applicant.id}`, result);
        updateApplicantSignatureInStorage(applicant.id, result);
        toast.success("Signature uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload signature");
      }
    }
    
    if (signatureInputRef.current) {
      signatureInputRef.current.value = '';
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

  // Update applicant signature in the localStorage applicants array
  const updateApplicantSignatureInStorage = (id: string, signatureData: string) => {
    try {
      const storedApplicants = localStorage.getItem('applicants');
      if (storedApplicants) {
        const applicants = JSON.parse(storedApplicants);
        const updatedApplicants = applicants.map((app: any) => {
          if (app.id === id) {
            return { ...app, issuingOfficerSignature: signatureData };
          }
          return app;
        });
        localStorage.setItem('applicants', JSON.stringify(updatedApplicants));
      }
    } catch (error) {
      console.error("Error updating applicant signature in storage:", error);
    }
  };
  
  // Handle printing with different formats and single/double page option - FIXED
  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print.");
        return;
      }
      
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

      // Get front and back custom fields
      const frontCustomFields = customFields.filter(field => field.position === 'front');
      const backCustomFields = customFields.filter(field => field.position === 'back');
      
      const htmlContent = `
        <html>
          <head>
            <title>ID Card Print - ${applicant.fullName}</title>
            <style>
              @media print {
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: Arial, sans-serif;
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
                  padding: 10px;
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                  box-sizing: border-box;
                  page-break-inside: avoid;
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
                  margin-bottom: 8px;
                }
                .logo-image {
                  max-height: 30px;
                  max-width: 80px;
                }
                .photo-container {
                  width: 60px;
                  height: 75px;
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
                .page-break {
                  ${singlePagePrint ? 'display: none;' : 'page-break-after: always;'}
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
                  padding-left: 8px;
                  font-size: 9px;
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
                  margin-bottom: 1px;
                  line-height: 1.2;
                }
                .card-info strong {
                  font-weight: bold;
                }
                .card-title {
                  text-align: center;
                  margin-bottom: 8px;
                }
                .card-title div:first-child {
                  font-weight: bold;
                  font-size: 10px;
                }
                .card-title div:last-child {
                  font-size: 8px;
                }
              }
            </style>
          </head>
          <body>
            <div class="card-container">
              <h2 style="text-align:center;margin-bottom:20px;">${applicant.fullName} - ID Card</h2>
              <div class="card-layout">
                <div class="card-front">
                  <div class="card-content">
                    <div class="left-side">
                      <div class="logo-container">
                        ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
                      </div>
                      <div class="photo-container">
                        ${photo ? `<img src="${photo}" alt="Applicant" class="photo-image" />` : ''}
                      </div>
                      <div style="margin-top: 3px;">
                        <div class="visa-type">
                          ${getVisaType().toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div class="right-side">
                      <div class="card-title">
                        <div>${cardLabels.title}</div>
                        <div>${cardLabels.subtitle}</div>
                      </div>
                      <div class="card-info">
                        <div><strong>${cardLabels.name}</strong> ${applicant.fullName}</div>
                        <div><strong>${cardLabels.nationality}</strong> ${applicant.nationality}</div>
                        <div><strong>${cardLabels.dateOfBirth}</strong> ${formatDate(applicant.dateOfBirth)}</div>
                        <div><strong>Phone:</strong> ${applicant.phoneNumber || 'Not provided'}</div>
                        <div><strong>${cardLabels.idNo}</strong> ${applicant.id}</div>
                        <div><strong>${cardLabels.expiryDate}</strong> ${formatDate(getExpiryDate())}</div>
                        ${frontCustomFields.map(field => `<div><strong>${field.label}:</strong> ${field.value}</div>`).join('')}
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
                  <div class="card-content">
                    <div style="width: 100%;">
                      <div class="card-title">
                        <div>${cardLabels.title}</div>
                        ${footerSettings.showBackFooter ? `<div style="font-size: 8px;">${footerSettings.backFooter}</div>` : ''}
                      </div>
                      <div class="card-info">
                        <div><strong>${cardLabels.occupation}</strong> ${applicant.occupation || 'Not specified'}</div>
                        <div><strong>Area:</strong> ${applicant.area || 'Not provided'}</div>
                        <div><strong>${cardLabels.issueDate}</strong> ${formatDate(new Date().toISOString().split('T')[0])}</div>
                        ${backCustomFields.map(field => `<div><strong>${field.label}:</strong> ${field.value}</div>`).join('')}
                      </div>
                      ${footerSettings.showMainFooter ? `
                        <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 4px; margin-top: 8px;">
                          <div style="text-align: center; font-size: 8px;">${footerSettings.mainFooter}</div>
                        </div>
                      ` : ''}
                      <div style="display: flex; justify-content: space-between; margin-top: auto; position: absolute; bottom: 20px; left: 10px; right: 10px;">
                        <div style="width: 70px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 7px; padding-top: 2px;">
                          ${cardLabels.holderSignature}
                        </div>
                        <div style="width: 70px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 7px; padding-top: 2px;">
                          ${cardLabels.issuingOfficer}
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
              </div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 1000);
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success(`Printing ID card in ${printFormat} format${singlePagePrint ? ' on single page' : ''}`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to open print dialog');
    }
  };
  
  // Fixed version of download PDF functionality
  const handleDownloadPDF = () => {
    toast.info("Preparing PDF for download...");
    handlePrint();
  };

  // Get front and back custom fields for preview
  const frontCustomFields = customFields.filter(field => field.position === 'front');
  const backCustomFields = customFields.filter(field => field.position === 'back');
  
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
          
          <Button 
            variant="secondary" 
            className={`${isMobile ? 'w-full' : ''}`}
            onClick={handleSignatureUpload}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Signature
          </Button>
          <Input 
            type="file" 
            ref={signatureInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={handleSignatureFileSelected}
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
        <div className="mb-6 p-4 border rounded-lg w-full max-w-4xl">
          <h3 className="font-medium mb-4">Customize Card Settings</h3>
          
          {/* Card Labels Section */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Card Labels</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-500">Title</Label>
                <Input 
                  value={cardLabels.title}
                  onChange={(e) => setCardLabels({...cardLabels, title: e.target.value})}
                  className="mb-2"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Subtitle</Label>
                <Input 
                  value={cardLabels.subtitle}
                  onChange={(e) => setCardLabels({...cardLabels, subtitle: e.target.value})}
                  className="mb-2"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Name Label</Label>
                <Input 
                  value={cardLabels.name}
                  onChange={(e) => setCardLabels({...cardLabels, name: e.target.value})}
                  className="mb-2"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Nationality Label</Label>
                <Input 
                  value={cardLabels.nationality}
                  onChange={(e) => setCardLabels({...cardLabels, nationality: e.target.value})}
                  className="mb-2"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">DOB Label</Label>
                <Input 
                  value={cardLabels.dateOfBirth}
                  onChange={(e) => setCardLabels({...cardLabels, dateOfBirth: e.target.value})}
                  className="mb-2"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">ID Number Label</Label>
                <Input 
                  value={cardLabels.idNo}
                  onChange={(e) => setCardLabels({...cardLabels, idNo: e.target.value})}
                  className="mb-2"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-500">Occupation Label</Label>
                <Input 
                  value={cardLabels.occupation}
                  onChange={(e) => setCardLabels({...cardLabels, occupation: e.target.value})}
                  className="mb-2"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Issue Date Label</Label>
                <Input 
                  value={cardLabels.issueDate}
                  onChange={(e) => setCardLabels({...cardLabels, issueDate: e.target.value})}
                  className="mb-2"
                />
              </div>
            </div>
          </div>

          {/* Footer Settings Section */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Footer Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showMainFooter"
                  checked={footerSettings.showMainFooter}
                  onChange={(e) => setFooterSettings({...footerSettings, showMainFooter: e.target.checked})}
                />
                <Label htmlFor="showMainFooter">Show main footer</Label>
              </div>
              {footerSettings.showMainFooter && (
                <div>
                  <Label className="text-xs text-gray-500">Main Footer Text</Label>
                  <Input 
                    value={footerSettings.mainFooter}
                    onChange={(e) => setFooterSettings({...footerSettings, mainFooter: e.target.value})}
                    className="mb-2"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showBackFooter"
                  checked={footerSettings.showBackFooter}
                  onChange={(e) => setFooterSettings({...footerSettings, showBackFooter: e.target.checked})}
                />
                <Label htmlFor="showBackFooter">Show back header footer</Label>
              </div>
              {footerSettings.showBackFooter && (
                <div>
                  <Label className="text-xs text-gray-500">Back Header Footer Text</Label>
                  <Input 
                    value={footerSettings.backFooter}
                    onChange={(e) => setFooterSettings({...footerSettings, backFooter: e.target.value})}
                    className="mb-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Custom Fields Section */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Custom Fields</h4>
            
            {/* Add new custom field */}
            <div className="border rounded p-3 mb-4">
              <h5 className="text-sm font-medium mb-2">Add New Custom Field</h5>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Field label"
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField({...newCustomField, label: e.target.value})}
                />
                <Input
                  placeholder="Field value"
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField({...newCustomField, value: e.target.value})}
                />
                <Select
                  value={newCustomField.position}
                  onValueChange={(value) => setNewCustomField({...newCustomField, position: value as 'front' | 'back'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addCustomField} size="sm">
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>
            
            {/* Existing custom fields */}
            {customFields.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Existing Custom Fields</h5>
                {customFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 border rounded">
                    <div className="flex-1">
                      <span className="font-medium text-sm">{field.label}:</span> {field.value}
                      <span className="text-xs text-gray-500 ml-2">({field.position})</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeCustomField(field.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="col-span-1 sm:col-span-2">
            <Button onClick={saveSettings} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save All Customizations
            </Button>
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
                    {getVisaType().toUpperCase()}
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
                  <span className="font-semibold text-white">Phone:</span>
                  <span className="col-span-2">{applicant.phoneNumber || 'Not provided'}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.idNo}</span>
                  <span className="col-span-2">{applicant.id}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.expiryDate}</span>
                  <span className="col-span-2">{formatDate(getExpiryDate())}</span>
                </div>

                {/* Display front custom fields */}
                {frontCustomFields.map((field) => (
                  <div key={field.id} className="grid grid-cols-3 gap-1">
                    <span className="font-semibold text-white">{field.label}:</span>
                    <span className="col-span-2">{field.value}</span>
                  </div>
                ))}
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
              {footerSettings.showBackFooter && (
                <p className="text-xs">{footerSettings.backFooter}</p>
              )}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-white">{cardLabels.occupation}</span>
                <span className="col-span-2">{applicant.occupation || 'Not specified'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-white">Area:</span>
                <span className="col-span-2">{applicant.area || 'Not provided'}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-white">{cardLabels.issueDate}</span>
                <span className="col-span-2">{formatDate(new Date().toISOString().split('T')[0])}</span>
              </div>

              {/* Display back custom fields */}
              {backCustomFields.map((field) => (
                <div key={field.id} className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{field.label}:</span>
                  <span className="col-span-2">{field.value}</span>
                </div>
              ))}
            </div>
            
            {footerSettings.showMainFooter && (
              <div className="mt-4 border-t border-white/20 pt-2">
                <p className="text-xs text-center">{footerSettings.mainFooter}</p>
              </div>
            )}
            
            <div className="mt-auto flex justify-between items-end">
              <div className="w-1/3 border-t border-white/40 pt-1 text-center">
                <p className="text-xs">{cardLabels.holderSignature}</p>
              </div>
              
              <div className="w-1/3 border-t border-white/40 pt-1 text-center flex flex-col items-center">
                <div className="h-8 w-20 mb-1 flex items-center justify-center">
                  {issuingOfficerSignature ? (
                    <img 
                      src={issuingOfficerSignature} 
                      alt="Officer Signature" 
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-white/50">Signature</div>
                  )}
                </div>
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

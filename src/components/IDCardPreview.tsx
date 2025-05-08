
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Printer, Download, Upload, Camera, Edit, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";

interface IDCardPreviewProps {
  applicant: {
    id: string;
    fullName: string;
    nationality: string;
    passportNumber: string;
    dateOfBirth: string;
    visaType: string;
    occupation?: string;
  };
}

const IDCardPreview: React.FC<IDCardPreviewProps> = ({ applicant }) => {
  const isMobile = useIsMobile();
  
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
  
  // Load system logo and settings from localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    const savedLabels = localStorage.getItem('cardLabels');
    if (savedLabels) {
      setCardLabels(JSON.parse(savedLabels));
    }
    
    const savedFooter = localStorage.getItem('cardFooter');
    if (savedFooter) {
      setFooter(savedFooter);
    }
  }, []);
  
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
  
  // Generate a random ID card number for demo
  const generateCardNumber = () => {
    return `GIS-${Math.floor(1000000 + Math.random() * 9000000)}`;
  };
  
  // Calculate expiry date (2 years from now)
  const getExpiryDate = () => {
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
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
        toast.success("Photo uploaded successfully");
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Action Buttons - Now more responsive */}
      <div className="mb-6 flex flex-wrap items-center gap-2 justify-center w-full">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button className={`${isMobile ? 'w-full' : ''}`}>
            <Printer className="mr-2 h-4 w-4" />
            Print ID Card
          </Button>
          <Button variant="outline" className={`${isMobile ? 'w-full' : ''}`}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
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
          <label className="cursor-pointer">
            <Button variant="secondary" type="button" className={`${isMobile ? 'w-full' : ''}`}>
              <Camera className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handlePhotoUpload} 
            />
          </label>
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
          <Upload className="mr-2 h-4 w-4" />
          Backup Settings
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={restoreSettings}
          className={`${isMobile ? 'w-[48%]' : ''}`}
        >
          <Download className="mr-2 h-4 w-4" />
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
                  <span className="col-span-2">{generateCardNumber()}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1">
                  <span className="font-semibold text-white">{cardLabels.passportNo}</span>
                  <span className="col-span-2">{applicant.passportNumber}</span>
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

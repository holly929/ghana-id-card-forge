
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Printer } from 'lucide-react';

interface BulkPrintModalProps {
  open: boolean;
  onClose: () => void;
  applicants: any[];
}

const BulkPrintModal: React.FC<BulkPrintModalProps> = ({ 
  open, 
  onClose, 
  applicants 
}) => {
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [printFormat, setPrintFormat] = useState<string>('standard');
  
  // Toggle selecting all applicants
  const toggleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map(a => a.id));
    }
  };
  
  // Toggle selecting a single applicant
  const toggleSelectApplicant = (id: string) => {
    if (selectedApplicants.includes(id)) {
      setSelectedApplicants(selectedApplicants.filter(appId => appId !== id));
    } else {
      setSelectedApplicants([...selectedApplicants, id]);
    }
  };
  
  // Handle printing directly without navigation
  const handlePrint = () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant");
      return;
    }
    
    const selectedApplicantsData = applicants.filter(a => 
      selectedApplicants.includes(a.id)
    );
    
    console.log('Printing selected applicants:', selectedApplicantsData);
    
    // Print directly here instead of navigating
    printSelectedCards(selectedApplicantsData);
    
    toast.success(`Printing ${selectedApplicants.length} ID cards`);
    onClose();
  };

  const printSelectedCards = (selectedCards: any[]) => {
    try {
      const logo = localStorage.getItem('systemLogo');
      let scale = 1;
      
      switch(printFormat) {
        case 'small': scale = 0.8; break;
        case 'large': scale = 1.2; break;
        default: scale = 1; break;
      }

      const formatDate = (dateString: string) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      };

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print.");
        return;
      }

      const cardsHTML = selectedCards.map(applicant => {
        const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
        
        return `
          <div class="card">
            <div class="card-content">
              <div class="left-side">
                <div class="logo-container">
                  ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : '<div class="logo-placeholder">LOGO</div>'}
                </div>
                <div class="photo-container">
                  ${photo ? `<img src="${photo}" alt="Photo" class="photo-image" />` : '<div class="photo-placeholder">PHOTO</div>'}
                </div>
                <div class="visa-type">
                  ${(applicant.visaType || 'NONE').toUpperCase()}
                </div>
              </div>
              <div class="right-side">
                <div class="card-title">
                  <div class="main-title">REPUBLIC OF GHANA</div>
                  <div class="sub-title">NON-CITIZEN IDENTITY CARD</div>
                </div>
                <div class="card-info">
                  <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${applicant.fullName || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Nationality:</span>
                    <span class="value">${applicant.nationality || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Date of Birth:</span>
                    <span class="value">${formatDate(applicant.dateOfBirth)}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Phone:</span>
                    <span class="value">${applicant.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">ID No:</span>
                    <span class="value">${applicant.id || 'Not provided'}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Expiry Date:</span>
                    <span class="value">${formatDate(applicant.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0])}</span>
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
      }).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulk ID Cards Print</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; background: white; padding: 20px; }
              
              @media print {
                body { margin: 0; padding: 10px; }
                @page { size: auto; margin: 10mm; }
              }
              
              .page-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                justify-items: center;
                transform: scale(${scale});
                transform-origin: top left;
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
                page-break-inside: avoid;
                margin-bottom: 10px;
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
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
              }
              
              .logo-image {
                max-height: 25px;
                max-width: 60px;
                object-fit: contain;
              }
              
              .logo-placeholder {
                font-size: 8px;
                color: rgba(255,255,255,0.7);
              }
              
              .photo-container {
                width: 55px;
                height: 70px;
                border: 2px solid white;
                overflow: hidden;
                margin: 5px 0;
                background: rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              .photo-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
              
              .photo-placeholder {
                font-size: 6px;
                color: rgba(255,255,255,0.7);
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
              
              .main-title {
                font-weight: bold;
                font-size: 9px;
                line-height: 1.1;
              }
              
              .sub-title {
                font-size: 7px;
                line-height: 1.1;
                margin-top: 2px;
              }
              
              .card-info {
                flex: 1;
              }
              
              .info-row {
                margin-bottom: 2px;
                line-height: 1.2;
                display: flex;
                font-size: 7px;
              }
              
              .label {
                font-weight: bold;
                min-width: 35px;
                margin-right: 2px;
              }
              
              .value {
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
            </style>
          </head>
          <body>
            <div class="page-container">
              ${cardsHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
              
              window.addEventListener('afterprint', function() {
                setTimeout(function() { 
                  window.close(); 
                }, 1000);
              });
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print cards: ' + error.message);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Print ID Cards</DialogTitle>
          <DialogDescription>
            Select applicants and printing options
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex-1">
            <Label htmlFor="print-format" className="mb-2 block">Card Size</Label>
            <Select 
              value={printFormat} 
              onValueChange={setPrintFormat}
            >
              <SelectTrigger id="print-format">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md">
            <div className="p-3 border-b bg-muted/50 flex items-center">
              <div className="flex items-center">
                <Checkbox 
                  id="select-all" 
                  checked={selectedApplicants.length === applicants.length}
                  onCheckedChange={toggleSelectAll}
                  className="mr-2"
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({applicants.length})
                </Label>
              </div>
              <div className="ml-auto font-medium text-sm">
                {selectedApplicants.length} selected
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {applicants.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No approved applicants available for printing
                </div>
              ) : (
                applicants.map(applicant => (
                  <div 
                    key={applicant.id}
                    className="p-3 border-b last:border-0 flex items-center"
                  >
                    <Checkbox 
                      id={`select-${applicant.id}`}
                      checked={selectedApplicants.includes(applicant.id)}
                      onCheckedChange={() => toggleSelectApplicant(applicant.id)}
                      className="mr-3"
                    />
                    <div>
                      <Label 
                        htmlFor={`select-${applicant.id}`}
                        className="font-medium block"
                      >
                        {applicant.fullName}
                      </Label>
                      <div className="text-sm text-muted-foreground">
                        {applicant.nationality} • {applicant.id}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="mt-3 sm:mt-0"
          >
            Cancel
          </Button>
          <Button 
            variant="default"
            onClick={handlePrint}
            disabled={selectedApplicants.length === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print {selectedApplicants.length} Card{selectedApplicants.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPrintModal;

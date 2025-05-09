
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
import { Files, Printer, LayoutGrid, LayoutList } from 'lucide-react';

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
  const [layout, setLayout] = useState<'multiple' | 'single'>('multiple');
  
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
  
  // Handle printing with different formats
  const handlePrint = () => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select at least one applicant");
      return;
    }
    
    const selectedApplicantsData = applicants.filter(a => 
      selectedApplicants.includes(a.id)
    );
    
    // Get logo if available
    const logo = localStorage.getItem('systemLogo');
    
    // Get scale based on the print format
    let scale = 1;
    switch(printFormat) {
      case 'small':
        scale = 0.7;
        break;
      case 'large':
        scale = 1.3;
        break;
      case 'standard':
      default:
        scale = 1;
        break;
    }
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };
    
    const getCardHtml = (applicant: any, showFront: boolean = true) => {
      if (showFront) {
        return `
          <div class="card">
            <!-- Card content with photo and logo -->
            <div style="display: flex; height: 100%;">
              <div style="width: 33%; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <div class="logo-container">
                  ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
                </div>
                <div class="photo-container">
                  ${applicant.photo ? `<img src="${applicant.photo}" alt="Applicant" class="photo-image" />` : ''}
                </div>
                <div style="margin-top: 5px; text-align: center;">
                  <div style="background: #fcd116; color: black; padding: 3px 8px; border-radius: 2px; font-weight: bold; font-size: 10px;">
                    ${applicant.visaType.toUpperCase()}
                  </div>
                </div>
              </div>
              <div style="width: 67%; padding-left: 10px;">
                <div style="text-align: center; margin-bottom: 10px;">
                  <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
                  <div style="font-size: 10px;">NON-CITIZEN IDENTITY CARD</div>
                </div>
                <div style="font-size: 10px;">
                  <div><strong>Name:</strong> ${applicant.fullName}</div>
                  <div><strong>Nationality:</strong> ${applicant.nationality}</div>
                  <div><strong>Date of Birth:</strong> ${formatDate(applicant.dateOfBirth)}</div>
                  <div><strong>ID No:</strong> ${applicant.id}</div>
                  <div><strong>Passport No:</strong> ${applicant.passportNumber || 'Not provided'}</div>
                  <div><strong>Expiry Date:</strong> ${formatDate(new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0])}</div>
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
      } else {
        return `
          <div class="card">
            <!-- Back card content -->
            <div style="text-align: center; margin-bottom: 10px;">
              <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
              <div style="font-size: 9px;">This card remains the property of the Ghana Immigration Service</div>
            </div>
            <div style="font-size: 10px; margin-bottom: 10px;">
              <div><strong>Occupation:</strong> ${applicant.occupation || 'Not specified'}</div>
              <div><strong>Date of Issue:</strong> ${formatDate(new Date().toISOString().split('T')[0])}</div>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px; margin-top: 10px;">
              <div style="text-align: center; font-size: 9px;">If found, please return to the nearest Ghana Immigration Service office</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: auto; position: absolute; bottom: 25px; left: 10px; right: 10px;">
              <div style="width: 80px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 8px; padding-top: 2px;">
                Holder's Signature
              </div>
              <div style="width: 80px; border-top: 1px solid rgba(255,255,255,0.5); text-align: center; font-size: 8px; padding-top: 2px;">
                Issuing Officer
              </div>
            </div>
            <div class="color-band">
              <div class="red-band"></div>
              <div class="yellow-band"></div>
              <div class="green-band"></div>
            </div>
          </div>
        `;
      }
    };
    
    // Add CSS and content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Bulk ID Cards Print</title>
          <style>
            @page {
              size: ${printFormat === 'large' ? 'A4' : (layout === 'multiple' ? 'A4' : '85.6mm 53.98mm')};
              margin: ${layout === 'multiple' ? '10mm' : '0'};
            }
            body {
              margin: 0;
              padding: ${layout === 'multiple' ? '10px' : '0'};
              background: #f8f8f8;
              font-family: Arial, sans-serif;
            }
            .page-container {
              max-width: ${layout === 'multiple' ? '210mm' : '85.6mm'};
              margin: 0 auto;
            }
            .cards-grid {
              display: ${layout === 'multiple' ? 'grid' : 'block'};
              grid-template-columns: ${layout === 'multiple' ? 'repeat(2, 1fr)' : '1fr'};
              gap: ${layout === 'multiple' ? '20px' : '0'};
              padding: ${layout === 'multiple' ? '10px' : '0'};
              justify-content: center;
            }
            .card-container {
              margin-bottom: ${layout === 'multiple' ? '15px' : '0'};
              page-break-inside: avoid;
              transform: scale(${scale});
              transform-origin: top center;
              width: ${layout === 'multiple' ? 'auto' : '85.6mm'};
              height: ${layout === 'multiple' ? 'auto' : '53.98mm'};
            }
            .card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(to right, #006b3f, #006b3f99);
              color: white;
              padding: 16px;
              box-sizing: border-box;
              border-radius: 3mm;
              position: relative;
              overflow: hidden;
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
              page-break-after: always;
            }
            @media print {
              body {
                background: white;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .card {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="cards-grid">
              ${selectedApplicantsData.map((applicant: any, index: number) => `
                <div class="card-container">
                  ${getCardHtml(applicant, true)}
                  ${layout === 'single' ? `<div class="page-break"></div>` : ''}
                </div>
                ${(index % 2 === 1 && layout === 'multiple') ? `<div class="page-break"></div>` : ''}
              `).join('')}
            </div>
            
            ${layout === 'multiple' ? `<div class="page-break"></div>` : ''}
            
            <div class="cards-grid">
              ${selectedApplicantsData.map((applicant: any, index: number) => `
                <div class="card-container">
                  ${getCardHtml(applicant, false)}
                  ${layout === 'single' ? `<div class="page-break"></div>` : ''}
                </div>
                ${(index % 2 === 1 && layout === 'multiple') ? `<div class="page-break"></div>` : ''}
              `).join('')}
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
    toast.success(`Printing ${selectedApplicants.length} ID cards in ${printFormat} format`);
    onClose();
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
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
                  <SelectItem value="small">Small (85.6mm x 53.98mm)</SelectItem>
                  <SelectItem value="standard">Standard (CR80)</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="mb-2 block">Layout</Label>
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  type="button"
                  variant={layout === 'multiple' ? 'default' : 'outline'}
                  className={`flex-1 rounded-none ${layout === 'multiple' ? 'bg-primary' : ''}`}
                  onClick={() => setLayout('multiple')}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Multiple per page
                </Button>
                <Button
                  type="button"
                  variant={layout === 'single' ? 'default' : 'outline'}
                  className={`flex-1 rounded-none ${layout === 'single' ? 'bg-primary' : ''}`}
                  onClick={() => setLayout('single')}
                >
                  <LayoutList className="mr-2 h-4 w-4" />
                  Single per page
                </Button>
              </div>
            </div>
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
          <div className="flex gap-2">
            <Button 
              variant="default"
              onClick={handlePrint}
              disabled={selectedApplicants.length === 0}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print {selectedApplicants.length} Card{selectedApplicants.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPrintModal;

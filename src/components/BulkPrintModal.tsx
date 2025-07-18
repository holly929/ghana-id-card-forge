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
  const [printBothSides, setPrintBothSides] = useState<boolean>(false);
  
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

  // Helper function to safely get property values (handles both camelCase and snake_case)
  const getApplicantProperty = (applicant: any, camelCase: string, snakeCase: string): string => {
    return applicant[camelCase] || applicant[snakeCase] || '';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
    
    toast.success(`Printing ${selectedApplicants.length} ID cards${printBothSides ? ' (front and back)' : ''}`);
    onClose();
  };

  const generateBackSideHTML = (applicant: any) => {
    const logo = localStorage.getItem('systemLogo');
    
    return `
      <div class="card card-back">
        <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 20px;">
          <div style="text-align: center;">
            ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" style="max-height: 30px; max-width: 80px;" />` : ''}
            <div style="font-weight: bold; font-size: 10px; margin-top: 10px;">REPUBLIC OF GHANA</div>
            <div style="font-size: 8px;">IMMIGRATION SERVICE</div>
          </div>
          
          <div style="font-size: 8px; text-align: center;">
            <div style="margin-bottom: 10px;">
              <strong>CONDITIONS OF STAY</strong>
            </div>
            <div style="text-align: left; line-height: 1.4;">
              • This card must be carried at all times<br/>
              • Report change of address within 7 days<br/>
              • Valid for identification purposes only<br/>
              • Not transferable to another person<br/>
              • Report loss or damage immediately
            </div>
          </div>
          
          <!-- Signature Section -->
          <div style="display: flex; justify-content: center; margin-top: 15px; font-size: 7px;">
            <div style="width: 45%; text-align: center;">
              <div style="border-top: 1px solid white; padding-top: 3px; margin-bottom: 3px;">
                <strong>ISSUING OFFICER</strong>
              </div>
              <div style="height: 20px; border-bottom: 1px solid white;"></div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 8px; margin-top: 5px;">
            <div style="border-top: 1px solid white; padding-top: 5px;">
              <strong>Emergency Contact: +233-XXX-XXXX</strong>
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

  const printSelectedCards = (selectedCards: any[]) => {
    try {
      const logo = localStorage.getItem('systemLogo');
      let scale = 1;
      
      switch(printFormat) {
        case 'small': scale = 0.8; break;
        case 'large': scale = 1.2; break;
        default: scale = 1; break;
      }

      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) {
        toast.error("Pop-up blocked. Please allow pop-ups to print.");
        return;
      }

      const generateCardHTML = (applicant: any) => {
        const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;
        const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
        const phoneNumber = getApplicantProperty(applicant, 'phoneNumber', 'phone_number');
        const dateOfBirth = getApplicantProperty(applicant, 'dateOfBirth', 'date_of_birth');
        const expiryDate = getApplicantProperty(applicant, 'expiryDate', 'expiry_date');
        const visaType = getApplicantProperty(applicant, 'visaType', 'visa_type');

        return `
          <div class="card">
            <div style="display: flex; height: calc(100% - 40px);">
              <div style="width: 33%; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
                <div class="logo-container">
                  ${logo ? `<img src="${logo}" alt="Logo" class="logo-image" />` : ''}
                </div>
                <div class="photo-container">
                  ${photo ? `<img src="${photo}" alt="Applicant" class="photo-image" />` : ''}
                </div>
                <div style="margin-top: 5px; text-align: center;">
                  <div style="background: #fcd116; color: black; padding: 3px 8px; border-radius: 2px; font-weight: bold; font-size: 10px;">
                    ${(visaType || 'NONE').toUpperCase()}
                  </div>
                </div>
              </div>
              <div style="width: 67%; padding-left: 10px; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="text-align: center; margin-bottom: 10px;">
                    <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
                    <div style="font-size: 10px;">NON-CITIZEN IDENTITY CARD</div>
                  </div>
                  <div style="font-size: 10px;">
                    <div><strong>Name:</strong> ${fullName || 'Not provided'}</div>
                    <div><strong>Nationality:</strong> ${applicant.nationality || 'Not provided'}</div>
                    <div><strong>Date of Birth:</strong> ${formatDate(dateOfBirth)}</div>
                    <div><strong>Phone Number:</strong> ${phoneNumber || 'Not provided'}</div>
                    <div><strong>ID No:</strong> ${applicant.id || 'Not provided'}</div>
                    <div><strong>Expiry Date:</strong> ${formatDate(expiryDate)}</div>
                  </div>
                </div>
                
                <!-- Front Signature Section -->
                <div style="display: flex; justify-content: center; margin-top: 8px; font-size: 8px;">
                  <div style="width: 45%; text-align: center;">
                    <div style="height: 15px; border-bottom: 1px solid white; margin-bottom: 2px;"></div>
                    <div style="font-size: 7px;"><strong>ISSUING OFFICER</strong></div>
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

      // Generate all cards with proper page breaks
      let allCardsHTML = '';
      const cardsPerPage = printBothSides ? 3 : 6; // Fewer cards per page when printing both sides
      let currentPageCards = '';
      let cardsOnCurrentPage = 0;

      selectedCards.forEach((applicant, index) => {
        console.log(`Processing card ${index + 1} for applicant: ${getApplicantProperty(applicant, 'fullName', 'full_name')}`);
        
        const frontCardHTML = generateCardHTML(applicant);
        const backCardHTML = printBothSides ? generateBackSideHTML(applicant) : '';
        
        if (printBothSides) {
          // For double-sided printing, show front and back side by side
          currentPageCards += `
            <div class="card-pair">
              ${frontCardHTML}
              ${backCardHTML}
            </div>
          `;
        } else {
          currentPageCards += frontCardHTML;
        }
        
        cardsOnCurrentPage++;
        
        // If we've reached the cards per page limit or this is the last card
        if (cardsOnCurrentPage === cardsPerPage || index === selectedCards.length - 1) {
          if (allCardsHTML !== '') {
            allCardsHTML += '<div class="page-break"></div>';
          }
          allCardsHTML += `<div class="card-page">${currentPageCards}</div>`;
          currentPageCards = '';
          cardsOnCurrentPage = 0;
        }
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulk ID Cards Print - ${selectedCards.length} cards${printBothSides ? ' (front and back)' : ''}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
                
                .card-page {
                  display: grid;
                  grid-template-columns: ${printBothSides ? '1fr' : 'repeat(2, 1fr)'};
                  gap: 15mm;
                  width: 100%;
                  height: 100vh;
                  align-items: start;
                  justify-items: center;
                  padding: 10mm;
                  box-sizing: border-box;
                }
                
                .card-pair {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10mm;
                  width: 100%;
                  justify-items: center;
                  margin-bottom: 15mm;
                }
                
                .card {
                  width: 85.6mm;
                  height: 53.98mm;
                  background: linear-gradient(to right, #006b3f, #006b3f99);
                  color: white;
                  padding: 12px;
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                  box-sizing: border-box;
                  transform: scale(${scale});
                  transform-origin: center;
                  margin: ${scale > 1 ? '10px' : '5px'};
                  display: flex;
                  flex-direction: column;
                }
                
                .card-back {
                  background: linear-gradient(to right, #006b3f, #006b3f99);
                }
                
                .logo-container {
                  text-align: center;
                  margin-bottom: 8px;
                }
                
                .logo-image {
                  max-height: 35px;
                  max-width: 90px;
                }
                
                .photo-container {
                  width: 70px;
                  height: 90px;
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
              
              /* Screen preview styles */
              @media screen {
                body {
                  background: #f5f5f5;
                  padding: 20px;
                }
                
                .card-page {
                  background: white;
                  margin-bottom: 20px;
                  padding: 20px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  display: grid;
                  grid-template-columns: ${printBothSides ? '1fr' : 'repeat(2, 1fr)'};
                  gap: 20px;
                  justify-items: center;
                }
                
                .card-pair {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                  width: 100%;
                  justify-items: center;
                }
                
                .card {
                  width: 85.6mm;
                  height: 53.98mm;
                  background: linear-gradient(to right, #006b3f, #006b3f99);
                  color: white;
                  padding: 12px;
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                  box-sizing: border-box;
                  transform: scale(${scale});
                  margin: 10px;
                  display: flex;
                  flex-direction: column;
                }
              }
            </style>
          </head>
          <body>
            ${allCardsHTML}
            <script>
              console.log('Print window loaded with ${selectedCards.length} cards${printBothSides ? ' (front and back)' : ''}');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
            
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox 
                id="print-both-sides"
                checked={printBothSides}
                onCheckedChange={(checked) => {
                  setPrintBothSides(checked === true);
                }}
              />
              <Label htmlFor="print-both-sides" className="text-sm font-medium">
                Print both front and back
              </Label>
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
                applicants.map(applicant => {
                  const fullName = getApplicantProperty(applicant, 'fullName', 'full_name');
                  
                  return (
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
                          {fullName}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {applicant.nationality} • {applicant.id}
                        </div>
                      </div>
                    </div>
                  );
                })
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
            {printBothSides && ' (Both Sides)'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPrintModal;

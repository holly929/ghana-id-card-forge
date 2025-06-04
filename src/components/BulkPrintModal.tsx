
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
    
    // Store selected applicants for bulk printing
    localStorage.setItem('selectedApplicantsForPrint', JSON.stringify(selectedApplicantsData));
    
    // Navigate to print page
    window.open('/id-cards/bulk-print', '_blank');
    
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

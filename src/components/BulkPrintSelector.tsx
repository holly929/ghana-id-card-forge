
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface BulkPrintSelectorProps {
  applicants: any[];
  onPrintSelection: (selectedApplicants: any[]) => void;
}

const BulkPrintSelector: React.FC<BulkPrintSelectorProps> = ({ 
  applicants,
  onPrintSelection
}) => {
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  // Toggle selection of an applicant
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Toggle all selections
  const toggleAll = () => {
    const allSelected = applicants.every(a => selectedIds[a.id]);
    
    if (allSelected) {
      // Unselect all
      setSelectedIds({});
    } else {
      // Select all
      const newSelectedIds: Record<string, boolean> = {};
      applicants.forEach(a => {
        newSelectedIds[a.id] = true;
      });
      setSelectedIds(newSelectedIds);
    }
  };
  
  // Get selected applicants
  const getSelectedApplicants = () => {
    return applicants.filter(a => selectedIds[a.id]);
  };
  
  // Handle print button click
  const handlePrint = () => {
    const selected = getSelectedApplicants();
    
    if (selected.length === 0) {
      toast.error("Please select at least one applicant");
      return;
    }
    
    onPrintSelection(selected);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={applicants.length > 0 && applicants.every(a => selectedIds[a.id])}
            onCheckedChange={toggleAll}
          />
          <Label htmlFor="select-all">Select All</Label>
        </div>
        <div className="text-sm text-gray-500">
          {Object.values(selectedIds).filter(Boolean).length} of {applicants.length} selected
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {applicants.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No approved applicants found.
          </div>
        ) : (
          applicants.map((applicant) => (
            <div 
              key={applicant.id}
              className={`flex items-center space-x-3 p-2 rounded-md ${
                selectedIds[applicant.id] ? 'bg-primary/5 border border-primary/20' : 'bg-white'
              }`}
            >
              <Checkbox 
                id={`applicant-${applicant.id}`}
                checked={!!selectedIds[applicant.id]}
                onCheckedChange={() => toggleSelection(applicant.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`applicant-${applicant.id}`} className="font-medium cursor-pointer">
                    {applicant.fullName}
                  </Label>
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-x-3">
                  <span>{applicant.nationality}</span>
                  <span>{applicant.area || applicant.passportNumber || 'No area/passport'}</span>
                  <span>ID: {applicant.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button 
          variant="default"
          onClick={handlePrint}
          disabled={Object.values(selectedIds).filter(Boolean).length === 0}
        >
          Print Selected ({Object.values(selectedIds).filter(Boolean).length})
        </Button>
      </div>
    </div>
  );
};

export default BulkPrintSelector;

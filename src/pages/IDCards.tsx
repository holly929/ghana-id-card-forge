import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Eye,
  Printer,
  FileImage,
  Files,
  Download,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import BulkPrintSelector from '@/components/BulkPrintSelector';
import BulkPrintModal from '@/components/BulkPrintModal';

// Default mock data (unchanged)
const mockApplicants = [
  // ... your mock data remains unchanged
];

const IDCards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [printFormat, setPrintFormat] = useState('standard');
  const isMobile = useIsMobile();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [showBulkSelector, setShowBulkSelector] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicantToDelete, setApplicantToDelete] = useState<any>(null);
  const navigate = useNavigate();
  
  // Load applicants from localStorage (unchanged)
  useEffect(() => {
    // ... code unchanged
  }, []);
  
  // Filter applicants based on search term (unchanged)
  const filteredApplicants = applicants.filter(applicant => 
    applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (applicant.passportNumber && applicant.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Only show approved applicants for ID cards (unchanged)
  const approvedApplicants = filteredApplicants.filter(applicant => 
    applicant.status === 'approved'
  );

  // Handle printing with different formats
  const handlePrint = (applicant: any) => {
    const logo = localStorage.getItem('systemLogo');
    const photo = localStorage.getItem(`applicantPhoto_${applicant.id}`) || applicant.photo;

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

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${applicant.fullName} - ID Card</title>
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
              .card {
                width: 85.6mm;
                height: 53.98mm;
                background: linear-gradient(to right, #006b3f, #006b3f99);
                color: white;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
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
                page-break-after: always;
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
            <div class="card">
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
                    <div style="font-weight: bold; font-size: 12px;">REPUBLIC OF GHANA</div>
                    <div style="font-size: 10px;">NON-CITIZEN IDENTITY CARD</div>
                  </div>
                  <div style="font-size: 10px;">
                    <div><strong>Name:</strong> ${applicant.fullName}</div>
                    <div><strong>Nationality:</strong> ${applicant.nationality}</div>
                    <!-- Removed the system-generated "Expiry Date" label -->
                    <!-- If you have a correct expiry date field, replace the next line accordingly -->
                    <!-- Example if `applicant.expiryDate` exists: -->
                    <!-- <div><strong>Expiry Date:</strong> ${new Date(applicant.expiryDate).toLocaleDateString()}</div> -->
                    
                    <!-- Since you want to remove the system-generated label, omit this line entirely -->
                    
                    <div><strong>ID No:</strong> ${applicant.id}</div>
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
    toast.success(`Printing ID card for ${applicant.fullName} in ${printFormat} format`);
  };

  // ... rest of your component remains unchanged
  // (handlers, JSX rendering, etc.)

  return (
    // ... your existing JSX
  );
};

export default IDCards;

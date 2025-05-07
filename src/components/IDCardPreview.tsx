
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Printer, Download } from 'lucide-react';

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
  
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex items-center gap-2">
        <Button>
          <Printer className="mr-2 h-4 w-4" />
          Print ID Card
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      {/* ID Card Front */}
      <Card className="w-[350px] h-[220px] p-4 mb-6 bg-gradient-to-r from-ghana-green via-white to-white overflow-hidden relative">
        {/* Security pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-ghana-green text-xs"
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
              <Shield className="h-6 w-6 text-ghana-green" />
            </div>
            
            <div className="w-24 h-28 bg-gray-200 border border-gray-300 flex items-center justify-center">
              <span className="text-xs text-gray-400">Photo</span>
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
              <h3 className="text-sm font-bold text-ghana-green">REPUBLIC OF GHANA</h3>
              <h4 className="text-xs font-bold">NON-CITIZEN IDENTITY CARD</h4>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">Name:</span>
                <span className="col-span-2">{applicant.fullName}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">Nationality:</span>
                <span className="col-span-2">{applicant.nationality}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">Date of Birth:</span>
                <span className="col-span-2">{formatDate(applicant.dateOfBirth)}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">ID No:</span>
                <span className="col-span-2">{generateCardNumber()}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">Passport No:</span>
                <span className="col-span-2">{applicant.passportNumber}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="font-semibold text-ghana-black">Expiry Date:</span>
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
      
      {/* ID Card Back */}
      <Card className="w-[350px] h-[220px] p-4 bg-gradient-to-r from-ghana-green via-white to-white overflow-hidden relative">
        {/* Security pattern */}
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute text-ghana-green text-xs"
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
            <h3 className="text-sm font-bold text-ghana-green">GHANA IMMIGRATION SERVICE</h3>
            <p className="text-xs">This card remains the property of the Ghana Immigration Service</p>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="grid grid-cols-3 gap-1">
              <span className="font-semibold text-ghana-black">Occupation:</span>
              <span className="col-span-2">{applicant.occupation || 'Not specified'}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <span className="font-semibold text-ghana-black">Date of Issue:</span>
              <span className="col-span-2">{formatDate(new Date().toISOString().split('T')[0])}</span>
            </div>
          </div>
          
          <div className="mt-4 border-t pt-2">
            <p className="text-xs text-center">If found, please return to the nearest Ghana Immigration Service office</p>
          </div>
          
          <div className="mt-auto flex justify-between items-end">
            <div className="w-1/3 border-t border-gray-400 pt-1 text-center">
              <p className="text-xs">Holder's Signature</p>
            </div>
            
            <div className="w-1/3 border-t border-gray-400 pt-1 text-center">
              <p className="text-xs">Issuing Officer</p>
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
  );
};

export default IDCardPreview;

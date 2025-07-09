
import React, { useState, useEffect } from 'react';
  
interface IDCardPreviewProps {
  applicant: {
    id: string;
    fullName: string;
    nationality?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    visaType?: string;
    occupation?: string;
    photo?: string;
    phoneNumber?: string;
    area?: string;
  };
}

const IDCardPreview: React.FC<IDCardPreviewProps> = ({ applicant }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const [issuingOfficerSignature, setIssuingOfficerSignature] = useState<string | null>(null);
  
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    const savedSignature = localStorage.getItem('issuingOfficerSignature');
    if (savedSignature) {
      setIssuingOfficerSignature(savedSignature);
    }
  }, []);

  // Calculate expiry date (2 years from now if not provided)
  const getExpiryDate = () => {
    if (applicant.expiryDate) {
      return new Date(applicant.expiryDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    return expiryDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* ID Card Front */}
      <div className="relative w-[340px] h-[215px] bg-gradient-to-br from-green-800 to-green-900 rounded-lg overflow-hidden shadow-lg border-2 border-green-700">
        <div className="flex h-full p-3">
          {/* Left side */}
          <div className="w-2/5 flex flex-direction-col items-center justify-start space-y-2">
            {/* Logo */}
            <div className="h-8 flex items-center justify-center mb-2">
              {logo ? (
                <img src={logo} alt="Logo" className="max-h-8 max-w-20 object-contain" />
              ) : (
                <div className="text-white text-xs opacity-70">LOGO</div>
              )}
            </div>
            
            {/* Photo */}
            <div className="w-16 h-20 border-2 border-white rounded overflow-hidden bg-white/10">
              {applicant.photo ? (
                <img src={applicant.photo} alt="Applicant" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs opacity-70">
                  PHOTO
                </div>
              )}
            </div>
            
            {/* Visa Type Badge */}
            <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold text-center min-w-16">
              {(applicant.visaType || 'NONE').toUpperCase()}
            </div>
          </div>
          
          {/* Right side */}
          <div className="w-3/5 pl-3 text-white text-xs space-y-1">
            {/* Header */}
            <div className="text-center mb-3">
              <div className="font-bold text-sm leading-tight">REPUBLIC OF GHANA</div>
              <div className="text-xs leading-tight">NON-CITIZEN IDENTITY CARD</div>
            </div>
            
            {/* Information */}
            <div className="space-y-1">
              <div className="flex">
                <span className="font-bold w-12 shrink-0">Name:</span>
                <span className="break-words">{applicant.fullName}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-12 shrink-0">Nat:</span>
                <span className="break-words">{applicant.nationality || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-12 shrink-0">DOB:</span>
                <span>{formatDate(applicant.dateOfBirth)}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-12 shrink-0">Phone:</span>
                <span className="break-words">{applicant.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-12 shrink-0">ID No:</span>
                <span className="break-words">{applicant.id}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-12 shrink-0">Exp:</span>
                <span>{getExpiryDate()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-3 flex">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
      
      {/* ID Card Back */}
      <div className="relative w-[340px] h-[215px] bg-gradient-to-br from-green-800 to-green-900 rounded-lg overflow-hidden shadow-lg border-2 border-green-700">
        <div className="flex flex-col h-full p-3 text-white text-xs">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="font-bold text-sm">REPUBLIC OF GHANA</div>
            <div className="text-xs mt-1">This card remains the property of the Ghana Immigration Service</div>
          </div>
          
          {/* Information */}
          <div className="space-y-1 flex-1">
            <div className="flex">
              <span className="font-bold w-16 shrink-0">Occupation:</span>
              <span>{applicant.occupation || 'Not specified'}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16 shrink-0">Area:</span>
              <span>{applicant.area || 'Not provided'}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-16 shrink-0">Issue Date:</span>
              <span>{getCurrentDate()}</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-white/30 pt-2 text-center text-xs">
            If found, please return to the nearest Ghana Immigration Service office
          </div>
          
          {/* Signatures */}
          <div className="flex justify-between items-end mt-4">
            <div className="text-center">
              <div className="border-t border-white/50 w-16 mb-1"></div>
              <div className="text-xs">Holder's Signature</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-6 border-t border-white/50 mb-1 flex items-center justify-center">
                {issuingOfficerSignature && (
                  <img 
                    src={issuingOfficerSignature} 
                    alt="Officer Signature" 
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
              <div className="text-xs">Issuing Officer</div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-3 flex">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default IDCardPreview;

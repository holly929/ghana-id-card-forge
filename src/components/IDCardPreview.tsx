
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
  const [countryName, setCountryName] = useState('REPUBLIC OF GHANA');
  
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }

    const savedSignature = localStorage.getItem('issuingOfficerSignature');
    if (savedSignature) {
      setIssuingOfficerSignature(savedSignature);
    }

    const savedCountryName = localStorage.getItem('countryName');
    if (savedCountryName) {
      setCountryName(savedCountryName);
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
    <div className="flex flex-col items-center space-y-6">
      {/* ID Card Front */}
      <div className="relative w-[380px] h-[240px] bg-gradient-to-br from-green-800 to-green-900 rounded-xl overflow-hidden shadow-2xl border-2 border-green-700">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex h-full p-4">
          {/* Left side - Photo and Logo */}
          <div className="w-2/5 flex flex-col items-center justify-start space-y-3">
            {/* Logo */}
            <div className="h-12 flex items-center justify-center mb-2 bg-white/10 rounded-lg p-2 w-full">
              {logo ? (
                <img 
                  src={logo} 
                  alt="System Logo" 
                  className="max-h-10 max-w-full object-contain filter brightness-0 invert" 
                />
              ) : (
                <div className="text-white text-sm font-bold opacity-80">SYSTEM LOGO</div>
              )}
            </div>
            
            {/* Photo with better styling */}
            <div className="w-20 h-24 border-3 border-white rounded-lg overflow-hidden bg-white shadow-lg">
              {applicant.photo ? (
                <img 
                  src={applicant.photo} 
                  alt="Applicant" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-xs font-medium">
                  PHOTO
                </div>
              )}
            </div>
            
            {/* Visa Type Badge with better styling */}
            <div className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-xs font-bold text-center min-w-16 shadow-md">
              {(applicant.visaType || 'NONE').toUpperCase()}
            </div>
          </div>
          
          {/* Right side - Information */}
          <div className="w-3/5 pl-4 text-white">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="font-bold text-lg leading-tight text-yellow-300">{countryName}</div>
              <div className="text-sm leading-tight mt-1">NON-CITIZEN IDENTITY CARD</div>
            </div>
            
            {/* Information Grid */}
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Name:</span>
                <span className="text-xs break-words leading-tight">{applicant.fullName}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Nat:</span>
                <span className="text-xs break-words">{applicant.nationality || 'Not provided'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">DOB:</span>
                <span className="text-xs">{formatDate(applicant.dateOfBirth)}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Phone:</span>
                <span className="text-xs break-words">{applicant.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">ID No:</span>
                <span className="text-xs break-words font-mono">{applicant.id}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Exp:</span>
                <span className="text-xs">{getExpiryDate()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
      
      {/* ID Card Back */}
      <div className="relative w-[380px] h-[240px] bg-gradient-to-br from-green-800 to-green-900 rounded-xl overflow-hidden shadow-2xl border-2 border-green-700">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-28 h-28 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-4 text-white">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="font-bold text-lg text-yellow-300">{countryName}</div>
            <div className="text-xs mt-2 leading-relaxed">This card remains the property of the Ghana Immigration Service</div>
          </div>
          
          {/* Information */}
          <div className="space-y-2 flex-1">
            <div className="flex items-start">
              <span className="font-bold text-xs w-20 shrink-0 text-yellow-200">Occupation:</span>
              <span className="text-xs">{applicant.occupation || 'Not specified'}</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-xs w-20 shrink-0 text-yellow-200">Area:</span>
              <span className="text-xs">{applicant.area || 'Not provided'}</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-xs w-20 shrink-0 text-yellow-200">Issue Date:</span>
              <span className="text-xs">{getCurrentDate()}</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-white/30 pt-3 text-center text-xs mb-4">
            If found, please return to the nearest Ghana Immigration Service office
          </div>
          
          {/* Issuing Officer Signature Section */}
          <div className="flex justify-center items-end">
            <div className="text-center">
              {/* Signature Display */}
              <div className="w-28 h-12 mb-2 flex items-center justify-center bg-white rounded border-2 border-white/20">
                {issuingOfficerSignature ? (
                  <img 
                    src={issuingOfficerSignature} 
                    alt="Officer Signature" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-xs">No Signature</div>
                )}
              </div>
              {/* Label under signature */}
              <div className="border-t border-white/50 pt-1">
                <div className="text-xs font-medium">Issuing Officer</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default IDCardPreview;


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
    <div className="flex flex-col items-center space-y-6">
      {/* ID Card Front */}
      <div className="relative w-[380px] h-[240px] bg-gradient-to-br from-green-800 to-green-900 rounded-xl overflow-hidden shadow-2xl border-2 border-green-700">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 right-6 w-28 h-28 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex h-full p-5">
          {/* Left side - Photo and Logo */}
          <div className="w-2/5 flex flex-col items-center justify-start space-y-3">
            {/* Logo Section - Professional positioning */}
            <div className="h-12 w-full flex items-center justify-center mb-1">
              {logo ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 max-w-full max-h-full">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="max-h-8 max-w-20 object-contain filter brightness-0 invert" 
                  />
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 px-4">
                  <div className="text-white text-xs font-bold opacity-90">LOGO</div>
                </div>
              )}
            </div>
            
            {/* Photo Section - Enhanced professional look */}
            <div className="relative">
              <div className="w-24 h-28 border-3 border-white rounded-lg overflow-hidden bg-white shadow-xl">
                {applicant.photo ? (
                  <img 
                    src={applicant.photo} 
                    alt="Applicant" 
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-medium">
                    <div className="text-center">
                      <div className="text-2xl mb-1">👤</div>
                      <div>PHOTO</div>
                    </div>
                  </div>
                )}
              </div>
              {/* Photo frame shadow */}
              <div className="absolute inset-0 rounded-lg shadow-inner pointer-events-none border-3 border-white/20"></div>
            </div>
            
            {/* Visa Type Badge - Enhanced design */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-full text-xs font-bold text-center shadow-lg min-w-20 border border-yellow-300">
              {(applicant.visaType || 'NONE').toUpperCase()}
            </div>
          </div>
          
          {/* Right side - Information */}
          <div className="w-3/5 pl-5 text-white flex flex-col">
            {/* Header Section */}
            <div className="text-center mb-4">
              <div className="font-bold text-lg leading-tight text-yellow-300 drop-shadow-sm">REPUBLIC OF GHANA</div>
              <div className="text-sm leading-tight mt-1 text-white/90">NON-CITIZEN IDENTITY CARD</div>
            </div>
            
            {/* Information Grid - Better spacing */}
            <div className="space-y-2.5 flex-1">
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Name:</span>
                <span className="text-xs break-words leading-tight font-medium">{applicant.fullName}</span>
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
                <span className="text-xs break-words font-mono tracking-wide">{applicant.id}</span>
              </div>
              <div className="flex items-start">
                <span className="font-bold text-xs w-16 shrink-0 text-yellow-200">Exp:</span>
                <span className="text-xs font-medium">{getExpiryDate()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex shadow-inner">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
      
      {/* ID Card Back */}
      <div className="relative w-[380px] h-[240px] bg-gradient-to-br from-green-800 to-green-900 rounded-xl overflow-hidden shadow-2xl border-2 border-green-700">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-6 left-6 w-24 h-24 border border-white/30 rounded-full"></div>
          <div className="absolute bottom-6 right-6 w-16 h-16 border border-white/20 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 border border-white/10 rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-5 text-white">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="font-bold text-lg text-yellow-300 drop-shadow-sm">REPUBLIC OF GHANA</div>
            <div className="text-xs mt-2 leading-relaxed text-white/90">This card remains the property of the Ghana Immigration Service</div>
          </div>
          
          {/* Information Section */}
          <div className="space-y-2.5 flex-1">
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
              <span className="text-xs font-medium">{getCurrentDate()}</span>
            </div>
          </div>
          
          {/* Footer Message */}
          <div className="border-t border-white/30 pt-3 text-center text-xs mb-4 text-white/90">
            If found, please return to the nearest Ghana Immigration Service office
          </div>
          
          {/* Signatures Section - Professional layout */}
          <div className="flex justify-between items-end">
            {/* Holder's Signature */}
            <div className="text-center flex-1">
              <div className="border-t border-white/50 w-24 mb-2 mx-auto"></div>
              <div className="text-xs text-white/90">Holder's Signature</div>
            </div>
            
            {/* Issuing Officer Signature - Enhanced */}
            <div className="text-center flex-1">
              <div className="w-28 h-10 mx-auto mb-2 flex items-center justify-center">
                {issuingOfficerSignature ? (
                  <div className="bg-white/95 rounded-md p-1 w-full h-full flex items-center justify-center shadow-sm">
                    <img 
                      src={issuingOfficerSignature} 
                      alt="Officer Signature" 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="border-t border-white/50 w-24"></div>
                )}
              </div>
              <div className="text-xs text-white/90">Issuing Officer</div>
            </div>
          </div>
        </div>
        
        {/* Ghana flag colors at bottom - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex shadow-inner">
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-yellow-400"></div>
          <div className="flex-1 bg-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default IDCardPreview;


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
  const [countryName, setCountryName] = useState('');
  const [cardType, setCardType] = useState('');
  const [showCountryName, setShowCountryName] = useState(false);
  const [showCardType, setShowCardType] = useState(false);
  const [showNationality, setShowNationality] = useState(true);
  const [showDOB, setShowDOB] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [showOccupation, setShowOccupation] = useState(true);
  const [showArea, setShowArea] = useState(true);
  
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
      setShowCountryName(true);
    }

    const savedCardType = localStorage.getItem('cardType');
    if (savedCardType) {
      setCardType(savedCardType);
      setShowCardType(true);
    }

    // Load field visibility settings
    const showNat = localStorage.getItem('showNationality');
    if (showNat !== null) setShowNationality(showNat === 'true');

    const showDOBSetting = localStorage.getItem('showDOB');
    if (showDOBSetting !== null) setShowDOB(showDOBSetting === 'true');

    const showPhoneSetting = localStorage.getItem('showPhone');
    if (showPhoneSetting !== null) setShowPhone(showPhoneSetting === 'true');

    const showOccupationSetting = localStorage.getItem('showOccupation');
    if (showOccupationSetting !== null) setShowOccupation(showOccupationSetting === 'true');

    const showAreaSetting = localStorage.getItem('showArea');
    if (showAreaSetting !== null) setShowArea(showAreaSetting === 'true');
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
    <div className="flex justify-center items-center">
      {/* Single ID Card with All Information */}
      <div className="relative w-[480px] h-[300px] bg-gradient-to-br from-green-800 to-green-900 rounded-xl overflow-hidden shadow-2xl border-2 border-green-700">
        {/* Card Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 border border-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 flex h-full p-4">
          {/* Left side - Photo, Logo, and Signature */}
          <div className="w-1/3 flex flex-col items-center justify-start space-y-3">
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
            
            {/* Photo */}
            <div className="w-24 h-28 border-3 border-white rounded-lg overflow-hidden bg-white shadow-lg">
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
            
            {/* Visa Type Badge */}
            <div className="bg-yellow-400 text-black px-3 py-1.5 rounded-full text-xs font-bold text-center min-w-16 shadow-md">
              {(applicant.visaType || 'NONE').toUpperCase()}
            </div>
            
            {/* Issuing Officer Signature Section */}
            <div className="text-center mt-4">
              <div className="w-24 h-10 mb-1 flex items-center justify-center bg-white/10 rounded border border-white/20">
                {issuingOfficerSignature ? (
                  <img 
                    src={issuingOfficerSignature} 
                    alt="Officer Signature" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-white/50 text-xs">Signature</div>
                )}
              </div>
              <div className="border-t border-white/50 pt-1">
                <div className="text-xs font-medium text-white">Issuing Officer</div>
              </div>
            </div>
          </div>
          
          {/* Right side - All Information */}
          <div className="w-2/3 pl-6 text-white">
            {/* Header */}
            <div className="text-center mb-4">
              {showCountryName && countryName && (
                <div className="font-bold text-xl leading-tight text-yellow-300">{countryName}</div>
              )}
              {showCardType && cardType && (
                <div className="text-sm leading-tight mt-1">{cardType}</div>
              )}
            </div>
            
            {/* All Information in Two Columns */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-yellow-200">Name:</span>
                  <span className="text-xs break-words leading-tight">{applicant.fullName}</span>
                </div>
                {showNationality && (
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-yellow-200">Nationality:</span>
                    <span className="text-xs break-words">{applicant.nationality || 'Not provided'}</span>
                  </div>
                )}
                {showDOB && (
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-yellow-200">Date of Birth:</span>
                    <span className="text-xs">{formatDate(applicant.dateOfBirth)}</span>
                  </div>
                )}
                {showPhone && (
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-yellow-200">Phone:</span>
                    <span className="text-xs break-words">{applicant.phoneNumber || 'Not provided'}</span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-yellow-200">Issue Date:</span>
                  <span className="text-xs">{getCurrentDate()}</span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-yellow-200">ID Number:</span>
                  <span className="text-xs break-words font-mono">{applicant.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-yellow-200">Expiry Date:</span>
                  <span className="text-xs">{getExpiryDate()}</span>
                </div>
                {showOccupation && (
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-yellow-200">Occupation:</span>
                    <span className="text-xs">{applicant.occupation || 'Not specified'}</span>
                  </div>
                )}
                {showArea && (
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-yellow-200">Area:</span>
                    <span className="text-xs">{applicant.area || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Text */}
            <div className="border-t border-white/30 pt-2 mt-4 text-center text-xs">
              <div>This card remains the property of the issuing authority</div>
              <div className="mt-1">If found, please return to the nearest issuing authority office</div>
            </div>
          </div>
        </div>
        
        {/* Flag colors at bottom */}
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

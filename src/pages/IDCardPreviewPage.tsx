import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Printer } from 'lucide-react';
import IDCardPreview from '@/components/IDCardPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const defaultApplicants = [/* your default mock data here, same as before */];

const IDCardPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [applicants, setApplicants] = useState<any[]>([]);
  const [applicant, setApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load applicants
  useEffect(() => {
    setLoading(true);
    const storedApplicants = localStorage.getItem('applicants');
    if (storedApplicants) {
      try {
        const parsedApplicants = JSON.parse(storedApplicants);
        setApplicants(parsedApplicants);
      } catch (err) {
        console.error('Error parsing applicants:', err);
        setApplicants(defaultApplicants);
        toast.error('Failed to load applicant data');
      }
    } else {
      setApplicants(defaultApplicants);
    }
    setLoading(false);
  }, []);

  // Find applicant by ID
  useEffect(() => {
    if (applicants.length > 0 && id) {
      const found = applicants.find(a => a.id === id);
      if (found) {
        if (!found.photo) {
          const savedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
          if (savedPhoto) found.photo = savedPhoto;
        }
        setApplicant({ ...found });
      } else {
        toast.error(`Applicant with ID ${id} not found`);
      }
    }
  }, [applicants, id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB');
  };

  const getExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  };

  // Generate HTML for printing
  const generatePrintHTML = () => {
    if (!applicant) return '';

    const applicantData = applicant;
    const logoUrl = ''; // Set your logo URL if any

    // Example: scale based on size preference (you can extend this)
    const scale = 1;

    return `
    <html>
    <head>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 10mm;
            font-family: Arial, sans-serif;
          }
          .card {
            width: 180mm;
            height: 54mm;
            background: linear-gradient(to right, #006b3f, #006b3f99);
            color: white;
            border-radius: 8px;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            margin-bottom: 10mm;
            page-break-inside: avoid;
          }
          .front, .back {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 5mm;
            box-sizing: border-box;
            position: relative;
          }
          .logo {
            text-align: center;
            margin-bottom: 5mm;
          }
          .photo {
            width: 70px;
            height: 85px;
            border: 2px solid #fff;
            overflow: hidden;
            margin: 0 auto 5mm auto;
          }
          .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .red, .yellow, .green {
            height: 12px;
            display: flex;
          }
          .red { background: #ce1126; flex: 1; }
          .yellow { background: #fcd116; flex: 1; }
          .green { background: #006b3f; flex: 1; }
        }
      </style>
    </head>
    <body>
      <div style="transform: scale(${scale}); transform-origin: top left;">
        <div class="card">
          <!-- Front -->
          <div class="front">
            <div class="logo">
              ${logoUrl ? `<img src="${logoUrl}" style="max-height:30px; max-width:80px;">` : ''}
            </div>
            <div class="photo">
              ${applicantData.photo ? `<img src="${applicantData.photo}" />` : '<span>No Photo</span>'}
            </div>
            <div style="text-align:center; background:#fcd116; padding:2px 4px; border-radius:2px; font-weight:bold;">${applicantData.visaType.toUpperCase()}</div>
            <div style="text-align:center;">
              <div style="font-weight:bold;">REPUBLIC OF GHANA</div>
              <div>NON-CITIZEN IDENTITY CARD</div>
            </div>
            <div>
              <div><strong>Name:</strong> ${applicantData.fullName}</div>
              <div><strong>Nationality:</strong> ${applicantData.nationality}</div>
              <div><strong>ID No:</strong> ${applicantData.id}</div>
              <div><strong>Expiry Date:</strong> ${formatDate(applicantData.dateOfBirth)}</div>
              <div><strong>Expiry Date:</strong> ${formatDate(getExpiryDate())}</div>
            </div>
            <div class="red"></div>
            <div class="yellow"></div>
            <div class="green"></div>
          </div>
          <!-- Back -->
          <div class="back" style="margin-top:10px;">
            <div style="text-align:center;">
              <div style="font-weight:bold;">REPUBLIC OF GHANA</div>
              <div>This card remains the property of the Ghana Immigration Service</div>
            </div>
            <div>
              <div><strong>Occupation:</strong> ${applicantData.occupation || 'N/A'}</div>
              <div><strong>Date of Issue:</strong> ${formatDate(new Date().toISOString())}</div>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.3); margin-top:10px; padding-top:10px;">
              <div style="text-align:center; font-size:8px;">If found, please return to the nearest Ghana Immigration Service office</div>
            </div>
            <div style="display:flex; justify-content: space-between; margin-top:10px;">
              <div style="border-top:1px solid rgba(255,255,255,0.5); width:70px; text-align:center; font-size:7px;">Holder's Signature</div>
              <div style="border-top:1px solid rgba(255,255,255,0.5); width:70px; text-align:center; font-size:7px;">Issuing Officer</div>
            </div>
            <div class="red"></div>
            <div class="yellow"></div>
            <div class="green"></div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups.');
      return;
    }
    const htmlContent = generatePrintHTML();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => printWindow.close(), 500);
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!applicant) {
    return (
      <div>
        <h2>Applicant not found</h2>
        <Button onClick={() => navigate('/id-cards')}>Back to ID Cards</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={() => navigate('/id-cards')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="ml-2 text-xl font-semibold">Preview & Print ID Card</h1>
      </div>

      {/* Buttons */}
      <div className="mb-4 flex gap-2">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Print ID Card
        </Button>
        {/* You can add more buttons like 'Print Duplicates' etc. */}
      </div>

      {/* Preview */}
      <div className="border p-4 mb-4">
        <h2 className="mb-2 font-semibold">Applicant Details</h2>
        <p>Name: {applicant.fullName}</p>
        <p>Nationality: {applicant.nationality}</p>
        <p>ID: {applicant.id}</p>
        {/* Your ID card preview component or image can go here */}
        <IDCardPreview applicant={applicant} />
      </div>
    </div>
  );
};

export default IDCardPreviewPage;

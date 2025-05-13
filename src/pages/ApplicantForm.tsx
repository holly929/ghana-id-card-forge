import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save, Upload, Trash, Camera } from 'lucide-react';
import { toast } from "sonner";
import { generateUniqueId } from '@/lib/utils';

interface ApplicantFormProps {
  isEditing?: boolean;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({ isEditing = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    nationality: '',
    area: '',   
    dateOfBirth: '',
    visaType: 'Tourist',
    occupation: '',
    status: 'pending',
    idCardApproved: false,
    dateCreated: new Date().toISOString().split('T')[0],
    phoneNumber: '', // added
  });
  
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Load applicant data if editing
  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      const storedApplicants = localStorage.getItem('applicants');
      if (storedApplicants) {
        try {
          const applicants = JSON.parse(storedApplicants);
          const applicant = applicants.find((a: any) => a.id === id);
          if (applicant) {
            setFormData({
              id: applicant.id,
              fullName: applicant.fullName || '',
              nationality: applicant.nationality || '',
              area: applicant.area || applicant.passportNumber || '',
              dateOfBirth: applicant.dateOfBirth || '',
              visaType: applicant.visaType || 'Tourist',
              occupation: applicant.occupation || '',
              status: applicant.status || 'pending',
              idCardApproved: applicant.idCardApproved || false,
              dateCreated: applicant.dateCreated || new Date().toISOString().split('T')[0],
              phoneNumber: applicant.phoneNumber || '', // load phone
            });
            const storedPhoto = localStorage.getItem(`applicantPhoto_${id}`);
            if (storedPhoto) setPhoto(storedPhoto);
            else if (applicant.photo) setPhoto(applicant.photo);
          } else {
            toast.error('Applicant not found');
            navigate('/applicants');
          }
        } catch (error) {
          console.error('Error parsing applicant data:', error);
          toast.error('Error loading applicant data');
        }
      }
      setLoading(false);
    } else {
      setFormData(prev => ({ ...prev, id: generateUniqueId() }));
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, idCardApproved: checked }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhoto(event.target.result as string);
        toast.success('Photo uploaded successfully');
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.capture = 'user';
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  // Simple phone validation regex (basic example)
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?\d{7,15}$/; // allows optional +, 7 to 15 digits
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before proceeding
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    const storedApplicants = localStorage.getItem('applicants');
    let applicants = [];
    if (storedApplicants) {
      try {
        applicants = JSON.parse(storedApplicants);
      } catch (error) {
        console.error('Error parsing applicant data:', error);
      }
    }

    if (isEditing && id) {
      const index = applicants.findIndex((a: any) => a.id === id);
      if (index !== -1) {
        applicants[index] = { ...formData };
        localStorage.setItem('applicants', JSON.stringify(applicants));
        if (photo) localStorage.setItem(`applicantPhoto_${id}`, photo);
        else localStorage.removeItem(`applicantPhoto_${id}`);
        toast.success('Applicant updated successfully');
        navigate('/applicants');
      } else {
        toast.error('Failed to update applicant');
      }
    } else {
      applicants.push({ ...formData });
      localStorage.setItem('applicants', JSON.stringify(applicants));
      if (photo && formData.id) localStorage.setItem(`applicantPhoto_${formData.id}`, photo);
      toast.success('Applicant created successfully');
      navigate('/applicants');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and form omitted for brevity, same as previous code */}
      {/* ... */}
      {/* Inside the form, ensure the phone number input is included: */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="Enter phone number"
          />
        </div>
      </div>
      {/* ... rest of form */}
    </div>
  );
};

export default ApplicantForm;

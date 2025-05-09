
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

// Generate a unique GIS ID
const generateUniqueId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `GIS-${timestamp}${random}`;
};

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }).optional().or(z.literal('')),
  nationality: z.string().min(2, {
    message: "Nationality must be at least 2 characters.",
  }),
  passportNumber: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().min(1, {
    message: "Date of birth is required."
  }),
  address: z.string().optional().or(z.literal('')),
  visaType: z.string({
    required_error: "Please select a visa type."
  }),
  occupation: z.string().min(2, {
    message: "Occupation must be at least 2 characters."
  }).optional().or(z.literal('')),
  photo: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const visaTypes = [
  "Tourist",
  "Business",
  "Student",
  "Work",
  "Transit",
  "Diplomatic",
  "Residence"
];

const ApplicantForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      nationality: "",
      passportNumber: "",
      dateOfBirth: "",
      address: "",
      visaType: "Tourist",
      occupation: "",
      photo: null,
    },
  });
  
  // Check if we are editing an existing applicant
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('id');
    
    if (id) {
      setEditing(true);
      setEditId(id);
      
      // Fetch the applicant data from localStorage
      const storedApplicants = localStorage.getItem('applicants');
      if (storedApplicants) {
        try {
          const applicants = JSON.parse(storedApplicants);
          const applicant = applicants.find((a: any) => a.id === id);
          
          if (applicant) {
            // Pre-fill the form with the applicant data
            form.reset({
              fullName: applicant.fullName || "",
              email: applicant.email || "",
              nationality: applicant.nationality || "",
              passportNumber: applicant.passportNumber || "",
              dateOfBirth: applicant.dateOfBirth || "",
              address: applicant.address || "",
              visaType: applicant.visaType || "Tourist",
              occupation: applicant.occupation || "",
            });
            
            // Set the photo if it exists
            if (applicant.photo) {
              setPhoto(applicant.photo);
            }
          }
        } catch (error) {
          console.error('Error fetching applicant data:', error);
          toast.error('Failed to load applicant data');
        }
      }
    }
  }, [form]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      // Add unique ID and other metadata
      const applicantData = {
        ...data,
        id: editing && editId ? editId : generateUniqueId(),
        dateCreated: new Date().toISOString(),
        status: 'pending',
        photo: photo
      };
      
      // Save to localStorage
      const storedApplicants = localStorage.getItem('applicants');
      let applicants = [];
      
      if (storedApplicants) {
        applicants = JSON.parse(storedApplicants);
      }
      
      if (editing && editId) {
        // Update existing applicant
        applicants = applicants.map((applicant: any) => 
          applicant.id === editId ? applicantData : applicant
        );
        toast.success('Applicant updated successfully');
      } else {
        // Add new applicant
        applicants.push(applicantData);
        toast.success('Applicant added successfully');
      }
      
      localStorage.setItem('applicants', JSON.stringify(applicants));
      
      // Redirect to applicants list
      navigate('/applicants');
      
    } catch (error) {
      console.error('Error saving applicant data:', error);
      toast.error('Failed to save applicant data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          {editing ? 'Edit Applicant' : 'New Applicant'}
        </h1>
        <p className="text-gray-600">
          {editing 
            ? 'Update the information for this applicant' 
            : 'Enter the details for a new applicant'}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Applicant' : 'Applicant Information'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="Nigerian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="A1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="123 Main Street, Accra" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visaType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Type</FormLabel>
                      <Select 
                        defaultValue={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a visa type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {visaTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="md:col-span-2">
                  <FormLabel>Photo (Optional)</FormLabel>
                  <div className="mt-2 flex items-start space-x-4">
                    <div className="w-24 h-32 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                      {photo ? (
                        <img 
                          src={photo} 
                          alt="Applicant" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <p className="text-xs text-center text-gray-400">No photo</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="inline-block">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="cursor-pointer"
                        >
                          Upload Photo
                        </Button>
                        <Input 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                      <p className="text-xs text-gray-500">
                        Max file size: 5MB. Recommended dimensions: 3x4.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/applicants')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editing ? 'Update Applicant' : 'Add Applicant'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantForm;

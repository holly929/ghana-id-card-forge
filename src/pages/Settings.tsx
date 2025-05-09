
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Image } from 'lucide-react';
import { toast } from "sonner";
import { handleImageUpload } from '@/lib/utils';

const Settings: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Ghana Immigration Service');
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogo(savedLogo);
    }
    
    const savedCompanyName = localStorage.getItem('companyName');
    if (savedCompanyName) {
      setCompanyName(savedCompanyName);
    }
  }, []);
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        handleImageUpload(
          file,
          (result) => {
            setLogo(result);
            localStorage.setItem('systemLogo', result);
            toast.success("Logo uploaded successfully");
          },
          { maxSizeMB: 1 }
        );
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to upload logo");
        }
      }
    }
  };
  
  // Save company name
  const saveCompanyName = () => {
    localStorage.setItem('companyName', companyName);
    toast.success("Company name saved successfully");
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage application settings</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center p-4 border rounded-lg">
                {logo ? (
                  <img src={logo} alt="System Logo" className="max-h-24" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                    <Image className="h-10 w-10 mb-2" />
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <label
                  htmlFor="logo-upload"
                  className="w-full cursor-pointer"
                >
                  <Button variant="outline" className="w-full" type="button">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </label>
                
                {logo && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      localStorage.removeItem('systemLogo');
                      setLogo(null);
                      toast.success("Logo removed");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <Button className="w-full" onClick={saveCompanyName}>
                <Save className="h-4 w-4 mr-2" />
                Save Company Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

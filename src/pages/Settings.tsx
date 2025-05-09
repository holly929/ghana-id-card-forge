
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Backup, Restore } from 'lucide-react';
import { toast } from "sonner";
import { handleImageUpload, backupSystem, restoreSystem } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Settings: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Ghana Immigration Service');
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupData, setBackupData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  
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
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
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
  };
  
  // Save company name
  const saveCompanyName = () => {
    localStorage.setItem('companyName', companyName);
    toast.success("Company name saved successfully");
  };
  
  // Create system backup
  const createBackup = () => {
    try {
      const backupStr = backupSystem();
      setBackupData(backupStr);
      
      // Create and download backup file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(backupStr);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `GIS_system_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success("System backup created successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create backup");
      }
    }
  };
  
  // Handle restore file selection
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupStr = event.target?.result as string;
        restoreSystem(backupStr);
        toast.success("System restored successfully. Please refresh the page.");
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to restore system");
        }
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read backup file");
    };
    reader.readAsText(file);
  };
  
  // Trigger file input click
  const triggerLogoFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Trigger backup file input click
  const triggerBackupFileInput = () => {
    if (backupFileInputRef.current) {
      backupFileInputRef.current.click();
    }
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
                    <Upload className="h-10 w-10 mb-2" />
                    <p>No logo uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="file"
                  ref={fileInputRef}
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button variant="outline" className="w-full" onClick={triggerLogoFileInput}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Backup & Restore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Backup and restore your entire system data including applicants, photos, settings, and customizations.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={createBackup} className="w-full">
                  <Backup className="h-4 w-4 mr-2" />
                  Create System Backup
                </Button>
                
                <div>
                  <Input
                    type="file"
                    ref={backupFileInputRef}
                    accept=".json"
                    className="hidden"
                    onChange={handleRestoreFileSelect}
                  />
                  <Button variant="outline" className="w-full" onClick={triggerBackupFileInput}>
                    <Restore className="h-4 w-4 mr-2" />
                    Restore From Backup
                  </Button>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                <p><strong>Note:</strong> Restoring from a backup will replace all current data. Make sure to backup your current data first if needed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

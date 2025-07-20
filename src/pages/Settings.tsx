import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save, Archive, RefreshCw, Database, FileSignature } from 'lucide-react';
import { toast } from "sonner";
import { handleImageUpload, backupSystem, restoreSystem } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ConnectionStatus from '@/components/ConnectionStatus';
import { dataSyncService } from '@/services/dataSync';

const Settings: React.FC = () => {
  const [logo, setLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Identity Management System');
  const [countryName, setCountryName] = useState('');
  const [cardType, setCardType] = useState('NON-CITIZEN IDENTITY CARD');
  const [issuingOfficerSignature, setIssuingOfficerSignature] = useState<string | null>(null);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupData, setBackupData] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
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

    const savedCountryName = localStorage.getItem('countryName');
    if (savedCountryName) {
      setCountryName(savedCountryName);
    }

    const savedCardType = localStorage.getItem('cardType');
    if (savedCardType) {
      setCardType(savedCardType);
    }

    const savedSignature = localStorage.getItem('issuingOfficerSignature');
    if (savedSignature) {
      setIssuingOfficerSignature(savedSignature);
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

  // Handle signature upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected");
      return;
    }
    
    try {
      handleImageUpload(
        file,
        (result) => {
          setIssuingOfficerSignature(result);
          localStorage.setItem('issuingOfficerSignature', result);
          toast.success("Issuing officer signature uploaded successfully");
        },
        { maxSizeMB: 1 }
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to upload signature");
      }
    }
  };
  
  // Save company name
  const saveCompanyName = () => {
    localStorage.setItem('companyName', companyName);
    toast.success("Company name saved successfully");
  };

  // Save country name
  const saveCountryName = () => {
    localStorage.setItem('countryName', countryName);
    toast.success("Country name saved successfully");
  };

  // Save card type
  const saveCardType = () => {
    localStorage.setItem('cardType', cardType);
    toast.success("Card type saved successfully");
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
  
  // Trigger signature file input click
  const triggerSignatureFileInput = () => {
    if (signatureInputRef.current) {
      signatureInputRef.current.click();
    }
  };

  // Trigger backup file input click
  const triggerBackupFileInput = () => {
    if (backupFileInputRef.current) {
      backupFileInputRef.current.click();
    }
  };

  // New function to manually sync data
  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await dataSyncService.syncData();
      toast.success('Data synchronized successfully');
    } catch (error) {
      toast.error('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-600">Manage application settings</p>
        </div>
        <ConnectionStatus />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* New Sync Management Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Synchronization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                This system works both online and offline. When online, data is automatically synced with the cloud database. 
                When offline, changes are stored locally and will sync when connection is restored.
              </p>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleManualSync} 
                  disabled={syncing || !dataSyncService.getConnectionStatus()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Manual Sync'}
                </Button>
                
                <div className="text-sm text-gray-600">
                  Status: {dataSyncService.getConnectionStatus() ? (
                    <span className="text-green-600 font-medium">Online</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Offline</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Issuing Officer Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center p-4 border rounded-lg">
                {issuingOfficerSignature ? (
                  <img src={issuingOfficerSignature} alt="Officer Signature" className="max-h-24" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                    <FileSignature className="h-10 w-10 mb-2" />
                    <p>No signature uploaded</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Input
                  type="file"
                  ref={signatureInputRef}
                  id="signature-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureUpload}
                />
                <Button variant="outline" className="w-full" onClick={triggerSignatureFileInput}>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Upload Signature
                </Button>
                
                {issuingOfficerSignature && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      localStorage.removeItem('issuingOfficerSignature');
                      setIssuingOfficerSignature(null);
                      toast.success("Signature removed");
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
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

              <div className="space-y-2">
                <Label htmlFor="country-name">Country Name</Label>
                <Input
                  id="country-name"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  placeholder="Enter country name (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-type">Card Type</Label>
                <Input
                  id="card-type"
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  placeholder="Enter card type (e.g., NON-CITIZEN IDENTITY CARD)"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button onClick={saveCompanyName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Company Name
                </Button>
                <Button onClick={saveCountryName}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Country Name
                </Button>
                <Button onClick={saveCardType}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Card Type
                </Button>
              </div>
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
                  <Archive className="h-4 w-4 mr-2" />
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
                    <Upload className="h-4 w-4 mr-2" />
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

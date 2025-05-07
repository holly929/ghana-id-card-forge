
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/context/AuthContext';
import { toast } from "sonner";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Settings as SettingsIcon, Shield, Upload, Image } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // State for system logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);
  
  // Only admin users should be able to access settings
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-800">Unauthorized Access</h1>
        <p className="text-gray-600 mt-2">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const handleSaveGeneral = () => {
    // Save logo to localStorage if available
    if (logoFile && logoPreview) {
      localStorage.setItem('systemLogo', logoPreview);
      toast.success("Logo updated and settings saved successfully");
    } else {
      toast.success("General settings saved successfully");
    }
  };
  
  const handleSaveNotifications = () => {
    toast.success("Notification settings saved successfully");
  };
  
  const handleResetSystem = () => {
    toast.success("System reset initiated");
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">System Settings</h1>
        <p className="text-gray-600">Manage your system configuration and preferences</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full md:w-auto mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input id="system-name" defaultValue="Ghana Immigration Service" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@immigration.gov.gh" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Input id="timezone" defaultValue="Africa/Accra" />
              </div>
              
              <div className="space-y-2">
                <Label>System Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border rounded-md flex items-center justify-center overflow-hidden bg-white">
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="System Logo" 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <Image className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" type="button">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    <Input 
                      type="file" 
                      id="logo-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload} 
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Upload a logo to be displayed on ID cards and system interfaces
                </p>
              </div>
              
              <Button onClick={handleSaveGeneral} className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email notifications for new applicants</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">System Alerts</h3>
                  <p className="text-sm text-gray-500">Important system notifications for administrators</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Application Status Updates</h3>
                  <p className="text-sm text-gray-500">Automatically notify applicants of status changes</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <Button onClick={handleSaveNotifications} className="mt-4">Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Database Backup</h3>
                  <p className="text-sm text-gray-500">Schedule and manage system backups</p>
                </div>
                <Button variant="outline">Configure Backups</Button>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">System Logs</h3>
                  <p className="text-sm text-gray-500">View and export system logs</p>
                </div>
                <Button variant="outline">View Logs</Button>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-red-500">Danger Zone</h3>
                <p className="text-sm text-gray-500 mb-4">These actions cannot be undone</p>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <Button variant="destructive" onClick={handleResetSystem}>
                    Reset System
                  </Button>
                  <Button variant="outline" className="text-red-500 border-red-500">
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

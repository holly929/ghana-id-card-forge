
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
import { Settings as SettingsIcon, Shield, Upload, Image, Database, UserPlus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form schema for adding new users
const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  role: z.enum(["admin", "user", "manager"], {
    required_error: "Please select a user role.",
  }),
});

const Settings: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // State for system logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // State for user management
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [users, setUsers] = useState<Array<{id: string, username: string, email: string, role: string}>>([
    { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin' }
  ]);
  
  // State for backups
  const [backups, setBackups] = useState<Array<{id: string, name: string, date: string, size: string}>>([]);
  const [isConfigBackupOpen, setIsConfigBackupOpen] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [backupRetention, setBackupRetention] = useState('30');
  
  // Setup form for adding users
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "user",
    },
  });
  
  // Load logo from localStorage on mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('systemLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
    
    // Load saved backups
    const savedBackups = localStorage.getItem('systemBackups');
    if (savedBackups) {
      try {
        setBackups(JSON.parse(savedBackups));
      } catch (e) {
        console.error("Error loading backups:", e);
      }
    }
    
    // Load backup settings
    const savedBackupSettings = localStorage.getItem('backupSettings');
    if (savedBackupSettings) {
      try {
        const settings = JSON.parse(savedBackupSettings);
        setBackupFrequency(settings.frequency || 'daily');
        setBackupRetention(settings.retention || '30');
      } catch (e) {
        console.error("Error loading backup settings:", e);
      }
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
  
  // Handle adding a new user
  const onSubmitAddUser = (data: z.infer<typeof userFormSchema>) => {
    const newUser = {
      id: `${users.length + 1}`,
      username: data.username,
      email: data.email,
      role: data.role
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('systemUsers', JSON.stringify(updatedUsers));
    
    setIsAddUserOpen(false);
    form.reset();
    toast.success(`User ${data.username} added successfully`);
  };
  
  // Handle backup configuration
  const handleSaveBackupConfig = () => {
    // Save backup settings
    const backupSettings = {
      frequency: backupFrequency,
      retention: backupRetention,
      lastConfigured: new Date().toISOString()
    };
    localStorage.setItem('backupSettings', JSON.stringify(backupSettings));
    
    // Create an initial backup if none exists
    if (backups.length === 0) {
      createSystemBackup();
    }
    
    setIsConfigBackupOpen(false);
    toast.success("Backup configuration saved successfully");
  };
  
  // Create a backup of system data
  const createSystemBackup = () => {
    const timestamp = new Date();
    const backupId = `backup-${timestamp.getTime()}`;
    const backupName = `System Backup ${timestamp.toLocaleDateString()}`;
    
    // Collect all localStorage data
    const backupData = {
      cardLabels: localStorage.getItem('cardLabels'),
      cardFooter: localStorage.getItem('cardFooter'),
      systemLogo: localStorage.getItem('systemLogo'),
      systemUsers: localStorage.getItem('systemUsers'),
      // Add any other data you want to backup
    };
    
    // Store backup data
    localStorage.setItem(`backup-${backupId}`, JSON.stringify(backupData));
    
    // Update backup list
    const newBackup = {
      id: backupId,
      name: backupName,
      date: timestamp.toISOString(),
      size: '0.2 MB' // Just a sample size
    };
    
    const updatedBackups = [...backups, newBackup];
    setBackups(updatedBackups);
    localStorage.setItem('systemBackups', JSON.stringify(updatedBackups));
    
    toast.success("System backup created successfully");
    return backupId;
  };
  
  // Restore from a backup
  const restoreFromBackup = (backupId: string) => {
    const backupData = localStorage.getItem(`backup-${backupId}`);
    if (backupData) {
      try {
        const parsedData = JSON.parse(backupData);
        
        // Restore each item
        if (parsedData.cardLabels) localStorage.setItem('cardLabels', parsedData.cardLabels);
        if (parsedData.cardFooter) localStorage.setItem('cardFooter', parsedData.cardFooter);
        if (parsedData.systemLogo) localStorage.setItem('systemLogo', parsedData.systemLogo);
        if (parsedData.systemUsers) localStorage.setItem('systemUsers', parsedData.systemUsers);
        
        // Update logo preview if needed
        if (parsedData.systemLogo) {
          setLogoPreview(parsedData.systemLogo);
        }
        
        toast.success("System restored successfully from backup");
      } catch (e) {
        console.error("Error restoring from backup:", e);
        toast.error("Failed to restore from backup");
      }
    } else {
      toast.error("Backup not found");
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
          <TabsTrigger value="users">Users</TabsTrigger>
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
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management</CardTitle>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitAddUser)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrator</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="user">Regular User</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Add User</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Username</th>
                      <th className="p-2 text-left font-medium">Email</th>
                      <th className="p-2 text-left font-medium">Role</th>
                      <th className="p-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2 capitalize">{user.role}</td>
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Backup & Restore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">Configure Automated Backups</h3>
                  <p className="text-sm text-gray-500">Schedule regular backups of your system data</p>
                </div>
                <Dialog open={isConfigBackupOpen} onOpenChange={setIsConfigBackupOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Configure Backups
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Backup Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="backup-frequency">Backup Frequency</Label>
                        <Select 
                          value={backupFrequency} 
                          onValueChange={setBackupFrequency}
                        >
                          <SelectTrigger id="backup-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="backup-retention">Retention Period (days)</Label>
                        <Input 
                          id="backup-retention" 
                          type="number" 
                          value={backupRetention} 
                          onChange={(e) => setBackupRetention(e.target.value)} 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveBackupConfig}>Save Configuration</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Available Backups</h3>
                  <Button onClick={createSystemBackup} size="sm">
                    Create Backup Now
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Date</th>
                        <th className="p-2 text-left font-medium">Size</th>
                        <th className="p-2 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.length > 0 ? (
                        backups.map((backup) => (
                          <tr key={backup.id} className="border-b">
                            <td className="p-2">{backup.name}</td>
                            <td className="p-2">{new Date(backup.date).toLocaleString()}</td>
                            <td className="p-2">{backup.size}</td>
                            <td className="p-2 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => restoreFromBackup(backup.id)}
                              >
                                Restore
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-gray-500">
                            No backups available. Create your first backup now.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

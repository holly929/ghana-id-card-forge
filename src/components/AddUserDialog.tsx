
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserRole } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    username: '',
    password: '',
    role: UserRole.VIEWER,
    status: 'active',
    lastLogin: '-',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value as UserRole }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newUser.name || !newUser.username || !newUser.password) {
      return;
    }
    
    // Generate a random ID
    const user = {
      ...newUser,
      id: Math.random().toString(36).substring(2, 11),
    };
    
    onSave(user);
    
    // Reset form
    setNewUser({
      id: '',
      name: '',
      username: '',
      password: '',
      role: UserRole.VIEWER,
      status: 'active',
      lastLogin: '-',
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setNewUser({
      id: '',
      name: '',
      username: '',
      password: '',
      role: UserRole.VIEWER,
      status: 'active',
      lastLogin: '-',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with manual password and access level.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                value={newUser.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Access Level / Role *</Label>
              <RadioGroup value={newUser.role} onValueChange={handleRoleChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.ADMIN} id="add-admin" />
                  <Label htmlFor="add-admin" className="cursor-pointer">
                    Administrator
                    <div className="text-xs text-gray-500">Full access to all features and user management</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.DATA_ENTRY} id="add-data-entry" />
                  <Label htmlFor="add-data-entry" className="cursor-pointer">
                    Data Entry
                    <div className="text-xs text-gray-500">Can create and edit applicant records</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.VIEWER} id="add-viewer" />
                  <Label htmlFor="add-viewer" className="cursor-pointer">
                    Viewer
                    <div className="text-xs text-gray-500">Read-only access to view records</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;

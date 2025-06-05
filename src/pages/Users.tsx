import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Search, User, Shield, Plus, Edit, Trash, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole, generatePassword } from '@/context/AuthContext';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AddUserDialog from '@/components/AddUserDialog';

// Mock users for the users management page
const mockUsersList = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    role: UserRole.ADMIN,
    lastLogin: '2025-05-06',
    status: 'active',
    password: 'admin123', // Store password for authentication
  },
  {
    id: '2',
    username: 'entry',
    name: 'Data Entry Staff',
    role: UserRole.DATA_ENTRY,
    lastLogin: '2025-05-05',
    status: 'active',
    password: 'entry123',
  },
  {
    id: '3',
    username: 'viewer',
    name: 'View Only Staff',
    role: UserRole.VIEWER,
    lastLogin: '2025-05-01',
    status: 'active',
    password: 'viewer123',
  },
  {
    id: '4',
    username: 'supervisor',
    name: 'Supervisor',
    role: UserRole.ADMIN,
    lastLogin: '2025-05-04',
    status: 'inactive',
    password: 'supervisor123',
  }
];

interface EditUserDialogProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: any) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, isOpen, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({...user});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setEditedUser(prev => ({ ...prev, role: value as UserRole }));
  };

  const handleStatusChange = (value: string) => {
    setEditedUser(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Make changes to the user account. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={editedUser.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={editedUser.username}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <RadioGroup value={editedUser.role} onValueChange={handleRoleChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.ADMIN} id="admin" />
                  <Label htmlFor="admin">Administrator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.DATA_ENTRY} id="data-entry" />
                  <Label htmlFor="data-entry">Data Entry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserRole.VIEWER} id="viewer" />
                  <Label htmlFor="viewer">Viewer</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <RadioGroup value={editedUser.status} onValueChange={handleStatusChange}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteConfirmDialogProps {
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ username, isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user "{username}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Users: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const [users, setUsers] = useState(mockUsersList);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<{id: string, username: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Only admin users should be able to manage other users
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
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate a new password for a user
  const handleGeneratePassword = (userId: string, username: string) => {
    const newPassword = generatePassword();
    
    // Update the user's password in the local state
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, password: newPassword } : user
    ));
    
    // Update the password in the auth context mock users as well
    const authContextUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const updatedAuthUsers = authContextUsers.map((user: any) => 
      user.id === userId ? { ...user, password: newPassword } : user
    );
    localStorage.setItem('mockUsers', JSON.stringify(updatedAuthUsers));
    
    toast.success(`New password generated for ${username}: ${newPassword}`);
  };
  
  // Open edit dialog
  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };
  
  // Save edited user
  const handleSaveUser = (updatedUser: any) => {
    setUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
    
    // Update the user in auth context as well
    const authContextUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const updatedAuthUsers = authContextUsers.map((user: any) => 
      user.id === updatedUser.id ? updatedUser : user
    );
    localStorage.setItem('mockUsers', JSON.stringify(updatedAuthUsers));
    
    setIsEditDialogOpen(false);
    toast.success(`User ${updatedUser.username} has been updated`);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = (userId: string, username: string) => {
    setDeleteUser({ id: userId, username });
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm and delete user
  const handleDeleteConfirm = () => {
    if (deleteUser) {
      setUsers(prev => prev.filter(user => user.id !== deleteUser.id));
      
      // Remove user from auth context as well
      const authContextUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const updatedAuthUsers = authContextUsers.filter((user: any) => user.id !== deleteUser.id);
      localStorage.setItem('mockUsers', JSON.stringify(updatedAuthUsers));
      
      toast.success(`User ${deleteUser.username} has been deleted`);
      setIsDeleteDialogOpen(false);
      setDeleteUser(null);
    }
  };

  // Open add user dialog
  const handleAddUser = () => {
    setIsAddDialogOpen(true);
  };

  // Save new user
  const handleSaveNewUser = (newUser: any) => {
    // Add to local users state
    setUsers(prev => [...prev, newUser]);
    
    // Add to auth context mock users for login capability
    const authContextUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const updatedAuthUsers = [...authContextUsers, newUser];
    localStorage.setItem('mockUsers', JSON.stringify(updatedAuthUsers));
    
    setIsAddDialogOpen(false);
    toast.success(`User ${newUser.username} has been created successfully with the specified password and ${newUser.role} access level`);
  };

  // Initialize mock users in localStorage for auth context
  React.useEffect(() => {
    const storedUsers = localStorage.getItem('mockUsers');
    if (!storedUsers) {
      localStorage.setItem('mockUsers', JSON.stringify(mockUsersList));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage system users, passwords, and access levels</p>
        </div>
        <Button className="self-start" onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" /> Add New User
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isMobile ? (
            // Mobile view - card layout
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                        <Badge 
                          className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}
                        >
                          {user.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>
                          <p className="text-gray-500">Role</p>
                          <p>{user.role}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Login</p>
                          <p>{user.lastLogin}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-between mt-4 pt-2 border-t gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGeneratePassword(user.id, user.username)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" /> Reset Password
                        </Button>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDeleteClick(user.id, user.username)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            // Desktop view - table layout
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        No users found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <Badge 
                            className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGeneratePassword(user.id, user.username)}
                              className="flex items-center"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" /> Reset
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleDeleteClick(user.id, user.username)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteUser && (
        <DeleteConfirmDialog
          username={deleteUser.username}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Add User Dialog */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleSaveNewUser}
      />
    </div>
  );
};

export default Users;

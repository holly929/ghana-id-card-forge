
import React, { useState } from 'react';
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
import { Search, User, Shield, Plus, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth, UserRole, generatePassword } from '@/context/AuthContext';
import { toast } from "sonner";
import { useIsMobile } from '@/hooks/use-mobile';

// Mock users for the users management page
const mockUsersList = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    role: UserRole.ADMIN,
    lastLogin: '2025-05-06',
    status: 'active',
  },
  {
    id: '2',
    username: 'entry',
    name: 'Data Entry Staff',
    role: UserRole.DATA_ENTRY,
    lastLogin: '2025-05-05',
    status: 'active',
  },
  {
    id: '3',
    username: 'viewer',
    name: 'View Only Staff',
    role: UserRole.VIEWER,
    lastLogin: '2025-05-01',
    status: 'active',
  },
  {
    id: '4',
    username: 'supervisor',
    name: 'Supervisor',
    role: UserRole.ADMIN,
    lastLogin: '2025-05-04',
    status: 'inactive',
  }
];

const Users: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  
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
  const filteredUsers = mockUsersList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Generate a new password for a user
  const handleGeneratePassword = (userId: string, username: string) => {
    const newPassword = generatePassword();
    toast.success(`New password generated for ${username}: ${newPassword}`);
    // In a real application, you would save this to the backend
  };
  
  // Delete user (mock functionality)
  const handleDeleteUser = (userId: string, username: string) => {
    toast.success(`User ${username} has been deleted`);
    // In a real application, you would delete the user from the backend
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <Button className="self-start">
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
                      
                      <div className="flex justify-between mt-4 pt-2 border-t">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleGeneratePassword(user.id, user.username)}
                        >
                          Reset Password
                        </Button>
                        <div className="space-x-2">
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDeleteUser(user.id, user.username)}
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
                    <TableHead className="w-[200px]">Actions</TableHead>
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
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleGeneratePassword(user.id, user.username)}
                            >
                              Reset
                            </Button>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => handleDeleteUser(user.id, user.username)}
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
    </div>
  );
};

export default Users;

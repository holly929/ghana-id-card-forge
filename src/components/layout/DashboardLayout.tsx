
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  Users,
  Settings,
  LogOut,
  Shield,
  MenuIcon,
  X,
  Database,
  CreditCard,
  User,
  Search,
  Plus
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    {
      name: 'Applicants',
      href: '/applicants',
      icon: Users,
      requiresRole: [UserRole.ADMIN, UserRole.DATA_ENTRY, UserRole.VIEWER],
    },
    {
      name: 'New Applicant',
      href: '/applicants/new',
      icon: Plus,
      requiresRole: [UserRole.ADMIN, UserRole.DATA_ENTRY],
    },
    {
      name: 'ID Cards',
      href: '/id-cards',
      icon: CreditCard,
      requiresRole: [UserRole.ADMIN, UserRole.DATA_ENTRY, UserRole.VIEWER],
    },
    {
      name: 'User Management',
      href: '/users',
      icon: User,
      requiresRole: [UserRole.ADMIN],
    },
    {
      name: 'System Settings',
      href: '/settings',
      icon: Settings,
      requiresRole: [UserRole.ADMIN],
    },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(
    item => user && item.requiresRole.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="fixed bottom-4 left-4 md:hidden z-30">
        <Button
          onClick={toggleSidebar}
          size="icon"
          className="rounded-full shadow-lg"
        >
          {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 p-4 border-b">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-primary">Ghana Immigration</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            <Link 
              to="/dashboard" 
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-md",
                location.pathname === '/dashboard' 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Database className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 text-sm font-medium rounded-md",
                  location.pathname.startsWith(item.href)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar footer with logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        sidebarOpen ? "md:ml-64" : ""
      )}>
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-4 h-16">
            {/* Search */}
            <div className="flex items-center px-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 bg-transparent border-0 outline-none placeholder-gray-400 text-sm"
              />
            </div>

            {/* User dropdown */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user ? getInitials(user.name) : ''}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

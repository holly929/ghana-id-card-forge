
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Users, CreditCard, User, Clock, ChartLine, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardReports from '@/components/dashboard/DashboardReports';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading } = useDashboardData();
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'card_issued':
        return <CreditCard className="h-5 w-5 text-gray-500" />;
      case 'new_applicant':
        return <Users className="h-5 w-5 text-gray-500" />;
      case 'user_update':
        return <User className="h-5 w-5 text-gray-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diff < 1) {
      return 'Just now';
    } else if (diff < 24) {
      return `${diff} ${diff === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return format(date, 'dd MMM yyyy, HH:mm');
    }
  };

  const handleDownloadAllReports = () => {
    toast({
      title: "Preparing reports package",
      description: "All reports are being compiled for download",
    });
    
    // Simulate processing time for report generation
    setTimeout(() => {
      toast({
        title: "Reports package ready",
        description: "Your reports have been downloaded as a ZIP file",
      });
      
      // Mock ZIP download - in a real app, you'd generate a real ZIP file
      const mockZipContent = "ZIP Content";
      const blob = new Blob([mockZipContent], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ghana-immigration-reports-${new Date().toISOString().split('T')[0]}.zip`);
      link.click();
    }, 2000);
  };

  const stats = [
    { 
      title: 'Total Applicants', 
      value: loading ? '...' : data?.totalApplicants.toString() || '0', 
      icon: Users, 
      change: '+12% from last month', 
      color: 'bg-blue-100 text-blue-700' 
    },
    { 
      title: 'Pending Applications', 
      value: loading ? '...' : data?.pendingApplications.toString() || '0', 
      icon: Clock, 
      change: '-3% from last month', 
      color: 'bg-yellow-100 text-yellow-700' 
    },
    { 
      title: 'ID Cards Issued', 
      value: loading ? '...' : data?.idCardsIssued.toString() || '0', 
      icon: CreditCard, 
      change: '+8% from last month', 
      color: 'bg-green-100 text-green-700' 
    },
    { 
      title: 'Active Users', 
      value: loading ? '...' : data?.activeUsers.toString() || '0', 
      icon: User, 
      change: 'No change from last month', 
      color: 'bg-purple-100 text-purple-700' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Here's an overview of your ID card system</p>
        </div>
        
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleDownloadAllReports}
        >
          <Download size={16} />
          <span>Download All Reports</span>
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Reports Section */}
      <DashboardReports />
      
      {/* Available Reports Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={20} />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Weekly Applicant Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">Summary of applicant registration for the past week</p>
                <Button size="sm" variant="outline" className="w-full flex items-center gap-1" onClick={() => toast({ title: "Report queued", description: "Your weekly report will be ready shortly" })}>
                  <Download size={14} />
                  Download
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Monthly ID Card Issuance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">Monthly summary of ID cards issued and pending</p>
                <Button size="sm" variant="outline" className="w-full flex items-center gap-1" onClick={() => toast({ title: "Report queued", description: "Your monthly report will be ready shortly" })}>
                  <Download size={14} />
                  Download
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Annual Performance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-3">Comprehensive annual statistics and analysis</p>
                <Button size="sm" variant="outline" className="w-full flex items-center gap-1" onClick={() => toast({ title: "Report queued", description: "Your annual report will be ready shortly" })}>
                  <Download size={14} />
                  Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              // Show skeletons while loading
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="w-full">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : (
              data?.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

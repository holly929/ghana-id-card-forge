
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Users, CreditCard, User, Clock, ChartLine, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData, TimePeriod, getReportData } from '@/hooks/useDashboardData';
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
    
    try {
      // Create CSV content for all periods
      const periods: TimePeriod[] = ['weekly', 'monthly', 'annually'];
      let allReportsContent = '';
      
      periods.forEach(period => {
        const periodData = getReportData(period);
        allReportsContent += `\n\n${period.toUpperCase()} REPORT\n`;
        allReportsContent += "date,applicants,cards\n";
        
        periodData.forEach(item => {
          allReportsContent += `${item.date},${item.applicants},${item.cards}\n`;
        });
      });
      
      // Create blob and download
      const blob = new Blob([allReportsContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ghana-immigration-all-reports-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Reports package ready",
        description: "Your reports have been downloaded as a CSV file",
      });
    } catch (error) {
      console.error("Error generating reports package:", error);
      toast({
        title: "Download failed",
        description: "There was an error generating the reports package",
        variant: "destructive",
      });
    }
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full flex items-center gap-1" 
                  onClick={() => {
                    const weeklyData = getReportData('weekly');
                    let csvContent = "date,applicants,cards\n";
                    weeklyData.forEach(item => {
                      csvContent += `${item.date},${item.applicants},${item.cards}\n`;
                    });
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `weekly-applicant-report-${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    toast({ 
                      title: "Report downloaded", 
                      description: "Your weekly report is ready" 
                    });
                  }}
                >
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full flex items-center gap-1" 
                  onClick={() => {
                    const monthlyData = getReportData('monthly');
                    let csvContent = "date,applicants,cards\n";
                    monthlyData.forEach(item => {
                      csvContent += `${item.date},${item.applicants},${item.cards}\n`;
                    });
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `monthly-card-issuance-${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    toast({ 
                      title: "Report downloaded", 
                      description: "Your monthly report is ready" 
                    });
                  }}
                >
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full flex items-center gap-1" 
                  onClick={() => {
                    const annualData = getReportData('annually');
                    let csvContent = "date,applicants,cards\n";
                    annualData.forEach(item => {
                      csvContent += `${item.date},${item.applicants},${item.cards}\n`;
                    });
                    
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `annual-performance-report-${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    toast({ 
                      title: "Report downloaded", 
                      description: "Your annual report is ready" 
                    });
                  }}
                >
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

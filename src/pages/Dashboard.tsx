
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Users, CreditCard, User, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardReports from '@/components/dashboard/DashboardReports';
import { format } from 'date-fns';

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
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.name}</h1>
        <p className="text-gray-600">Here's an overview of your ID card system</p>
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

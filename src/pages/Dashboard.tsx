
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Users, CreditCard, User, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock statistics data
  const stats = [
    { 
      title: 'Total Applicants', 
      value: '358', 
      icon: Users, 
      change: '+12% from last month', 
      color: 'bg-blue-100 text-blue-700' 
    },
    { 
      title: 'Pending Applications', 
      value: '47', 
      icon: Clock, 
      change: '-3% from last month', 
      color: 'bg-yellow-100 text-yellow-700' 
    },
    { 
      title: 'ID Cards Issued', 
      value: '294', 
      icon: CreditCard, 
      change: '+8% from last month', 
      color: 'bg-green-100 text-green-700' 
    },
    { 
      title: 'Active Users', 
      value: '12', 
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {index % 3 === 0 && <CreditCard className="h-5 w-5 text-gray-500" />}
                  {index % 3 === 1 && <Users className="h-5 w-5 text-gray-500" />}
                  {index % 3 === 2 && <User className="h-5 w-5 text-gray-500" />}
                </div>
                <div>
                  <p className="font-medium">
                    {index % 3 === 0 && "New ID card issued for Ahmed Mohammed"}
                    {index % 3 === 1 && "New applicant registered: Maria Sanchez"}
                    {index % 3 === 2 && "User John Data updated applicant information"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {`${Math.floor(index * 2.5)} hours ago`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { dataSyncService } from '@/services/dataSync';

// Type definitions for our dashboard data
export interface DashboardStat {
  title: string;
  value: string;
  icon: React.ComponentType;
  change: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'card_issued' | 'new_applicant' | 'user_update';
  title: string;
  timestamp: Date;
}

export interface DashboardData {
  totalApplicants: number;
  pendingApplications: number;
  idCardsIssued: number;
  activeUsers: number;
  recentActivity: ActivityItem[];
}

// Time periods for reports
export type TimePeriod = 'weekly' | 'monthly' | 'annually';

// Mock data provider updated to use sync service
const getMockDashboardData = async (): Promise<DashboardData> => {
  const applicants = await dataSyncService.getApplicants();
  
  const totalApplicants = applicants.length;
  const pendingApplications = applicants.filter(a => a.status === 'pending').length;
  const idCardsIssued = applicants.filter(a => a.status === 'approved').length;
  
  return {
    totalApplicants,
    pendingApplications,
    idCardsIssued,
    activeUsers: 12,
    recentActivity: [
      {
        id: '1',
        type: 'card_issued',
        title: 'New ID card issued for Ahmed Mohammed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: '2',
        type: 'new_applicant',
        title: 'New applicant registered: Maria Sanchez',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5)
      },
      {
        id: '3',
        type: 'user_update',
        title: 'User John Data updated applicant information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8)
      },
      {
        id: '4',
        type: 'card_issued',
        title: 'New ID card issued for Sarah Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12)
      },
      {
        id: '5',
        type: 'new_applicant',
        title: 'New applicant registered: James Wilson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]
  };
};

// Get report data for different time periods
export const getReportData = (period: TimePeriod) => {
  const now = new Date();
  const data: { date: string; applicants: number; cards: number }[] = [];
  
  switch (period) {
    case 'weekly':
      // Generate daily data for past 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          applicants: Math.floor(Math.random() * 20) + 5,
          cards: Math.floor(Math.random() * 15) + 3
        });
      }
      break;
    
    case 'monthly':
      // Generate weekly data for past 4 weeks
      for (let i = 0; i < 4; i++) {
        data.push({
          date: `Week ${i + 1}`,
          applicants: Math.floor(Math.random() * 80) + 30,
          cards: Math.floor(Math.random() * 60) + 20
        });
      }
      break;
      
    case 'annually':
      // Generate monthly data for past 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: date.toLocaleDateString('en-US', { month: 'short' }),
          applicants: Math.floor(Math.random() * 300) + 100,
          cards: Math.floor(Math.random() * 250) + 80
        });
      }
      break;
  }
  
  return data.reverse();
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Updated to use sync service
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const dashboardData = await getMockDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};

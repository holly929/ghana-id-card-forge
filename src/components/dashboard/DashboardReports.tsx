
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TimePeriod, getReportData } from '@/hooks/useDashboardData';
import ReportDownloadOptions from './ReportDownloadOptions';

export const DashboardReports = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  
  const data = getReportData(timePeriod);
  
  const handlePeriodChange = (value: string) => {
    setTimePeriod(value as TimePeriod);
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>ID Card System Reports</CardTitle>
          <div className="flex items-center flex-wrap gap-4">
            <ReportDownloadOptions timePeriod={timePeriod} data={data} />
            <Tabs 
              defaultValue="weekly" 
              value={timePeriod} 
              onValueChange={handlePeriodChange}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annually">Annually</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ChartContainer
            config={{
              applicants: { color: "#4b89ec" },
              cards: { color: "#10b981" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  content={(props) => {
                    if (props.active && props.payload && props.payload.length) {
                      return (
                        <div className="border border-gray-200 shadow-lg p-2 bg-white rounded-md">
                          <p className="font-medium">{props.label}</p>
                          {props.payload.map((entry, index) => (
                            <p key={`item-${index}`} style={{ color: entry.color }}>
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="New Applicants"
                  dataKey="applicants"
                  stroke="#4b89ec"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="ID Cards Issued"
                  dataKey="cards"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardReports;

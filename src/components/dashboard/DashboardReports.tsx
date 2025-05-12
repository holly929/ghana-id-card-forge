
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">ID Card System Reports</CardTitle>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ReportDownloadOptions timePeriod={timePeriod} data={data} />
            <Tabs 
              defaultValue="weekly" 
              value={timePeriod} 
              onValueChange={handlePeriodChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annually">Annually</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] w-full mt-2 sm:mt-4">
          <ChartContainer
            config={{
              applicants: { color: "#4b89ec" },
              cards: { color: "#10b981" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickMargin={10}
                  interval="preserveEnd"
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <Tooltip
                  content={(props) => {
                    if (props.active && props.payload && props.payload.length) {
                      return (
                        <div className="border border-gray-200 shadow-lg p-2 bg-white rounded-md text-xs sm:text-sm">
                          <p className="font-medium">{props.label}</p>
                          {props.payload.map((entry, index) => (
                            <p key={`item-${index}`} style={{ color: entry.color }} className="whitespace-nowrap">
                              {entry.name}: {entry.value}
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  name="New Applicants"
                  dataKey="applicants"
                  stroke="#4b89ec"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  name="ID Cards Issued"
                  dataKey="cards"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
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

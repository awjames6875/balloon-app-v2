import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { ArrowUpRight, BarChart2, Download, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

// Sample data for charts
const salesData = [
  { month: 'Jan', revenue: 4000, orders: 24 },
  { month: 'Feb', revenue: 3000, orders: 18 },
  { month: 'Mar', revenue: 5000, orders: 29 },
  { month: 'Apr', revenue: 2780, orders: 17 },
  { month: 'May', revenue: 1890, orders: 12 },
  { month: 'Jun', revenue: 2390, orders: 16 },
  { month: 'Jul', revenue: 3490, orders: 21 },
];

const materialData = [
  { name: 'Red', value: 400, percentage: 25 },
  { name: 'Blue', value: 300, percentage: 18.75 },
  { name: 'White', value: 300, percentage: 18.75 },
  { name: 'Yellow', value: 200, percentage: 12.5 },
  { name: 'Green', value: 150, percentage: 9.38 },
  { name: 'Pink', value: 100, percentage: 6.25 },
  { name: 'Purple', value: 100, percentage: 6.25 },
  { name: 'Other', value: 50, percentage: 3.12 },
];

const timeData = [
  { day: 'Mon', hours: 5.2 },
  { day: 'Tue', hours: 6.5 },
  { day: 'Wed', hours: 4.8 },
  { day: 'Thu', hours: 7.1 },
  { day: 'Fri', hours: 5.5 },
  { day: 'Sat', hours: 3.2 },
  { day: 'Sun', hours: 1.5 },
];

const COLORS = ['#ef4444', '#3b82f6', '#f3f4f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#6b7280'];

const Analytics = () => {
  const [dateRange, setDateRange] = useState('last30days');
  const [chartType, setChartType] = useState('revenue');

  // This would fetch real data in a production environment
  const { isLoading } = useQuery({
    queryKey: ['/api/analytics', dateRange],
    enabled: false, // Disabled since we're using sample data
  });

  const handleExportData = () => {
    // In a real app, this would generate and download a CSV file
    alert('In a real app, this would export analytics data as CSV');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Sales Analytics</h1>
        <p className="text-secondary-500 mt-1">View and analyze your sales metrics and trends</p>
      </div>

      {/* Analytics Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Select
          value={dateRange}
          onValueChange={setDateRange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="last90days">Last 90 days</SelectItem>
            <SelectItem value="lastYear">Last year</SelectItem>
            <SelectItem value="allTime">All time</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Total Revenue</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">$12,500</p>
              </div>
              <div className="p-2 bg-green-50 rounded-md">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 12%</span>
              <span className="text-secondary-500 ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Orders</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">137</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md">
                <BarChart2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 5%</span>
              <span className="text-secondary-500 ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Avg. Order Value</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">$92.34</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-md">
                <ArrowUpRight className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 7%</span>
              <span className="text-secondary-500 ml-1">from previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Materials Used</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">1,628</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-md">
                <PieChartIcon className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-secondary-600">
              <span className="text-secondary-500">Balloons and accessories</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Charts */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Sales Trends</CardTitle>
              <CardDescription>Visualize your sales performance over time</CardDescription>
            </div>
            <Tabs value={chartType} onValueChange={setChartType} className="w-full md:w-auto mt-2 md:mt-0">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => chartType === 'revenue' ? `$${value}` : value}
                  />
                  <Tooltip 
                    formatter={(value) => chartType === 'revenue' ? `$${value}` : value}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar 
                    dataKey={chartType === 'revenue' ? 'revenue' : 'orders'} 
                    fill={chartType === 'revenue' ? '#3b82f6' : '#10b981'} 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Material Usage & Production Time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Material Usage</CardTitle>
            <CardDescription>Balloon color distribution across all designs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {materialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {materialData.slice(0, 8).map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-1"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-xs text-secondary-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Time */}
        <Card>
          <CardHeader>
            <CardTitle>Production Time</CardTitle>
            <CardDescription>Average hours spent per day on production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip formatter={(value) => `${value} hours`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700">Average Time Per Design</p>
                  <p className="text-lg font-semibold text-secondary-900">4.83 hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-700">Total Production Hours</p>
                  <p className="text-lg font-semibold text-secondary-900">33.8 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Designs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Top Selling Designs</CardTitle>
              <CardDescription>Most popular balloon designs by revenue</CardDescription>
            </div>
            <Link href="/design">
              <a className="text-sm text-primary-600 hover:text-primary-700">View all designs</a>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <div className="grid grid-cols-12 py-3 px-4 bg-secondary-50 border-b font-medium text-secondary-700 text-sm">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Design</div>
              <div className="col-span-2">Client</div>
              <div className="col-span-2">Sales</div>
              <div className="col-span-2">Revenue</div>
              <div className="col-span-2">Production Time</div>
            </div>
            
            {/* Sample top designs - In a real app, this would be dynamic data */}
            <div className="grid grid-cols-12 py-3 px-4 border-b items-center text-sm">
              <div className="col-span-1 text-secondary-500">1</div>
              <div className="col-span-3 flex items-center">
                <div className="w-10 h-10 rounded bg-blue-100 mr-3"></div>
                <span className="font-medium">Blue Cascade</span>
              </div>
              <div className="col-span-2">Johnson Wedding</div>
              <div className="col-span-2">14</div>
              <div className="col-span-2">$1,960</div>
              <div className="col-span-2">6.2 hrs</div>
            </div>
            
            <div className="grid grid-cols-12 py-3 px-4 border-b items-center text-sm">
              <div className="col-span-1 text-secondary-500">2</div>
              <div className="col-span-3 flex items-center">
                <div className="w-10 h-10 rounded bg-red-100 mr-3"></div>
                <span className="font-medium">Red Elegance</span>
              </div>
              <div className="col-span-2">Smith Gala</div>
              <div className="col-span-2">12</div>
              <div className="col-span-2">$1,800</div>
              <div className="col-span-2">5.5 hrs</div>
            </div>
            
            <div className="grid grid-cols-12 py-3 px-4 border-b items-center text-sm">
              <div className="col-span-1 text-secondary-500">3</div>
              <div className="col-span-3 flex items-center">
                <div className="w-10 h-10 rounded bg-purple-100 mr-3"></div>
                <span className="font-medium">Royal Purple</span>
              </div>
              <div className="col-span-2">Roberts Party</div>
              <div className="col-span-2">10</div>
              <div className="col-span-2">$1,450</div>
              <div className="col-span-2">4.8 hrs</div>
            </div>
            
            <div className="grid grid-cols-12 py-3 px-4 border-b items-center text-sm">
              <div className="col-span-1 text-secondary-500">4</div>
              <div className="col-span-3 flex items-center">
                <div className="w-10 h-10 rounded bg-green-100 mr-3"></div>
                <span className="font-medium">Forest Theme</span>
              </div>
              <div className="col-span-2">Green Charity</div>
              <div className="col-span-2">8</div>
              <div className="col-span-2">$1,120</div>
              <div className="col-span-2">5.0 hrs</div>
            </div>
            
            <div className="grid grid-cols-12 py-3 px-4 items-center text-sm">
              <div className="col-span-1 text-secondary-500">5</div>
              <div className="col-span-3 flex items-center">
                <div className="w-10 h-10 rounded bg-yellow-100 mr-3"></div>
                <span className="font-medium">Sunshine Delight</span>
              </div>
              <div className="col-span-2">Miller Birthday</div>
              <div className="col-span-2">7</div>
              <div className="col-span-2">$980</div>
              <div className="col-span-2">3.9 hrs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

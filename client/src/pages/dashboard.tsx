import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronRight, BarChart3, LineChart, FileText, Calendar, Package, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Design } from "@shared/schema";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartType, setChartType] = useState("sales");

  // Fetch user's recent designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
    enabled: !!user,
  });

  // Fetch inventory alerts
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: !!user,
  });

  // Calculate low inventory items
  const lowInventoryItems = inventory?.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock') || [];

  // Example data for charts
  const salesData = [
    { name: 'Jan', value: 2400 },
    { name: 'Feb', value: 1398 },
    { name: 'Mar', value: 9800 },
    { name: 'Apr', value: 3908 },
    { name: 'May', value: 4800 },
    { name: 'Jun', value: 3800 },
  ];

  const materialData = [
    { name: 'Red', value: 400 },
    { name: 'Blue', value: 300 },
    { name: 'White', value: 300 },
    { name: 'Yellow', value: 200 },
    { name: 'Green', value: 100 },
  ];

  const COLORS = ['#ef4444', '#3b82f6', '#f3f4f6', '#f59e0b', '#10b981'];

  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-500 mt-1">Welcome back, {user?.fullName || user?.username}</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Total Projects</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {designsLoading ? "..." : designs?.length || 0}
                </p>
              </div>
              <div className="p-2 bg-primary-50 rounded-md">
                <FileText className="h-5 w-5 text-primary-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 12%</span>
              <span className="text-secondary-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">8</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 5%</span>
              <span className="text-secondary-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Inventory Status</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {lowInventoryItems.length > 0 ? `${lowInventoryItems.length} alerts` : "All Good"}
                </p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-md">
                <Package className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-warning-600">
              <span className="font-medium">
                {lowInventoryItems.length > 0 ? "⚠ Low stock items" : "✓ Stock levels healthy"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Sales This Month</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">$12,500</p>
              </div>
              <div className="p-2 bg-green-50 rounded-md">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-success-600">
              <span className="font-medium">↑ 18%</span>
              <span className="text-secondary-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Track your business performance</CardDescription>
            </div>
            <Tabs value={chartType} onValueChange={setChartType} className="w-[300px]">
              <TabsList>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mt-4">
            {chartType === "sales" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {materialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/design" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {designsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : designs && designs.length > 0 ? (
              <div className="space-y-4">
                {designs.slice(0, 5).map((design: Design) => (
                  <div key={design.id} className="flex items-center p-3 bg-secondary-50 rounded-lg">
                    <div className="w-12 h-12 bg-primary-100 rounded overflow-hidden mr-4">
                      {design.imageUrl && (
                        <img 
                          src={design.imageUrl} 
                          alt={design.clientName} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-800">{design.clientName}</p>
                      <p className="text-xs text-secondary-500">
                        {new Date(design.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded">
                        {design.totalBalloons} balloons
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-secondary-500">No projects yet</p>
                <Link href="/design" className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700">
                  Upload your first design
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Inventory Alerts</CardTitle>
              <Link href="/inventory" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View inventory <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
            ) : lowInventoryItems.length > 0 ? (
              <div className="space-y-4">
                {lowInventoryItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center p-3 bg-secondary-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4">
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-secondary-800">
                        {item.color} {item.size} Balloons
                      </p>
                      <p className="text-xs text-secondary-500">
                        {item.quantity} remaining (Threshold: {item.threshold})
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        item.status === 'out_of_stock' 
                          ? 'bg-error-50 text-error-700' 
                          : 'bg-warning-50 text-warning-700'
                      }`}>
                        {item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="bg-success-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-6 w-6 text-success-600" />
                </div>
                <p className="text-secondary-800 font-medium">Inventory levels are healthy</p>
                <p className="text-secondary-500 text-sm">All items are above threshold levels</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

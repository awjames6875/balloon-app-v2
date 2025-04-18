
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch orders data
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  const filteredOrders = orders?.filter(order => 
    order.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
        <p className="text-secondary-500 mt-1">Manage balloon orders and deliveries</p>
      </div>

      {/* Orders Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Orders Management</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="border rounded-md">
              <div className="grid grid-cols-12 py-3 px-4 bg-secondary-50 border-b font-medium text-secondary-700 text-sm">
                <div className="col-span-1">#</div>
                <div className="col-span-2">Client Name</div>
                <div className="col-span-2">Order Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Actions</div>
              </div>
              {filteredOrders.map((order, index) => (
                <div key={order.id} className="grid grid-cols-12 py-3 px-4 border-b last:border-b-0 items-center text-sm">
                  <div className="col-span-1 text-secondary-500">{index + 1}</div>
                  <div className="col-span-2">{order.clientName}</div>
                  <div className="col-span-2">{new Date(order.createdAt).toLocaleDateString()}</div>
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' 
                        ? 'bg-success-50 text-success-700' 
                        : order.status === 'pending' 
                        ? 'bg-warning-50 text-warning-700'
                        : 'bg-error-50 text-error-700'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-span-2">${order.total?.toFixed(2)}</div>
                  <div className="col-span-2 flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-secondary-500">No orders found</p>
              {searchTerm && (
                <p className="text-sm text-secondary-400 mt-1">
                  Try a different search term
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;

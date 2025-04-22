
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Clock, CheckCircle2, AlertTriangle, PackageCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { apiRequest } from '@/lib/queryClient';
import { OrderDetailDialog } from '@/components/order/order-detail-dialog';

// Define the order interfaces
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

interface OrderItem {
  id: number;
  orderId: number;
  inventoryType: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: number;
  userId: number;
  designId?: number;
  status: OrderStatus;
  supplierName?: string;
  expectedDeliveryDate?: string | Date;
  priority: string;
  notes?: string;
  totalQuantity: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch orders data
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  // Fetch selected order details when an order is selected
  const { data: orderDetails } = useQuery<Order>({
    queryKey: [`/api/orders/${selectedOrder}`],
    enabled: !!selectedOrder,
  });

  // Filter orders by search term and status
  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(order.id).includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge styles and icon
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return {
          classes: 'bg-green-100 text-green-800',
          icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        };
      case 'processing':
        return {
          classes: 'bg-blue-100 text-blue-800',
          icon: <PackageCheck className="h-3.5 w-3.5 mr-1" />
        };
      case 'shipped':
        return {
          classes: 'bg-indigo-100 text-indigo-800',
          icon: <PackageCheck className="h-3.5 w-3.5 mr-1" />
        };  
      case 'cancelled':
        return {
          classes: 'bg-red-100 text-red-800',
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        };
      case 'pending':
      default:
        return {
          classes: 'bg-amber-100 text-amber-800',
          icon: <Clock className="h-3.5 w-3.5 mr-1" />
        };
    }
  };

  // Handle opening the details dialog
  const handleViewOrder = (orderId: number) => {
    setSelectedOrder(orderId);
    setDetailDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100) : '$0.00';
  };

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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2">Order Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-3">Actions</div>
              </div>
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <div key={order.id} className="grid grid-cols-12 py-3 px-4 border-b last:border-b-0 items-center text-sm hover:bg-muted/20">
                    <div className="col-span-1 text-secondary-500">#{order.id}</div>
                    <div className="col-span-2">{order.supplierName || 'N/A'}</div>
                    <div className="col-span-2">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="col-span-2">
                      <Badge variant="outline" className={`flex items-center ${statusBadge.classes}`}>
                        {statusBadge.icon}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="col-span-2 font-medium">{formatCurrency(order.totalCost)}</div>
                    <div className="col-span-3 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          Process Order
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-secondary-500">No orders found</p>
              {(searchTerm || statusFilter !== 'all') && (
                <p className="text-sm text-secondary-400 mt-1">
                  Try adjusting your filters
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order detail dialog */}
      {selectedOrder && (
        <OrderDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          orderId={selectedOrder}
          orderData={orderDetails}
        />
      )}
    </div>
  );
};

export default Orders;

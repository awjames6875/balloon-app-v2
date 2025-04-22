import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  Truck, 
  ShoppingBag, 
  X, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define the order and order item interfaces
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
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
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

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  orderData?: Order;
}

export function OrderDetailDialog({
  open,
  onOpenChange,
  orderId,
  orderData
}: OrderDetailDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusUpdateNote, setStatusUpdateNote] = useState("");
  const [newStatus, setNewStatus] = useState(orderData?.status || "pending");
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  
  // Set the initial status when orderData changes
  useEffect(() => {
    if (orderData) {
      setNewStatus(orderData.status);
    }
  }, [orderData]);
  
  // Define status configurations with colors and icons
  const statusConfig = {
    pending: {
      color: "bg-amber-100 text-amber-800",
      icon: <Clock className="h-5 w-5 mr-2" />,
      label: "Pending",
      description: "Order has been placed but not yet processed"
    },
    processing: {
      color: "bg-blue-100 text-blue-800",
      icon: <PackageCheck className="h-5 w-5 mr-2" />,
      label: "Processing",
      description: "Order is being prepared"
    },
    shipped: {
      color: "bg-indigo-100 text-indigo-800",
      icon: <Truck className="h-5 w-5 mr-2" />,
      label: "Shipped",
      description: "Order is on its way to delivery"
    },
    completed: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="h-5 w-5 mr-2" />,
      label: "Completed",
      description: "Order has been delivered successfully"
    },
    cancelled: {
      color: "bg-red-100 text-red-800",
      icon: <X className="h-5 w-5 mr-2" />,
      label: "Cancelled",
      description: "Order has been cancelled"
    }
  };
  
  // Define valid status transitions
  const validStatusTransitions = {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "completed", "cancelled"],
    shipped: ["completed", "cancelled"],
    completed: [],
    cancelled: []
  };
  
  // Filter out invalid status transitions
  const availableStatusTransitions = validStatusTransitions[orderData?.status as keyof typeof validStatusTransitions] || [];
  
  // Set up mutation for updating order status
  const updateOrderMutation = useMutation({
    mutationFn: async (data: { status: string; notes?: string }) => {
      return apiRequest(
        'PATCH',
        `/api/orders/${orderId}`, 
        {
          status: data.status,
          statusUpdateNote: data.notes
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Order status updated",
        description: `Order #${orderId} has been updated to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
        variant: "default",
      });
      
      // Refresh order data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
    },
    onError: (error: any) => {
      console.error("Order status update error:", error);
      toast({
        title: "Failed to update order status",
        description: "There was an error updating the order status. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle status update
  const handleStatusUpdate = () => {
    if (newStatus && newStatus !== orderData?.status) {
      updateOrderMutation.mutate({
        status: newStatus,
        notes: statusUpdateNote
      });
    }
  };
  
  // Handle cancel order
  const handleCancelOrder = () => {
    updateOrderMutation.mutate({
      status: "cancelled",
      notes: statusUpdateNote || "Order cancelled by user"
    });
    setShowCancelAlert(false);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return amount ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100) : '$0.00';
  };
  
  if (!orderData) {
    return null;
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Order #{orderId}
            </DialogTitle>
          </DialogHeader>
          
          {/* Order header section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-bold mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Date:</span>
                  <span>{orderData.createdAt ? format(new Date(orderData.createdAt), 'PPP') : 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Status:</span>
                  <div className="flex items-center">
                    <Badge variant="outline" className={`${statusConfig[orderData.status as keyof typeof statusConfig]?.color || ''} flex items-center`}>
                      {statusConfig[orderData.status as keyof typeof statusConfig]?.icon}
                      {statusConfig[orderData.status as keyof typeof statusConfig]?.label || orderData.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Total:</span>
                  <span className="font-bold">{formatCurrency(orderData.totalCost)}</span>
                </div>
                {orderData.priority && (
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-24">Priority:</span>
                    <span className="capitalize">{orderData.priority}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Supplier Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Supplier:</span>
                  <span>{orderData.supplierName || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground w-24">Expected:</span>
                  <span>{orderData.expectedDeliveryDate ? format(new Date(orderData.expectedDeliveryDate), 'PPP') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Order items section */}
          <div className="my-4">
            <h3 className="font-bold mb-2">Order Items</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 py-2 px-3 bg-muted/50 border-b font-medium text-sm">
                <div className="col-span-4">Item</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
              
              {orderData.items && orderData.items.length > 0 ? (
                orderData.items.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 py-2 px-3 border-b last:border-b-0 text-sm">
                    <div className="col-span-4 capitalize flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: item.color ? getColorHex(item.color) : '#ccc' }}
                      ></div>
                      {item.color} {item.inventoryType}
                    </div>
                    <div className="col-span-2">
                      {item.size === '11inch' ? '11"' : '16"'}
                    </div>
                    <div className="col-span-2 text-right">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="col-span-2 text-right">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 px-4 text-center text-muted-foreground">
                  No items found for this order
                </div>
              )}
              
              {/* Order totals */}
              <div className="grid grid-cols-12 py-2 px-3 bg-muted/20 border-t font-medium text-sm">
                <div className="col-span-10 text-right">Total:</div>
                <div className="col-span-2 text-right font-bold">
                  {formatCurrency(orderData.totalCost)}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Status update section - only show if order is not completed or cancelled */}
          {orderData.status !== 'completed' && orderData.status !== 'cancelled' && (
            <div className="my-4">
              <h3 className="font-bold mb-2">Update Order Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-status">New Status</Label>
                  <Select 
                    value={newStatus} 
                    onValueChange={setNewStatus}
                    disabled={availableStatusTransitions.length === 0}
                  >
                    <SelectTrigger id="new-status">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatusTransitions.map(status => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center">
                            {statusConfig[status as keyof typeof statusConfig]?.icon}
                            <span className="ml-2">{statusConfig[status as keyof typeof statusConfig]?.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableStatusTransitions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      This order cannot be updated further.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-note">Status Update Note (Optional)</Label>
                  <Textarea
                    id="status-note"
                    placeholder="Add any notes about this status change..."
                    value={statusUpdateNote}
                    onChange={e => setStatusUpdateNote(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => setShowCancelAlert(true)}
                  disabled={orderData.status === 'cancelled'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
                
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={
                    !newStatus || 
                    newStatus === orderData.status || 
                    !availableStatusTransitions.includes(newStatus) ||
                    updateOrderMutation.isPending
                  }
                >
                  {updateOrderMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Notes section */}
          {orderData.notes && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Order Notes</h3>
              <div className="bg-muted/20 p-3 rounded-md text-sm whitespace-pre-wrap">
                {orderData.notes}
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Cancel order confirmation dialog */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              Cancel Order #{orderId}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order will be marked as cancelled and any associated processes will be stopped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancelOrder}>
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Helper function to get color hex codes
function getColorHex(colorName: string) {
  const colorMap: Record<string, string> = {
    red: '#FF5252',
    blue: '#2196F3',
    green: '#4CAF50',
    yellow: '#FFEB3B',
    purple: '#9C27B0',
    pink: '#E91E63',
    orange: '#FF9800',
    white: '#FFFFFF',
    black: '#000000',
    silver: '#BDBDBD',
    gold: '#FFC107'
  };
  
  return colorMap[colorName.toLowerCase()] || '#CCCCCC';
}
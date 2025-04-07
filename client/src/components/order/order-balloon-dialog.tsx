import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Truck } from "lucide-react";
import { Inventory, Order } from "@shared/schema";
import { apiRequest } from "../../lib/queryClient";
import { cn } from "../../lib/utils";

interface MaterialRequirement {
  color: string;
  size: string;
  required: number;
  inStock: number;
  difference: number;
  status: 'available' | 'low' | 'unavailable';
}

interface OrderBalloonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: number;
  materialRequirements: MaterialRequirement[];
}

export function OrderBalloonDialog({
  open,
  onOpenChange,
  designId,
  materialRequirements
}: OrderBalloonDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderData, setOrderData] = useState<Order | null>(null);
  
  // Filter to show only items that need to be ordered (status = unavailable)
  const itemsToOrder = materialRequirements.filter(item => item.status === 'unavailable');
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    supplierName: "Default Supplier",
    expectedDeliveryDate: null as Date | null,
    priority: "normal",
    notes: "",
    items: itemsToOrder.map(item => ({
      color: item.color,
      size: item.size,
      quantity: Math.abs(item.difference), // Default to the exact amount needed
      unitPrice: item.size === '11inch' ? 0.5 : 0.75 // Default prices
    }))
  });

  // Calculate totals
  const totalQuantity = orderForm.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = orderForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      // 1. Create the order
      const response = await apiRequest('/api/designs/' + designId + '/order', 'POST', {
        supplierName: orderForm.supplierName,
        expectedDeliveryDate: orderForm.expectedDeliveryDate,
        priority: orderForm.priority,
        notes: orderForm.notes || `Order for design #${designId}`
      });
      
      return response;
    },
    onSuccess: (data: any) => {
      // Show success notification
      toast({
        title: "Order placed successfully!",
        description: `Order #${data.id} has been created.`,
        variant: "default",
      });
      
      // Set order placed state and store order data
      setOrderPlaced(true);
      setOrderData(data);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: "There was an error creating your order. Please try again.",
        variant: "destructive",
      });
      console.error("Order creation error:", error);
    }
  });
  
  // Handle order submission
  const handlePlaceOrder = () => {
    createOrderMutation.mutate();
  };
  
  // Handle form changes
  const handleInputChange = (field: string, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle item quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...orderForm.items];
    newItems[index].quantity = quantity;
    setOrderForm(prev => ({
      ...prev,
      items: newItems
    }));
  };
  
  // Reset state when dialog closes
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Reset state when dialog closes
      setOrderPlaced(false);
      setOrderData(null);
    }
    onOpenChange(open);
  };

  // Get color hex for display
  const getColorHex = (colorName: string) => {
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
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl">
        {orderPlaced ? (
          // Order confirmation view
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Order Placed Successfully!
              </DialogTitle>
              <DialogDescription className="text-base">
                Your balloon order has been placed and is being processed.
              </DialogDescription>
            </DialogHeader>
            
            <div className="my-6 p-5 border rounded-lg bg-muted/20">
              <div className="flex items-center mb-4">
                <Truck className="h-10 w-10 text-primary mr-3" />
                <div>
                  <h3 className="text-lg font-bold">Order #{orderData?.id}</h3>
                  <p className="text-muted-foreground">
                    {orderData?.expectedDeliveryDate 
                      ? `Expected delivery: ${format(new Date(orderData.expectedDeliveryDate), 'MMMM d, yyyy')}` 
                      : 'Delivery date not specified'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Balloons:</p>
                  <p className="font-bold">{orderData?.totalQuantity || totalQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cost:</p>
                  <p className="font-bold">${orderData?.totalCost || totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Priority:</p>
                  <p className="font-bold capitalize">{orderData?.priority || orderForm.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Supplier:</p>
                  <p className="font-bold">{orderData?.supplierName || orderForm.supplierName}</p>
                </div>
              </div>
              
              {orderData?.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notes:</p>
                  <p>{orderData.notes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleDialogChange(false)}
                className="w-full sm:w-auto"
              >
                Return to Design
              </Button>
              <Button 
                variant="default" 
                onClick={() => window.location.href = '/orders'}
                className="w-full sm:w-auto"
              >
                View All Orders
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Order creation form
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Order Balloons for Your Design</DialogTitle>
              <DialogDescription className="text-base">
                You need more balloons for your design. Let's order them!
              </DialogDescription>
            </DialogHeader>
            
            {/* Order items table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-bold">Color</th>
                    <th className="p-3 text-left font-bold">Size</th>
                    <th className="p-3 text-right font-bold">Need</th>
                    <th className="p-3 text-right font-bold">Have</th>
                    <th className="p-3 text-right font-bold">Missing</th>
                    <th className="p-3 text-right font-bold">Quantity to Order</th>
                  </tr>
                </thead>
                <tbody>
                  {orderForm.items.map((item, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="p-3 capitalize flex items-center">
                        <div 
                          className="w-5 h-5 rounded-full mr-2" 
                          style={{ backgroundColor: getColorHex(item.color) }}
                        ></div>
                        {item.color}
                      </td>
                      <td className="p-3">{item.size === '11inch' ? '11"' : '16"'}</td>
                      <td className="p-3 text-right">
                        {itemsToOrder[index]?.required || 0}
                      </td>
                      <td className="p-3 text-right">
                        {itemsToOrder[index]?.inStock || 0}
                      </td>
                      <td className="p-3 text-right text-red-600 font-bold">
                        {itemsToOrder[index]?.difference < 0 ? itemsToOrder[index]?.difference : 0}
                      </td>
                      <td className="p-3 text-right">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                          className="w-20 text-right inline-block"
                        />
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total row */}
                  <tr className="bg-muted/30 font-bold">
                    <td className="p-3" colSpan={5}>TOTAL</td>
                    <td className="p-3 text-right">{totalQuantity}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Order details form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select 
                  value={orderForm.supplierName} 
                  onValueChange={(value) => handleInputChange('supplierName', value)}
                >
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Default Supplier">Default Supplier</SelectItem>
                    <SelectItem value="Balloon Wholesaler">Balloon Wholesaler</SelectItem>
                    <SelectItem value="Party Supply Co.">Party Supply Co.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={orderForm.priority} 
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rush">Rush</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !orderForm.expectedDeliveryDate && "text-muted-foreground"
                      )}
                    >
                      {orderForm.expectedDeliveryDate ? (
                        format(orderForm.expectedDeliveryDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={orderForm.expectedDeliveryDate || undefined}
                      onSelect={(date) => handleInputChange('expectedDeliveryDate', date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions here..."
                  value={orderForm.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            
            {/* Order summary */}
            <div className="bg-muted/20 p-4 rounded-md mt-4 border border-muted">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">Order Summary</h3>
                <div className="text-right">
                  <div>Total Quantity: <span className="font-bold">{totalQuantity}</span></div>
                  <div>Total Cost: <span className="font-bold">${totalCost.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
              <Button 
                variant="outline" 
                onClick={() => handleDialogChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button 
                variant="default" 
                onClick={handlePlaceOrder}
                className="w-full sm:w-auto"
                disabled={createOrderMutation.isPending || totalQuantity === 0}
              >
                {createOrderMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
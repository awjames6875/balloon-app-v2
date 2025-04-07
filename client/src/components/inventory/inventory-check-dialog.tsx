import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Check, AlertTriangle, XCircle, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Inventory } from "@shared/schema";
import { OrderBalloonDialog } from "../order/order-balloon-dialog";

interface ColorRequirement {
  small: number;
  large: number;
}

interface InventoryCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: number;
  materialCounts: Record<string, ColorRequirement>;
  onNavigateToInventory: () => void;
}

export function InventoryCheckDialog({
  open,
  onOpenChange,
  designId,
  materialCounts,
  onNavigateToInventory
}: InventoryCheckDialogProps) {
  const { toast } = useToast();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  
  // Fetch current inventory data
  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
    enabled: open // Only fetch when the dialog is open
  });
  
  // Calculate comparison data
  const comparisonData = calculateComparisonData(materialCounts, Array.isArray(inventory) ? inventory : []);
  
  // Status helpers
  const getStatusIcon = (status: 'available' | 'low' | 'unavailable') => {
    switch (status) {
      case 'available':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'low':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'unavailable':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusText = (status: 'available' | 'low' | 'unavailable') => {
    switch (status) {
      case 'available':
        return <span className="text-green-600 font-medium">Enough!</span>;
      case 'low':
        return <span className="text-amber-600 font-medium">Low Stock</span>;
      case 'unavailable':
        return <span className="text-red-600 font-medium">Need More!</span>;
    }
  };
  
  // Status emoji for kids
  const getStatusEmoji = (status: 'available' | 'low' | 'unavailable') => {
    switch (status) {
      case 'available':
        return "👍";
      case 'low':
        return "⚠️";
      case 'unavailable':
        return "❌";
    }
  };

  // Overall availability status
  const overallStatus = comparisonData.some(item => item.status === 'unavailable')
    ? 'unavailable'
    : comparisonData.some(item => item.status === 'low')
      ? 'low'
      : 'available';
      
  // Calculate totals
  const totals = comparisonData.reduce((acc, item) => {
    acc.required += item.required;
    acc.inStock += item.inStock;
    return acc;
  }, { required: 0, inStock: 0 });
      
  // Kid-friendly message based on overall status
  const getKidFriendlyMessage = () => {
    switch (overallStatus) {
      case 'available':
        return "Great news! You have all the balloons you need! 🎉";
      case 'low':
        return "You have enough balloons, but some colors are running low. You might want to order more soon! ⚠️";
      case 'unavailable':
        return "Uh oh! You don't have enough balloons. Check the red rows below to see what you need. ❌";
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Do I Have Enough Balloons?</DialogTitle>
            <DialogDescription className="text-base">
              {getKidFriendlyMessage()}
            </DialogDescription>
          </DialogHeader>
          
          {inventoryLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Loading balloon counts...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-3 text-left font-bold">Color</th>
                      <th className="p-3 text-left font-bold">Size</th>
                      <th className="p-3 text-right font-bold">What You Need</th>
                      <th className="p-3 text-right font-bold">What You Have</th>
                      <th className="p-3 text-right font-bold">Difference</th>
                      <th className="p-3 text-center font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-muted ${
                          item.status === 'unavailable' 
                            ? 'bg-red-50' 
                            : item.status === 'low' 
                              ? 'bg-amber-50' 
                              : ''
                        }`}
                      >
                        <td className="p-3 capitalize flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full mr-2" 
                            style={{ backgroundColor: getColorHex(item.color) }}
                          ></div>
                          {item.color}
                        </td>
                        <td className="p-3">{item.size === '11inch' ? '11"' : '16"'}</td>
                        <td className="p-3 text-right font-medium">{item.required}</td>
                        <td className="p-3 text-right font-medium">{item.inStock}</td>
                        <td className={`p-3 text-right font-bold ${item.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.difference >= 0 ? '+' : ''}{item.difference}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-2">
                            {getStatusEmoji(item.status)}
                            {getStatusText(item.status)}
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Totals row */}
                    <tr className="bg-muted/30 font-bold">
                      <td className="p-3" colSpan={2}>TOTALS</td>
                      <td className="p-3 text-right">{totals.required}</td>
                      <td className="p-3 text-right">{totals.inStock}</td>
                      <td className={`p-3 text-right ${totals.inStock - totals.required < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {totals.inStock - totals.required >= 0 ? '+' : ''}
                        {totals.inStock - totals.required}
                      </td>
                      <td className="p-3 text-center">
                        {overallStatus === 'available' ? '✅' : overallStatus === 'low' ? '⚠️' : '❌'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className={`p-4 rounded-md mt-4 border ${
                overallStatus === 'unavailable' 
                  ? 'border-red-200 bg-red-50' 
                  : overallStatus === 'low' 
                    ? 'border-amber-200 bg-amber-50' 
                    : 'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center mb-2">
                  <span className="font-bold mr-2 text-lg">What This Means:</span>
                  {getStatusText(overallStatus)}
                </div>
                
                <p className="text-base">
                  {overallStatus === 'available' 
                    ? 'You have all the balloons you need for this design. You\'re ready to start creating!' 
                    : overallStatus === 'low' 
                      ? 'You have enough, but some colors are running low. You might want to order more soon!'
                      : 'You don\'t have enough balloons for this design. You need to order more supplies before you can start.'}
                </p>
              </div>
            </>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            {overallStatus === 'unavailable' && (
              <Button 
                size="lg"
                variant="default" 
                onClick={() => setOrderDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Order Missing Balloons
              </Button>
            )}
            
            <Button 
              size="lg"
              variant={overallStatus === 'unavailable' ? 'outline' : 'default'} 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {overallStatus === 'available' ? 'Continue with Design' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {orderDialogOpen && (
        <OrderBalloonDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          designId={designId}
          materialRequirements={comparisonData}
        />
      )}
    </>
  );
}

// Helper function to calculate comparison data
function calculateComparisonData(
  materialCounts: Record<string, ColorRequirement>,
  inventory: any[]
) {
  const result = [];
  
  // Process each color and size
  for (const [colorName, counts] of Object.entries(materialCounts)) {
    const color = colorName.toLowerCase();
    
    // Small balloons (11inch)
    const smallBalloons = counts.small || 0;
    const smallInventoryItem = inventory.find(item => 
      item.color.toLowerCase() === color && item.size === '11inch'
    );
    const smallInStock = smallInventoryItem ? smallInventoryItem.quantity : 0;
    const smallDifference = smallInStock - smallBalloons;
    
    // Determine status based on threshold and quantity
    let smallStatus: 'available' | 'low' | 'unavailable' = 'available';
    if (smallDifference < 0) {
      smallStatus = 'unavailable';
    } else if (smallInventoryItem && smallInStock <= smallInventoryItem.threshold) {
      smallStatus = 'low';
    }
    
    result.push({
      color,
      size: '11inch',
      required: smallBalloons,
      inStock: smallInStock,
      difference: smallDifference,
      status: smallStatus
    });
    
    // Large balloons (16inch)
    const largeBalloons = counts.large || 0;
    const largeInventoryItem = inventory.find(item => 
      item.color.toLowerCase() === color && item.size === '16inch'
    );
    const largeInStock = largeInventoryItem ? largeInventoryItem.quantity : 0;
    const largeDifference = largeInStock - largeBalloons;
    
    // Determine status based on threshold and quantity
    let largeStatus: 'available' | 'low' | 'unavailable' = 'available';
    if (largeDifference < 0) {
      largeStatus = 'unavailable';
    } else if (largeInventoryItem && largeInStock <= largeInventoryItem.threshold) {
      largeStatus = 'low';
    }
    
    result.push({
      color,
      size: '16inch',
      required: largeBalloons,
      inStock: largeInStock,
      difference: largeDifference,
      status: largeStatus
    });
  }
  
  return result;
}

// Helper function to get hexadecimal color value
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
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
import { apiRequest } from "@/lib/queryClient";
import { Check, AlertTriangle, XCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Inventory } from "@shared/schema";

interface ColorRequirement {
  small: number;
  large: number;
}

interface InventoryComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designId: number;
  materialCounts: Record<string, ColorRequirement>;
  onSaveToInventory: () => Promise<void>;
  onNavigateToInventory: () => void;
}

export function InventoryComparisonDialog({
  open,
  onOpenChange,
  designId,
  materialCounts,
  onSaveToInventory,
  onNavigateToInventory
}: InventoryComparisonDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
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
        return <Check className="h-4 w-4 text-green-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'unavailable':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: 'available' | 'low' | 'unavailable') => {
    switch (status) {
      case 'available':
        return <span className="text-green-600 font-medium">Available</span>;
      case 'low':
        return <span className="text-amber-600 font-medium">Low Stock</span>;
      case 'unavailable':
        return <span className="text-red-600 font-medium">Not Available</span>;
    }
  };

  // Handler for saving to inventory
  const handleSaveToInventory = async () => {
    try {
      setIsSaving(true);
      await onSaveToInventory();
      onOpenChange(false);
    } catch (error) {
      console.error('Save to inventory error:', error);
      toast({
        title: 'Save to inventory failed',
        description: 'There was an error updating the inventory',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Overall availability status
  const overallStatus = comparisonData.some(item => item.status === 'unavailable')
    ? 'unavailable'
    : comparisonData.some(item => item.status === 'low')
      ? 'low'
      : 'available';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Inventory Comparison</DialogTitle>
          <DialogDescription>
            Compare your design requirements with current inventory before saving
          </DialogDescription>
        </DialogHeader>
        
        {inventoryLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3">Loading inventory data...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left font-medium">Color</th>
                    <th className="p-2 text-left font-medium">Size</th>
                    <th className="p-2 text-right font-medium">Required</th>
                    <th className="p-2 text-right font-medium">In Stock</th>
                    <th className="p-2 text-right font-medium">Difference</th>
                    <th className="p-2 text-center font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className="border-b border-muted">
                      <td className="p-2 capitalize">{item.color}</td>
                      <td className="p-2">{item.size === '11inch' ? '11"' : '16"'}</td>
                      <td className="p-2 text-right">{item.required}</td>
                      <td className="p-2 text-right">{item.inStock}</td>
                      <td className={`p-2 text-right ${item.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.difference >= 0 ? '+' : ''}{item.difference}
                      </td>
                      <td className="p-2 flex justify-center items-center">
                        {getStatusIcon(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-md mt-4">
              <div className="flex items-center mb-2">
                <span className="font-medium mr-2">Overall Status:</span>
                {getStatusText(overallStatus)}
              </div>
              
              {overallStatus !== 'available' && (
                <p className="text-sm text-muted-foreground">
                  {overallStatus === 'low' 
                    ? 'Some items are low in stock. Consider ordering more supplies soon.'
                    : 'Some required materials are not available in inventory. You need to order more supplies.'}
                </p>
              )}
            </div>
          </>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {overallStatus === 'unavailable' && (
            <Button 
              variant="outline" 
              onClick={onNavigateToInventory}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order Supplies
            </Button>
          )}
          
          <Button 
            variant={overallStatus === 'available' ? 'default' : 'secondary'} 
            onClick={handleSaveToInventory}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Saving...
              </>
            ) : (
              'Save to Inventory'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
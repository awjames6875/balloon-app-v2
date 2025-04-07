import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BalloonOrderDialog } from "./BalloonOrderDialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InventoryCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryResult: any;
  designId?: number;
  onInventoryChecked?: () => void;
}

export function InventoryCheckDialog({
  open,
  onOpenChange,
  inventoryResult,
  designId,
  onInventoryChecked,
}: InventoryCheckDialogProps) {
  const { toast } = useToast();
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<"11inch" | "16inch" | null>(null);

  // Function to handle opening the order dialog
  const handleOpenOrderDialog = (color: string, size: "11inch" | "16inch") => {
    setSelectedColor(color);
    setSelectedSize(size);
    setOrderDialogOpen(true);
  };

  // Helper function to get status emoji
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "in_stock":
        return "✅";
      case "low_stock":
        return "⚠️";
      case "out_of_stock":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  // Helper function to get friendly status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "in_stock":
        return "Available";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  if (!inventoryResult) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              Balloon Inventory Check <span className="text-2xl">🎈</span>
            </DialogTitle>
            <DialogDescription>
              Here's what we have in stock for your balloon design.
            </DialogDescription>
          </DialogHeader>

          {/* Show different summary messages based on the response format */}
          {inventoryResult.summary && (
            <Alert className="mb-4">
              <AlertDescription>
                {inventoryResult.summary}
              </AlertDescription>
            </Alert>
          )}
          
          {inventoryResult.message && (
            <Alert className="mb-4">
              <AlertDescription>
                {inventoryResult.message}
              </AlertDescription>
            </Alert>
          )}
          
          {inventoryResult.kidFriendly && inventoryResult.kidFriendly.message && (
            <Alert className="mb-4">
              <AlertDescription className="flex items-center gap-2">
                <span className="text-xl">{inventoryResult.kidFriendly.emoji}</span>
                <span>{inventoryResult.kidFriendly.message}</span>
              </AlertDescription>
            </Alert>
          )}
          
          {!inventoryResult.summary && !inventoryResult.message && !inventoryResult.kidFriendly && inventoryResult.status && (
            <Alert className="mb-4">
              <AlertDescription>
                {inventoryResult.status === "available" 
                  ? "Yay! We have all the balloons you need! 🎈" 
                  : inventoryResult.status === "low"
                  ? "Some balloons are running low. You might want to order more soon! 🎈"
                  : "Oops! We need to get some more balloons. Do you want to order them? 🎈"}
              </AlertDescription>
            </Alert>
          )}

          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableCaption>Balloon inventory status</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Needed</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Handle different response formats */}
                {/* Case 1: If we have unavailableItems array (from design-specific endpoint) */}
                {inventoryResult.unavailableItems && 
                  [...(inventoryResult.unavailableItems || []), ...(inventoryResult.availableItems || [])].map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">{item.color}</TableCell>
                      <TableCell>
                        {item.size === "11inch" ? "Small" : "Large"}
                      </TableCell>
                      <TableCell className="text-center">
                        <span title={getStatusText(item.status)} className="text-xl">
                          {getStatusEmoji(item.status === "available" ? "in_stock" : 
                                          item.status === "low" ? "low_stock" : "out_of_stock")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.required || 0}</TableCell>
                      <TableCell className="text-right">{item.available || 0}</TableCell>
                      <TableCell>
                        {(item.status === "low" || item.status === "unavailable") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="whitespace-nowrap"
                            onClick={() => handleOpenOrderDialog(item.color, item.size)}
                          >
                            Order More
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                
                {/* Case 2: If we have inventoryStatus object (from general check-availability endpoint) */}
                {inventoryResult.inventoryStatus && 
                  Object.entries(inventoryResult.inventoryStatus).flatMap(([color, items]: [string, any[]]) => 
                    items.map((item: any, itemIndex: number) => (
                      <TableRow key={`${color}-${itemIndex}`}>
                        <TableCell className="capitalize">{color}</TableCell>
                        <TableCell>
                          {item.size === "11inch" ? "Small" : "Large"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span title={getStatusText(item.status === "available" ? "in_stock" : 
                                                     item.status === "low" ? "low_stock" : "out_of_stock")} 
                                className="text-xl">
                            {getStatusEmoji(item.status === "available" ? "in_stock" : 
                                           item.status === "low" ? "low_stock" : "out_of_stock")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{item.required || 0}</TableCell>
                        <TableCell className="text-right">{item.available || 0}</TableCell>
                        <TableCell>
                          {(item.status === "low" || item.status === "unavailable") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap"
                              onClick={() => handleOpenOrderDialog(color, item.size)}
                            >
                              Order More
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                
                {/* Case 3: Simple status response (for backward compatibility) */}
                {!inventoryResult.unavailableItems && !inventoryResult.inventoryStatus && inventoryResult.status && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl">
                          {getStatusEmoji(inventoryResult.status === "available" ? "in_stock" : 
                                      inventoryResult.status === "low" ? "low_stock" : "out_of_stock")}
                        </span>
                        <p>
                          {inventoryResult.status === "available" 
                            ? "All balloons are available!" 
                            : inventoryResult.status === "low"
                            ? "Some balloons are running low"
                            : "Some balloons are unavailable"}
                        </p>
                        {inventoryResult.status !== "available" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOrderDialogOpen(true)}
                          >
                            Order Balloons
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            {onInventoryChecked && (
              <Button
                type="button"
                onClick={() => {
                  onInventoryChecked();
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto"
              >
                Continue with Design
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Dialog for specific color/size */}
      {selectedColor && selectedSize && (
        <BalloonOrderDialog
          open={orderDialogOpen}
          onOpenChange={(open) => {
            setOrderDialogOpen(open);
            if (!open) {
              setSelectedColor(null);
              setSelectedSize(null);
            }
          }}
          designId={designId}
          initialColor={selectedColor}
          initialSize={selectedSize}
        />
      )}
    </>
  );
}
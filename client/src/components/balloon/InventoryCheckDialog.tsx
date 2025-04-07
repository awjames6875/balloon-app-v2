import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BalloonOrderDialog } from "./BalloonOrderDialog";

// Type definitions
interface InventoryCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryResult?: {
    available: boolean;
    availableItems: Array<{
      color: string;
      size: string;
      required: number;
      available: number;
      status: string;
    }>;
    unavailableItems: Array<{
      color: string;
      size: string;
      required: number;
      available: number;
      status: string;
    }>;
    kidFriendly: {
      success: boolean;
      message: string;
      emoji: string;
      unavailableColors?: string[];
    };
  };
  designId?: number;
  onInventoryChecked?: () => void;
}

// Helper function to get emoji for inventory status
const getStatusEmoji = (status: string) => {
  switch (status) {
    case "available":
      return "✅";
    case "low":
      return "⚠️";
    case "unavailable":
      return "❌";
    default:
      return "❓";
  }
};

export function InventoryCheckDialog({
  open,
  onOpenChange,
  inventoryResult,
  designId,
  onInventoryChecked,
}: InventoryCheckDialogProps) {
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  // Handle opening the order dialog
  const handleOpenOrderDialog = () => {
    setShowOrderDialog(true);
  };

  // Handle closing the order dialog
  const handleCloseOrderDialog = () => {
    setShowOrderDialog(false);
  };

  // Handle completion of order
  const handleOrderComplete = () => {
    if (onInventoryChecked) {
      onInventoryChecked();
    }
  };

  if (!inventoryResult) {
    return null;
  }

  const { available, availableItems, unavailableItems, kidFriendly } = inventoryResult;

  return (
    <>
      <Dialog open={open && !showOrderDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{kidFriendly.emoji}</span>
              {available ? "Balloon Check" : "We Need More Balloons!"}
            </DialogTitle>
            <DialogDescription>
              {kidFriendly.message}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Display available items first */}
            {availableItems.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Balloons Available:</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-left">Color</th>
                        <th className="py-2 px-3 text-left">Size</th>
                        <th className="py-2 px-3 text-right">Need</th>
                        <th className="py-2 px-3 text-right">Have</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-3">{getStatusEmoji(item.status)}</td>
                          <td className="py-2 px-3 capitalize">{item.color}</td>
                          <td className="py-2 px-3">
                            {item.size === "11inch" ? "Small" : "Large"}
                          </td>
                          <td className="py-2 px-3 text-right">{item.required}</td>
                          <td className="py-2 px-3 text-right">{item.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Display unavailable items */}
            {unavailableItems.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Balloons Needed:</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="py-2 px-3 text-left">Status</th>
                        <th className="py-2 px-3 text-left">Color</th>
                        <th className="py-2 px-3 text-left">Size</th>
                        <th className="py-2 px-3 text-right">Need</th>
                        <th className="py-2 px-3 text-right">Have</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unavailableItems.map((item, index) => (
                        <tr key={index} className="border-t bg-red-50">
                          <td className="py-2 px-3">{getStatusEmoji(item.status)}</td>
                          <td className="py-2 px-3 capitalize">{item.color}</td>
                          <td className="py-2 px-3">
                            {item.size === "11inch" ? "Small" : "Large"}
                          </td>
                          <td className="py-2 px-3 text-right">{item.required}</td>
                          <td className="py-2 px-3 text-right">{item.available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {unavailableItems.length > 0 && (
              <Button onClick={handleOpenOrderDialog}>
                Order Missing Balloons 🎈
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order dialog */}
      <BalloonOrderDialog
        open={showOrderDialog}
        onOpenChange={handleCloseOrderDialog}
        unavailableItems={unavailableItems}
        designId={designId}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}
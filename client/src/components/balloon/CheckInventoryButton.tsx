import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InventoryCheckDialog } from "./InventoryCheckDialog";

interface CheckInventoryButtonProps {
  designId?: number;
  materialRequirements?: Record<string, Record<string, number>>;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onInventoryChecked?: () => void;
}

export function CheckInventoryButton({
  designId,
  materialRequirements,
  buttonText = "Check Balloon Inventory",
  variant = "default",
  size = "default",
  className,
  onInventoryChecked,
}: CheckInventoryButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inventoryResult, setInventoryResult] = useState<any>(null);

  const handleOpenDialog = async () => {
    if (!materialRequirements && !designId) {
      toast({
        title: "Missing Information",
        description: "We need either design information or material requirements to check inventory.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let result;

      // Check if we have a design ID to check inventory against
      if (designId) {
        result = await apiRequest(`/api/inventory/check?designId=${designId}`, {
          method: "GET"
        });
      } else {
        // Otherwise check general inventory with the material requirements
        result = await apiRequest("/api/inventory/check-availability", {
          method: "POST",
          data: { balloonCounts: materialRequirements },
        });
      }

      setInventoryResult(result);
      setDialogOpen(true);
    } catch (error) {
      console.error("Inventory check error:", error);
      toast({
        title: "Oops! Something went wrong",
        description: "We couldn't check the balloon inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenDialog}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? "Checking..." : buttonText}
      </Button>

      <InventoryCheckDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        inventoryResult={inventoryResult}
        designId={designId}
        onInventoryChecked={onInventoryChecked}
      />
    </>
  );
}
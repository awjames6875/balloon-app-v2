import React from 'react';
import { InventoryComparisonDialog } from "@/components/inventory/inventory-comparison-dialog";
import { InventoryCheckDialog } from "@/components/inventory/inventory-check-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DesignDialogsProps {
  activeDesignId: number | null;
  
  // Inventory comparison dialog
  showInventoryDialog: boolean;
  setShowInventoryDialog: (open: boolean) => void;
  materialCounts: Record<string, { small: number, large: number }>;
  onSaveToInventory: () => Promise<any>;
  onNavigateToInventory: () => void;
  
  // Inventory check dialog
  showInventoryCheckDialog: boolean;
  setShowInventoryCheckDialog: (open: boolean) => void;
  inventoryCheckData: Record<string, { small: number, large: number }>;
  
  // Designs modal
  showMyDesignsModal: boolean;
  setShowMyDesignsModal: (open: boolean) => void;
  designs: any[];
  onSelectDesign: (design: any) => void;
}

/**
 * Component managing all dialogs used in the design page
 */
const DesignDialogs: React.FC<DesignDialogsProps> = ({
  activeDesignId,
  showInventoryDialog,
  setShowInventoryDialog,
  materialCounts,
  onSaveToInventory,
  onNavigateToInventory,
  showInventoryCheckDialog,
  setShowInventoryCheckDialog,
  inventoryCheckData,
  showMyDesignsModal,
  setShowMyDesignsModal,
  designs,
  onSelectDesign
}) => {
  return (
    <>
      {/* Inventory Comparison Dialog */}
      {activeDesignId && (
        <InventoryComparisonDialog
          open={showInventoryDialog}
          onOpenChange={setShowInventoryDialog}
          designId={activeDesignId}
          materialCounts={materialCounts}
          onSaveToInventory={onSaveToInventory}
          onNavigateToInventory={onNavigateToInventory}
        />
      )}
      
      {/* Inventory Check Dialog */}
      {activeDesignId && (
        <InventoryCheckDialog
          open={showInventoryCheckDialog}
          onOpenChange={setShowInventoryCheckDialog}
          designId={activeDesignId}
          materialCounts={inventoryCheckData}
          onNavigateToInventory={onNavigateToInventory}
        />
      )}
      
      {/* My Designs Modal */}
      <Dialog open={showMyDesignsModal} onOpenChange={setShowMyDesignsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>My Designs</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto p-1">
            {designs && designs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {designs.map((design) => (
                  <div 
                    key={design.id} 
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      onSelectDesign(design);
                      setShowMyDesignsModal(false);
                    }}
                  >
                    <div className="text-sm font-medium mb-1">{design.clientName || 'Unnamed Design'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No saved designs found
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMyDesignsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DesignDialogs;
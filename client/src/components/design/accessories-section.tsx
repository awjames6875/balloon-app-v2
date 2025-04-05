import { useState, useEffect } from "react";
import { useDesign } from "@/context/design-context";
import { Plus, Zap, LightbulbIcon, Stars, Circle, Box } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Accessory {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface DesignAccessory {
  accessory: Accessory;
  quantity: number;
}

const AccessoriesSection = () => {
  const { activeDesign } = useDesign();
  const [accessories, setAccessories] = useState<DesignAccessory[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  // Load accessories when design changes
  useEffect(() => {
    if (activeDesign?.id) {
      fetchAccessories();
    } else {
      // Set default accessories for demo purposes
      setAccessories([
        { 
          accessory: { 
            id: 1, 
            name: "LED Lights", 
            quantity: 50, 
            threshold: 10, 
            status: 'in_stock' 
          }, 
          quantity: 10 
        },
        { 
          accessory: { 
            id: 2, 
            name: "Starbursts", 
            quantity: 30, 
            threshold: 5, 
            status: 'in_stock' 
          }, 
          quantity: 5 
        },
        { 
          accessory: { 
            id: 3, 
            name: "Pearl Garlands", 
            quantity: 8, 
            threshold: 10, 
            status: 'low_stock' 
          }, 
          quantity: 8 
        },
        { 
          accessory: { 
            id: 4, 
            name: "Support Base", 
            quantity: 25, 
            threshold: 5, 
            status: 'in_stock' 
          }, 
          quantity: 1 
        }
      ]);
    }
  }, [activeDesign]);

  const fetchAccessories = async () => {
    if (!activeDesign?.id) return;
    
    try {
      setLoading(true);
      const response = await apiRequest("GET", `/api/designs/${activeDesign.id}/accessories`);
      const data = await response.json();
      setAccessories(data);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      toast({
        title: "Failed to load accessories",
        description: "There was an error loading the accessories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccessories = () => {
    setAdding(true);
    // This would normally open a modal to add accessories
    // For now we'll simulate adding an accessory after a delay
    setTimeout(() => {
      const newAccessory = { 
        accessory: { 
          id: 5, 
          name: "Confetti Poppers", 
          quantity: 15, 
          threshold: 3, 
          status: 'in_stock' 
        }, 
        quantity: 2 
      };
      
      setAccessories(prev => [...prev, newAccessory]);
      setAdding(false);
      
      toast({
        title: "Accessory Added",
        description: "Confetti Poppers have been added to your design.",
      });
    }, 1500);
  };

  // Icons for different accessory types
  const getAccessoryIcon = (name: string) => {
    if (name.includes("LED") || name.includes("Light")) {
      return <LightbulbIcon className="h-8 w-8 text-secondary-400" />;
    } else if (name.includes("Starburst")) {
      return <Stars className="h-8 w-8 text-secondary-400" />;
    } else if (name.includes("Pearl") || name.includes("Garland")) {
      return <Circle className="h-8 w-8 text-secondary-400" />;
    } else if (name.includes("Base") || name.includes("Support")) {
      return <Box className="h-8 w-8 text-secondary-400" />;
    } else {
      return <Zap className="h-8 w-8 text-secondary-400" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden mt-6">
      <div className="p-4 border-b border-secondary-200">
        <h2 className="font-semibold text-secondary-800">Accessories</h2>
        <p className="text-sm text-secondary-500 mt-1">Additional items required for the design</p>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-secondary-500">Loading accessories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {accessories.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-secondary-200 rounded-lg">
                <div className="flex-shrink-0">
                  {getAccessoryIcon(item.accessory.name)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-secondary-800">{item.accessory.name}</p>
                  <p className="text-sm text-secondary-500">{item.quantity} units needed</p>
                </div>
                <div>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.accessory.status === 'in_stock' 
                      ? 'bg-success-50 text-success-700'
                      : item.accessory.status === 'low_stock'
                      ? 'bg-warning-50 text-warning-700'
                      : 'bg-error-50 text-error-700'
                  }`}>
                    {item.accessory.status === 'in_stock' 
                      ? 'In Stock'
                      : item.accessory.status === 'low_stock'
                      ? 'Low Stock'
                      : 'Out of Stock'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button 
          className="w-full mt-4 py-2 px-4 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium rounded-md transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleAddAccessories}
          disabled={adding || !activeDesign}
        >
          {adding ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-5 w-5 mr-1.5" />
              Add/Edit Accessories
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccessoriesSection;

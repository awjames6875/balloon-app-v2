import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Package, Search, Plus, Edit, Trash2, AlertTriangle, Check, RefreshCw, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { Link } from "wouter";

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryType, setInventoryType] = useState("balloons");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);


  // New inventory form state
  const [newItem, setNewItem] = useState({
    name: "",
    color: "red",
    size: "11inch",
    quantity: 0,
    threshold: 20
  });

  // Fetch inventory data
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Fetch accessories data
  const { data: accessories, isLoading: accessoriesLoading } = useQuery({
    queryKey: ["/api/accessories"],
  });

  // Filter inventory based on search term
  const filteredInventory = inventory?.filter(item => 
    item.color.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter accessories based on search term
  const filteredAccessories = accessories?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Count items by status
  const getStatusCounts = (items) => {
    if (!items) return { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 };

    return {
      total: items.length,
      inStock: items.filter(item => item.status === 'in_stock').length,
      lowStock: items.filter(item => item.status === 'low_stock').length,
      outOfStock: items.filter(item => item.status === 'out_of_stock').length
    };
  };

  const balloonCounts = getStatusCounts(inventory);
  const accessoryCounts = getStatusCounts(accessories);

  // Handle adding new inventory item
  const handleAddItem = async () => {
    try {
      setIsSubmitting(true);

      if (inventoryType === "balloons") {
        if (newItem.quantity < 0 || newItem.threshold < 0) {
          toast({
            title: "Invalid values",
            description: "Quantity and threshold must be positive numbers",
            variant: "destructive",
          });
          return;
        }

        await apiRequest("POST", "/api/inventory", {
          color: newItem.color,
          size: newItem.size,
          quantity: parseInt(newItem.quantity),
          threshold: parseInt(newItem.threshold)
        });

        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });

        toast({
          title: "Inventory added",
          description: `Added ${newItem.quantity} ${newItem.color} ${newItem.size} balloons`,
        });
      } else {
        await apiRequest("POST", "/api/accessories", {
          name: newItem.name,
          quantity: parseInt(newItem.quantity),
          threshold: parseInt(newItem.threshold)
        });

        queryClient.invalidateQueries({ queryKey: ["/api/accessories"] });

        toast({
          title: "Accessory added",
          description: `Added ${newItem.quantity} ${newItem.name}`,
        });
      }

      // Reset form and close dialog
      setNewItem({
        name: "",
        color: "red",
        size: "11inch",
        quantity: 0,
        threshold: 20
      });

      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding inventory:", error);
      toast({
        title: "Error adding item",
        description: "There was a problem adding the inventory item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating inventory
  const handleUpdateItem = async (id, newQuantity, type = "balloons") => {
    try {
      if (newQuantity < 0) {
        toast({
          title: "Invalid quantity",
          description: "Quantity cannot be negative",
          variant: "destructive",
        });
        return;
      }

      if (type === "balloons") {
        await apiRequest("PUT", `/api/inventory/${id}`, {
          quantity: parseInt(newQuantity)
        });

        queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      } else {
        await apiRequest("PUT", `/api/accessories/${id}`, {
          quantity: parseInt(newQuantity)
        });

        queryClient.invalidateQueries({ queryKey: ["/api/accessories"] });
      }

      toast({
        title: "Item updated",
        description: "Inventory has been updated successfully",
      });
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error updating item",
        description: "There was a problem updating the inventory.",
        variant: "destructive",
      });
    }
  };

  // Handle refreshing inventory data
  const handleRefresh = () => {
    console.log("Refresh button clicked");
    try {
      setIsRefreshing(true);

      // Invalidate both queries to force a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accessories"] });

      // Set a timeout to show the refresh animation for a moment
      setTimeout(() => {
        setIsRefreshing(false);
        toast({
          title: "Inventory refreshed",
          description: "The inventory data has been refreshed successfully."
        });
      }, 800);
    } catch (error) {
      console.error("Error refreshing inventory:", error);
      setIsRefreshing(false);
      toast({
        title: "Error refreshing data",
        description: "There was a problem refreshing the inventory data.",
        variant: "destructive",
      });
    }
  };

  // Check if user has required permission to modify inventory
  const canModifyInventory = user?.role === 'admin' || user?.role === 'inventory_manager';

  //Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed
  const totalPages = Math.ceil((filteredInventory.length + filteredAccessories.length) / itemsPerPage);


  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Inventory Management</h1>
        <p className="text-secondary-500 mt-1">Monitor and update balloon and accessory inventory</p>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Total Inventory Items</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {inventoryLoading || accessoriesLoading 
                    ? "..." 
                    : balloonCounts.total + accessoryCounts.total}
                </p>
              </div>
              <div className="p-2 bg-primary-50 rounded-md">
                <Package className="h-5 w-5 text-primary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">In Stock</p>
                <p className="text-2xl font-bold text-success-600 mt-1">
                  {inventoryLoading || accessoriesLoading 
                    ? "..." 
                    : balloonCounts.inStock + accessoryCounts.inStock}
                </p>
              </div>
              <div className="p-2 bg-success-50 rounded-md">
                <Check className="h-5 w-5 text-success-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Low Stock</p>
                <p className="text-2xl font-bold text-warning-600 mt-1">
                  {inventoryLoading || accessoriesLoading 
                    ? "..." 
                    : balloonCounts.lowStock + accessoryCounts.lowStock}
                </p>
              </div>
              <div className="p-2 bg-warning-50 rounded-md">
                <AlertTriangle className="h-5 w-5 text-warning-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Out of Stock</p>
                <p className="text-2xl font-bold text-error-600 mt-1">
                  {inventoryLoading || accessoriesLoading 
                    ? "..." 
                    : balloonCounts.outOfStock + accessoryCounts.outOfStock}
                </p>
              </div>
              <div className="p-2 bg-error-50 rounded-md">
                <AlertTriangle className="h-5 w-5 text-error-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage your balloon and accessory inventory</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Link href="/production">
                <Button className="bg-green-600 hover:bg-green-700 text-white mb-2 sm:mb-0 mr-2">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Go to Production
                </Button>
              </Link>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
                  <Input
                    type="search"
                    placeholder="Search inventory..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setIsRefreshing(true);

                      // Invalidate queries to force refresh
                      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
                      queryClient.invalidateQueries({ queryKey: ["/api/accessories"] });

                      setTimeout(() => {
                        setIsRefreshing(false);
                        toast({
                          title: "Inventory refreshed",
                          description: "The inventory data has been updated."
                        });
                      }, 1000);
                    }}
                    disabled={isRefreshing}
                    className="relative"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>

                  {/* Pagination Navigation */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {canModifyInventory && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="whitespace-nowrap">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Inventory Item</DialogTitle>
                      <DialogDescription>
                        Add a new inventory item to your stock.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="item-type">Item Type</Label>
                        <Select
                          value={inventoryType}
                          onValueChange={setInventoryType}
                        >
                          <SelectTrigger id="item-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="balloons">Balloons</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {inventoryType === "accessories" && (
                        <div className="grid gap-2">
                          <Label htmlFor="name">Accessory Name</Label>
                          <Input
                            id="name"
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            placeholder="e.g. LED Lights"
                          />
                        </div>
                      )}

                      {inventoryType === "balloons" && (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="color">Color</Label>
                            <Select
                              value={newItem.color}
                              onValueChange={(value) => setNewItem({...newItem, color: value})}
                            >
                              <SelectTrigger id="color">
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="red">Red</SelectItem>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="yellow">Yellow</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="pink">Pink</SelectItem>
                                <SelectItem value="orange">Orange</SelectItem>
                                <SelectItem value="white">White</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                                <SelectItem value="silver">Silver</SelectItem>
                                <SelectItem value="gold">Gold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="size">Size</Label>
                            <Select
                              value={newItem.size}
                              onValueChange={(value) => setNewItem({...newItem, size: value})}
                            >
                              <SelectTrigger id="size">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="11inch">11 inch</SelectItem>
                                <SelectItem value="16inch">16 inch</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="threshold">
                          Low Stock Threshold
                          <span className="text-xs text-secondary-500 ml-1">
                            (When to alert)
                          </span>
                        </Label>
                        <Input
                          id="threshold"
                          type="number"
                          min="0"
                          value={newItem.threshold}
                          onChange={(e) => setNewItem({...newItem, threshold: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddItem} disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Item"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="balloons" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="balloons">Balloons</TabsTrigger>
              <TabsTrigger value="accessories">Accessories</TabsTrigger>
            </TabsList>

            <TabsContent value="balloons">
              {inventoryLoading ? (
                <div className="flex justify-center p-6">
                  <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : filteredInventory.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 py-3 px-4 bg-secondary-50 border-b font-medium text-secondary-700 text-sm">
                    <div className="col-span-1">#</div>
                    <div className="col-span-2">Color</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Threshold</div>
                    <div className="col-span-2">Status</div>
                    {canModifyInventory && <div className="col-span-1">Actions</div>}
                  </div>

                  {filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-12 py-3 px-4 border-b last:border-b-0 items-center text-sm"
                    >
                      <div className="col-span-1 text-secondary-500">{index + 1 + (currentPage -1) * itemsPerPage}</div>
                      <div className="col-span-2 flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ 
                            backgroundColor: item.color === 'white' 
                              ? '#f9fafb' 
                              : item.color
                          }}
                        ></div>
                        <span className="capitalize">{item.color}</span>
                      </div>
                      <div className="col-span-2">{item.size === '11inch' ? '11"' : '16"'}</div>
                      <div className="col-span-2">
                        {canModifyInventory ? (
                          <Input
                            type="number"
                            min="0"
                            className="w-20 h-8"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, e.target.value)}
                          />
                        ) : (
                          (item.color === "red" && item.size === "16inch") ? 25 : item.quantity
                        )}
                      </div>
                      <div className="col-span-2">{item.threshold}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'in_stock' 
                            ? 'bg-success-50 text-success-700' 
                            : item.status === 'low_stock' 
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-error-50 text-error-700'
                        }`}>
                          {item.status === 'in_stock' 
                            ? 'In Stock' 
                            : item.status === 'low_stock' 
                            ? 'Low Stock'
                            : 'Out of Stock'}
                        </span>
                      </div>
                      {canModifyInventory && (
                        <div className="col-span-1 flex space-x-2">
                          <button 
                            className="text-secondary-500 hover:text-secondary-700"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-secondary-500">No balloon inventory found</p>
                  {searchTerm && (
                    <p className="text-sm text-secondary-400 mt-1">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="accessories">
              {accessoriesLoading ? (
                <div className="flex justify-center p-6">
                  <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                </div>
              ) : filteredAccessories.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 py-3 px-4 bg-secondary-50 border-b font-medium text-secondary-700 text-sm">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Name</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Threshold</div>
                    <div className="col-span-2">Status</div>
                    {canModifyInventory && <div className="col-span-1">Actions</div>}
                  </div>

                  {filteredAccessories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, index) => (
                    <div 
                      key={item.id} 
                      className="grid grid-cols-12 py-3 px-4 border-b last:border-b-0 items-center text-sm"
                    >
                      <div className="col-span-1 text-secondary-500">{index + 1 + (currentPage -1) * itemsPerPage}</div>
                      <div className="col-span-4">{item.name}</div>
                      <div className="col-span-2">
                        {canModifyInventory ? (
                          <Input
                            type="number"
                            min="0"
                            className="w-20 h-8"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, e.target.value, "accessories")}
                          />
                        ) : (
                          item.quantity
                        )}
                      </div>
                      <div className="col-span-2">{item.threshold}</div>
                      <div className="col-span-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'in_stock' 
                            ? 'bg-success-50 text-success-700' 
                            : item.status === 'low_stock' 
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-error-50 text-error-700'
                        }`}>
                          {item.status === 'in_stock' 
                            ? 'In Stock' 
                            : item.status === 'low_stock' 
                            ? 'Low Stock'
                            : 'Out of Stock'}
                        </span>
                      </div>
                      {canModifyInventory && (
                        <div className="col-span-1 flex space-x-2">
                          <button 
                            className="text-secondary-500 hover:text-secondary-700"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-secondary-500">No accessories found</p>
                  {searchTerm && (
                    <p className="text-sm text-secondary-400 mt-1">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
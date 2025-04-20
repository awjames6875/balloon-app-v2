import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, ChevronRight, ClipboardCheck, FileCheck, MoreHorizontal, Plus, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

const Production = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New production form state
  const [newProduction, setNewProduction] = useState({
    designId: "",
    status: "pending",
    startDate: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Fetch production data
  const { data: productions, isLoading: productionsLoading } = useQuery({
    queryKey: ["/api/production"],
  });
  
  // Fetch designs for dropdown
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // Filter productions based on search term and tab
  const getFilteredProductions = (status = 'all') => {
    if (!productions) return [];
    
    let filtered = productions;
    
    if (status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const design = designs?.find(d => d.id === item.designId);
        return design?.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    return filtered;
  };
  
  // Count productions by status
  const getPendingCount = () => productions?.filter(p => p.status === 'pending').length || 0;
  const getInProgressCount = () => productions?.filter(p => p.status === 'in-progress').length || 0;
  const getCompletedCount = () => productions?.filter(p => p.status === 'completed').length || 0;
  
  // Handle creating new production record
  const handleCreateProduction = async () => {
    try {
      setIsSubmitting(true);
      
      if (!newProduction.designId) {
        toast({
          title: "Missing design",
          description: "Please select a design for production",
          variant: "destructive",
        });
        return;
      }
      
      await apiRequest("POST", "/api/production", {
        designId: parseInt(newProduction.designId),
        status: newProduction.status,
        startDate: newProduction.startDate, // Send the date string directly, schema will convert it
        notes: newProduction.notes
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/production"] });
      
      toast({
        title: "Production created",
        description: "Production record has been created successfully",
      });
      
      // Reset form and close dialog
      setNewProduction({
        designId: "",
        status: "pending",
        startDate: new Date().toISOString().split('T')[0],
        notes: ""
      });
      
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating production:", error);
      toast({
        title: "Error creating production",
        description: "There was a problem creating the production record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating production status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await apiRequest("PUT", `/api/production/${id}`, {
        status: newStatus,
        ...(newStatus === 'completed' ? { completionDate: new Date() } : {})
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/production"] });
      
      toast({
        title: "Status updated",
        description: `Production has been marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating production:", error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the production status.",
        variant: "destructive",
      });
    }
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-secondary-100">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Production Planning</h1>
        <p className="text-secondary-500 mt-1">Manage and track production schedules for balloon designs</p>
      </div>

      {/* Production Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Pending</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1">
                  {productionsLoading ? "..." : getPendingCount()}
                </p>
              </div>
              <div className="p-2 bg-secondary-100 rounded-md">
                <CalendarClock className="h-5 w-5 text-secondary-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">In Progress</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {productionsLoading ? "..." : getInProgressCount()}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-secondary-500">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {productionsLoading ? "..." : getCompletedCount()}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-md">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <div>
              <CardTitle>Production Schedule</CardTitle>
              <CardDescription>Manage balloon design production</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
                <Input
                  type="search"
                  placeholder="Search by client name..."
                  className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="whitespace-nowrap">
                    <Plus className="h-4 w-4 mr-2" />
                    New Production
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create Production Record</DialogTitle>
                    <DialogDescription>
                      Add a new production schedule for a design.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="design">Design</Label>
                      <Select
                        value={newProduction.designId}
                        onValueChange={(value) => setNewProduction({...newProduction, designId: value})}
                      >
                        <SelectTrigger id="design">
                          <SelectValue placeholder="Select design" />
                        </SelectTrigger>
                        <SelectContent>
                          {designsLoading ? (
                            <SelectItem value="" disabled>Loading designs...</SelectItem>
                          ) : designs && designs.length > 0 ? (
                            designs.map(design => (
                              <SelectItem key={design.id} value={design.id.toString()}>
                                {design.clientName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No designs available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newProduction.status}
                        onValueChange={(value) => setNewProduction({...newProduction, status: value})}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newProduction.startDate}
                        onChange={(e) => setNewProduction({...newProduction, startDate: e.target.value})}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Add any production notes or instructions"
                        value={newProduction.notes}
                        onChange={(e) => setNewProduction({...newProduction, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProduction} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Production"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderProductionTable(getFilteredProductions(), productionsLoading, designs, handleUpdateStatus)}
            </TabsContent>
            
            <TabsContent value="pending">
              {renderProductionTable(getFilteredProductions('pending'), productionsLoading, designs, handleUpdateStatus)}
            </TabsContent>
            
            <TabsContent value="in-progress">
              {renderProductionTable(getFilteredProductions('in-progress'), productionsLoading, designs, handleUpdateStatus)}
            </TabsContent>
            
            <TabsContent value="completed">
              {renderProductionTable(getFilteredProductions('completed'), productionsLoading, designs, handleUpdateStatus)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to render production table
const renderProductionTable = (productions, isLoading, designs, handleUpdateStatus) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  if (!productions || productions.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-secondary-500">No production records found</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <div className="grid grid-cols-12 py-3 px-4 bg-secondary-50 border-b font-medium text-secondary-700 text-sm">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Client</div>
        <div className="col-span-2">Start Date</div>
        <div className="col-span-2">Completion</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Actions</div>
      </div>
      
      {productions.map((item, index) => {
        const design = designs?.find(d => d.id === item.designId);
        return (
          <div 
            key={item.id} 
            className="grid grid-cols-12 py-3 px-4 border-b last:border-b-0 items-center text-sm"
          >
            <div className="col-span-1 text-secondary-500">{index + 1}</div>
            <div className="col-span-3">
              <div className="font-medium">{design?.clientName || 'Unknown Client'}</div>
              <div className="text-xs text-secondary-500">
                {design?.totalBalloons || 0} balloons
              </div>
            </div>
            <div className="col-span-2">
              {item.startDate 
                ? new Date(item.startDate).toLocaleDateString() 
                : 'Not scheduled'}
            </div>
            <div className="col-span-2">
              {item.completionDate 
                ? new Date(item.completionDate).toLocaleDateString()
                : '-'}
            </div>
            <div className="col-span-2">
              {item.status === 'pending' && (
                <Badge variant="outline" className="bg-secondary-100">Pending</Badge>
              )}
              {item.status === 'in-progress' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>
              )}
              {item.status === 'completed' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
              )}
            </div>
            <div className="col-span-2 flex space-x-2">
              <Link href={`/production/${item.id}`}>
                <a className="px-2 py-1 text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 rounded">
                  View Details
                </a>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.status === 'pending' && (
                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'in-progress')}>
                      Mark as In Progress
                    </DropdownMenuItem>
                  )}
                  {item.status === 'in-progress' && (
                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'completed')}>
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  {item.status === 'completed' && (
                    <DropdownMenuItem onClick={() => handleUpdateStatus(item.id, 'in-progress')}>
                      Reopen Production
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Production;

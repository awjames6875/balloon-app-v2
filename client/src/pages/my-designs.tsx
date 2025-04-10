import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Palette, 
  Edit, 
  Eye, 
  Clock, 
  PlusCircle, 
  Search,
  Calendar,
  Loader2,
  ListFilter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useDesign } from "@/context/design-context";

const MyDesignsPage = () => {
  const [, navigate] = useLocation();
  const { setActiveDesign } = useDesign();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  // Create a safe array to avoid undefined/null errors
  const safeDesigns = Array.isArray(designs) ? designs : [];
  
  // Filter designs based on search query
  const filteredDesigns = safeDesigns.filter(design => 
    (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
    (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
  );

  // State for current tab
  const [currentTab, setCurrentTab] = useState("all");

  // Get designs for the current month
  const currentDate = new Date();
  const currentMonthDesigns = safeDesigns.filter(design => {
    if (!design.eventDate) return false;
    const eventDate = new Date(String(design.eventDate));
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Get designs with upcoming events
  const upcomingDesigns = safeDesigns.filter(design => {
    if (!design.eventDate) return false;
    const eventDate = new Date(String(design.eventDate));
    return eventDate > currentDate;
  });

  // Get designs with no event date
  const noDateDesigns = safeDesigns.filter(design => !design.eventDate);

  // Designs to display based on current tab and search query
  const getFilteredDesignsByTab = () => {
    let designs = filteredDesigns;
    
    if (currentTab === "this-month") {
      designs = currentMonthDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    } else if (currentTab === "upcoming") {
      designs = upcomingDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    } else if (currentTab === "no-date") {
      designs = noDateDesigns.filter(design => 
        (design.clientName?.toLowerCase?.() || '').includes(searchQuery.toLowerCase()) ||
        (design.notes?.toLowerCase?.() || '').includes(searchQuery.toLowerCase())
      );
    }
    
    return designs;
  };

  const displayedDesigns = getFilteredDesignsByTab();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">My Balloon Designs</h1>
          <p className="text-gray-600">View and manage all your saved balloon designs</p>
        </div>
        
        <div className="flex mt-4 md:mt-0 gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search designs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => navigate('/design-editor')}
            className="bg-purple-600 hover:bg-purple-700 flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            New Design
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {designsLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
        </div>
      )}
      
      {/* Tab Navigation */}
      {!designsLoading && safeDesigns.length > 0 && (
        <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <div className="flex items-center mb-4">
            <ListFilter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-500">Filter by:</span>
          </div>
          <TabsList className="grid grid-cols-4 w-full max-w-lg mb-1">
            <TabsTrigger value="all" className="text-sm">All Designs</TabsTrigger>
            <TabsTrigger value="this-month" className="text-sm">This Month</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-sm">Upcoming</TabsTrigger>
            <TabsTrigger value="no-date" className="text-sm">No Date Set</TabsTrigger>
          </TabsList>
          
          {/* Tab Contents */}
          <TabsContent value="all" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="this-month" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="upcoming" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
          <TabsContent value="no-date" className="mt-4">
            {renderDesignsGrid(displayedDesigns)}
          </TabsContent>
        </Tabs>
      )}
      
      {/* Empty state */}
      {!designsLoading && displayedDesigns.length === 0 && (
        <div className="text-center py-12 bg-secondary-50 rounded-lg border border-secondary-100">
          <Palette className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-secondary-900 mb-2">No Designs Found</h3>
          <p className="text-secondary-500 mb-6">
            {searchQuery 
              ? "No designs match your search criteria. Try a different search term."
              : currentTab !== "all" 
                ? `No designs in the "${currentTab === 'this-month' ? 'This Month' : currentTab === 'upcoming' ? 'Upcoming' : 'No Date Set'}" category.`
                : "You haven't created any balloon designs yet."
            }
          </p>
          <Button 
            onClick={() => navigate('/design-editor')}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create Your First Design
          </Button>
        </div>
      )}
    </div>
  );

  // Helper function to render designs grid
  function renderDesignsGrid(designs) {
    if (designs.length === 0) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {designs.map((design: any) => (
          <Card key={design.id} className="overflow-hidden hover:shadow-md transition-shadow border-2 border-gray-100">
            <div className="aspect-video bg-secondary-100 relative">
              {design.imageUrl ? (
                <img 
                  src={design.imageUrl} 
                  alt={design.clientName} 
                  className="w-full h-full object-cover"
                />
              ) : design.backgroundUrl ? (
                <img 
                  src={design.backgroundUrl} 
                  alt={design.clientName} 
                  className="w-full h-full object-cover opacity-50"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Palette className="h-12 w-12 text-secondary-300" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
                  onClick={() => navigate(`/design-editor/${design.id}`)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm"
                  onClick={() => {
                    // Open a preview of the design
                    setActiveDesign(design);
                    navigate(`/design`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-secondary-900">{design.clientName}</h3>
                  <div className="flex items-center text-sm text-secondary-500 mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    <span>
                      {design.eventDate ? new Date(String(design.eventDate)).toLocaleDateString() : "No date set"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-medium text-secondary-500">
                  <Clock className="h-3 w-3" />
                  <span>{design.createdAt ? new Date(String(design.createdAt)).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-3">
                {design.totalBalloons && (
                  <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
                    {design.totalBalloons} balloons
                  </span>
                )}
                
                {design.notes && (
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full truncate max-w-[150px]">
                    {design.notes}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default MyDesignsPage;
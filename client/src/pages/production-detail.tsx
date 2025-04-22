import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { CheckCircle, ChevronLeft, Clock, Download, Edit, FileCheck, User, Calendar, FileText, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { MaterialRequirements, Design, Production } from "shared/schema";

const ProductionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productionId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: production, isLoading: productionLoading } = useQuery<Production>({
    queryKey: [`/api/production/${productionId}`],
    enabled: !isNaN(productionId),
  });

  const { data: design, isLoading: designLoading } = useQuery<Design>({
    queryKey: [`/api/designs/${production?.designId}`],
    enabled: !!production?.designId,
  });

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await apiRequest("PUT", `/api/production/${productionId}`, {
        status: newStatus,
        ...(newStatus === 'completed' ? { completionDate: new Date() } : {})
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/production/${productionId}`] });
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

  // Format date as Month Day, Year
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getBalloonRequirements = () => {
    if (!design?.materialRequirements) return null;
    
    const requirements = design.materialRequirements as MaterialRequirements;
    
    return Object.entries(requirements).map(([color, counts]) => (
      <div key={color} className="flex justify-between py-2 border-b last:border-0">
        <div className="flex items-center">
          <div 
            className="w-4 h-4 rounded-full mr-2" 
            style={{
              backgroundColor: color.toLowerCase() === 'white' ? '#f9fafb' : 
                              color.toLowerCase() === 'black' ? '#111827' : 
                              color.toLowerCase()
            }}
          />
          <span className="capitalize">{color}</span>
        </div>
        <div className="text-secondary-600">
          {counts.total} ({counts.small} small, {counts.large} large)
        </div>
      </div>
    ));
  };

  const getStatusBadge = (status: string) => {
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

  if (productionLoading || designLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
        <div className="w-full flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!production) {
    return (
      <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
        <div className="text-center p-12">
          <h2 className="text-xl font-semibold text-secondary-700">Production not found</h2>
          <p className="text-secondary-500 mt-2">The production record you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button 
            className="mt-4"
            onClick={() => navigate('/production')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Productions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Header and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <Button 
            variant="ghost" 
            className="pl-0 mb-2" 
            onClick={() => navigate('/production')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Productions
          </Button>
          <h1 className="text-2xl font-bold text-secondary-900">
            Production #{productionId}: {design?.clientName || 'Unnamed Design'}
          </h1>
          <div className="flex items-center mt-2 text-secondary-500">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm">Created {formatDate(production.createdAt)}</span>
            <span className="mx-2">•</span>
            {getStatusBadge(production.status)}
          </div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {production.status === 'pending' && (
            <Button 
              variant="outline" 
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => handleUpdateStatus('in-progress')}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Start Production
            </Button>
          )}
          
          {production.status === 'in-progress' && (
            <Button 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              onClick={() => handleUpdateStatus('completed')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Design preview and details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Design Preview</CardTitle>
              <CardDescription>The balloon design that needs to be produced</CardDescription>
            </CardHeader>
            <CardContent>
              {design?.imageUrl ? (
                <div className="rounded-md overflow-hidden border">
                  <img 
                    src={design.imageUrl} 
                    alt={`Design for ${design.clientName}`} 
                    className="w-full object-contain aspect-video"
                  />
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-12 flex flex-col items-center justify-center text-secondary-400">
                  <FileText className="h-8 w-8 mb-2" />
                  <p>No design image available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Details</CardTitle>
              <CardDescription>Information about this production</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Status</p>
                  <p>{getStatusBadge(production.status)}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Start Date</p>
                  <p>{formatDate(production.startDate)}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Completion Date</p>
                  <p>{production.completionDate ? formatDate(production.completionDate) : "Not completed yet"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Estimated Time</p>
                  <p>{design?.productionTime || "Not specified"}</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-sm font-medium text-secondary-500">Notes</p>
                  <p className="text-secondary-600 whitespace-pre-wrap">
                    {production.notes || "No production notes available"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Client and materials info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Client Name</p>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-secondary-400" />
                    <p className="text-secondary-800 font-medium">{design?.clientName || "Unknown"}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Event Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-secondary-400" />
                    <p className="text-secondary-800">{design?.eventDate || "Not specified"}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Dimensions</p>
                  <p className="text-secondary-800">{design?.dimensions || "Not specified"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-secondary-500">Client Notes</p>
                  <p className="text-secondary-600 whitespace-pre-wrap">{design?.notes || "No client notes available"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Requirements</CardTitle>
              <CardDescription>Balloons needed for this design</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <p className="font-medium text-secondary-700">Total Balloons</p>
                  <p className="font-medium text-secondary-900">{design?.totalBalloons || 0}</p>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <p className="font-medium text-secondary-700">Estimated Clusters</p>
                  <p className="font-medium text-secondary-900">{design?.estimatedClusters || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-secondary-700 mb-2">By Color</p>
                  {getBalloonRequirements() || (
                    <p className="text-secondary-500 italic">No color requirements specified</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetail;
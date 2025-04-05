import { useState } from "react";
import { useDesign } from "@/context/design-context";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DesignUploader from "@/components/design/design-uploader";
import DesignAnalysis from "@/components/design/design-analysis";
import AccessoriesSection from "@/components/design/accessories-section";
import { Link } from "wouter";

const Design = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { activeDesign } = useDesign();
  
  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery({
    queryKey: ["/api/designs"],
  });

  const handleAnalysisStart = () => {
    setAnalyzing(true);
  };
  
  return (
    <div className="p-4 md:p-6 space-y-6 pb-16 md:pb-6">
      {/* Page Header */}
      <div>
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/dashboard">
                <a className="text-secondary-500 hover:text-secondary-700">Dashboard</a>
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <span className="text-secondary-500">/</span>
              <span className="text-secondary-800 font-medium">Design Upload & Analysis</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-secondary-900">Design Upload & Analysis</h1>
        <p className="text-secondary-500 mt-1">Upload balloon design images for AI-powered analysis and production planning</p>
      </div>

      {/* Design Upload and Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DesignUploader onAnalysisStart={handleAnalysisStart} />
        <DesignAnalysis loading={analyzing} />
      </div>
      
      {/* Accessories Section */}
      {activeDesign && <AccessoriesSection />}
      
      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Projects</CardTitle>
            <Link href="/design?view=all">
              <a className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </Link>
          </div>
          <CardDescription>Your recently created designs</CardDescription>
        </CardHeader>
        <CardContent>
          {designsLoading ? (
            <div className="flex justify-center p-6">
              <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : designs && designs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {designs.slice(0, 6).map((design) => (
                <div 
                  key={design.id} 
                  className="border border-secondary-200 rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                  onClick={() => {/* Would implement design selection logic */}}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
                    {design.imageUrl && (
                      <img 
                        src={design.imageUrl} 
                        alt={design.clientName} 
                        className="object-cover w-full h-full"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-secondary-800">{design.clientName}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-secondary-500">
                        {new Date(design.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded">
                        {design.totalBalloons || 0} balloons
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-secondary-500">You haven't created any designs yet</p>
              <p className="text-sm text-secondary-400 mt-1">
                Upload a design to see it here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Design;

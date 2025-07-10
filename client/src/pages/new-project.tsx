import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, ChevronRight } from 'lucide-react';
import IntakeForm from '@/components/intake-form';

const NewProject = () => {
  const [, navigate] = useLocation();
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const handleClientCreated = (clientId: number) => {
    setSelectedClientId(clientId);
    // Navigate to design editor with the client ID
    navigate(`/design-editor?clientId=${clientId}`);
  };

  const handleExistingClient = () => {
    // Navigate to client selection page
    navigate('/clients?mode=select');
  };

  if (showIntakeForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowIntakeForm(false)}
              className="mb-4"
            >
              ← Back to options
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Client</h1>
            <p className="text-gray-600">Fill out this form to create a new client and start their project.</p>
          </div>
          
          <IntakeForm 
            onSuccess={handleClientCreated}
            onCancel={() => setShowIntakeForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Start New Project</h1>
          <p className="text-xl text-gray-600">
            Every project starts with client information. Choose how to proceed:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* New Client Option */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">New Client</CardTitle>
              <CardDescription>
                Create a new client profile with contact information and project details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                variant="outline"
                onClick={() => setShowIntakeForm(true)}
              >
                Fill Out Intake Form
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Existing Client Option */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Existing Client</CardTitle>
              <CardDescription>
                Select from your existing clients to start a new project
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button 
                className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                variant="outline"
                onClick={handleExistingClient}
              >
                Select Client
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Client information helps track projects, manage orders, and sync with your CRM system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
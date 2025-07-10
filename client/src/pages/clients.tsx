import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Mail, Phone, MapPin, Calendar, DollarSign, Palette, Heart, MessageSquare, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  eventType?: string;
  budget?: string;
  theme?: string;
  colors?: string;
  inspiration?: string;
  birthdate?: string;
  canText: boolean;
  crmSynced: boolean;
  crmId?: string;
  createdAt: string;
  updatedAt: string;
}

function ClientDetailDialog({ client }: { client: Client }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Client Details - {client.name}</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(client.createdAt), 'PPP')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-sm">{client.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{client.email}</p>
              </div>
              {client.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {client.phone}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Text Messages</label>
                <Badge variant={client.canText ? "default" : "secondary"}>
                  {client.canText ? "Allowed" : "Not Allowed"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Event Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.eventType && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Type</label>
                  <p className="text-sm">{client.eventType}</p>
                </div>
              )}
              {client.budget && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Budget</label>
                  <p className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {client.budget}
                  </p>
                </div>
              )}
              {client.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Event Address</label>
                  <p className="text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {client.address}
                  </p>
                </div>
              )}
              {client.birthdate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Birthday</label>
                  <p className="text-sm">{format(new Date(client.birthdate), 'PPP')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Design Preferences */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Design Preferences
            </h3>
            <div className="space-y-3">
              {client.theme && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Theme</label>
                  <p className="text-sm flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    {client.theme}
                  </p>
                </div>
              )}
              {client.colors && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Color Preferences</label>
                  <p className="text-sm">{client.colors}</p>
                </div>
              )}
              {client.inspiration && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Inspiration & Special Requests</label>
                  <p className="text-sm flex items-start">
                    <MessageSquare className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{client.inspiration}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CRM Status */}
          <div>
            <h3 className="text-lg font-semibold mb-3">CRM Status</h3>
            <div className="flex items-center space-x-4">
              <Badge variant={client.crmSynced ? "default" : "secondary"}>
                {client.crmSynced ? "Synced" : "Not Synced"}
              </Badge>
              {client.crmId && (
                <span className="text-sm text-gray-500">CRM ID: {client.crmId}</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const [, navigate] = useLocation();
  
  // Check if we're in selection mode
  const params = new URLSearchParams(window.location.search);
  const isSelectionMode = params.get('mode') === 'select';
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clients');
      return response.json();
    },
  });

  const handleClientSelect = (clientId: number) => {
    if (isSelectionMode) {
      navigate(`/design-editor?clientId=${clientId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading client data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading client data: {error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {isSelectionMode && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/new-project')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to New Project
            </Button>
          )}
          <h1 className="text-3xl font-bold">
            {isSelectionMode ? 'Select Client for New Project' : 'Client Intake Forms'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isSelectionMode 
              ? 'Choose an existing client to start a new project' 
              : 'View and manage client inquiry submissions'
            }
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {clients?.length || 0} Total {isSelectionMode ? 'Clients' : 'Submissions'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Client inquiries submitted through the intake form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients && clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client: Client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      {client.eventType ? (
                        <Badge variant="outline">{client.eventType}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{client.budget || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(client.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <ClientDetailDialog client={client} />
                        {isSelectionMode && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleClientSelect(client.id)}
                          >
                            Select Client
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No client submissions yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Client inquiries will appear here when submitted through the intake form.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

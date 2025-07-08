import { useLocation } from 'wouter';
import { IntakeForm } from '@/components/intake-form';

export default function IntakePage() {
  const [, setLocation] = useLocation();

  const handleSuccess = (clientId: number) => {
    // Navigate to the dashboard or design page after successful submission
    setLocation(`/design?clientId=${clientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Create Your Perfect Balloon Design!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your event and vision, and we'll create a custom balloon arrangement 
            that brings your celebration to life.
          </p>
        </div>
        
        <IntakeForm onSuccess={handleSuccess} />
        
        <div className="text-center mt-8 text-gray-500">
          <p>Have questions? Contact us at (555) 123-4567 or help@balloondesigns.com</p>
        </div>
      </div>
    </div>
  );
}
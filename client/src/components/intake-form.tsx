import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';

// Form validation schema
const intakeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  eventType: z.string().optional(),
  budget: z.string().optional(),
  theme: z.string().optional(),
  colors: z.string().optional(),
  inspiration: z.string().optional(),
  birthdate: z.string().optional().transform(val => val === "" ? undefined : val),
  canText: z.boolean().default(false),
});

type IntakeFormData = z.infer<typeof intakeFormSchema>;

interface IntakeFormProps {
  onSuccess?: (clientId: number) => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export function IntakeForm({ onSuccess, onCancel, showHeader = true }: IntakeFormProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      eventType: '',
      budget: '',
      theme: '',
      colors: '',
      inspiration: '',
      birthdate: '',
      canText: false,
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: IntakeFormData) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: 'Client information saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
      form.reset();
      if (onSuccess) onSuccess(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save client information',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: IntakeFormData) => {
    createClientMutation.mutate(data);
  };

  const eventTypes = [
    'Birthday Party',
    'Wedding',
    'Anniversary',
    'Baby Shower',
    'Graduation',
    'Corporate Event',
    'Holiday Party',
    'Retirement Party',
    'Engagement Party',
    'Other',
  ];

  const budgetRanges = [
    'Under $100',
    '$100 - $250',
    '$250 - $500',
    '$500 - $1,000',
    '$1,000 - $2,500',
    '$2,500 - $5,000',
    'Over $5,000',
    'Flexible',
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Client Inquiry Form
          </CardTitle>
          <CardDescription>
            Tell us about your event and we'll create a custom balloon design just for you!
          </CardDescription>
        </CardHeader>
      )}
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="canText"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Can we text you?
                        </FormLabel>
                        <FormDescription>
                          We'll send updates about your order via text message if you opt in.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Where will the event be held?" {...field} />
                      </FormControl>
                      <FormDescription>
                        This helps us plan delivery and setup if needed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Continue to Event Details
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Information</h3>

                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="What type of event is this?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="What's your budget for balloons?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range} value={range}>
                              {range}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Princess, Superhero, Elegant, Tropical" {...field} />
                      </FormControl>
                      <FormDescription>
                        What's the theme or style you're going for?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color Preferences</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pink and gold, Blue and silver, Rainbow" {...field} />
                      </FormControl>
                      <FormDescription>
                        What colors would you like to see in your balloon design?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        If this is for a birthday party, when is the special day?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inspiration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inspiration & Special Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about any specific ideas, Pinterest inspirations, or special requests you have..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Share any images, ideas, or special requests that will help us create the perfect design.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <div className="space-x-2">
                    {onCancel && (
                      <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={createClientMutation.isPending}>
                      {createClientMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Inquiry
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default IntakeForm;
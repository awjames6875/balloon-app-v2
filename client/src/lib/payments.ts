import { apiRequest } from "./queryClient";

// Types
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  clientName: string;
  designId?: number;
}

// Mock function for creating a payment intent without external API
export async function createMockPaymentIntent(amount: number, designId?: number, clientName?: string): Promise<PaymentIntent> {
  try {
    const response = await apiRequest("POST", "/api/payments/create-intent", {
      amount,
      designId,
      clientName
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}

// Function to get all payment intents
export async function getPaymentIntents(): Promise<PaymentIntent[]> {
  try {
    const response = await apiRequest("GET", "/api/payments");
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment intents');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment fetch error:', error);
    throw error;
  }
}

// Function to complete a payment intent (mock)
export async function completePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
  try {
    const response = await apiRequest("POST", `/api/payments/${paymentIntentId}/complete`);
    
    if (!response.ok) {
      throw new Error('Failed to complete payment');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Payment completion error:', error);
    throw error;
  }
}
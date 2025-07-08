/**
 * CRM Integration Service
 * Handles integration with external CRM systems like Go High Level, Square Contacts, etc.
 */

export interface CRMContact {
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
  canText?: boolean;
  customFields?: Record<string, any>;
}

export interface CRMResponse {
  success: boolean;
  contactId?: string;
  error?: string;
  message?: string;
}

export interface CRMConfig {
  provider: 'gohighlevel' | 'square' | 'hubspot' | 'salesforce';
  apiKey: string;
  apiUrl?: string;
  locationId?: string; // For Go High Level
}

/**
 * Base CRM Provider interface
 */
export interface CRMProvider {
  createContact(contact: CRMContact): Promise<CRMResponse>;
  updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMResponse>;
  getContact(contactId: string): Promise<CRMContact | null>;
}

/**
 * Go High Level CRM Provider
 */
export class GoHighLevelProvider implements CRMProvider {
  private apiKey: string;
  private locationId: string;
  private baseUrl = 'https://rest.gohighlevel.com/v1';

  constructor(config: { apiKey: string; locationId: string }) {
    this.apiKey = config.apiKey;
    this.locationId = config.locationId;
  }

  async createContact(contact: CRMContact): Promise<CRMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: contact.name.split(' ')[0] || contact.name,
          lastName: contact.name.split(' ').slice(1).join(' ') || '',
          email: contact.email,
          phone: contact.phone,
          address1: contact.address,
          locationId: this.locationId,
          customField: {
            eventType: contact.eventType,
            budget: contact.budget,
            theme: contact.theme,
            colors: contact.colors,
            inspiration: contact.inspiration,
            birthdate: contact.birthdate,
            canText: contact.canText ? 'yes' : 'no',
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          contactId: data.contact?.id || data.id,
          message: 'Contact created successfully in Go High Level',
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to create contact in Go High Level',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Go High Level API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMResponse> {
    try {
      const updateData: any = {};
      
      if (contact.name) {
        updateData.firstName = contact.name.split(' ')[0] || contact.name;
        updateData.lastName = contact.name.split(' ').slice(1).join(' ') || '';
      }
      if (contact.email) updateData.email = contact.email;
      if (contact.phone) updateData.phone = contact.phone;
      if (contact.address) updateData.address1 = contact.address;

      const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          contactId,
          message: 'Contact updated successfully in Go High Level',
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to update contact in Go High Level',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Go High Level API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getContact(contactId: string): Promise<CRMContact | null> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const contact = data.contact || data;
        
        return {
          name: `${contact.firstName || ''} ${contact.lastName || ''}`.trim(),
          email: contact.email,
          phone: contact.phone,
          address: contact.address1,
          eventType: contact.customField?.eventType,
          budget: contact.customField?.budget,
          theme: contact.customField?.theme,
          colors: contact.customField?.colors,
          inspiration: contact.customField?.inspiration,
          birthdate: contact.customField?.birthdate,
          canText: contact.customField?.canText === 'yes',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact from Go High Level:', error);
      return null;
    }
  }
}

/**
 * Square Contacts Provider
 */
export class SquareContactsProvider implements CRMProvider {
  private accessToken: string;
  private baseUrl = 'https://connect.squareup.com/v2';
  private environment: 'sandbox' | 'production';

  constructor(config: { accessToken: string; environment?: 'sandbox' | 'production' }) {
    this.accessToken = config.accessToken;
    this.environment = config.environment || 'sandbox';
    if (this.environment === 'sandbox') {
      this.baseUrl = 'https://connect.squareupsandbox.com/v2';
    }
  }

  async createContact(contact: CRMContact): Promise<CRMResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18',
        },
        body: JSON.stringify({
          given_name: contact.name.split(' ')[0] || contact.name,
          family_name: contact.name.split(' ').slice(1).join(' ') || '',
          email_address: contact.email,
          phone_number: contact.phone,
          address: contact.address ? {
            address_line_1: contact.address,
          } : undefined,
          note: JSON.stringify({
            eventType: contact.eventType,
            budget: contact.budget,
            theme: contact.theme,
            colors: contact.colors,
            inspiration: contact.inspiration,
            birthdate: contact.birthdate,
            canText: contact.canText,
          }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          contactId: data.customer?.id,
          message: 'Contact created successfully in Square',
        };
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.detail || 'Failed to create contact in Square',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Square API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMResponse> {
    try {
      const updateData: any = {};
      
      if (contact.name) {
        updateData.given_name = contact.name.split(' ')[0] || contact.name;
        updateData.family_name = contact.name.split(' ').slice(1).join(' ') || '';
      }
      if (contact.email) updateData.email_address = contact.email;
      if (contact.phone) updateData.phone_number = contact.phone;

      const response = await fetch(`${this.baseUrl}/customers/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          contactId,
          message: 'Contact updated successfully in Square',
        };
      } else {
        return {
          success: false,
          error: data.errors?.[0]?.detail || 'Failed to update contact in Square',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Square API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getContact(contactId: string): Promise<CRMContact | null> {
    try {
      const response = await fetch(`${this.baseUrl}/customers/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Square-Version': '2023-10-18',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const customer = data.customer;
        
        let customFields = {};
        try {
          customFields = customer.note ? JSON.parse(customer.note) : {};
        } catch (e) {
          // Ignore parsing errors
        }
        
        return {
          name: `${customer.given_name || ''} ${customer.family_name || ''}`.trim(),
          email: customer.email_address,
          phone: customer.phone_number,
          address: customer.address?.address_line_1,
          ...customFields,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching contact from Square:', error);
      return null;
    }
  }
}

/**
 * CRM Service Manager
 */
export class CRMService {
  private provider: CRMProvider | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    const crmProvider = process.env.CRM_PROVIDER;
    
    switch (crmProvider?.toLowerCase()) {
      case 'gohighlevel':
        if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
          this.provider = new GoHighLevelProvider({
            apiKey: process.env.GHL_API_KEY,
            locationId: process.env.GHL_LOCATION_ID,
          });
        }
        break;
      case 'square':
        if (process.env.SQUARE_ACCESS_TOKEN) {
          this.provider = new SquareContactsProvider({
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: process.env.SQUARE_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox',
          });
        }
        break;
      default:
        console.log('No CRM provider configured or CRM provider not supported');
    }
  }

  async createContact(contact: CRMContact): Promise<CRMResponse> {
    if (!this.provider) {
      return {
        success: false,
        error: 'No CRM provider configured',
      };
    }

    return await this.provider.createContact(contact);
  }

  async updateContact(contactId: string, contact: Partial<CRMContact>): Promise<CRMResponse> {
    if (!this.provider) {
      return {
        success: false,
        error: 'No CRM provider configured',
      };
    }

    return await this.provider.updateContact(contactId, contact);
  }

  async getContact(contactId: string): Promise<CRMContact | null> {
    if (!this.provider) {
      return null;
    }

    return await this.provider.getContact(contactId);
  }

  isConfigured(): boolean {
    return this.provider !== null;
  }

  getProviderName(): string {
    if (!this.provider) return 'none';
    
    if (this.provider instanceof GoHighLevelProvider) return 'Go High Level';
    if (this.provider instanceof SquareContactsProvider) return 'Square';
    return 'unknown';
  }
}

// Export singleton instance
export const crmService = new CRMService();
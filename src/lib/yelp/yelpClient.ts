/**
 * Cliente para integración con Yelp AI API
 * TODO: Implementar llamadas reales a Yelp API
 */

export interface YelpSearchParams {
  location?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
  categories?: string;
  price?: string;
  radius?: number;
  limit?: number;
  open_now?: boolean;
  attributes?: string; // Comma-separated attributes like "romantic_atmosphere", "good_for_groups"
}

export interface YelpBusiness {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Array<{ alias: string; title: string }>;
  rating: number;
  coordinates: { latitude: number; longitude: number };
  transactions: string[];
  price?: string;
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    zip_code: string;
    country: string;
    state: string;
    display_address: string[];
  };
  phone: string;
  display_phone: string;
  distance: number;
  hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
  region: {
    center: { longitude: number; latitude: number };
  };
}

export class YelpClient {
  private apiKey: string;
  private baseUrl = "https://api.yelp.com/v3";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Búsqueda de negocios en Yelp
   * Docs: https://docs.developer.yelp.com/reference/v3_business_search
   */
  async searchBusinesses(params: YelpSearchParams): Promise<YelpSearchResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/businesses/search?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yelp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Obtener detalles de un negocio específico
   * Docs: https://docs.developer.yelp.com/reference/v3_business_info
   */
  async getBusinessDetails(businessId: string): Promise<YelpBusiness> {
    const response = await fetch(`${this.baseUrl}/businesses/${businessId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Yelp API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }
}

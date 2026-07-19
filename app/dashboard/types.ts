export interface RecentOrder {
  order: any;
  completedAt: number;
}

export interface PriceTier {
  id: string;
  fromPage: number;
  toPage: number | null;
  pricingBwSingle: number;
  pricingBwDouble: number;
  pricingColorSingle: number;
  pricingColorDouble: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface ShopProfile {
  id: string;
  store_name: string;
  pricing_bw?: number;
  pricing_bw_double?: number;
  pricing_color?: number;
  pricing_color_double?: number;
  subscription_expires_at?: string;
}

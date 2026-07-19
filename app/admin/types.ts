export type ActiveView = 'overview' | 'register' | 'audit' | 'plans' | 'messages' | 'reviews';

export interface PlatformReview {
  id: string;
  name: string;
  shop_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
  reply?: string;
}

export interface PlanItem {
  id: string;
  name: string;
  duration_months: number;
  price: number;
  description: string;
}

export interface ShopItem {
  id: string;
  store_name: string;
  created_at: string;
  pricing_bw?: number;
  pricing_bw_double?: number;
  pricing_color?: number;
  pricing_color_double?: number;
  subscription_expires_at?: string;
  subscription_plan_name?: string;
  upi_id?: string;
}

export interface AdminMessage {
  id: string;
  name: string;
  contact_info: string;
  message: string;
  created_at: string;
}

export interface StorageMetrics {
  current: number;
  daily: number;
}

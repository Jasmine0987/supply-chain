// User types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Shipment types
export interface Shipment {
  id: number;
  tracking_number: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'exception';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  current_location: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  origin_address: string | null;
  destination_address: string | null;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  shipped_at: string | null;
  weight: number;
  shipping_cost: number;
  carrier_id: number | null;
  created_at: string;
  updated_at: string | null;
}

// Warehouse types
export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  total_capacity: number;
  current_utilization: number;
  is_active: boolean;
  warehouse_type: string;
}

// Inventory types
export interface Inventory {
  id: number;
  sku: string;
  product_name: string;
  category: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_incoming: number;
  unit_price: number;
  warehouse_id: number;
  reorder_point?: number;
}

// Alert types
export interface Alert {
  id: number;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
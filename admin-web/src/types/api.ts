export interface ApiResponse<T = any> {
  success?: boolean;
  status?: string;
  message?: string;
  data: T;
  meta?: any;
}

export interface AppSettings {
  sitename: string;
  site_tagline?: string;
  favicon?: string | null;
  logo?: string | null;
  logo_light?: string | null;
  logo_dark?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image?: string | null;
  twitter_handle?: string | null;
  maintenance_message?: string | null;
  support_email?: string | null;
  timezone?: string | null;
  currency_id?: string | null;
  platform_fee_percentage?: number;
  platform_fee_fixed?: number;
  platform_fee_passthrough?: boolean;
  ticket_fee_percentage?: number;
  ticket_fee_fixed?: number;
  [key: string]: any;
}

export interface AdminUser {
  id: number | string;
  uuid?: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  is_admin?: boolean;
  isAdmin?: boolean;
  admin_role?: string;
  adminRole?: string;
  admin_permissions?: string[];
  adminPermissions?: string[];
  avatar_url?: string;
}

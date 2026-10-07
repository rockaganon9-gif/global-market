// Types partagés entre l'API, le web et le mobile.

export type UserRole = "CUSTOMER" | "VENDOR" | "ADMIN";

export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export type PaymentMethod = "MOBILE_MONEY" | "CARD" | "CASH_ON_DELIVERY";

export type PaymentProvider = "FLUTTERWAVE" | "COD";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  country: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  shopName: string;
  shopSlug: string;
  description?: string;
  logoUrl?: string;
  country: string;
  city?: string;
  status: VendorStatus;
  createdAt: string;
  themeId?: string | null;
  theme?: Theme | null;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  isPremium: boolean;
  priceCents: number;
  previewImageUrl?: string | null;
}

export interface ThemePurchase {
  id: string;
  vendorId: string;
  themeId: string;
  amountCents: number;
  currency: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export type ProductType = "PHYSICAL" | "DIGITAL";

export interface Product {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  type: ProductType;
  stock: number;
  /// Uniquement renvoyé au vendeur propriétaire (jamais dans le catalogue public).
  digitalFileUrl?: string | null;
  images: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  productId: string;
  vendorId: string;
  title: string;
  priceCents: number;
  quantity: number;
  commissionCents?: number;
  productType?: ProductType;
  /// Présent uniquement pour un article digital d'une commande payée.
  downloadUrl?: string | null;
}

export interface PlatformSettings {
  id: string;
  commissionRate: number;
}

export interface VendorRevenue {
  vendorId: string;
  shopName: string;
  shopSlug: string | null;
  salesCents: number;
  commissionCents: number;
  payoutCents: number;
  paidOutCents: number;
  remainingCents: number;
  orderCount: number;
}

export interface AdminStats {
  totalRevenueCents: number;
  totalCommissionCents: number;
  totalPayoutCents: number;
  totalPaidOutCents: number;
  totalRemainingCents: number;
  currency: string;
  vendors: VendorRevenue[];
}

export interface Payout {
  id: string;
  vendorId: string;
  amountCents: number;
  currency: string;
  note?: string | null;
  createdAt: string;
  vendor?: { shopName: string; shopSlug: string };
}

export interface VendorOwnRevenue {
  currency: string;
  salesCents: number;
  commissionCents: number;
  payoutCents: number;
  paidOutCents: number;
  remainingCents: number;
  orderCount: number;
  payouts: Payout[];
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  totalCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  addressLine: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

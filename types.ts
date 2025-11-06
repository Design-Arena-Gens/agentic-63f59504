export type ProductCategory =
  | "Prescription"
  | "OTC"
  | "Wellness"
  | "Medical Supplies";

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  reorderPoint: number;
  requiresPrescription: boolean;
  category: ProductCategory;
}

export interface CartItem {
  productId: string;
  quantity: number;
  dosage?: string;
  notes?: string;
}

export type PaymentMethod = "Cash" | "Card" | "Insurance";

export interface SaleRecord {
  id: string;
  soldAt: string;
  customerName: string;
  prescriptionNumber?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  items: Array<CartItem & { unitPrice: number; productName: string }>;
  subtotal: number;
  tax: number;
  total: number;
}

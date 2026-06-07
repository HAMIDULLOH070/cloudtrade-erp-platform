export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  size: string;
  color: string;
  price: number;
  cost: number;
  quantityInStock: number;
  lowStockThreshold: number;
  supplierId: string;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  category: string;
  debt: number;
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  customerId: string;
  customer?: Customer;
  status: 'NEW' | 'CONTACTED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  value: number;
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  orderDate: string;
  items: OrderItem[];
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  cost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  poDate: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  type: 'INCOMING' | 'OUTGOING' | 'TRANSFER' | 'ADJUSTMENT';
  fromZone?: string;
  toZone?: string;
  referenceId?: string;
  userId?: string;
  user?: User;
  createdAt: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  code: string;
  capacity: number;
  currentUsage: number;
  description?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  order?: Order;
  amount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  dueDate: string;
  issuedDate: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoice?: Invoice;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  reference?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'OPERATOR' | 'DRIVER' | 'WASHER';
export type OrderStatus = 'NEW' | 'DRIVER_ASSIGNED' | 'PICKED_UP' | 'AT_FACILITY' | 'WASHING' | 'DRYING' | 'READY_FOR_DELIVERY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface Company {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  logo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  companyId: string;
  company?: Company;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  companyId: string;
  operatorId?: string;
  operator?: User;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  companyId: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  service?: Service;
  quantity: number;
  width: number;
  length: number;
  price: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  companyId: string;
  operatorId: string;
  operator?: User;
  driverId?: string;
  driver?: User;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  companyId: string;
  userId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Call {
  id: string;
  from: string;
  to: string;
  direction: 'INCOMING' | 'OUTGOING';
  status: 'ANSWERED' | 'MISSED' | 'BUSY' | 'FAILED';
  duration: number;
  recordingUrl?: string;
  companyId: string;
  operatorId?: string;
  createdAt: string;
}

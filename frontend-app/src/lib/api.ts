const API_BASE = 'http://localhost:3000/api';

// ===== TOKEN BOSHQARUVI =====
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

// ===== ASOSIY FETCH WRAPPER =====
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('Sessiya muddati tugadi');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Server xatosi' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ===== AUTH API =====
export const authApi = {
  login: (phone: string, password: string) =>
    request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  register: (data: { phone: string; password: string; fullName: string; role: string; companyId?: string }) =>
    request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ===== COMPANIES API =====
export const companiesApi = {
  getAll: () => request<any[]>('/companies'),
  getOne: (id: string) => request<any>(`/companies/${id}`),
  getStats: () => request<any>('/companies/stats'),
  create: (data: any) => request<any>('/companies', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/companies/${id}`, { method: 'DELETE' }),
};

// ===== USERS API =====
export const usersApi = {
  getAll: () => request<any[]>('/users'),
  getByCompany: (companyId: string) => request<any[]>(`/users/company/${companyId}`),
  getOne: (id: string) => request<any>(`/users/${id}`),
  create: (data: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// ===== CUSTOMERS API =====
export const customersApi = {
  getByCompany: (companyId: string) => request<any[]>(`/customers/company/${companyId}`),
  search: (companyId: string, query: string) => request<any[]>(`/customers/search/${companyId}?q=${encodeURIComponent(query)}`),
  getOne: (id: string) => request<any>(`/customers/${id}`),
  create: (data: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/customers/${id}`, { method: 'DELETE' }),
};

// ===== SERVICES API =====
export const servicesApi = {
  getByCompany: (companyId: string) => request<any[]>(`/services/company/${companyId}`),
  getOne: (id: string) => request<any>(`/services/${id}`),
  create: (data: any) => request<any>('/services', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/services/${id}`, { method: 'DELETE' }),
};

// ===== ORDERS API =====
export const ordersApi = {
  getAll: () => request<any[]>('/orders'),
  getByCompany: (companyId: string) => request<any[]>(`/orders/company/${companyId}`),
  getCompanyStats: (companyId: string) => request<any>(`/orders/company/${companyId}/stats`),
  getDriverOrders: (driverId: string) => request<any[]>(`/orders/driver/${driverId}`),
  getOne: (id: string) => request<any>(`/orders/${id}`),
  create: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: string, data: any) => request<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

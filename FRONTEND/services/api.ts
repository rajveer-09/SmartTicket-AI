import { Ticket, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface LoginData {
  email: string;
  password: string;
}

interface SignupData extends LoginData {
  name: string;
}

interface UpdateUserData {
  userId: string;
  role?: string;
  skills?: string[];
}

interface CreateTicketData {
  title: string;
  description: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.hash = '/login';
    }
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || 'API request failed');
  }

  return response;
};

export const api = {
  login: async (credentials: LoginData): Promise<{ token: string; user: User }> => {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  signup: async (userData: SignupData): Promise<{ token: string; user: User }> => {
    const response = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  getProfile: async (): Promise<User> => {
    const response = await fetchWithAuth('/auth/profile');
    return response.json();
  },

  getTickets: async (): Promise<Ticket[]> => {
    const response = await fetchWithAuth('/tickets');
    return response.json();
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}`);
    const data = await response.json();
    return data.ticket;
  },

  createTicket: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await fetchWithAuth('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await fetchWithAuth('/auth/users');
    return response.json();
  },

  updateUser: async (data: UpdateUserData): Promise<User> => {
    const response = await fetchWithAuth('/auth/update-user', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateTicket: async (id: string, data: { title: string; description: string }): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },

  updateTicketStatus: async (id: string, data: { status: string }): Promise<Ticket> => {
    const response = await fetchWithAuth(`/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const resData = await response.json();
    return resData.ticket;
  },
};

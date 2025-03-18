
import { toast } from "@/components/ui/use-toast";

// API base URL - change this to your actual backend URL when deployed
const API_BASE_URL = "http://localhost:5000/api";

interface ApiOptions {
  method: string;
  headers?: HeadersInit;
  body?: any;
  requiresAuth?: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  author: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Utility function for API calls
async function apiCall<T>(endpoint: string, options: ApiOptions): Promise<T> {
  const { method, body, requiresAuth = false } = options;
  
  try {
    // Prepare headers
    const headers: HeadersInit = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    
    // Add auth token if required
    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
    };
    
    // Add body for non-GET requests
    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }
    
    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    // Parse response
    const data = await response.json();
    
    // Handle non-2xx responses
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    throw error;
  }
}

// Auth API
export const authApi = {
  signup: (userData: { username: string; email: string; password: string }) => 
    apiCall<AuthResponse>('/signup', { method: 'POST', body: userData }),
  
  login: (credentials: { email: string; password: string }) => 
    apiCall<AuthResponse>('/login', { method: 'POST', body: credentials }),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },
  
  setCurrentUser: (user: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
};

// Posts API
export const postsApi = {
  getAllPosts: () => 
    apiCall<Post[]>('/posts', { method: 'GET' }),
  
  getPostById: (id: string) => 
    apiCall<Post>(`/posts/${id}`, { method: 'GET' }),
  
  createPost: (postData: FormData) => 
    apiCall<Post>('/posts', { 
      method: 'POST', 
      body: postData,
      headers: {}, // Let fetch set proper content-type for FormData
      requiresAuth: true 
    }),
  
  updatePost: (id: string, postData: FormData) => 
    apiCall<Post>(`/posts/${id}`, { 
      method: 'PUT', 
      body: postData,
      headers: {}, // Let fetch set proper content-type for FormData
      requiresAuth: true 
    }),
  
  deletePost: (id: string) => 
    apiCall<{ success: boolean }>(`/posts/${id}`, { 
      method: 'DELETE', 
      requiresAuth: true 
    }),
};

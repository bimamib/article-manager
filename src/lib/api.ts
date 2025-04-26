
import axios, { AxiosError } from 'axios';
import { Article, Category } from '@/types';

// Create an axios instance with base URL
export const api = axios.create({
  baseURL: 'https://test-fe.mysellerpintar.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const errorMessage = error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data 
      ? (error.response.data as { message: string }).message 
      : 'Unknown error occurred';
    
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Dummy data for fallback when API fails
export const dummyData = {
  articles: Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Article ${i + 1}`,
    content: `This is the content of article ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    image: `https://picsum.photos/seed/${i + 1}/800/400`,
    category_id: `${(i % 5) + 1}`,
    category: {
      id: `${(i % 5) + 1}`,
      name: `Category ${(i % 5) + 1}`,
    },
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  })) as Article[],

  categories: Array.from({ length: 10 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Category ${i + 1}`,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  })) as Category[],
};

export default api;

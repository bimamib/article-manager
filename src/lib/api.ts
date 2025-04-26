
import axios, { AxiosError } from "axios";
import { toast } from "@/components/ui/use-toast";

// API Base URL
const API_URL = "https://test-fe.mysellerpintar.com/api";

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.message || "Terjadi kesalahan pada server";
    
    if (error.response?.status === 401) {
      // Handle unauthorized error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    } else if (error.response?.status === 403) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengakses halaman ini",
        variant: "destructive",
      });
    } else {
      // Handle other errors
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

// Dummy data untuk fallback
export const dummyData = {
  articles: [
    {
      id: "1",
      title: "Mengenal React Hooks",
      content: "React Hooks adalah fitur baru di React 16.8. Dengan Hooks, Anda dapat menggunakan state dan fitur React lainnya tanpa menulis kelas.",
      image: "https://picsum.photos/seed/article1/800/450",
      category_id: "1",
      category_name: "Frontend",
      created_at: "2023-01-10T10:30:00Z",
      updated_at: "2023-01-10T10:30:00Z",
      excerpt: "React Hooks adalah fitur baru di React 16.8..."
    },
    {
      id: "2",
      title: "Tailwind CSS untuk Pemula",
      content: "Tailwind CSS adalah framework CSS utility-first yang memungkinkan Anda untuk membangun desain kustom tanpa meninggalkan HTML Anda.",
      image: "https://picsum.photos/seed/article2/800/450",
      category_id: "1",
      category_name: "Frontend",
      created_at: "2023-02-15T14:20:00Z",
      updated_at: "2023-02-15T14:20:00Z",
      excerpt: "Tailwind CSS adalah framework CSS utility-first..."
    },
    {
      id: "3",
      title: "Node.js dan Express: Backend untuk JavaScript Developer",
      content: "Node.js dan Express memberikan cara yang efisien untuk membangun aplikasi backend dengan JavaScript.",
      image: "https://picsum.photos/seed/article3/800/450",
      category_id: "2",
      category_name: "Backend",
      created_at: "2023-03-05T09:45:00Z",
      updated_at: "2023-03-05T09:45:00Z",
      excerpt: "Node.js dan Express memberikan cara yang efisien..."
    },
    {
      id: "4",
      title: "MongoDB: Database NoSQL untuk Aplikasi Modern",
      content: "MongoDB adalah database dokumen NoSQL yang memberikan skalabilitas dan fleksibilitas dengan model data berbasis dokumen JSON.",
      image: "https://picsum.photos/seed/article4/800/450",
      category_id: "2",
      category_name: "Backend",
      created_at: "2023-04-20T16:10:00Z",
      updated_at: "2023-04-20T16:10:00Z",
      excerpt: "MongoDB adalah database dokumen NoSQL..."
    },
    {
      id: "5",
      title: "Mengenal Docker untuk Pengembangan Aplikasi",
      content: "Docker adalah platform yang memungkinkan pengembang untuk mengembangkan, mengirim, dan menjalankan aplikasi dalam wadah yang terisolasi.",
      image: "https://picsum.photos/seed/article5/800/450",
      category_id: "3",
      category_name: "DevOps",
      created_at: "2023-05-12T11:30:00Z",
      updated_at: "2023-05-12T11:30:00Z",
      excerpt: "Docker adalah platform yang memungkinkan pengembang..."
    },
    {
      id: "6",
      title: "CI/CD dengan GitHub Actions",
      content: "GitHub Actions memungkinkan Anda untuk mengotomatisasi alur kerja pengembangan perangkat lunak Anda langsung dari repositori GitHub.",
      image: "https://picsum.photos/seed/article6/800/450",
      category_id: "3",
      category_name: "DevOps",
      created_at: "2023-06-08T13:45:00Z",
      updated_at: "2023-06-08T13:45:00Z",
      excerpt: "GitHub Actions memungkinkan Anda untuk mengotomatisasi..."
    },
    {
      id: "7",
      title: "Machine Learning dengan TensorFlow",
      content: "TensorFlow adalah platform open-source untuk machine learning yang menyediakan ekosistem komprehensif dari tools, libraries, dan resources.",
      image: "https://picsum.photos/seed/article7/800/450",
      category_id: "4",
      category_name: "Data Science",
      created_at: "2023-07-14T10:20:00Z",
      updated_at: "2023-07-14T10:20:00Z",
      excerpt: "TensorFlow adalah platform open-source untuk machine learning..."
    },
    {
      id: "8",
      title: "Analisis Data dengan Python Pandas",
      content: "Pandas adalah library Python yang menyediakan struktur data dan tools analisis yang cepat, fleksibel, dan ekspresif.",
      image: "https://picsum.photos/seed/article8/800/450",
      category_id: "4",
      category_name: "Data Science",
      created_at: "2023-08-23T15:50:00Z",
      updated_at: "2023-08-23T15:50:00Z",
      excerpt: "Pandas adalah library Python yang menyediakan struktur data..."
    },
    {
      id: "9",
      title: "Keamanan Web: Praktik Terbaik",
      content: "Keamanan web adalah aspek penting dalam pengembangan aplikasi modern. Artikel ini membahas praktik terbaik untuk mengamankan aplikasi web Anda.",
      image: "https://picsum.photos/seed/article9/800/450",
      category_id: "5",
      category_name: "Security",
      created_at: "2023-09-17T09:30:00Z",
      updated_at: "2023-09-17T09:30:00Z",
      excerpt: "Keamanan web adalah aspek penting dalam pengembangan aplikasi modern..."
    },
    {
      id: "10",
      title: "OWASP Top 10: Ancaman Keamanan Web",
      content: "OWASP Top 10 adalah daftar standar kesadaran untuk pengembang dan keamanan web yang mewakili konsensus luas tentang risiko keamanan web paling kritis.",
      image: "https://picsum.photos/seed/article10/800/450",
      category_id: "5",
      category_name: "Security",
      created_at: "2023-10-05T14:15:00Z",
      updated_at: "2023-10-05T14:15:00Z",
      excerpt: "OWASP Top 10 adalah daftar standar kesadaran untuk pengembang..."
    }
  ],
  categories: [
    { id: "1", name: "Frontend", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    { id: "2", name: "Backend", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    { id: "3", name: "DevOps", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    { id: "4", name: "Data Science", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" },
    { id: "5", name: "Security", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z" }
  ]
};

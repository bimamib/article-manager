
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email harus diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  password_confirmation: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak sesuai",
  path: ["password_confirmation"],
});

export const categorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
});

export const articleSchema = z.object({
  title: z.string().min(5, "Judul artikel minimal 5 karakter"),
  content: z.string().min(20, "Konten artikel minimal 20 karakter"),
  image: z.string().min(1, "URL gambar harus diisi"),
  category_id: z.string().min(1, "Kategori harus dipilih"),
});

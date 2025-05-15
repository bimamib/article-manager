## Home Test Frontend Web Developer

Website manajemen artikel dengan dua role: **User** dan **Admin**.

---

### 1. User

#### a. Authentication

- Login dengan validasi form
- Register dengan validasi form
- Setelah login/register sukses, redirect ke halaman list artikel

#### b. List Artikel

- Filter artikel berdasarkan kategori
- Searching artikel dengan debounce (300–500ms)
- Pagination jika data lebih dari 9 item

#### c. Detail Artikel

- Tampilkan konten lengkap dari artikel
- Other Articles:
  - Tampilkan maksimal 3 artikel dari kategori yang sama dengan artikel yang sedang dilihat user

---

### 2. Admin

#### a. Authentication

- Login dengan validasi form
- Register dengan validasi form
- Setelah login/register sukses, redirect ke halaman list artikel
- Logout dengan redirect ke halaman login

#### b. List Categories

- Searching category dengan debounce (300–500ms)
- Pagination jika data lebih dari 10 item

#### c. Create Category

- Terapkan form validation

#### d. Edit Category

- Terapkan form validation

#### e. List Artikel

- Filter artikel berdasarkan kategori
- Searching artikel dengan debounce (300–500ms)
- Pagination jika data lebih dari 10 item

#### f. Create Article

- Terapkan form validation
- Buat tampilan preview sebelum submit (fetch API)

#### g. Edit Article

- Terapkan form validation
- Buat tampilan preview sebelum submit (fetch API)

---

### 3. Teknologi

- Next.js
- TypeScript
- Redux Toolkit
- TailwindCSS
- Axios
- React Router DOM
- React Hook Form
- React Icons
- React Query
- React Toastify
- React Spinners
- React Paginate
- React Debounce Input
- Zod + React Hook Form Resolvers
- Version Control: Git

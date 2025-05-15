## Home Test Frontend Web Developer

Website manajemen artikel dengan role User dan Admin.

1. User
   a. Authentication

   1. Login dengan validasi form
   2. Register dengan validasi form.
   3. Setelah login/register sukses, redirect ke halaman list artikel.

   b. List Artikel

   1. Filter artikel berdasarkan kategori.
   2. Searching artikel, dengan debounce (300-500ms).
   3. Pagination, jika data lebih dari 9 item.

   c. Detail Artikel

   1. Detail artikel, tampilkan konten lengkap.
   2. Other articles, tampilkan maksimal 3 artikel dari kategori yang sama dengan artikel yang sedang dilihat user.

2. Admin
   a. Authentication

   1. Login dengan validasi form
   2. Register dengan validasi form.
   3. Setelah login/register sukses, redirect ke halaman list artikel.
   4. Logout dengan redirect ke halaman login.

   b. List Categories

   1. Searching category, dengan debounce (300-500ms)
   2. Terapkan pagination, jika data lebih dari 10 items

   c. Create Category

   - Terapkan form validation.

   d. Edit Category

   - Terapkan form validation.

   e. List artikel

   1. Filter artikel berdasarkan kategori
   2. Searching artikel, dengan debounce (300-500ms)
   3. Pagination, jika data lebih dari 10 item

   f. Create article

   1. Terapkan form validation
   2. Buat tampilan preview sebelum submit (fetch api).

   g. Edit artikel

   1. Terapkan form validation
   2. Buat tampilan preview sebelum submit (fetch api).

3. Teknologi
   - NextJS
   - TypeScript
   - Redux Toolkit
   - TailwindCSS
   - Axios
   - React Router Dom
   - React Hook Form
   - React Icons
   - React Query
   - React Toastify
   - React Spinners
   - React Paginate
   - React Debounce Input
   - Zod + React Hook Form Resolvers
   - Version Control: Git

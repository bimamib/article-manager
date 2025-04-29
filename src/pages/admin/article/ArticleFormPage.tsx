
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Loading } from "@/components/ui/loading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Eye, Save, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { articleService } from "@/services/articleService";
import { categoryService } from "@/services/categoryService";
import { ArticleFormData, Category } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  title: z.string().min(1, { message: "Judul wajib diisi" }),
  content: z.string().min(1, { message: "Konten wajib diisi" }),
  image: z.string().min(1, { message: "URL Gambar wajib diisi" }),
  category_id: z.string().min(1, { message: "Kategori wajib dipilih" }),
});

type FormValues = z.infer<typeof formSchema>;

const ArticleFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshingCategories, setRefreshingCategories] = useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
      category_id: "",
    },
  });

  const { watch } = form;
  const previewData = watch();

  const fetchCategories = async (forceRefresh: boolean = true) => {
    try {
      console.log("ArticleFormPage - Memulai pengambilan kategori, forceRefresh:", forceRefresh);
      setRefreshingCategories(true);
      const categoriesData = await categoryService.getAllCategories(forceRefresh);
      console.log("ArticleFormPage - Kategori yang diambil:", categoriesData);
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        console.error("Format data kategori tidak valid:", categoriesData);
        setCategories([]);
        toast({
          title: "Peringatan",
          description: "Format data kategori tidak valid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saat mengambil kategori:", error);
      toast({
        title: "Error",
        description: "Gagal memuat kategori",
        variant: "destructive",
      });
      setCategories([]);
    } finally {
      setRefreshingCategories(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchCategories(true); // Paksa refresh kategori
        
        if (isEditMode && id) {
          const article = await articleService.getArticleById(id);
          if (article) {
            form.reset({
              title: article.title || "",
              content: article.content || "",
              image: article.image || "",
              category_id: article.category_id || "",
            });
          }
        }
      } catch (error) {
        console.error("Error saat memuat data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data yang diperlukan",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    
    const articleData: ArticleFormData = {
      title: values.title,
      content: values.content,
      image: values.image,
      category_id: values.category_id
    };
    
    try {
      console.log("ArticleFormPage - Menyimpan artikel:", articleData);
      
      if (isEditMode && id) {
        await articleService.updateArticle(id, articleData);
        toast({ title: "Berhasil", description: "Artikel berhasil diperbarui" });
      } else {
        await articleService.createArticle(articleData);
        
        // Tambahkan penundaan sebelum navigasi untuk memastikan data tersimpan
        toast({ title: "Berhasil", description: "Artikel berhasil dibuat" });
        
        // Berikan waktu untuk menyimpan artikel ke localStorage
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      navigate("/admin/articles");
    } catch (error) {
      console.error("Error saat menyimpan artikel:", error);
      toast({
        title: "Error",
        description: `Gagal ${isEditMode ? "memperbarui" : "membuat"} artikel`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshCategories = async () => {
    await fetchCategories(true);
    toast({
      title: "Berhasil",
      description: "Daftar kategori berhasil diperbarui",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 py-6 mx-auto">
        {/* Back button above the card on mobile */}
        {isMobile && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="flex items-center gap-1"
            >
              <Link to="/admin/articles">
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Link>
            </Button>
          </div>
        )}
        
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Artikel" : "Buat Artikel"}
          </h1>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
            size={isMobile ? "sm" : "default"}
          >
            {isSaving ? (
              <>Menyimpan...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Detail Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full sm:w-auto mb-4">
                <TabsTrigger value="editor" className="flex-1 sm:flex-none">Editor</TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 sm:flex-none">
                  Pratinjau
                  <Eye className="ml-2 h-4 w-4" />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="editor">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul</FormLabel>
                          <FormControl>
                            <Input placeholder="Judul artikel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konten</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Isi artikel" className="min-h-32" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Gambar</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>Kategori</FormLabel>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="xs" 
                              onClick={handleRefreshCategories}
                              disabled={refreshingCategories}
                            >
                              <RefreshCw className={`h-4 w-4 ${refreshingCategories ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.isArray(categories) && categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-categories" disabled>
                                  Tidak ada kategori tersedia
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Hide on mobile */}
                    {!isMobile && (
                      <div className="flex justify-start mt-6">
                        <Button 
                          variant="outline" 
                          type="button" 
                          onClick={() => navigate("/admin/articles")} 
                          className="flex items-center gap-2"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Kembali
                        </Button>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="preview">
                <Card className="border">
                  <CardHeader>
                    <CardTitle>{previewData.title || "Judul Artikel"}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {previewData.image && (
                      <img
                        src={previewData.image}
                        alt="Article Preview"
                        className="w-full h-auto rounded-md"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{previewData.content || "Isi Artikel"}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ArticleFormPage;

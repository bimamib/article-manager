
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

  const fetchCategories = async (forceRefresh: boolean = false) => {
    try {
      console.log("ArticleFormPage - Memulai pengambilan kategori, forceRefresh:", forceRefresh);
      setRefreshingCategories(true);
      const categoriesData = await categoryService.getAllCategories(forceRefresh);
      console.log("ArticleFormPage - Kategori yang diambil:", categoriesData);
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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
      if (isEditMode && id) {
        await articleService.updateArticle(id, articleData);
        toast({ title: "Berhasil", description: "Artikel berhasil diperbarui" });
      } else {
        await articleService.createArticle(articleData);
        toast({ title: "Berhasil", description: "Artikel berhasil dibuat" });
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/admin/articles")}>
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">
              {isEditMode ? "Edit Artikel" : "Buat Artikel"}
            </h1>
          </div>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSaving}
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">
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
                          <Textarea placeholder="Isi artikel" {...field} />
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
                            size="sm" 
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
                  <p>{previewData.content || "Isi Artikel"}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default ArticleFormPage;

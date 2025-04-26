
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
import { ArrowLeft, Eye, Save } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { articleService } from "@/services/articleService";
import { categoryService } from "@/services/categoryService";
import { ArticleFormData, Category } from "@/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  image: z.string().min(1, { message: "Image URL is required" }),
  category_id: z.string().min(1, { message: "Category is required" }),
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);

        if (isEditMode) {
          const article = await articleService.getArticleById(id);
          form.reset({
            title: article.title,
            content: article.content,
            image: article.image,
            category_id: article.category_id,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load necessary data",
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
      if (isEditMode) {
        await articleService.updateArticle(id, articleData);
        toast({ title: "Success", description: "Article updated successfully" });
      } else {
        await articleService.createArticle(articleData);
        toast({ title: "Success", description: "Article created successfully" });
      }
      navigate("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} article`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
                        <FormLabel>Kategori</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
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

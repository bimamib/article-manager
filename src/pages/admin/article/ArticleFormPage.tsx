
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { articleSchema } from "@/lib/validations";
import { articleService } from "@/services/articleService";
import { categoryService } from "@/services/categoryService";
import { Category } from "@/types";
import { ArrowLeft, Eye, Pencil, Save } from "lucide-react";

type ArticleFormValues = z.infer<typeof articleSchema>;

const ArticleFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(!!id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const isEditing = !!id;
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      content: "",
      image: "",
      category_id: "",
    },
  });
  
  // Get form values for preview
  const previewData = form.watch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        const article = await articleService.getArticleById(id);
        form.reset({
          title: article.title,
          content: article.content,
          image: article.image,
          category_id: article.category_id,
        });
      } catch (error) {
        console.error("Error fetching article:", error);
        toast({
          title: "Error",
          description: "Failed to fetch article",
          variant: "destructive",
        });
        navigate("/admin/articles");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    } else {
      setInitialLoading(false);
    }
  }, [id, form, navigate, toast]);

  const onSubmit = async (data: ArticleFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && id) {
        await articleService.updateArticle(id, data);
        toast({
          title: "Success",
          description: "Article updated successfully",
        });
      } else {
        await articleService.createArticle(data);
        toast({
          title: "Success",
          description: "Article created successfully",
        });
      }
      navigate("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} article`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return <Layout><Loading /></Layout>;
  }

  const selectedCategoryName = categories.find(
    (category) => category.id === previewData.category_id
  )?.name || "Uncategorized";

  return (
    <Layout>
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        asChild
      >
        <Link to="/admin/articles">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Articles
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Edit" : "Create"} Article
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update an existing article" : "Add a new article to your collection"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <Card>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 pt-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter article title" 
                            {...field} 
                          />
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
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
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
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter image URL" 
                            {...field} 
                          />
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
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your article content here..."
                            className="min-h-[300px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/articles")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Update" : "Save"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewData.image && (
                <div className="aspect-video mb-6 overflow-hidden rounded-lg">
                  <img
                    src={previewData.image}
                    alt={previewData.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Set fallback image on error
                      e.currentTarget.src = "https://picsum.photos/seed/article/800/450";
                    }}
                  />
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {selectedCategoryName}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-4">
                  {previewData.title || "Article Title"}
                </h1>
              </div>
              
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="article-content">
                  {previewData.content ? (
                    previewData.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">Article content will appear here...</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default ArticleFormPage;

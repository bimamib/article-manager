
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { categoryService } from "@/services/categoryService";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";
import { CategoryFormData } from "@/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditMode) return;
      
      try {
        const category = await categoryService.getCategoryById(id as string);
        form.reset({ name: category.name });
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: "Failed to load category data",
          variant: "destructive",
        });
        navigate("/admin/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, isEditMode, navigate, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const categoryData: CategoryFormData = {
      name: values.name
    };
    
    try {
      if (isEditMode) {
        await categoryService.updateCategory(id as string, categoryData);
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        await categoryService.createCategory(categoryData);
        toast({ title: "Success", description: "Category created successfully" });
      }
      
      // Force a refresh of the categories list in local storage
      await categoryService.getAllCategories(true);
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} category`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      {isLoading ? (
        <Loading fullScreen />
      ) : (
        <div className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? "Edit Category" : "Create Category"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Category Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4">
                    <Button variant="ghost" asChild>
                      <Link to="/admin/categories" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </Link>
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default CategoryFormPage;

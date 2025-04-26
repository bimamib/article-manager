
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { categorySchema } from "@/lib/validations";
import { categoryService } from "@/services/categoryService";
import { ArrowLeft, Save } from "lucide-react";

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(!!id);
  const isEditing = !!id;
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      
      try {
        const category = await categoryService.getCategoryById(id);
        form.reset({ name: category.name });
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: "Failed to fetch category",
          variant: "destructive",
        });
        navigate("/admin/categories");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, form, navigate, toast]);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && id) {
        await categoryService.updateCategory(id, data);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await categoryService.createCategory(data);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} category`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return <Layout><Loading /></Layout>;
  }

  return (
    <Layout>
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        asChild
      >
        <Link to="/admin/categories">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? "Edit" : "Create"} Category
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update an existing category" : "Add a new category to your articles"}
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter category name" 
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
                onClick={() => navigate("/admin/categories")}
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
    </Layout>
  );
};

export default CategoryFormPage;

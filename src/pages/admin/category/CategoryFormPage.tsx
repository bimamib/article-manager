
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
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  name: z.string().min(1, { message: "Nama kategori diperlukan" }),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();

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
        console.error("Error saat mengambil data kategori:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data kategori",
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
        console.log("Memperbarui kategori:", id, categoryData);
        await categoryService.updateCategory(id as string, categoryData);
        toast({ title: "Berhasil", description: "Kategori berhasil diperbarui" });
      } else {
        console.log("Membuat kategori baru:", categoryData);
        await categoryService.createCategory(categoryData);
        toast({ title: "Berhasil", description: "Kategori berhasil dibuat" });
      }
      
      // Paksa refresh daftar kategori di localStorage
      console.log("Memaksa refresh daftar kategori");
      await categoryService.getAllCategories(true);
      
      // Tunggu sejenak untuk memastikan data tersimpan
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error saat menyimpan kategori:", error);
      toast({
        title: "Error",
        description: `Gagal ${isEditMode ? "memperbarui" : "membuat"} kategori`,
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
        <div className="container px-4 py-6 mx-auto">
          {/* Back button above the card on mobile */}
          <div className={`${isMobile ? 'mb-4' : 'hidden'}`}>
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="inline-flex w-auto"
            >
              <Link to="/admin/categories" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>Kembali</span>
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl md:text-2xl">
                {isEditMode ? "Edit Kategori" : "Buat Kategori"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Kategori" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-4 mt-6">
                    {/* Hide back button on mobile as it's moved above the card */}
                    <div className={`${isMobile ? 'hidden' : 'block'}`}>
                      <Button variant="outline" asChild className="w-auto">
                        <Link to="/admin/categories" className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          <span>Kembali</span>
                        </Link>
                      </Button>
                    </div>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan
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

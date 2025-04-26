
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { FileSearch, ArrowLeft } from "lucide-react";

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <FileSearch className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Button asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFoundPage;

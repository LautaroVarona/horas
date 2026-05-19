"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { FileDropzone } from "@/components/upload/FileDropzone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHasData, useHorasStore } from "@/lib/store";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

export default function UploadPage() {
  const router = useRouter();
  const hasData = useHasData();
  const {
    addFiles,
    clearData,
    isLoading,
    uploadedFiles,
    parseErrors,
    activities,
  } = useHorasStore();

  useEffect(() => {
    if (parseErrors.length > 0) {
      parseErrors.forEach((err) => toast.error(err));
    }
  }, [parseErrors]);

  const handleFiles = async (files: File[]) => {
    await addFiles(files);
    const state = useHorasStore.getState();
    const imported = state.uploadedFiles
      .slice(-files.length)
      .reduce((s, f) => s + f.rowCount, 0);
    if (imported > 0) {
      toast.success(
        `Se importaron ${imported} actividad${imported === 1 ? "" : "es"} de ${files.length} archivo${files.length === 1 ? "" : "s"}.`
      );
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cargar archivos</h1>
          <p className="mt-1 text-muted-foreground">
            Subí uno o más archivos Excel mensuales (.xlsx) con columnas Fecha,
            Cliente y Cantidad.
          </p>
        </div>

        <FileDropzone onFilesSelected={handleFiles} isLoading={isLoading} />

        {isLoading && <UploadProgress />}

        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Archivos cargados</CardTitle>
              <CardDescription>
                {activities.length} actividades en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <Badge variant="secondary">{file.rowCount} filas</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!hasData || isLoading}
            onClick={() => router.push("/dashboard")}
          >
            Ir al dashboard
          </Button>
          {hasData && (
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                clearData();
                toast.info("Datos eliminados.");
              }}
            >
              <Trash2 className="h-4 w-4" />
              Limpiar datos
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/ejemplo-enero.xlsx" download>
              Descargar ejemplo
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

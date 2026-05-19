"use client";

import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
}

export function FileDropzone({ onFilesSelected, isLoading }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const xlsxFiles = Array.from(fileList).filter((f) =>
        f.name.toLowerCase().endsWith(".xlsx")
      );
      if (xlsxFiles.length > 0) {
        onFilesSelected(xlsxFiles);
      }
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      )}
    >
      <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-1 text-lg font-medium">
        Arrastrá archivos Excel aquí
      </p>
      <p className="mb-6 text-sm text-muted-foreground">
        o hacé clic para seleccionar (.xlsx)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Seleccionar archivos
      </Button>
    </div>
  );
}

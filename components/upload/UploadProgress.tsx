"use client";

import { Loader2 } from "lucide-react";

export function UploadProgress() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        Procesando archivos Excel...
      </p>
    </div>
  );
}

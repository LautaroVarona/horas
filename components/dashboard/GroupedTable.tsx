"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatHoras } from "@/lib/format";

interface GroupedRow {
  label: string;
  sublabel?: string;
  horas: number;
}

interface GroupedTableProps {
  rows: GroupedRow[];
  col1Label: string;
  col2Label?: string;
  emptyMessage?: string;
}

export function GroupedTable({
  rows,
  col1Label,
  col2Label,
  emptyMessage = "No hay datos con estos filtros.",
}: GroupedTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{col1Label}</TableHead>
            {col2Label && <TableHead>{col2Label}</TableHead>}
            <TableHead className="text-right">Horas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${row.label}-${row.sublabel ?? i}`}>
              <TableCell className="font-medium">{row.label}</TableCell>
              {col2Label && (
                <TableCell className="text-muted-foreground">
                  {row.sublabel ?? "—"}
                </TableCell>
              )}
              <TableCell className="text-right">
                {formatHoras(row.horas)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

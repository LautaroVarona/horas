export interface Activity {
  id: string;
  fecha: string;
  cliente: string;
  horas: number;
  descripcion: string;
  propietario?: string;
  expediente?: string;
  mes: number;
  anio: number;
  sourceFile?: string;
}

export interface Filters {
  monthKeys: string[];
  clientes: string[];
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface MonthGroup {
  mes: number;
  anio: number;
  label: string;
  horas: number;
}

export interface ClientGroup {
  cliente: string;
  horas: number;
}

export interface ClientMonthGroup {
  cliente: string;
  mes: number;
  anio: number;
  label: string;
  horas: number;
}

export interface FilterOptions {
  meses: { mes: number; anio: number; label: string; key: string }[];
  clientes: string[];
}

export interface ParseResult {
  activities: Activity[];
  errors: string[];
}

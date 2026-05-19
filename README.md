# Horas Laborales

Plataforma web para analizar horas trabajadas a partir de múltiples archivos Excel mensuales.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
npm run generate:ejemplo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Uso

1. **Cargar archivos** — En `/upload`, arrastrá o seleccioná archivos `.xlsx` (uno por mes).
2. **Dashboard** — En `/dashboard`, revisá totales, gráficos y tablas con filtros por mes, cliente y rango de fechas.

Los datos se guardan en `sessionStorage` de la pestaña actual (no se envían a ningún servidor).

## Formato del Excel

La primera fila debe contener encabezados. Se reconocen variantes de nombres:

| Campo       | Requerido | Ejemplos de columna                          |
|------------|-----------|----------------------------------------------|
| Fecha      | Sí        | Fecha, Date                                  |
| Cliente    | Sí        | Cliente, Client                              |
| Cantidad   | Sí        | Cantidad, Horas, Tiempo                      |
| Descripción| No        | Descripción, Detalle, Actividad              |
| Propietario| No        | Propietario, Owner, Responsable              |
| Expediente | No        | Expediente, Caso, Matter                     |

### Valores en Cantidad

Se aceptan formatos como:

- `2:30 h` → 2.5 horas
- `2:30` → 2.5 horas
- `2.5` o `2,5`
- `2h 30m`

### Fechas

- `dd/mm/yyyy` (ej: `15/01/2026`)
- `yyyy-mm-dd`
- Número serial de Excel

## Estructura del proyecto

```
app/
  upload/       # Carga de archivos
  dashboard/    # Análisis y visualizaciones
components/     # UI y componentes de negocio
lib/
  parserExcel.ts
  normalizers.ts
  aggregations.ts
  store.ts
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run generate:ejemplo` | Genera `public/ejemplo-enero.xlsx` |

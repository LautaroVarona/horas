# Sistema de Normalización de Clientes

## Descripción General

Este sistema implementa una normalización robusta de clientes para procesar múltiples archivos Excel de actividades laborales. Resuelve el problema donde clientes se agrupan incorrectamente debido a valores como "GRUPO CLIENTES VARIOS" o "GRUPO MLILY EUROPE".

## Arquitectura

### 1. Campos de Datos (types.ts)

```typescript
interface Activity {
  cliente: string;           // Compatibilidad (= cliente_origen)
  cliente_origen: string;    // Valor original del Excel
  cliente_final: string;     // Valor procesado/normalizado
  // ... otros campos
}
```

### 2. Funciones de Normalización (normalizers.ts)

#### `normalizeSuffix(value: string): string`
Normaliza sufijos de entidades legales:
- `"S.L"`, `"S L"`, `"SL"` → `"S.L."`
- `"S.L.U"`, `"S L U"`, `"SLU"` → `"S.L.U."`

```typescript
normalizeSuffix("Acme Corp S L") // → "Acme Corp S.L."
```

#### `inferFromNombreExpediente(expediente: string): string`
Infiere el cliente desde el nombre del expediente:
- Realiza trim()
- Limpia espacios dobles
- Normaliza sufijos

```typescript
inferFromNombreExpediente("  HEALTHCARE FOAM SL  ") // → "HEALTHCARE FOAM S.L."
```

#### `normalizeClienteFinal(cliente_origen: string, expediente?: string): string`
**Lógica principal** de normalización:

```
SI cliente_origen contiene "GRUPO" (case-insensitive):
  SI expediente existe:
    cliente_final = inferFromNombreExpediente(expediente)
  SINO:
    cliente_final = cliente_origen
SINO:
  cliente_final = cliente_origen
```

**Ejemplos:**
- `normalizeClienteFinal("GRUPO CLIENTES VARIOS", "HEALTHCARE FOAM S.L.")` → `"HEALTHCARE FOAM S.L."`
- `normalizeClienteFinal("Acme Corp", "...") ` → `"Acme Corp"`
- `normalizeClienteFinal("GRUPO MLILY EUROPE", undefined)` → `"GRUPO MLILY EUROPE"`

#### `extractClienteKey(cliente: string): string` (BONUS)
Extrae una key única para detectar variantes del mismo cliente:
- Elimina sufijos legales
- Normaliza espacios
- Permite agrupar: `"HEALTHCARE FOAM S.L"`, `"HEALTHCARE FOAM, S.L.U"` → key: `"HEALTHCARE FOAM"`

```typescript
extractClienteKey("HEALTHCARE FOAM S.L.") // → "HEALTHCARE FOAM"
extractClienteKey("HEALTHCARE FOAM, S.L.U.") // → "HEALTHCARE FOAM"
```

### 3. Agregaciones (aggregations.ts)

Todas las funciones de agregación fueron actualizadas para usar `cliente_final`:

- `filterActivities()` - Filtra por `cliente_final`
- `groupByClient()` - Agrupa por `cliente_final`
- `groupByClientAndMonth()` - Agrupa por `cliente_final` + mes
- `getFilterOptions()` - Lista clientes usando `cliente_final`
- `getDistinctClients()` - Cuenta clientes únicos por `cliente_final`

### 4. UI (Dashboard)

#### ActivitiesTable (components/dashboard/ActivitiesTable.tsx)
Muestra ambos campos para debugging:

| Fecha | Cliente (Origen) | Cliente (Final) | Horas | Descripción | ... |
|-------|-----------------|-----------------|-------|-------------|-----|
| 15/01 | GRUPO MLILY EUROPE | MLILY TECH S.L. | 2.5 | Consultoría | ... |
| 20/01 | Acme Corp | Acme Corp | 3.0 | Revisión | ... |

#### FilterPanel (components/dashboard/FilterPanel.tsx)
El panel de filtros usa automáticamente `cliente_final` (a través de `getFilterOptions()`):
- Muestra solo clientes normalizados
- Filtra por `cliente_final`

## Flujo de Procesamiento

```
1. Usuario carga archivo Excel
   ↓
2. parseExcel() lee el archivo
   ↓
3. normalizeActivity() procesa cada fila:
   a. Obtiene cliente_origen del Excel
   b. Obtiene expediente del Excel (si existe)
   c. Calcula cliente_final usando normalizeClienteFinal()
   d. Crea Activity con ambos campos
   ↓
4. Agregaciones usan cliente_final
   ↓
5. Dashboard muestra datos con ambas columnas
```

## Casos de Uso

### Caso 1: Cliente Normal
```
Entrada: cliente_origen = "Acme Corp", expediente = "EXP-001"
Proceso: No contiene "GRUPO" → cliente_final = "Acme Corp"
Resultado: Acme Corp | Acme Corp
```

### Caso 2: Cliente con GRUPO
```
Entrada: cliente_origen = "GRUPO CLIENTES VARIOS", expediente = "HEALTHCARE FOAM S L"
Proceso: Contiene "GRUPO" → infiere de expediente → normaliza sufijo
Resultado: GRUPO CLIENTES VARIOS | HEALTHCARE FOAM S.L.
```

### Caso 3: Cliente con GRUPO y sin expediente
```
Entrada: cliente_origen = "GRUPO MLILY EUROPE", expediente = undefined
Proceso: Contiene "GRUPO" pero sin expediente → mantiene origen
Resultado: GRUPO MLILY EUROPE | GRUPO MLILY EUROPE
```

### Caso 4: Variantes del mismo cliente (BONUS)
```
Actividades:
- HEALTHCARE FOAM S.L. → key: "HEALTHCARE FOAM" (3 horas)
- HEALTHCARE FOAM S.L.U. → key: "HEALTHCARE FOAM" (2 horas)
- HEALTHCARE FOAM → key: "HEALTHCARE FOAM" (1 hora)

Resultado agrupado: "HEALTHCARE FOAM" = 6 horas
```

## Utilidades Adicionales (clientNormalizationUtils.ts)

### `groupByClientKey(data: Activity[])`
Agrupa actividades por cliente usando la key normalizada (BONUS).
Detecta y agrupa variantes automáticamente.

```typescript
const grouped = groupByClientKey(activities);
// Resultado:
// {
//   "HEALTHCARE FOAM": {
//     key: "HEALTHCARE FOAM",
//     clientes: ["HEALTHCARE FOAM S.L.", "HEALTHCARE FOAM S.L.U."],
//     horas: 6
//   }
// }
```

### `generateClienteNormalizationReport(data: Activity[])`
Genera un reporte de normalización para debugging:

```typescript
const report = generateClienteNormalizationReport(activities);
// report.conGrupo: clientes que tenían "GRUPO"
// report.sinGrupo: clientes normales
// report.original: mapeo cliente_origen → cliente_final
```

## Testing

### Archivo de Ejemplo
Se incluye `scripts/generate-ejemplo-normalization.mjs` que genera un archivo Excel con casos de prueba:

```bash
node scripts/generate-ejemplo-normalization.mjs
```

Casos incluidos:
- Clientes normales (Acme, Beta, Gamma)
- Clientes con "GRUPO" que se normalizan desde expediente
- Variantes del mismo cliente
- Normalización de sufijos

### Verificación Manual
En el dashboard, verificar que:
1. ✅ Columna "Cliente (Origen)" muestra valores originales
2. ✅ Columna "Cliente (Final)" muestra valores normalizados
3. ✅ Gráficos agrupan por `cliente_final`
4. ✅ Filtro de clientes muestra solo clientes únicos (por `cliente_final`)
5. ✅ Horas se suman correctamente para variantes del mismo cliente

## Consideraciones de Implementación

### Código Limpio
- Funciones pequeñas y reutilizables
- Nombres descriptivos
- Separación clara de responsabilidades

### Separación de Capas
- **normalizers.ts**: Lógica de transformación de datos
- **aggregations.ts**: Agregaciones y filtrado
- **clientNormalizationUtils.ts**: Utilidades BONUS y reportes
- **components/dashboard/**: Presentación

### Rendimiento
- No hay operaciones complejas (O(n) lineal)
- Regex compiladas implícitamente por JavaScript
- Mapas para O(1) lookups

### Compatibilidad
- Campo `cliente` mantiene compatibilidad hacia atrás
- Nuevos campos `cliente_origen` y `cliente_final` no rompen nada
- Fácil de desactivar/cambiar lógica en futuro

## Mejoras Futuras

1. **Machine Learning**: Detectar clientes automáticamente de expediente sin palabra "GRUPO"
2. **Validación**: Alertar si expediente no coincide con cliente
3. **Historico**: Guardar mapeo de variantes encontradas y reutilizar
4. **Configuración**: Permitir reglas de normalización personalizadas por usuario
5. **API**: Exponer funciones de normalización para uso externo

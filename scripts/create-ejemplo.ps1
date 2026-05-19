$tempDir = Join-Path $env:TEMP "ejemplo-xlsx-$(Get-Random)"
$xlDir = Join-Path $tempDir "xl"
$relsDir = Join-Path $tempDir "_rels"
$xlRelsDir = Join-Path $xlDir "_rels"
$wsDir = Join-Path $xlDir "worksheets"

New-Item -ItemType Directory -Force -Path $wsDir, $xlRelsDir, $relsDir | Out-Null

function Write-Utf8($path, $content) {
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
}

Write-Utf8 (Join-Path $tempDir "[Content_Types].xml") @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>
'@

Write-Utf8 (Join-Path $relsDir ".rels") @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
'@

Write-Utf8 (Join-Path $xlDir "workbook.xml") @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Enero" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
'@

Write-Utf8 (Join-Path $xlRelsDir "workbook.xml.rels") @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
</Relationships>
'@

$strings = @(
  "Fecha","Cliente","Cantidad","Descripcion","Propietario","Expediente",
  "15/01/2026","Acme Corp","2:30 h","Revision de contrato","Juan Perez","EXP-001",
  "16/01/2026","Beta SA","1:00 h","Llamada con cliente","Maria Lopez","EXP-002",
  "20/01/2026","Acme Corp","3:00 h","Redaccion de informe","Juan Perez","EXP-001",
  "22/01/2026","Gamma LLC","0:45 h","Consulta rapida","Juan Perez","",
  "28/01/2026","Beta SA","2:15 h","Preparacion de audiencia","Maria Lopez","EXP-003"
)

$si = ($strings | ForEach-Object { "<si><t>$_</t></si>" }) -join ""
Write-Utf8 (Join-Path $xlDir "sharedStrings.xml") "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><sst xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`" count=`"$($strings.Count)`" uniqueCount=`"$($strings.Count)`">$si</sst>"

$rows = @(
  @(0,1,2,3,4,5),
  @(6,7,8,9,10,11),
  @(12,13,14,15,16,17),
  @(18,19,20,21,22,23),
  @(24,25,26,27,28,29),
  @(30,31,32,33,34,35)
)

$sheetRows = ""
$rowNum = 1
foreach ($row in $rows) {
  $cells = ""
  $col = 0
  foreach ($sIdx in $row) {
    $colLetter = [char](65 + $col)
    $cells += "<c r=`"$colLetter$rowNum`" t=`"s`"><v>$sIdx</v></c>"
    $col++
  }
  $sheetRows += "<row r=`"$rowNum`">$cells</row>"
  $rowNum++
}

Write-Utf8 (Join-Path $wsDir "sheet1.xml") "<?xml version=`"1.0`" encoding=`"UTF-8`" standalone=`"yes`"?><worksheet xmlns=`"http://schemas.openxmlformats.org/spreadsheetml/2006/main`"><sheetData>$sheetRows</sheetData></worksheet>"

$publicDir = Join-Path (Split-Path $PSScriptRoot -Parent) "public"
New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
$outZip = Join-Path $env:TEMP "ejemplo-temp.zip"
$outXlsx = Join-Path $publicDir "ejemplo-enero.xlsx"
if (Test-Path $outZip) { Remove-Item $outZip -Force }
if (Test-Path $outXlsx) { Remove-Item $outXlsx -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $outZip -Force
Move-Item $outZip $outXlsx -Force
Remove-Item $tempDir -Recurse -Force
Write-Host "Creado: $outXlsx ($((Get-Item $outXlsx).Length) bytes)"

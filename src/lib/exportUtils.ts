/**
 * Utilitário para exportação de dados em CSV e Excel
 */

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

/**
 * Converte dados para CSV
 */
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string
): void {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar cabeçalho
  const headers = columns.map(col => col.label).join(',');
  
  // Criar linhas
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // Aplicar formatação se existir
      if (col.format && value !== null && value !== undefined) {
        value = col.format(value);
      }
      
      // Tratar valores nulos/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Escapar aspas e adicionar aspas se necessário
      value = String(value).replace(/"/g, '""');
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  // Combinar cabeçalho e linhas
  const csv = [headers, ...rows].join('\n');
  
  // Criar blob e download
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Converte dados para Excel (formato HTML que o Excel reconhece)
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Dados'
): void {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  // Criar cabeçalho
  const headers = columns.map(col => `<th>${col.label}</th>`).join('');
  
  // Criar linhas
  const rows = data.map(row => {
    const cells = columns.map(col => {
      let value = row[col.key];
      
      // Aplicar formatação se existir
      if (col.format && value !== null && value !== undefined) {
        value = col.format(value);
      }
      
      // Tratar valores nulos/undefined
      if (value === null || value === undefined) {
        value = '';
      }
      
      return `<td>${String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`;
    }).join('');
    
    return `<tr>${cells}</tr>`;
  }).join('');
  
  // Template HTML para Excel
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${sheetName}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #4472C4; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          tr:nth-child(even) { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${headers}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  // Criar blob e download
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Formata data para exportação
 */
export function formatDateForExport(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata valor monetário para exportação
 */
export function formatCurrencyForExport(value: string | number | null | undefined): string {
  if (!value) return 'R$ 0,00';
  
  const numValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9,.-]/g, '').replace(',', '.'))
    : value;
  
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return `R$ ${numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formata telefone para exportação
 */
export function formatPhoneForExport(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formata conforme o tamanho
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

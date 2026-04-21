import * as XLSX from 'xlsx'

/**
 * Export data to an Excel file and trigger download.
 * @param {Array<Object>} rows - Array of plain objects (each key = column header).
 * @param {string} sheetName - Name of the worksheet tab.
 * @param {string} fileName - Download filename (without extension).
 */
export function downloadExcel(rows, sheetName = 'Sheet1', fileName = 'export') {
  if (!rows || rows.length === 0) return

  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Auto-size columns based on content
  const colWidths = Object.keys(rows[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...rows.map((row) => String(row[key] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 50) }
  })
  worksheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

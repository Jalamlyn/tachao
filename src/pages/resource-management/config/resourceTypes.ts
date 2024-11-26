import { ResourceTypeConfig } from '../types';
import ExcelPreview from '../components/previews/ExcelPreview';
import WordPreview from '../components/previews/WordPreview';
import PDFPreview from '../components/previews/PDFPreview';

export const resourceTypes: ResourceTypeConfig = {
  excel: {
    id: 'excel',
    name: 'Excel表格',
    icon: 'mdi:file-excel',
    description: '支持.xlsx,.xls,.csv格式的Excel表格文件',
    previewComponent: ExcelPreview,
  },
  word: {
    id: 'word',
    name: 'Word文档',
    icon: 'mdi:file-word',
    description: '支持.docx,.doc格式的Word文档',
    previewComponent: WordPreview,
  },
  pdf: {
    id: 'pdf',
    name: 'PDF文档',
    icon: 'mdi:file-pdf',
    description: '支持.pdf格式的文档',
    previewComponent: PDFPreview,
  }
};
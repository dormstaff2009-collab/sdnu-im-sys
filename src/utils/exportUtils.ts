import type { Asset, AssetStatus } from '../types/asset';

// Format currency in THB
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format Thai Date
export function formatThaiDate(dateStr?: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear() + 543;
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

// Status styling helper
export function getStatusBadgeInfo(status: AssetStatus): {
  color: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case 'ใช้งานปกติ':
      return {
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'ใช้งานปกติ',
        dot: 'bg-emerald-500'
      };
    case 'อยู่ระหว่างซ่อม':
      return {
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'อยู่ระหว่างซ่อม',
        dot: 'bg-amber-500'
      };
    case 'ชำรุด':
      return {
        color: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'ชำรุด',
        dot: 'bg-rose-500'
      };
    case 'จำหน่ายแล้ว':
      return {
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        border: 'border-slate-300',
        text: 'จำหน่ายแล้ว',
        dot: 'bg-slate-400'
      };
    case 'สูญหาย':
      return {
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'สูญหาย',
        dot: 'bg-purple-500'
      };
    default:
      return {
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: status,
        dot: 'bg-slate-400'
      };
  }
}

// Export Assets to CSV
export function exportAssetsToCSV(assets: Asset[], filename = 'ครุภัณฑ์_ทะเบียนพัสดุ.csv') {
  const headers = [
    'เลขครุภัณฑ์',
    'ชื่อครุภัณฑ์',
    'ยี่ห้อ',
    'รุ่น',
    'หมายเลขซีเรียล',
    'หมวดครุภัณฑ์',
    'สถานที่ติดตั้ง/จัดเก็บ',
    'ผู้รับผิดชอบ',
    'สถานะ',
    'สภาพ',
    'ราคาจัดซื้อ (บาท)',
    'วันที่ได้มา',
    'ปีงบประมาณ',
    'แหล่งงบประมาณ',
    'ผู้ยืมปัจจุบัน',
    'ร้าน/ศูนย์ส่งซ่อม',
    'หมายเหตุ'
  ];

  const rows = assets.map(a => [
    `"${(a.assetNumber || '').replace(/"/g, '""')}"`,
    `"${(a.name || '').replace(/"/g, '""')}"`,
    `"${(a.brand || '').replace(/"/g, '""')}"`,
    `"${(a.model || '').replace(/"/g, '""')}"`,
    `"${(a.serialNumber || '').replace(/"/g, '""')}"`,
    `"${(a.category || '').replace(/"/g, '""')}"`,
    `"${(a.location || '').replace(/"/g, '""')}"`,
    `"${(a.responsiblePerson || '').replace(/"/g, '""')}"`,
    `"${(a.status || '').replace(/"/g, '""')}"`,
    `"${(a.condition || '').replace(/"/g, '""')}"`,
    a.price || 0,
    `"${a.acquiredDate || ''}"`,
    `"${a.fiscalYear || ''}"`,
    `"${(a.budgetSource || '').replace(/"/g, '""')}"`,
    `"${(a.borrower ? `${a.borrower.name} (${a.borrower.department})` : '').replace(/"/g, '""')}"`,
    `"${(a.repairInfo ? `${a.repairInfo.repairShop} (ส่ง: ${a.repairInfo.sendDate})` : '').replace(/"/g, '""')}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`
  ]);

  // UTF-8 BOM for Thai Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

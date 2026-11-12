export type AssetStatus = 
  | 'ใช้งานปกติ'
  | 'อยู่ระหว่างซ่อม'
  | 'ชำรุด'
  | 'จำหน่ายแล้ว'
  | 'สูญหาย';

export type AssetCondition = 
  | 'ดีมาก'
  | 'ดี/พร้อมใช้งาน'
  | 'พอใช้'
  | 'ชำรุดรอซ่อม'
  | 'ชำรุดซ่อมไม่ได้'
  | 'สูญหาย';

export interface BorrowerInfo {
  name: string;
  department: string;
  phone?: string;
  borrowDate: string;
  expectedReturnDate: string;
  purpose?: string;
}

export interface RepairInfo {
  repairShop: string;
  technicianName?: string;
  contactNumber?: string;
  sendDate: string;
  estimatedReturnDate?: string;
  issueDescription: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface Asset {
  id: string;
  assetNumber: string; // เลขครุภัณฑ์
  name: string; // ชื่อ
  brand: string; // ยี่ห้อ
  model: string; // รุ่น
  serialNumber: string; // Serial
  responsiblePerson: string; // ผู้รับผิดชอบ
  category: string; // หมวด
  location: string; // สถานที่
  status: AssetStatus; // สถานะ
  condition: AssetCondition; // สภาพ
  price: number; // มูลค่า/ราคา (บาท)
  acquiredDate: string; // วันที่ได้มา
  fiscalYear: string; // ปีงบประมาณ เช่น 2567
  budgetSource?: string; // แหล่งเงินงบประมาณ
  imageUrl?: string; // ภาพถ่าย
  notes?: string; // หมายเหตุ
  borrower?: BorrowerInfo | null;
  repairInfo?: RepairInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface LocationItem {
  id: string;
  name: string;
  building: string;
  floor?: string;
  room?: string;
  description?: string;
}

export type ActionType = 
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'TRANSFERRED'
  | 'BORROWED'
  | 'RETURNED'
  | 'REPAIR_SENT'
  | 'REPAIR_COMPLETED'
  | 'IMAGE_CHANGED'
  | 'STATUS_CHANGED';

export interface ActionLog {
  id: string;
  assetId: string;
  assetNumber: string;
  assetName: string;
  actionType: ActionType;
  details: string;
  officerName: string;
  timestamp: string;
}

export interface SystemSettings {
  organizationName: string;
  departmentName: string;
  officerPasscode: string; // default "admin123" or "123456"
  officerUsername: string; // default "officer"
  fiscalYearCurrent: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

export interface AppDataResponse {
  assets: Asset[];
  categories: Category[];
  locations: LocationItem[];
  logs: ActionLog[];
  settings: SystemSettings;
}

export interface DashboardStats {
  totalAssets: number;
  normalCount: number;
  repairCount: number;
  damagedCount: number;
  disposedCount: number;
  lostCount: number;
  totalCategories: number;
  totalLocations: number;
  totalValue: number;
  borrowedCount: number;
}

import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Plus, 
  Settings, 
  FileSpreadsheet, 
  Printer, 
  Layers, 
  Sparkles, 
  Trash2,
  FolderTree,
  QrCode,
  LayoutDashboard,
  Boxes,
  History,
  Eye,
  UserCheck
} from 'lucide-react';
import type { SystemSettings } from '../types/asset';

interface HeaderProps {
  settings: SystemSettings;
  isOfficer: boolean;
  activeTab: 'catalog' | 'dashboard' | 'logs' | 'labels';
  setActiveTab: (tab: 'catalog' | 'dashboard' | 'logs' | 'labels') => void;
  onOpenLogin: () => void;
  onInstantLogin?: () => void;
  onLogout: () => void;
  onOpenAddAsset: () => void;
  onOpenCategoriesLocations: () => void;
  onOpenSettings: () => void;
  onOpenPrintLabels: () => void;
  onExportCSV: () => void;
  onGenerateDemo: () => void;
  onClearDemo: () => void;
  totalAssetsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isOfficer,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onInstantLogin,
  onLogout,
  onOpenAddAsset,
  onOpenCategoriesLocations,
  onOpenSettings,
  onOpenPrintLabels,
  onExportCSV,
  onGenerateDemo,
  onClearDemo,
  totalAssetsCount
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-200">งานจัดการหอพักบุคลากร กองอาคารสถานที่ มหาวิทยาลัยนเรศวร</span>
            <span className="text-slate-500 hidden md:inline">|</span>
            <span className="text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-700/60 hidden md:inline-flex items-center gap-1">
              Cloud: sdnu-im-sys
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {isOfficer ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  โหมดเจ้าหน้าที่ (Officer / Admin)
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded"
                  title="ออกจากระบบเจ้าหน้าที่"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-slate-400 text-[11px]">
                  <Eye className="w-3 h-3 text-slate-400" />
                  โหมดตรวจสอบทั่วไป (Read-Only)
                </span>
                {onInstantLogin && (
                  <button
                    type="button"
                    onClick={onInstantLogin}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer shadow-xs"
                    title="เข้าสู่ระบบเจ้าหน้าที่ทันที (admin)"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-200" />
                    <span>⚡ เข้าสู่ระบบทันที (admin)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer shadow-xs"
                >
                  <Lock className="w-3 h-3 text-indigo-200" />
                  <span>เข้าสู่ระบบเจ้าหน้าที่ (admin / sdnu12345)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav & Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & System Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 flex-shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  ระบบบริหารจัดการและตรวจสอบพัสดุครุภัณฑ์ของหอพักบุคลากร
                </h1>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                  isOfficer 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {isOfficer ? '🛡️ โหมดเจ้าหน้าที่ (สิทธิ์เต็ม)' : '👁️ โหมดผู้เข้าใช้งานทั่วไป (ดูอย่างเดียว)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOfficer 
                  ? 'ระบบจัดการและตรวจสอบทะเบียนพัสดุ ครุภัณฑ์ ของหอพักบุคลากร มหาวิทยาลัยนเรศวร (สิทธิ์เพิ่ม-แก้ไข-ลบ-โอนย้าย-ยืม-ซ่อม)' 
                  : 'ระบบจัดการและตรวจสอบทะเบียนพัสดุ ครุภัณฑ์ ของหอพักบุคลากร มหาวิทยาลัยนเรศวร (ดูและสืบค้นข้อมูลเท่านั้น)'}
              </p>
            </div>
          </div>

          {/* Officer Fast Action Tools */}
          {isOfficer && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddAsset}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มครุภัณฑ์</span>
              </button>

              <button
                type="button"
                onClick={onOpenCategoriesLocations}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="จัดการหมวดและสถานที่"
              >
                <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">หมวด/สถานที่</span>
              </button>

              <button
                type="button"
                onClick={onOpenPrintLabels}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="พิมพ์ป้ายสติกเกอร์ QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">พิมพ์สติกเกอร์ QR</span>
              </button>

              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="ส่งออกไฟล์ CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                title="ตั้งค่าระบบ"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation & Mode Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100">
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              รายการครุภัณฑ์ ({totalAssetsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              แดชบอร์ดสรุปผล
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              ประวัติการดำเนินงาน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('labels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                activeTab === 'labels'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              พิมพ์ป้ายครุภัณฑ์ (Print Labels)
            </button>
          </nav>

          {/* Quick Demo Utilities (Always visible with clear state) */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium px-1 hidden sm:inline">ระบบทดสอบ:</span>
            <button
              type="button"
              onClick={onGenerateDemo}
              className="flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition cursor-pointer text-xs font-semibold shadow-2xs"
              title="สร้างข้อมูลตัวอย่างครุภัณฑ์ 12 รายการ"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>สร้าง Demo</span>
            </button>
            <button
              type="button"
              onClick={onClearDemo}
              className="flex items-center gap-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-md transition cursor-pointer text-xs font-bold shadow-2xs"
              title="ล้างข้อมูลครุภัณฑ์ทั้งหมด (Clear Demo)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>ล้าง Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


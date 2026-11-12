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
  History
} from 'lucide-react';
import type { SystemSettings } from '../types/asset';

interface HeaderProps {
  settings: SystemSettings;
  isOfficer: boolean;
  activeTab: 'catalog' | 'dashboard' | 'logs' | 'labels';
  setActiveTab: (tab: 'catalog' | 'dashboard' | 'logs' | 'labels') => void;
  onOpenLogin: () => void;
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

          <div className="flex items-center gap-3">
            {isOfficer ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  เจ้าหน้าที่เข้าสู่ระบบแล้ว
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer text-[11px]"
                  title="ออกจากระบบเจ้าหน้าที่"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer shadow-xs"
              >
                <Lock className="w-3 h-3" />
                เข้าสู่ระบบเจ้าหน้าที่ (Officer Login)
              </button>
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
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  ระบบบริหารจัดการและตรวจสอบพัสดุครุภัณฑ์ของหอพักบุคลากร
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  {isOfficer ? 'โหมดเจ้าหน้าที่' : 'โหมดตรวจสอบทั่วไป'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOfficer 
                  ? 'ระบบจัดการและตรวจสอบทะเบียนพัสดุ ครุภัณฑ์ ของหอพักบุคลากร มหาวิทยาลัยนเรศวร' 
                  : 'ระบบตรวจสอบครุภัณฑ์และสืบค้นข้อมูลพัสดุ (Read-Only) สำหรับบุคคลทั่วไป'}
              </p>
            </div>
          </div>

          {/* Officer Fast Action Tools */}
          {isOfficer && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAddAsset}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มครุภัณฑ์</span>
              </button>

              <button
                onClick={onOpenCategoriesLocations}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="จัดการหมวดและสถานที่"
              >
                <FolderTree className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">หมวด/สถานที่</span>
              </button>

              <button
                onClick={onOpenPrintLabels}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="พิมพ์ป้ายสติกเกอร์ QR Code"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">พิมพ์สติกเกอร์ QR</span>
              </button>

              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                title="ส่งออกไฟล์ CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
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

          {/* Quick Demo Utilities for Officer */}
          {isOfficer && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] hidden lg:inline">ตัวช่วยทดสอบ:</span>
              <button
                onClick={onGenerateDemo}
                className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer text-xs"
                title="สร้างข้อมูลตัวอย่างครุภัณฑ์ 12 รายการ"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>สร้าง Demo</span>
              </button>
              <button
                onClick={onClearDemo}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition cursor-pointer text-xs"
                title="ล้างข้อมูลครุภัณฑ์ทั้งหมด"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>ล้าง Demo</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

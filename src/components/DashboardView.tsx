import React, { useState } from 'react';
import { 
  Boxes, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Archive, 
  HelpCircle, 
  FolderTree, 
  MapPin, 
  Coins, 
  ArrowRight,
  PieChart as PieIcon,
  BarChart3,
  Flame,
  Cloud
} from 'lucide-react';
import type { Asset, Category, LocationItem } from '../types/asset';
import { formatCurrency } from '../utils/exportUtils';
import { PieChart, PieChartItem } from './PieChart';

interface DashboardViewProps {
  assets: Asset[];
  categories: Category[];
  locations: LocationItem[];
  onSelectFilter: (type: 'status' | 'category' | 'location', value: string) => void;
  isCloudSynced?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  categories,
  locations,
  onSelectFilter,
  isCloudSynced = true
}) => {
  const [metricMode, setMetricMode] = useState<'count' | 'value'>('count');

  // Core Counts
  const totalAssets = assets.length;
  const normalCount = assets.filter(a => a.status === 'ใช้งานปกติ').length;
  const repairCount = assets.filter(a => a.status === 'อยู่ระหว่างซ่อม').length;
  const damagedCount = assets.filter(a => a.status === 'ชำรุด').length;
  const disposedCount = assets.filter(a => a.status === 'จำหน่ายแล้ว').length;
  const lostCount = assets.filter(a => a.status === 'สูญหาย').length;
  const totalCategories = categories.length;
  const totalLocations = locations.length;
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const borrowedCount = assets.filter(a => !!a.borrower).length;

  // 1. Data for Status Pie Chart
  const statusValues: Record<string, number> = {
    'ใช้งานปกติ': assets.filter(a => a.status === 'ใช้งานปกติ').reduce((s, a) => s + (metricMode === 'value' ? Number(a.price) || 0 : 1), 0),
    'อยู่ระหว่างซ่อม': assets.filter(a => a.status === 'อยู่ระหว่างซ่อม').reduce((s, a) => s + (metricMode === 'value' ? Number(a.price) || 0 : 1), 0),
    'ชำรุด': assets.filter(a => a.status === 'ชำรุด').reduce((s, a) => s + (metricMode === 'value' ? Number(a.price) || 0 : 1), 0),
    'จำหน่ายแล้ว': assets.filter(a => a.status === 'จำหน่ายแล้ว').reduce((s, a) => s + (metricMode === 'value' ? Number(a.price) || 0 : 1), 0),
    'สูญหาย': assets.filter(a => a.status === 'สูญหาย').reduce((s, a) => s + (metricMode === 'value' ? Number(a.price) || 0 : 1), 0)
  };

  const statusPieData: PieChartItem[] = [
    {
      id: 'st-1',
      label: 'ใช้งานปกติ',
      value: statusValues['ใช้งานปกติ'],
      secondaryValue: assets.filter(a => a.status === 'ใช้งานปกติ').reduce((s, a) => s + (Number(a.price) || 0), 0),
      color: '#10b981' // emerald-500
    },
    {
      id: 'st-2',
      label: 'อยู่ระหว่างซ่อม',
      value: statusValues['อยู่ระหว่างซ่อม'],
      secondaryValue: assets.filter(a => a.status === 'อยู่ระหว่างซ่อม').reduce((s, a) => s + (Number(a.price) || 0), 0),
      color: '#f59e0b' // amber-500
    },
    {
      id: 'st-3',
      label: 'ชำรุด',
      value: statusValues['ชำรุด'],
      secondaryValue: assets.filter(a => a.status === 'ชำรุด').reduce((s, a) => s + (Number(a.price) || 0), 0),
      color: '#f43f5e' // rose-500
    },
    {
      id: 'st-4',
      label: 'จำหน่ายแล้ว',
      value: statusValues['จำหน่ายแล้ว'],
      secondaryValue: assets.filter(a => a.status === 'จำหน่ายแล้ว').reduce((s, a) => s + (Number(a.price) || 0), 0),
      color: '#64748b' // slate-500
    },
    {
      id: 'st-5',
      label: 'สูญหาย',
      value: statusValues['สูญหาย'],
      secondaryValue: assets.filter(a => a.status === 'สูญหาย').reduce((s, a) => s + (Number(a.price) || 0), 0),
      color: '#a855f7' // purple-500
    }
  ];

  // 2. Data for Category Pie Chart
  const categoryPalette = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // purple
    '#f97316', // orange
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#14b8a6', // teal
    '#eab308'  // yellow
  ];

  const categoryPieData: PieChartItem[] = categories.map((cat, idx) => {
    const catAssets = assets.filter(a => a.category === cat.name);
    const count = catAssets.length;
    const catTotalValue = catAssets.reduce((s, a) => s + (Number(a.price) || 0), 0);

    return {
      id: cat.id,
      label: `${cat.name}`,
      value: metricMode === 'value' ? catTotalValue : count,
      secondaryValue: catTotalValue,
      color: categoryPalette[idx % categoryPalette.length]
    };
  }).filter(c => c.value > 0);

  // 3. Data for Condition Pie Chart
  const conditionPalette: Record<string, string> = {
    'ดีมาก': '#059669',
    'ดี/พร้อมใช้งาน': '#10b981',
    'พอใช้': '#0284c7',
    'ชำรุดรอซ่อม': '#d97706',
    'ชำรุดซ่อมไม่ได้': '#e11d48',
    'สูญหาย': '#7c3aed'
  };

  const conditions = ['ดีมาก', 'ดี/พร้อมใช้งาน', 'พอใช้', 'ชำรุดรอซ่อม', 'ชำรุดซ่อมไม่ได้', 'สูญหาย'];
  const conditionPieData: PieChartItem[] = conditions.map(cond => {
    const condAssets = assets.filter(a => a.condition === cond);
    const count = condAssets.length;
    const condTotalValue = condAssets.reduce((s, a) => s + (Number(a.price) || 0), 0);

    return {
      id: `cond-${cond}`,
      label: cond,
      value: metricMode === 'value' ? condTotalValue : count,
      secondaryValue: condTotalValue,
      color: conditionPalette[cond] || '#94a3b8'
    };
  }).filter(c => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Overview Intro Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-300">
              ระบบรายงานภาพรวมพัสดุและสินทรัพย์
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              <Cloud className="w-3 h-3 text-emerald-400" />
              เชื่อมต่อ Firebase: sdnu-im-sys
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white">
            ภาพรวมสถานะและสรุปผลแผนภูมิวงกลมครุภัณฑ์
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            ติดตามสถานะพัสดุครุภัณฑ์ การส่งซ่อมบำรุง และสัดส่วนมูลค่าสินทรัพย์แบบ Interactive Charts เชื่อมต่อข้อมูลเรียลไทม์กับ Google Cloud Firestore
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-slate-400">มูลค่ารวมพัสดุ (Total Value)</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-0.5">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">ครุภัณฑ์ทั้งหมด</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {totalAssets.toLocaleString()} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">พร้อมใช้งาน</div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-300 mt-0.5">
              {totalAssets > 0 ? Math.round((normalCount / totalAssets) * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400">อยู่ระหว่างยืมใช้งาน</div>
            <div className="text-xl sm:text-2xl font-bold text-sky-300 mt-0.5">
              {borrowedCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Required 9 Core Metric Cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          สถิติสถานะครุภัณฑ์ (Asset Status & Taxonomy Metrics)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {/* 1. ครุภัณฑ์ทั้งหมด */}
          <div 
            onClick={() => onSelectFilter('status', 'ALL')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">ครุภัณฑ์ทั้งหมด</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {totalAssets.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>ทะเบียนในระบบ</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
            </div>
          </div>

          {/* 2. ใช้งานปกติ */}
          <div 
            onClick={() => onSelectFilter('status', 'ใช้งานปกติ')}
            className="bg-white p-5 rounded-xl border border-emerald-200 shadow-2xs hover:border-emerald-400 hover:shadow-sm transition cursor-pointer group bg-emerald-50/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">ใช้งานปกติ</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {normalCount.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600/80 mt-1 flex items-center justify-between">
              <span>{totalAssets > 0 ? ((normalCount / totalAssets) * 100).toFixed(1) : 0}% ของทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 3. อยู่ระหว่างซ่อม */}
          <div 
            onClick={() => onSelectFilter('status', 'อยู่ระหว่างซ่อม')}
            className="bg-white p-5 rounded-xl border border-amber-200 shadow-2xs hover:border-amber-400 hover:shadow-sm transition cursor-pointer group bg-amber-50/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-800">อยู่ระหว่างซ่อม</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700 mt-2">
              {repairCount.toLocaleString()}
            </div>
            <div className="text-xs text-amber-600/80 mt-1 flex items-center justify-between">
              <span>ส่งซ่อมศูนย์/ช่าง</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 4. ชำรุด */}
          <div 
            onClick={() => onSelectFilter('status', 'ชำรุด')}
            className="bg-white p-5 rounded-xl border border-rose-200 shadow-2xs hover:border-rose-400 hover:shadow-sm transition cursor-pointer group bg-rose-50/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-800">ชำรุด</span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-2">
              {damagedCount.toLocaleString()}
            </div>
            <div className="text-xs text-rose-600/80 mt-1 flex items-center justify-between">
              <span>รอตรวจซ่อม/จำหน่าย</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 5. จำหน่ายแล้ว */}
          <div 
            onClick={() => onSelectFilter('status', 'จำหน่ายแล้ว')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-400 hover:shadow-sm transition cursor-pointer group bg-slate-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">จำหน่ายแล้ว</span>
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <Archive className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700 mt-2">
              {disposedCount.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>ตัดบัญชีพัสดุ</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 6. สูญหาย */}
          <div 
            onClick={() => onSelectFilter('status', 'สูญหาย')}
            className="bg-white p-5 rounded-xl border border-purple-200 shadow-2xs hover:border-purple-400 hover:shadow-sm transition cursor-pointer group bg-purple-50/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-purple-800">สูญหาย</span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">
              {lostCount.toLocaleString()}
            </div>
            <div className="text-xs text-purple-600/80 mt-1 flex items-center justify-between">
              <span>แจ้งความ/สอบข้อเท็จจริง</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* 7. จำนวนหมวด */}
          <div 
            onClick={() => onSelectFilter('category', 'ALL')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">จำนวนหมวด</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderTree className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {totalCategories.toLocaleString()} <span className="text-xs font-normal text-slate-500">หมวด</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>ตามมาตรฐานบัญชีพัสดุ</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
            </div>
          </div>

          {/* 8. จำนวนสถานที่ */}
          <div 
            onClick={() => onSelectFilter('location', 'ALL')}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">จำนวนสถานที่</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {totalLocations.toLocaleString()} <span className="text-xs font-normal text-slate-500">จุดติดตั้ง</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>อาคารและห้องจัดเก็บ</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600" />
            </div>
          </div>

          {/* 9. มูลค่ารวม */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">มูลค่ารวมทั้งสิ้น</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              ราคาจัดซื้อสะสมทั้งหมด
            </div>
          </div>
        </div>
      </div>

      {/* ======================== PIE CHARTS SECTION ======================== */}
      <div className="space-y-4">
        {/* Section Header with Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                การสรุปผลและแสดงผลเป็นแผนภูมิวงกลม (Pie & Donut Charts)
              </h3>
              <p className="text-xs text-slate-500">
                วิเคราะห์สัดส่วนข้อมูลครุภัณฑ์แบบเข้าใจง่าย ชี้เพื่อดูตัวเลข และคลิกเพื่อเจาะลึกข้อมูล
              </p>
            </div>
          </div>

          {/* Metric Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setMetricMode('count')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                metricMode === 'count'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัดส่วนตามจำนวนชิ้น (Count)
            </button>
            <button
              onClick={() => setMetricMode('value')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                metricMode === 'value'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สัดส่วนตามมูลค่าบาท (THB Value)
            </button>
          </div>
        </div>

        {/* 3 Pie Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 1. Status Pie Chart */}
          <PieChart
            title="1. สัดส่วนตามสถานะการใช้งาน"
            subtitle="จำแนกตามสถานะปกติ ซ่อม ชำรุด จำหน่าย และสูญหาย"
            data={statusPieData}
            totalLabel={metricMode === 'value' ? 'มูลค่ารวม' : 'ครุภัณฑ์ทั้งหมด'}
            valueUnit={metricMode === 'value' ? 'บาท' : 'รายการ'}
            isCurrency={metricMode === 'value'}
            onSliceClick={(item) => onSelectFilter('status', item.label)}
          />

          {/* 2. Category Pie Chart */}
          <PieChart
            title="2. สัดส่วนตามหมวดหมู่ครุภัณฑ์"
            subtitle="จำแนกตามหมวดคอมพิวเตอร์ สำนักงาน วิทยาศาสตร์ ฯลฯ"
            data={categoryPieData}
            totalLabel={metricMode === 'value' ? 'มูลค่ารวม' : 'ครุภัณฑ์ทั้งหมด'}
            valueUnit={metricMode === 'value' ? 'บาท' : 'รายการ'}
            isCurrency={metricMode === 'value'}
            onSliceClick={(item) => onSelectFilter('category', item.label)}
          />

          {/* 3. Condition Pie Chart */}
          <PieChart
            title="3. สัดส่วนตามสภาพความสมบูรณ์"
            subtitle="จำแนกตามสภาพดีมาก ดี พอใช้ ชำรุดรอซ่อม"
            data={conditionPieData}
            totalLabel={metricMode === 'value' ? 'มูลค่ารวม' : 'ครุภัณฑ์ทั้งหมด'}
            valueUnit={metricMode === 'value' ? 'บาท' : 'รายการ'}
            isCurrency={metricMode === 'value'}
            onSliceClick={(item) => onSelectFilter('status', 'ALL')}
          />
        </div>
      </div>
    </div>
  );
};

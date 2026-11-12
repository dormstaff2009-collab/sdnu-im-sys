import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ArrowRightLeft, 
  Calendar, 
  RotateCcw, 
  Wrench, 
  Plus, 
  Edit3, 
  Trash2, 
  Camera,
  Filter
} from 'lucide-react';
import type { ActionLog, ActionType } from '../types/asset';
import { formatThaiDate } from '../utils/exportUtils';

interface LogsViewProps {
  logs: ActionLog[];
}

export const LogsView: React.FC<LogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const getActionBadge = (type: ActionType) => {
    switch (type) {
      case 'CREATED':
        return { label: 'เพิ่มครุภัณฑ์', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Plus };
      case 'UPDATED':
        return { label: 'แก้ไขข้อมูล', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Edit3 };
      case 'DELETED':
        return { label: 'ลบรายการ', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: Trash2 };
      case 'TRANSFERRED':
        return { label: 'ย้ายสถานที่', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: ArrowRightLeft };
      case 'BORROWED':
        return { label: 'ยืมครุภัณฑ์', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Calendar };
      case 'RETURNED':
        return { label: 'คืนครุภัณฑ์', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: RotateCcw };
      case 'REPAIR_SENT':
        return { label: 'ส่งซ่อม', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Wrench };
      case 'REPAIR_COMPLETED':
        return { label: 'ซ่อมเสร็จสิ้น', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Wrench };
      case 'IMAGE_CHANGED':
        return { label: 'จัดการรูปภาพ', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Camera };
      default:
        return { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: History };
    }
  };

  const filteredLogs = logs.filter(log => {
    if (typeFilter !== 'ALL' && log.actionType !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchNum = log.assetNumber.toLowerCase().includes(q);
      const matchName = log.assetName.toLowerCase().includes(q);
      const matchDet = log.details.toLowerCase().includes(q);
      const matchOfficer = log.officerName.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchDet && !matchOfficer) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาตามเลขครุภัณฑ์, รายละเอียด, ผู้ดำเนินการ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">ทุกประเภทการดำเนินงาน</option>
            <option value="TRANSFERRED">ย้ายสถานที่ (Transfer)</option>
            <option value="BORROWED">ยืมครุภัณฑ์ (Borrow)</option>
            <option value="RETURNED">คืนครุภัณฑ์ (Return)</option>
            <option value="REPAIR_SENT">ส่งซ่อม (Repair Sent)</option>
            <option value="REPAIR_COMPLETED">ซ่อมเสร็จ (Repair Complete)</option>
            <option value="CREATED">เพิ่มครุภัณฑ์ใหม่</option>
            <option value="UPDATED">แก้ไขข้อมูล</option>
          </select>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>ไม่พบประวัติการดำเนินงานที่ตรงกับเงื่อนไข</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const badge = getActionBadge(log.actionType);
              const Icon = badge.icon;
              return (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono font-bold text-blue-700">
                          {log.assetNumber}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {log.assetName}
                        </span>
                      </div>

                      <div className="text-slate-600 leading-relaxed pt-0.5">
                        {log.details}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>ผู้บันทึก: {log.officerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400 text-[11px] font-mono whitespace-nowrap self-end sm:self-start">
                    {formatThaiDate(log.timestamp)} {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

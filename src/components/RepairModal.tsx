import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, Building, DollarSign } from 'lucide-react';
import type { Asset } from '../types/asset';
import { formatCurrency, formatThaiDate } from '../utils/exportUtils';

interface RepairModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    assetId: string;
    actionType: 'SEND' | 'COMPLETE';
    repairShop?: string;
    technicianName?: string;
    contactNumber?: string;
    sendDate?: string;
    estimatedReturnDate?: string;
    issueDescription?: string;
    cost?: number;
  }) => Promise<boolean>;
}

export const RepairModal: React.FC<RepairModalProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirm
}) => {
  const isAlreadyUnderRepair = asset?.status === 'อยู่ระหว่างซ่อม';
  const [mode, setMode] = useState<'SEND' | 'COMPLETE'>(isAlreadyUnderRepair ? 'COMPLETE' : 'SEND');
  
  // Send form states
  const [repairShop, setRepairShop] = useState(asset?.repairInfo?.repairShop || '');
  const [technicianName, setTechnicianName] = useState(asset?.repairInfo?.technicianName || '');
  const [contactNumber, setContactNumber] = useState(asset?.repairInfo?.contactNumber || '');
  const [sendDate, setSendDate] = useState(asset?.repairInfo?.sendDate || new Date().toISOString().split('T')[0]);
  const [estimatedReturnDate, setEstimatedReturnDate] = useState(asset?.repairInfo?.estimatedReturnDate || '');
  const [issueDescription, setIssueDescription] = useState(asset?.repairInfo?.issueDescription || '');
  const [estimatedCost, setEstimatedCost] = useState(asset?.repairInfo?.estimatedCost ? asset.repairInfo.estimatedCost.toString() : '');

  // Complete form states
  const [actualCost, setActualCost] = useState(asset?.repairInfo?.estimatedCost ? asset.repairInfo.estimatedCost.toString() : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (asset?.status === 'อยู่ระหว่างซ่อม') {
      setMode('COMPLETE');
    } else {
      setMode('SEND');
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let success = false;
    if (mode === 'SEND') {
      success = await onConfirm({
        assetId: asset.id,
        actionType: 'SEND',
        repairShop: repairShop.trim() || 'ศูนย์ซ่อมภายนอก',
        technicianName: technicianName.trim(),
        contactNumber: contactNumber.trim(),
        sendDate,
        estimatedReturnDate,
        issueDescription: issueDescription.trim(),
        cost: Number(estimatedCost) || 0
      });
    } else {
      success = await onConfirm({
        assetId: asset.id,
        actionType: 'COMPLETE',
        cost: Number(actualCost) || 0
      });
    }

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {mode === 'SEND' ? 'บันทึกส่งซ่อมบำรุงครุภัณฑ์' : 'บันทึกซ่อมบำรุงเสร็จสิ้น / รับคืน'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher if already under repair */}
        {isAlreadyUnderRepair && (
          <div className="flex p-1 bg-slate-100 mx-5 mt-4 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMode('COMPLETE')}
              className={`flex-1 py-1.5 font-medium rounded-md transition ${mode === 'COMPLETE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
            >
              ซ่อมเสร็จสิ้น (คืนสู่สถานะปกติ)
            </button>
            <button
              type="button"
              onClick={() => setMode('SEND')}
              className={`flex-1 py-1.5 font-medium rounded-md transition ${mode === 'SEND' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
            >
              แก้ไขข้อมูลการส่งซ่อม
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-mono font-bold text-blue-700">{asset.assetNumber}</div>
            <div className="font-semibold text-slate-800 text-sm">{asset.name}</div>
            <div className="text-slate-500 text-[11px]">สถานะปัจจุบัน: <strong>{asset.status}</strong></div>
          </div>

          {mode === 'SEND' ? (
            <>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อศูนย์บริการ / ร้านซ่อม / ผู้รับซ่อม <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={repairShop}
                  onChange={(e) => setRepairShop(e.target.value)}
                  placeholder="เช่น บริษัท เอปสัน เซอร์วิส หรือ ช่างวิเชียร"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">ชื่อช่าง / ผู้ประสานงาน</label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="เช่น ช่างสมหมาย"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เบอร์ติดต่อศูนย์ซ่อม</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="02-xxx-xxxx"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">วันที่ส่งซ่อม</label>
                  <input
                    type="date"
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">คาดว่าจะแล้วเสร็จ</label>
                  <input
                    type="date"
                    value={estimatedReturnDate}
                    onChange={(e) => setEstimatedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  อาการชำรุด / รายการที่ต้องซ่อม <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="ระบุอาการชำรุด เช่น เปิดไม่ติด พัดลมเสียงดัง เมนบอร์ดช็อต..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ประมาณการค่าซ่อม (บาท)</label>
                <input
                  type="number"
                  min="0"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="เช่น 4500"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs leading-relaxed">
                การบันทึกนี้จะเปลี่ยนสถานะครุภัณฑ์กลับมาเป็น <strong>&quot;ใช้งานปกติ&quot;</strong> และสภาพ <strong>&quot;ดี/พร้อมใช้งาน&quot;</strong> พร้อมบันทึกประวัติการซ่อมบำรุง
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ค่าใช้จ่ายในการซ่อมจริง (บาท)
                </label>
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg font-medium shadow-xs transition disabled:opacity-50 ${
                mode === 'SEND' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? 'กำลังบันทึก...' : mode === 'SEND' ? 'ยืนยันการส่งซ่อม' : 'บันทึกซ่อมเสร็จสิ้น'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

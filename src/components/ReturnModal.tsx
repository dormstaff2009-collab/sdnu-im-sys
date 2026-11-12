import React, { useState } from 'react';
import { X, CheckCircle, RotateCcw } from 'lucide-react';
import type { Asset, AssetCondition } from '../types/asset';

interface ReturnModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assetId: string, returnCondition: AssetCondition, notes: string) => Promise<boolean>;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [returnCondition, setReturnCondition] = useState<AssetCondition>('ดี/พร้อมใช้งาน');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onConfirm(asset.id, returnCondition, notes);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">บันทึกรับคืนครุภัณฑ์</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-mono font-bold text-blue-700">{asset.assetNumber}</div>
            <div className="font-semibold text-slate-800 text-sm">{asset.name}</div>
            {asset.borrower && (
              <div className="text-slate-600 mt-1">
                ผู้ยืม: <strong>{asset.borrower.name}</strong> ({asset.borrower.department})
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              ประเมินสภาพพัสดุเมื่อรับคืน <span className="text-rose-500">*</span>
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ดีมาก">ดีมาก (สมบูรณ์ 100%)</option>
              <option value="ดี/พร้อมใช้งาน">ดี/พร้อมใช้งาน</option>
              <option value="พอใช้">พอใช้ (มีรอยขีดข่วนเล็กน้อย)</option>
              <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม</option>
              <option value="ชำรุดซ่อมไม่ได้">ชำรุดเสียหายหนัก</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              หมายเหตุการรับคืน / ข้อสังเกต
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ตรวจสอบอุปกรณ์ครบถ้วน ทำความสะอาดก่อนจัดเก็บ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันรับคืนครุภัณฑ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

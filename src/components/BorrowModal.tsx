import React, { useState } from 'react';
import { X, Calendar, User, Phone, FileText } from 'lucide-react';
import type { Asset, BorrowerInfo } from '../types/asset';

interface BorrowModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assetId: string, borrowerData: BorrowerInfo) => Promise<boolean>;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) return;

    setIsSubmitting(true);
    const success = await onConfirm(asset.id, {
      name: name.trim(),
      department: department.trim(),
      phone: phone.trim(),
      borrowDate,
      expectedReturnDate,
      purpose: purpose.trim()
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-sm">บันทึกการยืมครุภัณฑ์</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-mono font-bold text-blue-700">{asset.assetNumber}</div>
            <div className="font-semibold text-slate-800 text-sm">{asset.name}</div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              ชื่อผู้ขอยืม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น นายกิตติศักดิ์ พานิช"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                สังกัด / แผนก <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น กองวิจัยและพัฒนา"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">วันที่ยืม</label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">กำหนดส่งคืน</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">วัตถุประสงค์ในการขอยืม</label>
            <textarea
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น ใช้ในการจัดนิทรรศการวิชาการ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการให้ยืม'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

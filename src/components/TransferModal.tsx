import React, { useState } from 'react';
import { X, ArrowRightLeft, MapPin } from 'lucide-react';
import type { Asset, LocationItem } from '../types/asset';

interface TransferModalProps {
  asset: Asset | null;
  locations: LocationItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (assetId: string, newLocation: string, reason: string) => Promise<boolean>;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  asset,
  locations,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [newLocation, setNewLocation] = useState(locations[0]?.name || '');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation) return;
    setIsSubmitting(true);
    const success = await onConfirm(asset.id, newLocation, reason);
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-sm">ย้ายสถานที่จัดเก็บ/ติดตั้งครุภัณฑ์</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="font-mono font-bold text-blue-700">{asset.assetNumber}</div>
            <div className="font-semibold text-slate-800 text-sm">{asset.name}</div>
            <div className="text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>สถานที่ปัจจุบัน: <strong>{asset.location}</strong></span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              สถานที่ปลายทางใหม่ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                list="transfer-locations-list"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="พิมพ์สถานที่ปลายทาง เช่น ห้องเรียน 401 อาคาร 3"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              <datalist id="transfer-locations-list">
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name} />
                ))}
              </datalist>
            </div>
            {locations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                <span className="text-[10px] text-slate-400">เลือกด่วน:</span>
                {locations.filter(l => l.name !== asset.location).slice(0, 4).map(loc => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setNewLocation(loc.name)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer truncate max-w-[130px] ${
                      newLocation === loc.name
                        ? 'bg-teal-50 text-teal-700 border-teal-300 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              เหตุผลในการย้ายสถานที่ / คำสั่งโอนย้าย
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ย้ายตามคำขอปรับปรุงห้องเรียน หรือ ตามบันทึกข้อความ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
              disabled={isSubmitting || newLocation === asset.location}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการย้าย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

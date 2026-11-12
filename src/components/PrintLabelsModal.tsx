import React, { useState, useEffect } from 'react';
import { X, Printer, QrCode, FileText, CheckSquare, Square, Download } from 'lucide-react';
import QRCode from 'qrcode';
import type { Asset, SystemSettings } from '../types/asset';

interface PrintLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  settings: SystemSettings;
}

export const PrintLabelsModal: React.FC<PrintLabelsModalProps> = ({
  isOpen,
  onClose,
  assets,
  settings
}) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set(assets.map(a => a.id)));
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [labelSize, setLabelSize] = useState<'medium' | 'small' | 'large'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR codes for selected assets
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsGenerating(true);

    const generateQRs = async () => {
      const qrs: Record<string, string> = {};
      for (const asset of assets) {
        if (!active) break;
        try {
          const payload = JSON.stringify({
            assetNumber: asset.assetNumber,
            name: asset.name,
            location: asset.location,
            fiscalYear: asset.fiscalYear
          });
          const url = await QRCode.toDataURL(payload, {
            width: 140,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' }
          });
          qrs[asset.id] = url;
        } catch (e) {
          console.error(e);
        }
      }
      if (active) {
        setQrCodes(qrs);
        setIsGenerating(false);
      }
    };

    generateQRs();

    return () => {
      active = false;
    };
  }, [isOpen, assets]);

  if (!isOpen) return null;

  const toggleSelectAsset = (id: string) => {
    const next = new Set(selectedAssetIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedAssetIds(next);
  };

  const selectAll = () => {
    setSelectedAssetIds(new Set(assets.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedAssetIds(new Set());
  };

  const printableAssets = assets.filter(a => selectedAssetIds.has(a.id));

  // Trigger Print Window
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              พิมพ์ป้ายสติกเกอร์ครุภัณฑ์ (Asset Labels & QR Code Sheets)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              พิมพ์แผ่นสติกเกอร์บาร์โค้ดและ QR Code สำหรับติดประจำตัวพัสดุครุภัณฑ์
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={printableAssets.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ ({printableAssets.length} ดวง)</span>
            </button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Options & Selection */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-100/60 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-3">
            <span className="text-slate-600 font-medium">เลือกพิมพ์:</span>
            <button
              onClick={selectAll}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer"
            >
              เลือกทั้งหมด ({assets.length})
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={deselectAll}
              className="text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
            >
              ยกเลิกทั้งหมด
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">ขนาดป้าย:</span>
            <div className="flex bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setLabelSize('small')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${labelSize === 'small' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                ขนาดเล็ก (A4 3x7)
              </button>
              <button
                onClick={() => setLabelSize('medium')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${labelSize === 'medium' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                ขนาดมาตรฐาน (A4 2x4)
              </button>
              <button
                onClick={() => setLabelSize('large')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${labelSize === 'large' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
              >
                ขนาดใหญ่ (A4 1x3)
              </button>
            </div>
          </div>
        </div>

        {/* Print Preview & Selection Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/50">
          {printableAssets.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-slate-500 max-w-md mx-auto my-12">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-semibold text-slate-700">ไม่ได้เลือกรายการใดไว้</div>
              <p className="text-xs text-slate-400 mt-1">กรุณากดเลือกรายการครุภัณฑ์ที่ต้องการพิมพ์ป้ายสติกเกอร์</p>
            </div>
          ) : (
            <div className={`grid gap-4 bg-white p-6 rounded-xl shadow-xs border border-slate-300 mx-auto max-w-[850px] ${
              labelSize === 'small' 
                ? 'grid-cols-2 sm:grid-cols-3' 
                : labelSize === 'medium'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1'
            }`}>
              {printableAssets.map(asset => {
                const qrUrl = qrCodes[asset.id];
                return (
                  <div
                    key={asset.id}
                    className="border-2 border-slate-800 rounded-lg p-3 bg-white flex gap-3 relative select-none"
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    {/* QR Code Column */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex flex-col items-center justify-center border-r border-slate-200 pr-2">
                      {qrUrl ? (
                        <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                          QR...
                        </div>
                      )}
                      <span className="text-[8px] text-slate-500 tracking-tighter">สแกนตรวจสอบ</span>
                    </div>

                    {/* Label Details Column */}
                    <div className="flex-1 text-[11px] leading-tight flex flex-col justify-between overflow-hidden">
                      <div>
                        {/* Org Header */}
                        <div className="text-[9px] font-bold text-slate-600 truncate border-b border-slate-200 pb-0.5">
                          {settings.organizationName || 'ทะเบียนพัสดุและครุภัณฑ์'}
                        </div>

                        {/* Asset Code */}
                        <div className="text-sm font-bold font-mono text-blue-900 mt-1 truncate">
                          {asset.assetNumber}
                        </div>

                        {/* Name */}
                        <div className="font-semibold text-slate-900 line-clamp-1 mt-0.5 text-xs" title={asset.name}>
                          {asset.name}
                        </div>

                        {/* Brand / Model */}
                        <div className="text-slate-500 text-[10px] truncate mt-0.5">
                          {asset.brand} {asset.model !== '-' ? asset.model : ''}
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                        <span className="truncate max-w-[120px]">{asset.location}</span>
                        <span>ปี {asset.fiscalYear}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

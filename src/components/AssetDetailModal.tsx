import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  User, 
  Tag, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  Camera, 
  Upload, 
  Trash2, 
  ExternalLink,
  QrCode as QrIcon,
  ArrowRightLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';
import QRCode from 'qrcode';
import type { Asset } from '../types/asset';
import { formatCurrency, formatThaiDate, getStatusBadgeInfo } from '../utils/exportUtils';

interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
  isOfficer: boolean;
  onEdit?: (asset: Asset) => void;
  onTransfer?: (asset: Asset) => void;
  onBorrow?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
  onRepair?: (asset: Asset) => void;
  onOpenCamera?: (asset: Asset) => void;
  onUploadImage?: (asset: Asset) => void;
  onDeleteImage?: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  isOfficer,
  onEdit,
  onTransfer,
  onBorrow,
  onReturn,
  onRepair,
  onOpenCamera,
  onUploadImage,
  onDeleteImage
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (asset) {
      // Generate QR code for this asset
      const qrPayload = JSON.stringify({
        assetNumber: asset.assetNumber,
        name: asset.name,
        category: asset.category,
        location: asset.location,
        status: asset.status
      });

      QRCode.toDataURL(qrPayload, {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed generating QR Code:', err));
    }
  }, [asset]);

  if (!asset) return null;

  const badge = getStatusBadgeInfo(asset.status);

  // Individual print function
  const handlePrintSingleLabel = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ป้ายครุภัณฑ์ - ${asset.assetNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
            .label-card {
              border: 2px solid #0f172a;
              border-radius: 8px;
              padding: 16px;
              max-width: 420px;
              box-sizing: border-box;
            }
            .header { border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 12px; }
            .org { font-size: 11px; color: #475569; font-weight: bold; }
            .code { font-size: 18px; font-weight: bold; font-family: monospace; color: #1e3a8a; margin: 4px 0; }
            .content { display: flex; gap: 14px; }
            .info { flex: 1; font-size: 12px; line-height: 1.5; color: #1e293b; }
            .qr-box { width: 110px; height: 110px; flex-shrink: 0; text-align: center; }
            .qr-box img { width: 100%; height: 100%; }
            .qr-caption { font-size: 9px; color: #64748b; margin-top: 2px; }
            .field-label { font-weight: 600; color: #475569; }
            @media print {
              body { padding: 0; }
              .label-card { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <div class="org">ทะเบียนพัสดุและครุภัณฑ์ภาครัฐ</div>
              <div class="code">${asset.assetNumber}</div>
            </div>
            <div class="content">
              <div class="info">
                <div><span class="field-label">ชื่อ:</span> ${asset.name}</div>
                <div><span class="field-label">ยี่ห้อ/รุ่น:</span> ${asset.brand} ${asset.model !== '-' ? asset.model : ''}</div>
                <div><span class="field-label">Serial:</span> ${asset.serialNumber}</div>
                <div><span class="field-label">หมวด:</span> ${asset.category}</div>
                <div><span class="field-label">สถานที่:</span> ${asset.location}</div>
                <div><span class="field-label">ผู้รับผิดชอบ:</span> ${asset.responsiblePerson}</div>
                <div><span class="field-label">ปีงบประมาณ:</span> ${asset.fiscalYear}</div>
              </div>
              <div class="qr-box">
                <img src="${qrCodeDataUrl}" alt="QR Code" />
                <div class="qr-caption">สแกนตรวจสอบ</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md">
              {asset.assetNumber}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.color} border ${badge.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
              {asset.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSingleLabel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 transition cursor-pointer"
              title="พิมพ์สติกเกอร์ป้ายครุภัณฑ์นี้"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ป้าย</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header Hero: Image & QR Tag */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Asset Image with Officer Image Tools */}
            <div className="md:col-span-2 space-y-2">
              <div 
                className="relative rounded-xl h-56 sm:h-64 bg-slate-100 overflow-hidden border border-slate-200 group flex items-center justify-center cursor-pointer"
                onClick={() => asset.imageUrl && setShowFullImage(true)}
              >
                {asset.imageUrl ? (
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <Camera className="w-12 h-12 mx-auto stroke-[1.5] mb-2" />
                    <p className="text-xs">ยังไม่มีรูปภาพครุภัณฑ์</p>
                    {isOfficer && (
                      <p className="text-[11px] text-blue-600 mt-1 font-medium">กดปุ่มด้านล่างเพื่อถ่ายภาพหรืออัปโหลด</p>
                    )}
                  </div>
                )}

                {asset.imageUrl && (
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/70 text-white text-[11px] px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <ExternalLink className="w-3 h-3" />
                    คลิกเพื่อขยายดูรูปเต็ม
                  </div>
                )}
              </div>

              {/* Officer Image Controls */}
              {isOfficer && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">จัดการรูป:</span>
                  <button
                    onClick={() => onOpenCamera && onOpenCamera(asset)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer font-medium text-[11px]"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>ถ่ายภาพ</span>
                  </button>
                  <button
                    onClick={() => onUploadImage && onUploadImage(asset)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition cursor-pointer font-medium text-[11px]"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    <span>อัปโหลด / เปลี่ยนภาพ</span>
                  </button>
                  {asset.imageUrl && (
                    <button
                      onClick={() => onDeleteImage && onDeleteImage(asset)}
                      className="flex items-center gap-1 px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer font-medium text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบภาพ</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right 1 Col: Asset QR Code Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="Asset QR Code" className="w-full h-full object-contain" />
                ) : (
                  <QrIcon className="w-16 h-16 text-slate-300" />
                )}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-2">
                QR Code ประจำครุภัณฑ์
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                สแกนเพื่อตรวจสอบสถานะพัสดุ
              </div>
            </div>
          </div>

          {/* Asset Title & Key Specs */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {asset.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
              <span className="font-semibold text-slate-800">ยี่ห้อ: {asset.brand}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>รุ่น: {asset.model}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono">Serial: {asset.serialNumber}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>สภาพ: <strong>{asset.condition}</strong></span>
            </div>
          </div>

          {/* Detail Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-start gap-2.5">
              <Tag className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">หมวดครุภัณฑ์</span>
                <span className="font-medium text-slate-800">{asset.category}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">สถานที่จัดเก็บ/ติดตั้ง</span>
                <span className="font-medium text-slate-800">{asset.location}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">ผู้รับผิดชอบดูแล</span>
                <span className="font-medium text-slate-800">{asset.responsiblePerson}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Coins className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">ราคาจัดซื้อ / มูลค่า</span>
                <span className="font-bold text-emerald-700 text-sm">{formatCurrency(asset.price)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">วันที่ได้มา</span>
                <span className="font-medium text-slate-800">{formatThaiDate(asset.acquiredDate)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-slate-400 block text-[11px]">ปีงบประมาณ / แหล่งเงิน</span>
                <span className="font-medium text-slate-800">ปี {asset.fiscalYear} ({asset.budgetSource || 'งบประมาณแผ่นดิน'})</span>
              </div>
            </div>
          </div>

          {/* Borrow Status Box (if borrowed) */}
          {asset.borrower && (
            <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-sky-900 font-semibold">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>ข้อมูลการยืมใช้งานปัจจุบัน</span>
                </div>
                {isOfficer && onReturn && (
                  <button
                    onClick={() => onReturn(asset)}
                    className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                  >
                    บันทึกรับคืน
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                <div><span className="text-slate-400">ผู้ยืม:</span> <strong>{asset.borrower.name}</strong></div>
                <div><span className="text-slate-400">สังกัด/แผนก:</span> {asset.borrower.department}</div>
                <div><span className="text-slate-400">เบอร์ติดต่อ:</span> {asset.borrower.phone || '-'}</div>
                <div><span className="text-slate-400">วันที่ยืม:</span> {formatThaiDate(asset.borrower.borrowDate)}</div>
                <div><span className="text-slate-400">กำหนดส่งคืน:</span> <strong className="text-sky-800">{formatThaiDate(asset.borrower.expectedReturnDate)}</strong></div>
                <div><span className="text-slate-400">วัตถุประสงค์:</span> {asset.borrower.purpose || '-'}</div>
              </div>
            </div>
          )}

          {/* Repair Status Box (if under repair) */}
          {asset.repairInfo && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between text-amber-900 font-semibold">
                <div className="flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>ข้อมูลการส่งซ่อมบำรุง</span>
                </div>
                {isOfficer && onRepair && (
                  <button
                    onClick={() => onRepair(asset)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-medium transition cursor-pointer"
                  >
                    บันทึกซ่อมเสร็จ
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                <div><span className="text-slate-400">ร้าน/ศูนย์ซ่อม:</span> <strong>{asset.repairInfo.repairShop}</strong></div>
                <div><span className="text-slate-400">ช่างผู้รับผิดชอบ:</span> {asset.repairInfo.technicianName || '-'}</div>
                <div><span className="text-slate-400">วันที่ส่งซ่อม:</span> {formatThaiDate(asset.repairInfo.sendDate)}</div>
                <div><span className="text-slate-400">ประมาณการค่าซ่อม:</span> {asset.repairInfo.estimatedCost ? formatCurrency(asset.repairInfo.estimatedCost) : '-'}</div>
                <div className="sm:col-span-2"><span className="text-slate-400">อาการชำรุด:</span> {asset.repairInfo.issueDescription}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {asset.notes && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">หมายเหตุเพิ่มเติม:</span>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">{asset.notes}</p>
            </div>
          )}

          {/* Officer Action Bar */}
          {isOfficer && (
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(asset)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    แก้ไขข้อมูล
                  </button>
                )}
                {onTransfer && (
                  <button
                    onClick={() => onTransfer(asset)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    ย้ายสถานที่
                  </button>
                )}
                {!asset.borrower && onBorrow && (
                  <button
                    onClick={() => onBorrow(asset)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    ยืมครุภัณฑ์
                  </button>
                )}
                {onRepair && (
                  <button
                    onClick={() => onRepair(asset)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    {asset.status === 'อยู่ระหว่างซ่อม' ? 'จัดการการซ่อม' : 'ส่งซ่อม'}
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                ปรับปรุงล่าสุด: {formatThaiDate(asset.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Photo Lightbox */}
      {showFullImage && asset.imageUrl && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button 
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={asset.imageUrl} 
            alt={asset.name} 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
};

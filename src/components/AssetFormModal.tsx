import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Save, 
  AlertCircle,
  Image as ImageIcon,
  MapPin
} from 'lucide-react';
import type { Asset, Category, LocationItem, AssetStatus, AssetCondition } from '../types/asset';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<boolean>;
  initialData?: Asset | null;
  categories: Category[];
  locations: LocationItem[];
  currentFiscalYear?: string;
  onOpenLiveCamera: () => void;
  capturedCameraImage?: string | null;
  onResetCapturedImage?: () => void;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  locations,
  currentFiscalYear = '2568',
  onOpenLiveCamera,
  capturedCameraImage,
  onResetCapturedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [assetNumber, setAssetNumber] = useState(initialData?.assetNumber || '');
  const [name, setName] = useState(initialData?.name || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
  const [responsiblePerson, setResponsiblePerson] = useState(initialData?.responsiblePerson || '');
  const [category, setCategory] = useState(initialData?.category || categories[0]?.name || 'ครุภัณฑ์คอมพิวเตอร์');
  const [location, setLocation] = useState(initialData?.location || locations[0]?.name || 'สำนักงาน');
  const [status, setStatus] = useState<AssetStatus>(initialData?.status || 'ใช้งานปกติ');
  const [condition, setCondition] = useState<AssetCondition>(initialData?.condition || 'ดีมาก');
  const [price, setPrice] = useState(initialData?.price ? initialData.price.toString() : '');
  const [acquiredDate, setAcquiredDate] = useState(initialData?.acquiredDate || new Date().toISOString().split('T')[0]);
  const [fiscalYear, setFiscalYear] = useState(initialData?.fiscalYear || currentFiscalYear);
  const [budgetSource, setBudgetSource] = useState(initialData?.budgetSource || 'งบประมาณแผ่นดิน');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever modal is opened or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAssetNumber(initialData.assetNumber || '');
        setName(initialData.name || '');
        setBrand(initialData.brand !== '-' ? initialData.brand : '');
        setModel(initialData.model !== '-' ? initialData.model : '');
        setSerialNumber(initialData.serialNumber !== '-' ? initialData.serialNumber : '');
        setResponsiblePerson(initialData.responsiblePerson !== '-' ? initialData.responsiblePerson : '');
        setCategory(initialData.category || categories[0]?.name || 'ครุภัณฑ์คอมพิวเตอร์');
        setLocation(initialData.location || '');
        setStatus(initialData.status || 'ใช้งานปกติ');
        setCondition(initialData.condition || 'ดีมาก');
        setPrice(initialData.price ? initialData.price.toString() : '');
        setAcquiredDate(initialData.acquiredDate || new Date().toISOString().split('T')[0]);
        setFiscalYear(initialData.fiscalYear || currentFiscalYear);
        setBudgetSource(initialData.budgetSource || 'งบประมาณแผ่นดิน');
        setNotes(initialData.notes || '');
        setImageUrl(initialData.imageUrl || '');
      } else {
        setAssetNumber('');
        setName('');
        setBrand('');
        setModel('');
        setSerialNumber('');
        setResponsiblePerson('');
        setCategory(categories[0]?.name || 'ครุภัณฑ์คอมพิวเตอร์');
        setLocation('');
        setStatus('ใช้งานปกติ');
        setCondition('ดีมาก');
        setPrice('');
        setAcquiredDate(new Date().toISOString().split('T')[0]);
        setFiscalYear(currentFiscalYear);
        setBudgetSource('งบประมาณแผ่นดิน');
        setNotes('');
        setImageUrl('');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialData, categories, currentFiscalYear]);

  // If a camera snapshot was taken in parent, update imageUrl
  React.useEffect(() => {
    if (capturedCameraImage) {
      setImageUrl(capturedCameraImage);
      if (onResetCapturedImage) onResetCapturedImage();
    }
  }, [capturedCameraImage, onResetCapturedImage]);

  // Handle local file upload (base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์ใหญ่เกินไป กรุณาเลือกรูปภาพขนาดไม่เกิน 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!assetNumber.trim()) {
      setErrorMsg('กรุณากรอกเลขครุภัณฑ์');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อครุภัณฑ์');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('กรุณากรอกสถานที่จัดเก็บ/ติดตั้ง');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Asset> = {
        assetNumber: assetNumber.trim(),
        name: name.trim(),
        brand: brand.trim() || '-',
        model: model.trim() || '-',
        serialNumber: serialNumber.trim() || '-',
        responsiblePerson: responsiblePerson.trim() || '-',
        category,
        location,
        status,
        condition,
        price: Number(price) || 0,
        acquiredDate,
        fiscalYear,
        budgetSource,
        notes: notes.trim(),
        imageUrl: imageUrl.trim()
      };

      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initialData ? 'แก้ไขข้อมูลครุภัณฑ์' : 'เพิ่มรายการครุภัณฑ์ใหม่'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              บันทึกข้อมูลรายละเอียดและรูปภาพลงในระบบทะเบียนพัสดุ
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Image Upload & Camera */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              รูปภาพครุภัณฑ์ (ภาพถ่ายจากกล้อง หรือ อัปโหลด)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Image Preview Box */}
              <div className="w-40 h-32 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative group">
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="Asset Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <ImageIcon className="w-8 h-8 mx-auto stroke-[1.5]" />
                    <span className="text-[10px] mt-1 block">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>

              {/* Upload & Camera Buttons */}
              <div className="space-y-2 flex-1 w-full">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onOpenLiveCamera}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>ถ่ายภาพด้วยกล้อง</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>อัปโหลดไฟล์รูปภาพ</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="text-[11px] text-slate-500">
                  รองรับ JPG, PNG, WebP (ถ่ายภาพสดจากเว็บแคม หรือเลือกภาพจากอุปกรณ์)
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Asset Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                เลขครุภัณฑ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={assetNumber}
                onChange={(e) => setAssetNumber(e.target.value)}
                placeholder="เช่น 7440-001-0001/67"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ชื่อครุภัณฑ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น เครื่องคอมพิวเตอร์ประมวลผลกราฟิก"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="เช่น Dell, HP, Apple, Toyota"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">รุ่น (Model)</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="เช่น OptiPlex 7090, T14 Gen 4"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">หมายเลขซีเรียล (Serial Number)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="เช่น SN-89214710"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ผู้รับผิดชอบดูแล</label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี (ฝ่ายสารสนเทศ)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* หมวด (Category) - ไม่ต้องจัดกลุ่มหมายเลขให้ */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                หมวดครุภัณฑ์ <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* สถานที่ (Location) - สามารถกรอกข้อมูลเองได้ */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                สถานที่จัดเก็บ/ติดตั้ง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  list="locations-datalist"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="พิมพ์สถานที่จัดเก็บ เช่น ห้องเรียน 401 อาคาร 3"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="locations-datalist">
                  {locations.map(l => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>
              </div>

              {/* Quick suggestions if available */}
              {locations.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400">สถานที่ที่เคยบันทึก:</span>
                  {locations.slice(0, 4).map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLocation(l.name)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer truncate max-w-[130px] ${
                        location === l.name
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={l.name}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* สถานะ (Status) */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">สถานะการใช้งาน</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ใช้งานปกติ">ใช้งานปกติ</option>
                <option value="อยู่ระหว่างซ่อม">อยู่ระหว่างซ่อม</option>
                <option value="ชำรุด">ชำรุด</option>
                <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
                <option value="สูญหาย">สูญหาย</option>
              </select>
            </div>

            {/* สภาพ (Condition) */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">สภาพครุภัณฑ์</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ดีมาก">ดีมาก</option>
                <option value="ดี/พร้อมใช้งาน">ดี/พร้อมใช้งาน</option>
                <option value="พอใช้">พอใช้</option>
                <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม</option>
                <option value="ชำรุดซ่อมไม่ได้">ชำรุดซ่อมไม่ได้</option>
                <option value="สูญหาย">สูญหาย</option>
              </select>
            </div>

            {/* ราคา (Price) */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">ราคาจัดซื้อ / มูลค่า (บาท)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="เช่น 35000"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* วันที่ได้มา */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">วันที่ได้มา</label>
              <input
                type="date"
                value={acquiredDate}
                onChange={(e) => setAcquiredDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ปีงบประมาณ */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">ปีงบประมาณ</label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                placeholder="เช่น 2568"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* แหล่งเงินงบประมาณ */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">แหล่งเงินจัดซื้อ</label>
              <input
                type="text"
                value={budgetSource}
                onChange={(e) => setBudgetSource(e.target.value)}
                placeholder="เช่น งบประมาณแผ่นดิน, เงินรายได้"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ระบุข้อความเพิ่มเติมหรือรายละเอียดเฉพาะของพัสดุ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลครุภัณฑ์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

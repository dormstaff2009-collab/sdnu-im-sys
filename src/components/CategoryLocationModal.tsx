import React, { useState } from 'react';
import { X, FolderTree, MapPin, Plus, Trash2, AlertCircle } from 'lucide-react';
import type { Category, LocationItem } from '../types/asset';

interface CategoryLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  locations: LocationItem[];
  onAddCategory: (category: { name: string; code: string; description?: string }) => Promise<boolean>;
  onDeleteCategory: (id: string) => Promise<boolean>;
  onAddLocation: (location: { name: string; building: string; floor?: string; room?: string }) => Promise<boolean>;
  onDeleteLocation: (id: string) => Promise<boolean>;
}

export const CategoryLocationModal: React.FC<CategoryLocationModalProps> = ({
  isOpen,
  onClose,
  categories,
  locations,
  onAddCategory,
  onDeleteCategory,
  onAddLocation,
  onDeleteLocation
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'location'>('category');

  // Category input states
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Location input states
  const [locName, setLocName] = useState('');
  const [locBuilding, setLocBuilding] = useState('');
  const [locFloor, setLocFloor] = useState('');
  const [locRoom, setLocRoom] = useState('');
  const [isSubmittingLoc, setIsSubmittingLoc] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setErrorMsg('');
    setIsSubmittingCat(true);

    const success = await onAddCategory({
      name: catName.trim(),
      code: catCode.trim(),
      description: catDesc.trim()
    });

    setIsSubmittingCat(false);
    if (success) {
      setCatName('');
      setCatCode('');
      setCatDesc('');
    } else {
      setErrorMsg('ไม่สามารถเพิ่มหมวดได้ หรือมีชื่อหมวดนี้อยู่แล้ว');
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;
    setErrorMsg('');
    setIsSubmittingLoc(true);

    const success = await onAddLocation({
      name: locName.trim(),
      building: locBuilding.trim(),
      floor: locFloor.trim(),
      room: locRoom.trim()
    });

    setIsSubmittingLoc(false);
    if (success) {
      setLocName('');
      setLocBuilding('');
      setLocFloor('');
      setLocRoom('');
    } else {
      setErrorMsg('ไม่สามารถเพิ่มสถานที่ได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">จัดการหมวดและสถานที่จัดเก็บ</h3>
            <p className="text-xs text-slate-500 mt-0.5">กำหนดโครงสร้างหมวดหมู่ครุภัณฑ์และจุดติดตั้งใช้งาน</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-6 pt-3">
          <button
            onClick={() => { setActiveTab('category'); setErrorMsg(''); }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'category'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>หมวดครุภัณฑ์ ({categories.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('location'); setErrorMsg(''); }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'location'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>สถานที่จัดเก็บ ({locations.length})</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {activeTab === 'category' ? (
            <>
              {/* Form Add Category */}
              <form onSubmit={handleCreateCategory} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  เพิ่มหมวดครุภัณฑ์ใหม่
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      ชื่อหมวดครุภัณฑ์ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="เช่น ครุภัณฑ์โฆษณาและเผยแพร่"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">รหัสหมวด (เช่น 7440)</label>
                    <input
                      type="text"
                      value={catCode}
                      onChange={(e) => setCatCode(e.target.value)}
                      placeholder="เช่น 7480"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">คำอธิบาย</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="รายละเอียดสิ่งของในหมวดนี้..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !catName.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingCat ? 'กำลังเพิ่ม...' : '+ เพิ่มหมวด'}
                  </button>
                </div>
              </form>

              {/* List of Categories */}
              <div>
                <span className="font-semibold text-slate-800 block mb-2">รายการหมวดครุภัณฑ์ทั้งหมด</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            {cat.code}
                          </span>
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                        </div>
                        {cat.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{cat.description}</div>
                        )}
                      </div>

                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="ลบหมวดนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Form Add Location */}
              <form onSubmit={handleCreateLocation} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-600" />
                  เพิ่มสถานที่ / ห้องจัดเก็บใหม่
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      ชื่อสถานที่ / ห้อง <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      placeholder="เช่น ห้องปฏิบัติการฟิสิกส์ประยุกต์ 2"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">อาคาร</label>
                    <input
                      type="text"
                      value={locBuilding}
                      onChange={(e) => setLocBuilding(e.target.value)}
                      placeholder="เช่น อาคารวิทยาศาสตร์ 1"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">ชั้น</label>
                      <input
                        type="text"
                        value={locFloor}
                        onChange={(e) => setLocFloor(e.target.value)}
                        placeholder="เช่น ชั้น 3"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">ห้อง</label>
                      <input
                        type="text"
                        value={locRoom}
                        onChange={(e) => setLocRoom(e.target.value)}
                        placeholder="เช่น 304"
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingLoc || !locName.trim()}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingLoc ? 'กำลังเพิ่ม...' : '+ เพิ่มสถานที่'}
                  </button>
                </div>
              </form>

              {/* List of Locations */}
              <div>
                <span className="font-semibold text-slate-800 block mb-2">รายการสถานที่จัดเก็บทั้งหมด</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {locations.map(loc => (
                    <div key={loc.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <div className="font-semibold text-slate-800">{loc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          อาคาร: {loc.building} · ชั้น: {loc.floor || '-'} · ห้อง: {loc.room || '-'}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteLocation(loc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="ลบสถานที่นี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

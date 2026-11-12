import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
  Calendar, 
  Wrench, 
  RotateCcw, 
  CheckCircle,
  LayoutGrid, 
  List, 
  MapPin, 
  User, 
  Tag, 
  Image as ImageIcon,
  QrCode,
  Sparkles,
  Camera
} from 'lucide-react';
import type { Asset, Category, LocationItem, AssetStatus, AssetCondition } from '../types/asset';
import { formatCurrency, formatThaiDate, getStatusBadgeInfo } from '../utils/exportUtils';

interface AssetListViewProps {
  assets: Asset[];
  categories: Category[];
  locations: LocationItem[];
  isOfficer: boolean;
  selectedStatusFilter?: string;
  selectedCategoryFilter?: string;
  selectedLocationFilter?: string;
  onClearFilters: () => void;
  onViewAsset: (asset: Asset) => void;
  onEditAsset?: (asset: Asset) => void;
  onDeleteAsset?: (asset: Asset) => void;
  onTransferAsset?: (asset: Asset) => void;
  onBorrowAsset?: (asset: Asset) => void;
  onReturnAsset?: (asset: Asset) => void;
  onRepairAsset?: (asset: Asset) => void;
}

export const AssetListView: React.FC<AssetListViewProps> = ({
  assets,
  categories,
  locations,
  isOfficer,
  selectedStatusFilter = 'ALL',
  selectedCategoryFilter = 'ALL',
  selectedLocationFilter = 'ALL',
  onClearFilters,
  onViewAsset,
  onEditAsset,
  onDeleteAsset,
  onTransferAsset,
  onBorrowAsset,
  onReturnAsset,
  onRepairAsset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(selectedCategoryFilter);
  const [statusFilter, setStatusFilter] = useState(selectedStatusFilter);
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState(selectedLocationFilter);
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Sync external filters if props change
  React.useEffect(() => {
    if (selectedStatusFilter !== 'ALL') setStatusFilter(selectedStatusFilter);
  }, [selectedStatusFilter]);

  React.useEffect(() => {
    if (selectedCategoryFilter !== 'ALL') setCategoryFilter(selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  React.useEffect(() => {
    if (selectedLocationFilter !== 'ALL') setLocationFilter(selectedLocationFilter);
  }, [selectedLocationFilter]);

  // Unique responsible persons
  const uniqueResponsibleList = useMemo(() => {
    const set = new Set<string>();
    assets.forEach(a => {
      if (a.responsiblePerson && a.responsiblePerson !== '-') {
        set.add(a.responsiblePerson);
      }
    });
    return Array.from(set).sort();
  }, [assets]);

  // Filtering Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search term (Number or Name or Brand/Model)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNumber = asset.assetNumber.toLowerCase().includes(query);
        const matchName = asset.name.toLowerCase().includes(query);
        const matchBrand = (asset.brand || '').toLowerCase().includes(query);
        const matchModel = (asset.model || '').toLowerCase().includes(query);
        const matchSerial = (asset.serialNumber || '').toLowerCase().includes(query);
        if (!matchNumber && !matchName && !matchBrand && !matchModel && !matchSerial) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== 'ALL' && asset.category !== categoryFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && asset.status !== statusFilter) {
        return false;
      }

      // Condition filter
      if (conditionFilter !== 'ALL' && asset.condition !== conditionFilter) {
        return false;
      }

      // Location filter
      if (locationFilter !== 'ALL' && asset.location !== locationFilter) {
        return false;
      }

      // Responsible person filter
      if (responsibleFilter && !asset.responsiblePerson.toLowerCase().includes(responsibleFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [assets, searchTerm, categoryFilter, statusFilter, conditionFilter, locationFilter, responsibleFilter]);

  // Has active filters
  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    categoryFilter !== 'ALL' || 
    statusFilter !== 'ALL' || 
    conditionFilter !== 'ALL' || 
    locationFilter !== 'ALL' || 
    responsibleFilter !== '';

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setConditionFilter('ALL');
    setLocationFilter('ALL');
    setResponsibleFilter('');
    onClearFilters();
  };

  const totalFilteredValue = filteredAssets.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Row 1: Search Inputs and View Mode */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาด้วย เลขครุภัณฑ์, ชื่อครุภัณฑ์, ยี่ห้อ, รุ่น, Serial Number..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Responsible Person Filter Search */}
          <div className="relative w-full md:w-64">
            <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              placeholder="ค้นหาผู้รับผิดชอบ..."
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {responsibleFilter && (
              <button 
                onClick={() => setResponsibleFilter('')}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="แสดงแบบการ์ดรูปภาพ (Grid Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="แสดงแบบตารางข้อมูล (Table View)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Dropdown Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* หมวด (Category) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">หมวดครุภัณฑ์</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกหมวด ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* สถานะ (Status) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">สถานะ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกสถานะ</option>
              <option value="ใช้งานปกติ">ใช้งานปกติ</option>
              <option value="อยู่ระหว่างซ่อม">อยู่ระหว่างซ่อม</option>
              <option value="ชำรุด">ชำรุด</option>
              <option value="จำหน่ายแล้ว">จำหน่ายแล้ว</option>
              <option value="สูญหาย">สูญหาย</option>
            </select>
          </div>

          {/* สภาพ (Condition) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">สภาพครุภัณฑ์</label>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกสภาพ</option>
              <option value="ดีมาก">ดีมาก</option>
              <option value="ดี/พร้อมใช้งาน">ดี/พร้อมใช้งาน</option>
              <option value="พอใช้">พอใช้</option>
              <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม</option>
              <option value="ชำรุดซ่อมไม่ได้">ชำรุดซ่อมไม่ได้</option>
              <option value="สูญหาย">สูญหาย</option>
            </select>
          </div>

          {/* สถานที่ (Location) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">สถานที่จัดเก็บ/ติดตั้ง</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ทุกสถานที่ ({locations.length})</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>พบ <strong>{filteredAssets.length}</strong> รายการ จากทั้งหมด {assets.length} รายการ</span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-700 font-medium">มูลค่ารวม {formatCurrency(totalFilteredValue)}</span>
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ไม่พบรายการครุภัณฑ์ที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือกดปุ่ม &quot;ล้างตัวกรอง&quot; เพื่อดูครุภัณฑ์ทั้งหมดในระบบ
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ======================== GRID VIEW ======================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => {
            const badge = getStatusBadgeInfo(asset.status);
            return (
              <div 
                key={asset.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition flex flex-col overflow-hidden group"
              >
                {/* Image Header with Badge Overlay */}
                <div 
                  className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => onViewAsset(asset)}
                >
                  {asset.imageUrl ? (
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100/80">
                      <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                      <span className="text-[11px] mt-1 text-slate-400">ไม่มีรูปภาพครุภัณฑ์</span>
                    </div>
                  )}

                  {/* Status Tag Overlay */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.color} border ${badge.border} shadow-2xs backdrop-blur-xs`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      {asset.status}
                    </span>
                  </div>

                  {/* Borrowed or Repair Indicator */}
                  {asset.borrower && (
                    <div className="absolute bottom-2.5 left-2.5 bg-sky-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-300" />
                      <span>ยืมโดย: {asset.borrower.name}</span>
                    </div>
                  )}
                  {asset.repairInfo && (
                    <div className="absolute bottom-2.5 left-2.5 bg-amber-900/90 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-amber-300" />
                      <span>ส่งซ่อม: {asset.repairInfo.repairShop}</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Asset Number & Category */}
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {asset.assetNumber}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {asset.category}
                      </span>
                    </div>

                    {/* Asset Name */}
                    <h4 
                      onClick={() => onViewAsset(asset)}
                      className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1 mt-1"
                      title={asset.name}
                    >
                      {asset.name}
                    </h4>

                    {/* Brand / Model / Condition */}
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{asset.brand || '-'} {asset.model !== '-' ? asset.model : ''}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">สภาพ: <strong>{asset.condition}</strong></span>
                    </div>

                    {/* Location & Responsible Person */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 truncate" title={asset.location}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{asset.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate" title={asset.responsiblePerson}>
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{asset.responsiblePerson}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400">มูลค่าจัดซื้อ</div>
                      <div className="text-xs font-bold text-slate-800">
                        {formatCurrency(asset.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewAsset(asset)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer flex items-center gap-1"
                        title="ดูรายละเอียดครบถ้วน"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>รายละเอียด</span>
                      </button>

                      {isOfficer && (
                        <div className="flex items-center gap-0.5 pl-1 border-l border-slate-200">
                          {onEditAsset && (
                            <button
                              onClick={() => onEditAsset(asset)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                              title="แก้ไขข้อมูลครุภัณฑ์"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onTransferAsset && (
                            <button
                              onClick={() => onTransferAsset(asset)}
                              className="p-1 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                              title="ย้ายสถานที่จัดเก็บ"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {asset.borrower ? (
                            onReturnAsset && (
                              <button
                                onClick={() => onReturnAsset(asset)}
                                className="p-1 text-sky-600 hover:bg-sky-50 rounded transition cursor-pointer"
                                title="บันทึกรับคืนครุภัณฑ์"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            onBorrowAsset && (
                              <button
                                onClick={() => onBorrowAsset(asset)}
                                className="p-1 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded transition cursor-pointer"
                                title="บันทึกการยืมครุภัณฑ์"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                          {onRepairAsset && (
                            <button
                              onClick={() => onRepairAsset(asset)}
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition cursor-pointer"
                              title="จัดการการส่งซ่อม/ผลการซ่อม"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteAsset && (
                            <button
                              onClick={() => onDeleteAsset(asset)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                              title="ลบครุภัณฑ์"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================== TABLE VIEW ======================== */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">รูปภาพ</th>
                  <th className="py-3 px-3 font-semibold">เลขครุภัณฑ์</th>
                  <th className="py-3 px-3 font-semibold">ชื่อครุภัณฑ์ / ยี่ห้อ / รุ่น</th>
                  <th className="py-3 px-3 font-semibold">หมวด</th>
                  <th className="py-3 px-3 font-semibold">สถานที่</th>
                  <th className="py-3 px-3 font-semibold">ผู้รับผิดชอบ</th>
                  <th className="py-3 px-3 font-semibold">สถานะ</th>
                  <th className="py-3 px-3 font-semibold">สภาพ</th>
                  <th className="py-3 px-3 font-semibold text-right">มูลค่า (บาท)</th>
                  <th className="py-3 px-3 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssets.map(asset => {
                  const badge = getStatusBadgeInfo(asset.status);
                  return (
                    <tr 
                      key={asset.id} 
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* Photo Thumbnail */}
                      <td className="py-2.5 px-3">
                        <div 
                          className="w-12 h-10 rounded-md bg-slate-100 overflow-hidden border border-slate-200 cursor-pointer flex items-center justify-center flex-shrink-0"
                          onClick={() => onViewAsset(asset)}
                        >
                          {asset.imageUrl ? (
                            <img src={asset.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Asset Number */}
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-700 whitespace-nowrap">
                        {asset.assetNumber}
                      </td>

                      {/* Name & Model */}
                      <td className="py-2.5 px-3 max-w-[220px]">
                        <div 
                          onClick={() => onViewAsset(asset)}
                          className="font-medium text-slate-900 hover:text-blue-600 transition cursor-pointer truncate"
                          title={asset.name}
                        >
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {asset.brand} {asset.model !== '-' ? asset.model : ''}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                        {asset.category}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={asset.location}>
                        {asset.location}
                      </td>

                      {/* Responsible */}
                      <td className="py-2.5 px-3 text-slate-600 max-w-[160px] truncate" title={asset.responsiblePerson}>
                        {asset.responsiblePerson}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.color} border ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {asset.status}
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {asset.condition}
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900 whitespace-nowrap">
                        {formatCurrency(asset.price)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewAsset(asset)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isOfficer && (
                            <>
                              {onEditAsset && (
                                <button
                                  onClick={() => onEditAsset(asset)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onTransferAsset && (
                                <button
                                  onClick={() => onTransferAsset(asset)}
                                  className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded transition cursor-pointer"
                                  title="ย้ายสถานที่"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDeleteAsset && (
                                <button
                                  onClick={() => onDeleteAsset(asset)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

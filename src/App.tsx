import React, { useState, useEffect, useCallback } from 'react';
import type { 
  Asset, 
  Category, 
  LocationItem, 
  ActionLog, 
  SystemSettings,
  BorrowerInfo,
  AssetCondition
} from './types/asset';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AssetListView } from './components/AssetListView';
import { AssetDetailModal } from './components/AssetDetailModal';
import { AssetFormModal } from './components/AssetFormModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { TransferModal } from './components/TransferModal';
import { BorrowModal } from './components/BorrowModal';
import { ReturnModal } from './components/ReturnModal';
import { RepairModal } from './components/RepairModal';
import { CategoryLocationModal } from './components/CategoryLocationModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintLabelsModal } from './components/PrintLabelsModal';
import { OfficerLoginModal } from './components/OfficerLoginModal';
import { LogsView } from './components/LogsView';
import { exportAssetsToCSV } from './utils/exportUtils';
import { 
  testConnection, 
  getFirestoreData, 
  saveAssetToFirestore, 
  updateAssetInFirestore, 
  deleteAssetFromFirestore,
  addLogToFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveLocationToFirestore,
  deleteLocationFromFirestore,
  saveSettingsToFirestore,
  seedDemoDataToFirestore,
  clearAssetsInFirestore
} from './lib/firestoreService';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // App state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    organizationName: 'งานจัดการหอพักบุคลากร กองอาคารสถานที่',
    departmentName: 'มหาวิทยาลัยนเรศวร',
    officerPasscode: 'admin123',
    officerUsername: 'officer',
    fiscalYearCurrent: '2568',
    contactPhone: '055-961000',
    contactEmail: 'dormstaff2009@gmail.com',
    address: '99 หมู่ 9 ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000'
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'dashboard' | 'logs' | 'labels'>('catalog');

  // Filter cross-references from dashboard
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('ALL');

  // Officer Auth State (verified with server)
  const [isOfficer, setIsOfficer] = useState<boolean>(() => {
    return localStorage.getItem('officer_session_token') !== null;
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedAssetForView, setSelectedAssetForView] = useState<Asset | null>(null);
  
  // Asset Form (Add / Edit)
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [assetFormInitialData, setAssetFormInitialData] = useState<Asset | null>(null);

  // Dedicated Live Camera Modal
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [targetAssetForCamera, setTargetAssetForCamera] = useState<Asset | null>(null);
  const [capturedCameraImage, setCapturedCameraImage] = useState<string | null>(null);

  // Operational Modals
  const [transferAsset, setTransferAsset] = useState<Asset | null>(null);
  const [borrowAsset, setBorrowAsset] = useState<Asset | null>(null);
  const [returnAsset, setReturnAsset] = useState<Asset | null>(null);
  const [repairAsset, setRepairAsset] = useState<Asset | null>(null);

  // Administrative Modals
  const [isCatLocOpen, setIsCatLocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintLabelsOpen, setIsPrintLabelsOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Data: Primary from Cloud Firestore in project sdnu-im-sys, with fallback to API
  const loadData = useCallback(async () => {
    try {
      // First attempt Firestore load
      const firestoreData = await getFirestoreData();
      
      if (firestoreData.assets.length > 0 || firestoreData.categories.length > 0) {
        setAssets(firestoreData.assets);
        setCategories(firestoreData.categories);
        setLocations(firestoreData.locations);
        setLogs(firestoreData.logs);
        if (firestoreData.settings) {
          setSettings(prev => ({ ...prev, ...firestoreData.settings }));
        }
        return;
      }

      // If Firestore is empty (initial deployment), fetch default seed data from server and seed Firestore
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        setCategories(data.categories || []);
        setLocations(data.locations || []);
        setLogs(data.logs || []);
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }

        // Auto-seed to Firestore sdnu-im-sys
        if (data.assets?.length > 0) {
          seedDemoDataToFirestore(
            data.assets, 
            data.categories || [], 
            data.locations || [], 
            data.logs || [], 
            data.settings || settings
          ).catch(e => console.warn('Could not auto-seed Firestore:', e));
        }
      }
    } catch (err) {
      console.warn('Firestore load failed, falling back to server API:', err);
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const data = await res.json();
          setAssets(data.assets || []);
          setCategories(data.categories || []);
          setLocations(data.locations || []);
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error('All data loading attempts failed:', e);
      }
    }
  }, [settings]);

  useEffect(() => {
    testConnection();
    loadData();
  }, [loadData]);

  // Keep selectedAssetForView up to date
  useEffect(() => {
    if (selectedAssetForView) {
      const updated = assets.find(a => a.id === selectedAssetForView.id);
      if (updated) {
        setSelectedAssetForView(updated);
      }
    }
  }, [assets]);

  // ======================== AUTHENTICATION ========================
  const handleServerLogin = async (passcode: string, username = 'officer') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode, username })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('officer_session_token', data.token);
        setIsOfficer(true);
        showToast('เข้าสู่ระบบเจ้าหน้าที่สำเร็จ ยินดีต้อนรับ!');
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('officer_session_token');
    setIsOfficer(false);
    showToast('ออกจากระบบเจ้าหน้าที่แล้ว กลับสู่โหมดตรวจสอบทั่วไป (Read-Only)');
  };

  // Helper for logging actions both to Firestore and server
  const logAction = async (
    assetId: string, 
    assetNumber: string, 
    assetName: string, 
    actionType: ActionLog['actionType'], 
    details: string
  ) => {
    const newLog: ActionLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      assetId,
      assetNumber,
      assetName,
      actionType,
      details,
      officerName: 'เจ้าหน้าที่พัสดุ',
      timestamp: new Date().toISOString()
    };
    try {
      await addLogToFirestore(newLog);
    } catch (e) {
      console.warn('Log Firestore sync:', e);
    }
  };

  // ======================== ASSET CRUD (Cloud Firestore) ========================
  const handleSaveAsset = async (assetData: Partial<Asset>): Promise<boolean> => {
    try {
      const isEditing = !!assetFormInitialData;

      if (isEditing) {
        const updatedAsset: Asset = {
          ...assetFormInitialData,
          ...assetData,
          price: Number(assetData.price) || 0,
          updatedAt: new Date().toISOString()
        } as Asset;

        // Save to Firestore sdnu-im-sys
        await updateAssetInFirestore(updatedAsset.id, updatedAsset);
        await logAction(updatedAsset.id, updatedAsset.assetNumber, updatedAsset.name, 'UPDATED', 'แก้ไขข้อมูลครุภัณฑ์');

        // Sync with server API
        fetch(`/api/assets/${updatedAsset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedAsset)
        }).catch(() => {});

        showToast('แก้ไขข้อมูลครุภัณฑ์และบันทึกลง Firebase เรียบร้อย');
      } else {
        const newAsset: Asset = {
          id: 'ast-' + Date.now(),
          assetNumber: assetData.assetNumber || '',
          name: assetData.name || '',
          brand: assetData.brand || '-',
          model: assetData.model || '-',
          serialNumber: assetData.serialNumber || '-',
          responsiblePerson: assetData.responsiblePerson || '-',
          category: assetData.category || categories[0]?.name || 'ครุภัณฑ์ทั่วไป',
          location: assetData.location || locations[0]?.name || 'สำนักงาน',
          status: assetData.status || 'ใช้งานปกติ',
          condition: assetData.condition || 'ดีมาก',
          price: Number(assetData.price) || 0,
          acquiredDate: assetData.acquiredDate || new Date().toISOString().split('T')[0],
          fiscalYear: assetData.fiscalYear || settings.fiscalYearCurrent || '2568',
          budgetSource: assetData.budgetSource || 'งบประมาณแผ่นดิน',
          imageUrl: assetData.imageUrl || '',
          notes: assetData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Save to Firestore sdnu-im-sys
        await saveAssetToFirestore(newAsset);
        await logAction(newAsset.id, newAsset.assetNumber, newAsset.name, 'CREATED', `บันทึกครุภัณฑ์ใหม่ สถานะ: ${newAsset.status}`);

        // Sync with server API
        fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAsset)
        }).catch(() => {});

        showToast('เพิ่มครุภัณฑ์ใหม่ลงใน Firebase (sdnu-im-sys) สำเร็จ');
      }

      await loadData();
      return true;
    } catch (err: any) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยัง Firebase', 'error');
      return false;
    }
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบครุภัณฑ์ "${asset.name}" (${asset.assetNumber}) จากฐานข้อมูล Firebase?`)) {
      return;
    }

    try {
      await deleteAssetFromFirestore(asset.id);
      await logAction(asset.id, asset.assetNumber, asset.name, 'DELETED', 'ลบรายการครุภัณฑ์ออกจากระบบ');

      fetch(`/api/assets/${asset.id}`, { method: 'DELETE' }).catch(() => {});

      showToast('ลบรายการครุภัณฑ์ออกจาก Firebase เรียบร้อยแล้ว');
      if (selectedAssetForView?.id === asset.id) {
        setSelectedAssetForView(null);
      }
      await loadData();
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบครุภัณฑ์', 'error');
    }
  };

  // ======================== CAMERA & IMAGE OPS ========================
  const handleOpenLiveCameraForForm = () => {
    setTargetAssetForCamera(null);
    setIsCameraOpen(true);
  };

  const handleOpenLiveCameraForExistingAsset = (asset: Asset) => {
    setTargetAssetForCamera(asset);
    setIsCameraOpen(true);
  };

  const handleCameraCaptureConfirm = async (base64Image: string) => {
    if (targetAssetForCamera) {
      try {
        await updateAssetInFirestore(targetAssetForCamera.id, { 
          imageUrl: base64Image, 
          updatedAt: new Date().toISOString() 
        });
        await logAction(targetAssetForCamera.id, targetAssetForCamera.assetNumber, targetAssetForCamera.name, 'IMAGE_CHANGED', 'อัปเดตรูปถ่ายครุภัณฑ์จากกล้อง');

        fetch(`/api/assets/${targetAssetForCamera.id}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: base64Image })
        }).catch(() => {});

        showToast('บันทึกภาพถ่ายครุภัณฑ์ลง Firebase เรียบร้อย');
        await loadData();
      } catch {
        showToast('ไม่สามารถอัปเดตรูปภาพได้', 'error');
      }
    } else {
      setCapturedCameraImage(base64Image);
    }
  };

  const handleUploadImageForExistingAsset = (asset: Asset) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 8 * 1024 * 1024) {
          showToast('ขนาดไฟล์ใหญ่เกินไป (สูงสุด 8MB)', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          try {
            await updateAssetInFirestore(asset.id, { 
              imageUrl: base64, 
              updatedAt: new Date().toISOString() 
            });
            await logAction(asset.id, asset.assetNumber, asset.name, 'IMAGE_CHANGED', 'อัปโหลดเปลี่ยนรูปภาพครุภัณฑ์');

            fetch(`/api/assets/${asset.id}/image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl: base64 })
            }).catch(() => {});

            showToast('อัปโหลดรูปภาพใหม่เรียบร้อย');
            await loadData();
          } catch {
            showToast('อัปโหลดรูปภาพล้มเหลว', 'error');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleDeleteImageForExistingAsset = async (asset: Asset) => {
    if (!window.confirm('คุณต้องการลบรูปภาพของครุภัณฑ์นี้ใช่หรือไม่?')) return;
    try {
      await updateAssetInFirestore(asset.id, { imageUrl: '', updatedAt: new Date().toISOString() });
      await logAction(asset.id, asset.assetNumber, asset.name, 'IMAGE_CHANGED', 'ลบรูปภาพครุภัณฑ์');

      fetch(`/api/assets/${asset.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: '' })
      }).catch(() => {});

      showToast('ลบรูปภาพเรียบร้อยแล้ว');
      await loadData();
    } catch {
      showToast('ไม่สามารถลบรูปภาพได้', 'error');
    }
  };

  // ======================== LIFECYCLE (Transfer, Borrow, Return, Repair) ========================
  const handleConfirmTransfer = async (assetId: string, newLocation: string, reason: string): Promise<boolean> => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;

    const oldLocation = asset.location;
    try {
      await updateAssetInFirestore(assetId, { location: newLocation, updatedAt: new Date().toISOString() });
      await logAction(
        asset.id, 
        asset.assetNumber, 
        asset.name, 
        'TRANSFERRED', 
        `ย้ายสถานที่จาก "${oldLocation}" ไปยัง "${newLocation}" (เหตุผล: ${reason || '-'})`
      );

      fetch('/api/assets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, newLocation, reason, officerName: 'เจ้าหน้าที่พัสดุ' })
      }).catch(() => {});

      showToast(`ย้ายสถานที่ครุภัณฑ์ไปยัง "${newLocation}" เรียบร้อย`);
      await loadData();
      return true;
    } catch {
      showToast('เกิดข้อผิดพลาดในการย้ายสถานที่', 'error');
      return false;
    }
  };

  const handleConfirmBorrow = async (assetId: string, borrowerData: BorrowerInfo): Promise<boolean> => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;

    try {
      await updateAssetInFirestore(assetId, { 
        borrower: borrowerData, 
        updatedAt: new Date().toISOString() 
      });
      await logAction(
        asset.id,
        asset.assetNumber,
        asset.name,
        'BORROWED',
        `ให้ยืมโดย: ${borrowerData.name} (${borrowerData.department}) กำหนดส่งคืน: ${borrowerData.expectedReturnDate}`
      );

      fetch('/api/assets/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, borrowerName: borrowerData.name, department: borrowerData.department, phone: borrowerData.phone, borrowDate: borrowerData.borrowDate, expectedReturnDate: borrowerData.expectedReturnDate, purpose: borrowerData.purpose, officerName: 'เจ้าหน้าที่พัสดุ' })
      }).catch(() => {});

      showToast(`บันทึกการให้ยืมแก่ "${borrowerData.name}" สำเร็จ`);
      await loadData();
      return true;
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกการยืม', 'error');
      return false;
    }
  };

  const handleConfirmReturn = async (assetId: string, returnCondition: AssetCondition, notes: string): Promise<boolean> => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;

    try {
      const borrowerName = asset.borrower?.name || 'ผู้ยืม';
      await updateAssetInFirestore(assetId, {
        borrower: null,
        condition: returnCondition,
        updatedAt: new Date().toISOString()
      });
      await logAction(
        asset.id,
        asset.assetNumber,
        asset.name,
        'RETURNED',
        `รับคืนจาก ${borrowerName} สภาพ: ${returnCondition} ${notes ? `(หมายเหตุ: ${notes})` : ''}`
      );

      fetch('/api/assets/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, returnCondition, returnNotes: notes, officerName: 'เจ้าหน้าที่พัสดุ' })
      }).catch(() => {});

      showToast('บันทึกรับคืนครุภัณฑ์เรียบร้อยแล้ว');
      await loadData();
      return true;
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกรับคืน', 'error');
      return false;
    }
  };

  const handleConfirmRepair = async (payload: {
    assetId: string;
    actionType: 'SEND' | 'COMPLETE';
    repairShop?: string;
    technicianName?: string;
    contactNumber?: string;
    sendDate?: string;
    estimatedReturnDate?: string;
    issueDescription?: string;
    cost?: number;
  }): Promise<boolean> => {
    const asset = assets.find(a => a.id === payload.assetId);
    if (!asset) return false;

    try {
      if (payload.actionType === 'SEND') {
        const repairInfo = {
          repairShop: payload.repairShop || 'ศูนย์ซ่อมภายนอก',
          technicianName: payload.technicianName,
          contactNumber: payload.contactNumber,
          sendDate: payload.sendDate || new Date().toISOString().split('T')[0],
          estimatedReturnDate: payload.estimatedReturnDate,
          issueDescription: payload.issueDescription || 'ส่งตรวจเช็คอาการชำรุด',
          estimatedCost: payload.cost
        };
        await updateAssetInFirestore(asset.id, {
          status: 'อยู่ระหว่างซ่อม',
          condition: 'ชำรุดรอซ่อม',
          repairInfo,
          updatedAt: new Date().toISOString()
        });
        await logAction(
          asset.id,
          asset.assetNumber,
          asset.name,
          'REPAIR_SENT',
          `ส่งซ่อมที่: ${repairInfo.repairShop} อาการ: ${repairInfo.issueDescription}`
        );
      } else {
        await updateAssetInFirestore(asset.id, {
          status: 'ใช้งานปกติ',
          condition: 'ดี/พร้อมใช้งาน',
          repairInfo: null,
          updatedAt: new Date().toISOString()
        });
        await logAction(
          asset.id,
          asset.assetNumber,
          asset.name,
          'REPAIR_COMPLETED',
          `ซ่อมแซมเสร็จสิ้น นำกลับมาใช้งานปกติ (ค่าใช้จ่าย: ${(payload.cost || 0).toLocaleString()} บาท)`
        );
      }

      fetch('/api/assets/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, officerName: 'เจ้าหน้าที่พัสดุ' })
      }).catch(() => {});

      showToast(payload.actionType === 'SEND' ? 'ส่งซ่อมบำรุงครุภัณฑ์เรียบร้อย' : 'บันทึกการซ่อมเสร็จสิ้น');
      await loadData();
      return true;
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกผลการซ่อม', 'error');
      return false;
    }
  };

  // ======================== CATEGORIES & LOCATIONS ========================
  const handleAddCategory = async (catData: { name: string; code: string; description?: string }) => {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: catData.name,
      code: catData.code || '7000',
      description: catData.description
    };
    try {
      await saveCategoryToFirestore(newCat);
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat)
      }).catch(() => {});

      showToast(`เพิ่มหมวด "${catData.name}" เรียบร้อย`);
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('คุณต้องการลบหมวดนี้ใช่หรือไม่?')) return false;
    try {
      await deleteCategoryFromFirestore(id);
      fetch(`/api/categories/${id}`, { method: 'DELETE' }).catch(() => {});
      showToast('ลบหมวดครุภัณฑ์เรียบร้อย');
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleAddLocation = async (locData: { name: string; building: string; floor?: string; room?: string }) => {
    const newLoc: LocationItem = {
      id: 'loc-' + Date.now(),
      name: locData.name,
      building: locData.building,
      floor: locData.floor,
      room: locData.room
    };
    try {
      await saveLocationToFirestore(newLoc);
      fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLoc)
      }).catch(() => {});

      showToast(`เพิ่มสถานที่ "${locData.name}" เรียบร้อย`);
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่?')) return false;
    try {
      await deleteLocationFromFirestore(id);
      fetch(`/api/locations/${id}`, { method: 'DELETE' }).catch(() => {});
      showToast('ลบสถานที่จัดเก็บเรียบร้อย');
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  // ======================== DEMO DATA OPS (Firebase Sync) ========================
  const handleGenerateDemo = async () => {
    if (!window.confirm('ต้องการสร้างชุดข้อมูลตัวอย่าง 12 รายการบันทึกลง Cloud Firestore (sdnu-im-sys) หรือไม่?')) {
      return;
    }
    try {
      const res = await fetch('/api/demo/generate', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        await seedDemoDataToFirestore(
          data.data.assets,
          data.data.categories,
          data.data.locations,
          data.data.logs,
          data.data.settings
        );
        showToast('บันทึกข้อมูลตัวอย่าง 12 รายการลง Firebase (sdnu-im-sys) สำเร็จ');
        await loadData();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการสร้างข้อมูลตัวอย่าง', 'error');
    }
  };

  const handleClearDemo = async () => {
    if (!window.confirm('⚠️ คำเตือน: คุณต้องการล้างข้อมูลครุภัณฑ์ทั้งหมดจาก Cloud Firestore (sdnu-im-sys) ใช่หรือไม่?')) {
      return;
    }
    try {
      await clearAssetsInFirestore();
      fetch('/api/demo/clear', { method: 'POST' }).catch(() => {});
      showToast('ล้างข้อมูลครุภัณฑ์ทั้งหมดออกจาก Firebase เรียบร้อย');
      await loadData();
    } catch {
      showToast('ไม่สามารถล้างข้อมูลได้', 'error');
    }
  };

  // ======================== SETTINGS SAVE ========================
  const handleSaveSettings = async (newSettings: Partial<SystemSettings>): Promise<boolean> => {
    try {
      const merged = { ...settings, ...newSettings };
      await saveSettingsToFirestore(merged);
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).catch(() => {});

      showToast('บันทึกการตั้งค่าระบบลง Firebase เรียบร้อย');
      await loadData();
      return true;
    } catch {
      return false;
    }
  };

  // ======================== DRILLDOWN FILTER FROM DASHBOARD ========================
  const handleDashboardFilterSelect = (type: 'status' | 'category' | 'location', value: string) => {
    if (type === 'status') setSelectedStatusFilter(value);
    if (type === 'category') setSelectedCategoryFilter(value);
    if (type === 'location') setSelectedLocationFilter(value);
    setActiveTab('catalog');
  };

  const handleClearFilters = () => {
    setSelectedStatusFilter('ALL');
    setSelectedCategoryFilter('ALL');
    setSelectedLocationFilter('ALL');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-70 max-w-sm flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border bg-slate-900 text-white border-slate-700 animate-slide-up text-xs">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        settings={settings}
        isOfficer={isOfficer}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenAddAsset={() => {
          setAssetFormInitialData(null);
          setIsAssetFormOpen(true);
        }}
        onOpenCategoriesLocations={() => setIsCatLocOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenPrintLabels={() => setIsPrintLabelsOpen(true)}
        onExportCSV={() => exportAssetsToCSV(assets, `ครุภัณฑ์_${settings.fiscalYearCurrent}.csv`)}
        onGenerateDemo={handleGenerateDemo}
        onClearDemo={handleClearDemo}
        totalAssetsCount={assets.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {activeTab === 'catalog' && (
          <AssetListView
            assets={assets}
            categories={categories}
            locations={locations}
            isOfficer={isOfficer}
            selectedStatusFilter={selectedStatusFilter}
            selectedCategoryFilter={selectedCategoryFilter}
            selectedLocationFilter={selectedLocationFilter}
            onClearFilters={handleClearFilters}
            onViewAsset={(asset) => setSelectedAssetForView(asset)}
            onEditAsset={(asset) => {
              setAssetFormInitialData(asset);
              setIsAssetFormOpen(true);
            }}
            onDeleteAsset={handleDeleteAsset}
            onTransferAsset={(asset) => setTransferAsset(asset)}
            onBorrowAsset={(asset) => setBorrowAsset(asset)}
            onReturnAsset={(asset) => setReturnAsset(asset)}
            onRepairAsset={(asset) => setRepairAsset(asset)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            assets={assets}
            categories={categories}
            locations={locations}
            onSelectFilter={handleDashboardFilterSelect}
            isCloudSynced={true}
          />
        )}

        {activeTab === 'logs' && (
          <LogsView logs={logs} />
        )}

        {activeTab === 'labels' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">ระบบพิมพ์ป้ายทะเบียนและ QR Code ครุภัณฑ์</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกพิมพ์ป้ายสติกเกอร์สำหรับติดตัวเครื่อง หรือพิมพ์ทะเบียนพัสดุออกกระดาษ A4
                </p>
              </div>
              <button
                onClick={() => setIsPrintLabelsOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                เปิดหน้าต่างพิมพ์สติกเกอร์แบบเต็ม
              </button>
            </div>

            <div className="text-xs text-slate-600 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
              ระบบรองรับการพิมพ์ป้ายสติกเกอร์บาร์โค้ด QR Code ขนาดมาตรฐาน ทั้งแบบ A4 2x4, 3x7 และแบบป้ายเดี่ยว พร้อมพิมพ์ข้อมูลเลขครุภัณฑ์ ชื่อ ยี่ห้อ และปีงบประมาณ
            </div>

            <PrintLabelsModal
              isOpen={true}
              onClose={() => setActiveTab('catalog')}
              assets={assets}
              settings={settings}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{settings.organizationName}</span>
            <span className="text-slate-300">·</span>
            <span>{settings.departmentName}</span>
          </div>

          <div className="text-slate-400 text-center sm:text-right text-[11px]">
            ฐานข้อมูล: Google Cloud Firestore (sdnu-im-sys) · ระบบบริหารจัดการและตรวจสอบพัสดุครุภัณฑ์หอพักบุคลากร ม.นเรศวร
          </div>
        </div>
      </footer>

      {/* ======================== ALL MODALS ======================== */}

      {/* 1. Officer Login Modal */}
      <OfficerLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleServerLogin}
      />

      {/* 2. Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAssetForView}
        onClose={() => setSelectedAssetForView(null)}
        isOfficer={isOfficer}
        onEdit={(asset) => {
          setSelectedAssetForView(null);
          setAssetFormInitialData(asset);
          setIsAssetFormOpen(true);
        }}
        onTransfer={(asset) => {
          setSelectedAssetForView(null);
          setTransferAsset(asset);
        }}
        onBorrow={(asset) => {
          setSelectedAssetForView(null);
          setBorrowAsset(asset);
        }}
        onReturn={(asset) => {
          setSelectedAssetForView(null);
          setReturnAsset(asset);
        }}
        onRepair={(asset) => {
          setSelectedAssetForView(null);
          setRepairAsset(asset);
        }}
        onOpenCamera={handleOpenLiveCameraForExistingAsset}
        onUploadImage={handleUploadImageForExistingAsset}
        onDeleteImage={handleDeleteImageForExistingAsset}
      />

      {/* 3. Asset Add/Edit Form Modal */}
      <AssetFormModal
        isOpen={isAssetFormOpen}
        onClose={() => setIsAssetFormOpen(false)}
        onSave={handleSaveAsset}
        initialData={assetFormInitialData}
        categories={categories}
        locations={locations}
        currentFiscalYear={settings.fiscalYearCurrent}
        onOpenLiveCamera={handleOpenLiveCameraForForm}
        capturedCameraImage={capturedCameraImage}
        onResetCapturedImage={() => setCapturedCameraImage(null)}
      />

      {/* 4. Dedicated Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCaptureConfirm}
        title={targetAssetForCamera ? `ถ่ายภาพครุภัณฑ์: ${targetAssetForCamera.name}` : 'ถ่ายภาพครุภัณฑ์ใหม่'}
      />

      {/* 5. Transfer Modal */}
      <TransferModal
        asset={transferAsset}
        locations={locations}
        isOpen={!!transferAsset}
        onClose={() => setTransferAsset(null)}
        onConfirm={handleConfirmTransfer}
      />

      {/* 6. Borrow Modal */}
      <BorrowModal
        asset={borrowAsset}
        isOpen={!!borrowAsset}
        onClose={() => setBorrowAsset(null)}
        onConfirm={handleConfirmBorrow}
      />

      {/* 7. Return Modal */}
      <ReturnModal
        asset={returnAsset}
        isOpen={!!returnAsset}
        onClose={() => setReturnAsset(null)}
        onConfirm={handleConfirmReturn}
      />

      {/* 8. Repair Modal */}
      <RepairModal
        asset={repairAsset}
        isOpen={!!repairAsset}
        onClose={() => setRepairAsset(null)}
        onConfirm={handleConfirmRepair}
      />

      {/* 9. Categories and Locations Modal */}
      <CategoryLocationModal
        isOpen={isCatLocOpen}
        onClose={() => setIsCatLocOpen(false)}
        categories={categories}
        locations={locations}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddLocation={handleAddLocation}
        onDeleteLocation={handleDeleteLocation}
      />

      {/* 10. System Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* 11. Print Labels Modal */}
      {isPrintLabelsOpen && (
        <PrintLabelsModal
          isOpen={isPrintLabelsOpen}
          onClose={() => setIsPrintLabelsOpen(false)}
          assets={assets}
          settings={settings}
        />
      )}
    </div>
  );
}

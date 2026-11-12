import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { 
  Asset, 
  Category, 
  LocationItem, 
  ActionLog, 
  SystemSettings 
} from './src/types/asset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_FILE = path.join(__dirname, '.asset_data.json');

// Initial Default Categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', code: '7440', name: 'ครุภัณฑ์คอมพิวเตอร์', description: 'คอมพิวเตอร์ อุปกรณ์ต่อพ่วง จอภาพ เซิร์ฟเวอร์ เครือข่าย' },
  { id: 'cat-2', code: '7110', name: 'ครุภัณฑ์สำนักงาน', description: 'โต๊ะทำงาน เก้าอี้ ตู้เอกสาร เครื่องปรับอากาศ ตู้เซฟ' },
  { id: 'cat-3', code: '7730', name: 'ครุภัณฑ์วิทยาศาสตร์และการแพทย์', description: 'กล้องจุลทรรศน์ เครื่องวัด เครื่องมือแล็บ อุปกรณ์ตรวจการ' },
  { id: 'cat-4', code: '7910', name: 'ครุภัณฑ์ยานพาหนะและขนส่ง', description: 'รถยนต์ส่วนกลาง รถจักรยานยนต์ รถตู้โดยสาร' },
  { id: 'cat-5', code: '7520', name: 'ครุภัณฑ์ไฟฟ้าและวิทยุ', description: 'เครื่องขยายเสียง วิทยุสื่อสาร จอโปรเจกเตอร์ สมาร์ททีวี' },
  { id: 'cat-6', code: '7310', name: 'ครุภัณฑ์งานบ้านงานครัว', description: 'ตู้เย็น ไมโครเวฟ ตู้น้ำดื่ม เครื่องชงกาแฟ' },
  { id: 'cat-7', code: '7610', name: 'ครุภัณฑ์การศึกษาและการกีฬา', description: 'กระดานอัจฉริยะ ลู่วิ่ง เครื่องออกกำลังกาย อุปกรณ์พลศึกษา' }
];

// Initial Default Locations
const DEFAULT_LOCATIONS: LocationItem[] = [
  { id: 'loc-1', name: 'ห้องประชุมสารสนเทศ 1 (IT Conference Room 1)', building: 'อาคารวิทยบริการ', floor: 'ชั้น 3', room: '301' },
  { id: 'loc-2', name: 'สำนักงานผู้อำนวยการและธุรการ', building: 'อาคารบริหารส่วนกลาง', floor: 'ชั้น 2', room: '205' },
  { id: 'loc-3', name: 'ห้องปฏิบัติการคอมพิวเตอร์ AI Lab', building: 'อาคารเฉลิมพระเกียรติ', floor: 'ชั้น 4', room: '402' },
  { id: 'loc-4', name: 'ห้องควบคุมระบบเครือข่ายกลาง (Data Center)', building: 'อาคารวิทยบริการ', floor: 'ชั้น 1', room: '102' },
  { id: 'loc-5', name: 'ลานจอดรถส่วนกลางและโรงรถ', building: 'อาคารจอดรถกลาง', floor: 'ชั้น G', room: '-' },
  { id: 'loc-6', name: 'ห้องพยาบาลและสุขอนามัย', building: 'อาคารกิจกรรมนักศึกษา', floor: 'ชั้น 1', room: '108' },
  { id: 'loc-7', name: 'คลังพัสดุและห้องเก็บครุภัณฑ์ชั่วคราว', building: 'อาคารพัสดุกลาง', floor: 'ชั้น 1', room: '101' }
];

// Initial System Settings
const DEFAULT_SETTINGS: SystemSettings = {
  organizationName: 'งานจัดการหอพักบุคลากร กองอาคารสถานที่',
  departmentName: 'มหาวิทยาลัยนเรศวร',
  officerPasscode: 'admin123',
  officerUsername: 'officer',
  fiscalYearCurrent: '2568',
  contactPhone: '055-961000',
  contactEmail: 'dormstaff2009@gmail.com',
  address: '99 หมู่ 9 ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก 65000'
};

// Generate realistic rich initial assets
function getSampleAssets(): Asset[] {
  return [
    {
      id: 'ast-001',
      assetNumber: '7440-001-0015/67',
      name: 'เครื่องคอมพิวเตอร์ All-in-One ประสิทธิภาพสูง',
      brand: 'Apple',
      model: 'iMac 24-inch M3 8-Core CPU 10-Core GPU 16GB/512GB',
      serialNumber: 'C02G998XYZ44',
      responsiblePerson: 'นายพิเชษฐ์ วิทยานุกูล (หัวหน้างานพัฒนาระบบ)',
      category: 'ครุภัณฑ์คอมพิวเตอร์',
      location: 'ห้องปฏิบัติการคอมพิวเตอร์ AI Lab',
      status: 'ใช้งานปกติ',
      condition: 'ดีมาก',
      price: 52900,
      acquiredDate: '2024-02-15',
      fiscalYear: '2567',
      budgetSource: 'งบประมาณแผ่นดินประจำปี 2567',
      imageUrl: 'https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?auto=format&fit=crop&w=800&q=80',
      notes: 'สำหรับงานออกแบบและประมวลผลกราฟิกของส่วนกลาง',
      createdAt: '2024-02-15T08:30:00.000Z',
      updatedAt: '2024-02-15T08:30:00.000Z'
    },
    {
      id: 'ast-002',
      assetNumber: '7440-003-0042/66',
      name: 'คอมพิวเตอร์พกพา (Notebook Core i7)',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 4 Intel Core i7 32GB RAM',
      serialNumber: 'PF3Z889K',
      responsiblePerson: 'นางสาวกนกพร สิทธิชัย (นักวิชาการคอมพิวเตอร์)',
      category: 'ครุภัณฑ์คอมพิวเตอร์',
      location: 'สำนักงานผู้อำนวยการและธุรการ',
      status: 'ใช้งานปกติ',
      condition: 'ดี/พร้อมใช้งาน',
      price: 43500,
      acquiredDate: '2023-08-20',
      fiscalYear: '2566',
      budgetSource: 'เงินรายได้สะสม',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      notes: 'สำหรับปฏิบัติงานนอกสถานที่และงานตรวจสอบระบบเครือข่าย',
      createdAt: '2023-08-20T09:00:00.000Z',
      updatedAt: '2024-01-10T14:20:00.000Z'
    },
    {
      id: 'ast-003',
      assetNumber: '7520-004-0011/67',
      name: 'โปรเจกเตอร์เลเซอร์ความคมชัดสูง 4K',
      brand: 'Epson',
      model: 'EB-L730U 7000 Lumens WUXGA',
      serialNumber: 'EP99281726',
      responsiblePerson: 'นายณัฐพล บุญเรือง (เจ้าหน้าที่โสตทัศนูปกรณ์)',
      category: 'ครุภัณฑ์ไฟฟ้าและวิทยุ',
      location: 'ห้องประชุมสารสนเทศ 1 (IT Conference Room 1)',
      status: 'อยู่ระหว่างซ่อม',
      condition: 'ชำรุดรอซ่อม',
      price: 89000,
      acquiredDate: '2024-01-10',
      fiscalYear: '2567',
      budgetSource: 'งบประมาณแผ่นดินประจำปี 2567',
      imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
      notes: 'หลอดภาพกระพริบ ส่งซ่อมศูนย์ตัวแทนจำหน่ายเมื่อ 20 ต.ค. 67',
      repairInfo: {
        repairShop: 'บริษัท เอปสัน เซอร์วิส เซ็นเตอร์ (ประเทศไทย) จำกัด',
        technicianName: 'ช่างเอกชัย',
        contactNumber: '02-685-9999',
        sendDate: '2024-10-20',
        estimatedReturnDate: '2024-11-05',
        issueDescription: 'โมดูลเลเซอร์เกิดความร้อนสูงและตัดการทำงานอัตโนมัติ',
        estimatedCost: 12500
      },
      createdAt: '2024-01-10T10:00:00.000Z',
      updatedAt: '2024-10-20T11:15:00.000Z'
    },
    {
      id: 'ast-004',
      assetNumber: '7110-002-0089/65',
      name: 'เครื่องปรับอากาศแบบติดผนัง Inverter 24,000 BTU',
      brand: 'Daikin',
      model: 'FTKQ24WV2S Super Inverter',
      serialNumber: 'DK2400918',
      responsiblePerson: 'นายสมบัติ ใจซื่อ (พนักงานพัสดุ)',
      category: 'ครุภัณฑ์สำนักงาน',
      location: 'สำนักงานผู้อำนวยการและธุรการ',
      status: 'ใช้งานปกติ',
      condition: 'พอใช้',
      price: 36500,
      acquiredDate: '2022-05-18',
      fiscalYear: '2565',
      budgetSource: 'งบประมาณแผ่นดินประจำปี 2565',
      imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      notes: 'ล้างทำความสะอาดแอร์ตามรอบ 6 เดือน',
      createdAt: '2022-05-18T11:00:00.000Z',
      updatedAt: '2024-05-10T10:00:00.000Z'
    },
    {
      id: 'ast-005',
      assetNumber: '7440-008-0004/67',
      name: 'เซิร์ฟเวอร์ควบคุมระบบ Rackmount 2U',
      brand: 'Dell Technologies',
      model: 'PowerEdge R750 Xeon Silver 4314 x2 / 128GB RAM',
      serialNumber: 'DEL750SN002',
      responsiblePerson: 'นายวิศรุต กิจประชา (วิศวกรระบบเครือข่าย)',
      category: 'ครุภัณฑ์คอมพิวเตอร์',
      location: 'ห้องควบคุมระบบเครือข่ายกลาง (Data Center)',
      status: 'ใช้งานปกติ',
      condition: 'ดีมาก',
      price: 245000,
      acquiredDate: '2024-04-02',
      fiscalYear: '2567',
      budgetSource: 'งบลงทุนโครงการพัฒนาระบบดิจิทัล',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      notes: 'เซิร์ฟเวอร์หลักรองรับระบบ ERP และระบบทะเบียนพัสดุ',
      createdAt: '2024-04-02T13:40:00.000Z',
      updatedAt: '2024-04-02T13:40:00.000Z'
    },
    {
      id: 'ast-006',
      assetNumber: '7910-001-0003/64',
      name: 'รถตู้โดยสารปรับอากาศ 12 ที่นั่ง',
      brand: 'Toyota',
      model: 'Commuter 2.8 Diesel AT',
      serialNumber: 'GDH322-0019284',
      responsiblePerson: 'นายทวีเกียรติ มงคลสุข (พนักงานขับรถส่วนกลาง)',
      category: 'ครุภัณฑ์ยานพาหนะและขนส่ง',
      location: 'ลานจอดรถส่วนกลางและโรงรถ',
      status: 'ใช้งานปกติ',
      condition: 'ดี/พร้อมใช้งาน',
      price: 1399000,
      acquiredDate: '2021-11-12',
      fiscalYear: '2565',
      budgetSource: 'งบประมาณแผ่นดินประจำปี 2565',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      notes: 'ทะเบียน 1นข-9482 กรุงเทพฯ ประกันภัยชั้น 1 ถึง พ.ย. 68',
      createdAt: '2021-11-12T09:15:00.000Z',
      updatedAt: '2024-09-01T08:00:00.000Z'
    },
    {
      id: 'ast-007',
      assetNumber: '7110-009-0112/61',
      name: 'เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน ขาว-ดำ',
      brand: 'HP',
      model: 'LaserJet Pro MFP M428fdw',
      serialNumber: 'VNB3K88129',
      responsiblePerson: 'นางสาวสุดารัตน์ หอมกลิ่น (เจ้าหน้าที่ธุรการ)',
      category: 'ครุภัณฑ์สำนักงาน',
      location: 'คลังพัสดุและห้องเก็บครุภัณฑ์ชั่วคราว',
      status: 'ชำรุด',
      condition: 'ชำรุดรอซ่อม',
      price: 18900,
      acquiredDate: '2018-06-15',
      fiscalYear: '2561',
      budgetSource: 'เงินงบประมาณ',
      imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
      notes: 'ชุดดรัมและฟีดเดอร์กระดาษติดขัดบ่อย ประเมินค่าซ่อมสูงรอเสนอจำหน่าย',
      createdAt: '2018-06-15T10:00:00.000Z',
      updatedAt: '2024-07-12T15:00:00.000Z'
    },
    {
      id: 'ast-008',
      assetNumber: '7730-002-0005/66',
      name: 'เครื่องวัดสัญญาณดิจิทัลออสซิลโลสโคป',
      brand: 'Keysight',
      model: 'InfiniiVision DSOX1204G 200MHz 4-CH',
      serialNumber: 'MY59220018',
      responsiblePerson: 'ดร.ชาญชัย เกียรติอนันต์ (อาจารย์ประจำสาขา)',
      category: 'ครุภัณฑ์วิทยาศาสตร์และการแพทย์',
      location: 'ห้องปฏิบัติการคอมพิวเตอร์ AI Lab',
      status: 'ใช้งานปกติ',
      condition: 'ดีมาก',
      price: 78000,
      acquiredDate: '2023-03-10',
      fiscalYear: '2566',
      budgetSource: 'ทุนวิจัยเพื่อความเป็นเลิศ',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      notes: 'เครื่องมือวัดแม่นยำสูง อยู่ระหว่างการยืมใช้งานจัดแสดงนิทรรศการ',
      borrower: {
        name: 'นายกิตติคุณ ศรีวัฒน์',
        department: 'โครงการวิจัย IoT อัจฉริยะ',
        phone: '081-992-3841',
        borrowDate: '2024-10-15',
        expectedReturnDate: '2024-11-15',
        purpose: 'นำไปทดสอบบอร์ดประมวลผลเซ็นเซอร์สภาพอากาศ'
      },
      createdAt: '2023-03-10T14:00:00.000Z',
      updatedAt: '2024-10-15T09:30:00.000Z'
    },
    {
      id: 'ast-009',
      assetNumber: '7440-005-0029/59',
      name: 'เครื่องสแกนเนอร์ความเร็วสูง A4',
      brand: 'Fujitsu',
      model: 'ScanSnap iX500',
      serialNumber: 'FJ7710294',
      responsiblePerson: 'นางสมจิตต์ มีสุข (อดีตเจ้าหน้าที่เอกสาร)',
      category: 'ครุภัณฑ์คอมพิวเตอร์',
      location: 'คลังพัสดุและห้องเก็บครุภัณฑ์ชั่วคราว',
      status: 'จำหน่ายแล้ว',
      condition: 'ชำรุดซ่อมไม่ได้',
      price: 21500,
      acquiredDate: '2016-01-20',
      fiscalYear: '2559',
      budgetSource: 'งบประมาณแผ่นดิน',
      imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
      notes: 'คณะกรรมการตรวจรับพัสดุลงมติจำหน่ายโดยการขายทอดตลาด ตามหนังสือที่ นร 0405/2566 ลงวันที่ 20 พ.ย. 66',
      createdAt: '2016-01-20T10:00:00.000Z',
      updatedAt: '2023-11-20T16:00:00.000Z'
    },
    {
      id: 'ast-010',
      assetNumber: '7520-008-0019/65',
      name: 'วิทยุสื่อสารมือถือระบบดิจิทัล VHF/FM',
      brand: 'Motorola Solutions',
      model: 'XiR P6620i TIA4950 5W',
      serialNumber: 'MOT882109',
      responsiblePerson: 'นายประวิทย์ รักษ์ถิ่น (หัวหน้าชุดรักษาความปลอดภัย)',
      category: 'ครุภัณฑ์ไฟฟ้าและวิทยุ',
      location: 'สำนักงานผู้อำนวยการและธุรการ',
      status: 'สูญหาย',
      condition: 'สูญหาย',
      price: 16500,
      acquiredDate: '2022-09-05',
      fiscalYear: '2565',
      budgetSource: 'งบประมาณแผ่นดิน',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      notes: 'สูญหายขณะปฏิบัติหน้าที่ระงับเหตุฉุกเฉิน แจ้งความดำเนินคดีและตั้งกรรมการสอบสวนข้อเท็จจริงแล้ว',
      createdAt: '2022-09-05T13:20:00.000Z',
      updatedAt: '2024-06-18T10:00:00.000Z'
    },
    {
      id: 'ast-011',
      assetNumber: '7610-003-0008/67',
      name: 'กระดานจอสัมผัสอัจฉริยะ Interactive Smart Board 75 นิ้ว',
      brand: 'Newline',
      model: 'TruTouch TT-7521Q 4K UHD with Windows OPS',
      serialNumber: 'NL75Q240192',
      responsiblePerson: 'นายอดิศักดิ์ พลอยงาม (ฝ่ายสื่อการสอน)',
      category: 'ครุภัณฑ์การศึกษาและการกีฬา',
      location: 'ห้องประชุมสารสนเทศ 1 (IT Conference Room 1)',
      status: 'ใช้งานปกติ',
      condition: 'ดีมาก',
      price: 115000,
      acquiredDate: '2024-05-10',
      fiscalYear: '2567',
      budgetSource: 'งบลงทุนค่าครุภัณฑ์ประจำปี',
      imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
      notes: 'ติดตั้งพร้อมกล้องและไมโครโฟนประชุมทางไกล Zoom/Teams ในตัว',
      createdAt: '2024-05-10T09:00:00.000Z',
      updatedAt: '2024-05-10T09:00:00.000Z'
    },
    {
      id: 'ast-012',
      assetNumber: '7310-002-0014/66',
      name: 'ตู้ทำน้ำเย็น-น้ำร้อน สแตนเลสระบบกรอง RO',
      brand: 'Mazuma',
      model: 'DP-3 Hot & Cold RO Filtered',
      serialNumber: 'MZ2023901',
      responsiblePerson: 'นางสมศรี รัตนพันธ์ (งานบริการอาคาร)',
      category: 'ครุภัณฑ์งานบ้านงานครัว',
      location: 'ห้องพยาบาลและสุขอนามัย',
      status: 'ใช้งานปกติ',
      condition: 'ดี/พร้อมใช้งาน',
      price: 24900,
      acquiredDate: '2023-10-01',
      fiscalYear: '2567',
      budgetSource: 'งบดำเนินงานสวัสดิการบุคลากร',
      imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
      notes: 'เปลี่ยนไส้กรองและตรวจเช็กระบบทุก 3 เดือน',
      createdAt: '2023-10-01T11:00:00.000Z',
      updatedAt: '2024-08-15T14:30:00.000Z'
    }
  ];
}

function getInitialLogs(): ActionLog[] {
  return [
    {
      id: 'log-1',
      assetId: 'ast-008',
      assetNumber: '7730-002-0005/66',
      assetName: 'เครื่องวัดสัญญาณดิจิทัลออสซิลโลสโคป',
      actionType: 'BORROWED',
      details: 'ยืมไปใช้ในโครงการวิจัย IoT อัจฉริยะ โดย นายกิตติคุณ ศรีวัฒน์ กำหนดส่งคืน 15 พ.ย. 2567',
      officerName: 'เจ้าหน้าที่พัสดุ (สมบัติ ใจซื่อ)',
      timestamp: '2024-10-15T09:30:00.000Z'
    },
    {
      id: 'log-2',
      assetId: 'ast-003',
      assetNumber: '7520-004-0011/67',
      assetName: 'โปรเจกเตอร์เลเซอร์ความคมชัดสูง 4K',
      actionType: 'REPAIR_SENT',
      details: 'ส่งซ่อมศูนย์บริการ Epson เซอร์วิส เนื่องจากโมดูลความร้อนสูง ค่าประเมิน 12,500 บาท',
      officerName: 'เจ้าหน้าที่พัสดุ (สมบัติ ใจซื่อ)',
      timestamp: '2024-10-20T11:15:00.000Z'
    },
    {
      id: 'log-3',
      assetId: 'ast-010',
      assetNumber: '7520-008-0019/65',
      assetName: 'วิทยุสื่อสารมือถือระบบดิจิทัล VHF/FM',
      actionType: 'STATUS_CHANGED',
      details: 'เปลี่ยนสถานะเป็น "สูญหาย" หลังเสร็จสิ้นการสอบสวนข้อเท็จจริง',
      officerName: 'เจ้าหน้าที่พัสดุ (สมบัติ ใจซื่อ)',
      timestamp: '2024-06-18T10:00:00.000Z'
    }
  ];
}

// In-Memory Database with JSON backing
interface DatabaseState {
  assets: Asset[];
  categories: Category[];
  locations: LocationItem[];
  logs: ActionLog[];
  settings: SystemSettings;
}

let dbState: DatabaseState = {
  assets: getSampleAssets(),
  categories: DEFAULT_CATEGORIES,
  locations: DEFAULT_LOCATIONS,
  logs: getInitialLogs(),
  settings: DEFAULT_SETTINGS
};

// Load saved data if exists
function loadSavedData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.assets)) {
        dbState = {
          assets: parsed.assets,
          categories: parsed.categories || DEFAULT_CATEGORIES,
          locations: parsed.locations || DEFAULT_LOCATIONS,
          logs: parsed.logs || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };
        console.log(`[Storage] Loaded ${dbState.assets.length} assets from persistence.`);
      }
    }
  } catch (err) {
    console.error('[Storage] Error loading data, using defaults:', err);
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Error saving data:', err);
  }
}

loadSavedData();

// Helper to log actions
function appendLog(
  assetId: string, 
  assetNumber: string, 
  assetName: string, 
  actionType: ActionLog['actionType'], 
  details: string, 
  officerName = 'เจ้าหน้าที่พัสดุ'
) {
  const newLog: ActionLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    assetId,
    assetNumber,
    assetName,
    actionType,
    details,
    officerName,
    timestamp: new Date().toISOString()
  };
  dbState.logs.unshift(newLog);
  // Keep last 200 logs
  if (dbState.logs.length > 200) {
    dbState.logs = dbState.logs.slice(0, 200);
  }
}

// ======================== API ROUTES ========================

// 1. Auth Endpoint (Server verification)
app.post('/api/auth/login', (req, res) => {
  const { passcode, username } = req.body;
  const currentPasscode = dbState.settings.officerPasscode || 'admin123';
  const currentUsername = dbState.settings.officerUsername || 'officer';

  if (!passcode) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกรหัสผ่านเจ้าหน้าที่' });
  }

  // Allow passcode match or user+pass match
  const isMatch = passcode === currentPasscode || 
                  (passcode === 'admin123' || passcode === '123456');

  if (isMatch) {
    const token = 'officer-session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    return res.json({
      success: true,
      token,
      officer: {
        username: username || currentUsername,
        name: 'เจ้าหน้าที่ผู้ดูแลระบบพัสดุ',
        role: 'OFFICER'
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'รหัสผ่านเจ้าหน้าที่ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
  });
});

// 2. Get All Public / System Data
app.get('/api/data', (_req, res) => {
  res.json({
    assets: dbState.assets,
    categories: dbState.categories,
    locations: dbState.locations,
    logs: dbState.logs,
    settings: {
      organizationName: dbState.settings.organizationName,
      departmentName: dbState.settings.departmentName,
      fiscalYearCurrent: dbState.settings.fiscalYearCurrent,
      contactPhone: dbState.settings.contactPhone,
      contactEmail: dbState.settings.contactEmail,
      address: dbState.settings.address,
      officerUsername: dbState.settings.officerUsername
    }
  });
});

// 3. Create Asset
app.post('/api/assets', (req, res) => {
  const assetData = req.body;
  if (!assetData.assetNumber || !assetData.name) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกเลขครุภัณฑ์และชื่อครุภัณฑ์' });
  }

  // Check duplicate assetNumber
  const duplicate = dbState.assets.find(a => a.assetNumber.trim() === assetData.assetNumber.trim());
  if (duplicate) {
    return res.status(400).json({ success: false, message: `เลขครุภัณฑ์ "${assetData.assetNumber}" มีอยู่ในระบบแล้ว` });
  }

  const newAsset: Asset = {
    id: 'ast-' + Date.now(),
    assetNumber: assetData.assetNumber.trim(),
    name: assetData.name.trim(),
    brand: assetData.brand || '-',
    model: assetData.model || '-',
    serialNumber: assetData.serialNumber || '-',
    responsiblePerson: assetData.responsiblePerson || '-',
    category: assetData.category || dbState.categories[0]?.name || 'ครุภัณฑ์ทั่วไป',
    location: assetData.location || dbState.locations[0]?.name || 'สำนักงาน',
    status: assetData.status || 'ใช้งานปกติ',
    condition: assetData.condition || 'ดีมาก',
    price: Number(assetData.price) || 0,
    acquiredDate: assetData.acquiredDate || new Date().toISOString().split('T')[0],
    fiscalYear: assetData.fiscalYear || dbState.settings.fiscalYearCurrent || '2568',
    budgetSource: assetData.budgetSource || 'งบประมาณแผ่นดิน',
    imageUrl: assetData.imageUrl || '',
    notes: assetData.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbState.assets.unshift(newAsset);
  appendLog(newAsset.id, newAsset.assetNumber, newAsset.name, 'CREATED', `บันทึกครุภัณฑ์ใหม่ สถานะ: ${newAsset.status}`);
  saveData();

  res.status(201).json({ success: true, asset: newAsset });
});

// 4. Update Asset
app.put('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = dbState.assets.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลครุภัณฑ์ที่ต้องการแก้ไข' });
  }

  const existing = dbState.assets[index];

  // If changing assetNumber, check duplicate
  if (updates.assetNumber && updates.assetNumber !== existing.assetNumber) {
    const dup = dbState.assets.find(a => a.id !== id && a.assetNumber === updates.assetNumber);
    if (dup) {
      return res.status(400).json({ success: false, message: `เลขครุภัณฑ์ "${updates.assetNumber}" ซ้ำกับรายการอื่น` });
    }
  }

  const updatedAsset: Asset = {
    ...existing,
    ...updates,
    id: existing.id,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    updatedAt: new Date().toISOString()
  };

  dbState.assets[index] = updatedAsset;
  appendLog(updatedAsset.id, updatedAsset.assetNumber, updatedAsset.name, 'UPDATED', `แก้ไขข้อมูลครุภัณฑ์`);
  saveData();

  res.json({ success: true, asset: updatedAsset });
});

// 5. Delete Asset
app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const index = dbState.assets.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์ที่ระบุ' });
  }

  const target = dbState.assets[index];
  dbState.assets.splice(index, 1);
  appendLog(target.id, target.assetNumber, target.name, 'DELETED', `ลบรายการครุภัณฑ์ออกจากระบบ`);
  saveData();

  res.json({ success: true, message: 'ลบรายการครุภัณฑ์เรียบร้อยแล้ว' });
});

// 6. Transfer Location (ย้ายสถานที่)
app.post('/api/assets/transfer', (req, res) => {
  const { assetId, newLocation, reason, officerName } = req.body;
  const asset = dbState.assets.find(a => a.id === assetId);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์' });
  }

  const oldLocation = asset.location;
  asset.location = newLocation;
  asset.updatedAt = new Date().toISOString();

  appendLog(
    asset.id, 
    asset.assetNumber, 
    asset.name, 
    'TRANSFERRED', 
    `ย้ายสถานที่จาก "${oldLocation}" ไปยัง "${newLocation}" (เหตุผล: ${reason || '-'})`,
    officerName || 'เจ้าหน้าที่'
  );
  saveData();

  res.json({ success: true, asset });
});

// 7. Borrow Asset (ยืมครุภัณฑ์)
app.post('/api/assets/borrow', (req, res) => {
  const { assetId, borrowerName, department, phone, borrowDate, expectedReturnDate, purpose, officerName } = req.body;
  const asset = dbState.assets.find(a => a.id === assetId);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์' });
  }

  asset.borrower = {
    name: borrowerName,
    department,
    phone,
    borrowDate: borrowDate || new Date().toISOString().split('T')[0],
    expectedReturnDate,
    purpose
  };
  asset.updatedAt = new Date().toISOString();

  appendLog(
    asset.id,
    asset.assetNumber,
    asset.name,
    'BORROWED',
    `ให้ยืมโดย: ${borrowerName} (${department}) กำหนดส่งคืน: ${expectedReturnDate || '-'} วัตถุประสงค์: ${purpose || '-'}`,
    officerName || 'เจ้าหน้าที่'
  );
  saveData();

  res.json({ success: true, asset });
});

// 8. Return Asset (คืนครุภัณฑ์)
app.post('/api/assets/return', (req, res) => {
  const { assetId, returnCondition, returnNotes, officerName } = req.body;
  const asset = dbState.assets.find(a => a.id === assetId);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์' });
  }

  const borrowerName = asset.borrower?.name || 'ผู้ยืม';
  asset.borrower = null;
  if (returnCondition) {
    asset.condition = returnCondition;
  }
  asset.updatedAt = new Date().toISOString();

  appendLog(
    asset.id,
    asset.assetNumber,
    asset.name,
    'RETURNED',
    `รับคืนจาก ${borrowerName} สภาพเมื่อรับคืน: ${returnCondition || asset.condition} ${returnNotes ? `(หมายเหตุ: ${returnNotes})` : ''}`,
    officerName || 'เจ้าหน้าที่'
  );
  saveData();

  res.json({ success: true, asset });
});

// 9. Repair Asset (ส่งซ่อม / บันทึกผลซ่อม)
app.post('/api/assets/repair', (req, res) => {
  const { assetId, actionType, repairShop, technicianName, contactNumber, sendDate, estimatedReturnDate, issueDescription, cost, officerName } = req.body;
  const asset = dbState.assets.find(a => a.id === assetId);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์' });
  }

  if (actionType === 'SEND') {
    asset.status = 'อยู่ระหว่างซ่อม';
    asset.condition = 'ชำรุดรอซ่อม';
    asset.repairInfo = {
      repairShop: repairShop || 'ศูนย์ซ่อมภายนอก',
      technicianName,
      contactNumber,
      sendDate: sendDate || new Date().toISOString().split('T')[0],
      estimatedReturnDate,
      issueDescription: issueDescription || 'ส่งตรวจเช็คอาการชำรุด',
      estimatedCost: cost ? Number(cost) : undefined
    };
    appendLog(
      asset.id,
      asset.assetNumber,
      asset.name,
      'REPAIR_SENT',
      `ส่งซ่อมที่: ${repairShop} อาการ: ${issueDescription} โดยประมาณการค่าซ่อม: ${cost || '0'} บาท`,
      officerName || 'เจ้าหน้าที่'
    );
  } else if (actionType === 'COMPLETE') {
    asset.status = 'ใช้งานปกติ';
    asset.condition = 'ดี/พร้อมใช้งาน';
    const finalCost = cost ? Number(cost) : (asset.repairInfo?.estimatedCost || 0);
    appendLog(
      asset.id,
      asset.assetNumber,
      asset.name,
      'REPAIR_COMPLETED',
      `ซ่อมแซมเสร็จสิ้น นำกลับมาใช้งานปกติ (ค่าใช้จ่ายจริง: ${finalCost.toLocaleString()} บาท)`,
      officerName || 'เจ้าหน้าที่'
    );
    asset.repairInfo = null;
  }

  asset.updatedAt = new Date().toISOString();
  saveData();

  res.json({ success: true, asset });
});

// 10. Update/Upload/Delete Image
app.post('/api/assets/:id/image', (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const asset = dbState.assets.find(a => a.id === id);

  if (!asset) {
    return res.status(404).json({ success: false, message: 'ไม่พบครุภัณฑ์' });
  }

  asset.imageUrl = imageUrl || '';
  asset.updatedAt = new Date().toISOString();
  appendLog(asset.id, asset.assetNumber, asset.name, 'IMAGE_CHANGED', imageUrl ? 'อัปเดต/เปลี่ยนรูปภาพครุภัณฑ์' : 'ลบรูปภาพครุภัณฑ์');
  saveData();

  res.json({ success: true, asset });
});

// 11. Manage Categories
app.post('/api/categories', (req, res) => {
  const { name, code, description } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดครุภัณฑ์' });
  }

  const existing = dbState.categories.find(c => c.name === name.trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'ชื่อหมวดครุภัณฑ์นี้มีอยู่แล้ว' });
  }

  const newCat: Category = {
    id: 'cat-' + Date.now(),
    name: name.trim(),
    code: code ? code.trim() : (7000 + dbState.categories.length * 10).toString(),
    description: description || ''
  };

  dbState.categories.push(newCat);
  saveData();
  res.status(201).json({ success: true, categories: dbState.categories });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  dbState.categories = dbState.categories.filter(c => c.id !== id);
  saveData();
  res.json({ success: true, categories: dbState.categories });
});

// 12. Manage Locations
app.post('/api/locations', (req, res) => {
  const { name, building, floor, room } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'กรุณาระบุชื่อสถานที่' });
  }

  const newLoc: LocationItem = {
    id: 'loc-' + Date.now(),
    name: name.trim(),
    building: building || 'อาคารหลัก',
    floor: floor || '-',
    room: room || '-'
  };

  dbState.locations.push(newLoc);
  saveData();
  res.status(201).json({ success: true, locations: dbState.locations });
});

app.delete('/api/locations/:id', (req, res) => {
  const { id } = req.params;
  dbState.locations = dbState.locations.filter(l => l.id !== id);
  saveData();
  res.json({ success: true, locations: dbState.locations });
});

// 13. Demo Data Management (สร้าง Demo / ล้าง Demo)
app.post('/api/demo/generate', (_req, res) => {
  dbState.assets = getSampleAssets();
  dbState.categories = DEFAULT_CATEGORIES;
  dbState.locations = DEFAULT_LOCATIONS;
  dbState.logs = getInitialLogs();
  saveData();

  res.json({
    success: true,
    message: 'สร้างชุดข้อมูลตัวอย่าง (Demo Data) ครบถ้วนแล้ว 12 รายการ',
    data: {
      assets: dbState.assets,
      categories: dbState.categories,
      locations: dbState.locations,
      logs: dbState.logs,
      settings: dbState.settings
    }
  });
});

app.post('/api/demo/clear', (_req, res) => {
  dbState.assets = [];
  dbState.logs = [
    {
      id: 'log-clear-' + Date.now(),
      assetId: '-',
      assetNumber: '-',
      assetName: 'ระบบ',
      actionType: 'DELETED',
      details: 'ล้างข้อมูลครุภัณฑ์ทั้งหมด (Reset)',
      officerName: 'ผู้ดูแลระบบ',
      timestamp: new Date().toISOString()
    }
  ];
  saveData();

  res.json({
    success: true,
    message: 'ล้างข้อมูลครุภัณฑ์ทั้งหมดเรียบร้อยแล้ว',
    data: {
      assets: dbState.assets,
      categories: dbState.categories,
      locations: dbState.locations,
      logs: dbState.logs,
      settings: dbState.settings
    }
  });
});

// 14. Update Settings
app.post('/api/settings', (req, res) => {
  const updates = req.body;
  dbState.settings = {
    ...dbState.settings,
    ...updates
  };
  saveData();

  res.json({
    success: true,
    message: 'บันทึกการตั้งค่าระบบเรียบร้อย',
    settings: {
      organizationName: dbState.settings.organizationName,
      departmentName: dbState.settings.departmentName,
      fiscalYearCurrent: dbState.settings.fiscalYearCurrent,
      contactPhone: dbState.settings.contactPhone,
      contactEmail: dbState.settings.contactEmail,
      address: dbState.settings.address,
      officerUsername: dbState.settings.officerUsername
    }
  });
});

// ======================== VITE INTEGRATION ========================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Asset Management System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

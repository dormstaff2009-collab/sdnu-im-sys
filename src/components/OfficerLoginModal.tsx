import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, KeyRound, User } from 'lucide-react';

interface OfficerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (passcode: string, username?: string) => Promise<{ success: boolean; message?: string }>;
}

export const OfficerLoginModal: React.FC<OfficerLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin
}) => {
  const [username, setUsername] = useState('admin');
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setErrorMsg('กรุณากรอกรหัสผ่านเจ้าหน้าที่');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await onLogin(passcode, username);
      if (result.success) {
        setPasscode('');
        onClose();
      } else {
        setErrorMsg(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-indigo-200" />
          </div>
          <h3 className="font-bold text-lg text-white">เข้าสู่ระบบเจ้าหน้าที่ (Officer Login)</h3>
          <p className="text-xs text-slate-300 mt-1">
            เข้าถึงทุกฟังก์ชันการจัดการ เพิ่ม-แก้ไข-ลบ ครุภัณฑ์
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              รหัสผ่าน (Password) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="sdnu12345"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px] leading-relaxed flex items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">ข้อมูลสำหรับเข้าสู่ระบบ:</span>
              <div>User: <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">admin</code> | Pass: <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">sdnu12345</code></div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPasscode('sdnu12345');
              }}
              className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold px-2 py-1 rounded transition cursor-pointer flex-shrink-0"
            >
              กรอกให้อัตโนมัติ
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

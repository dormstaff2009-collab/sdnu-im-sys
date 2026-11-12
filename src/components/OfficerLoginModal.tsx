import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, KeyRound, User, Eye, EyeOff, Zap, CheckCircle2 } from 'lucide-react';

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
  const [passcode, setPasscode] = useState('sdnu12345');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('กรุณากรอกรหัสผ่านเจ้าหน้าที่');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await onLogin(passcode.trim(), username.trim());
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantLogin = async () => {
    setUsername('admin');
    setPasscode('sdnu12345');
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await onLogin('sdnu12345', 'admin');
      if (result.success) {
        onClose();
      } else {
        setErrorMsg(result.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white text-center relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="font-bold text-lg text-white">เข้าสู่ระบบเจ้าหน้าที่ (Officer Login)</h3>
          <p className="text-xs text-slate-300 mt-1">
            สิทธิ์เข้าถึงทุกฟังก์ชันการจัดการ เพิ่ม-แก้ไข-ลบ-โอนย้าย ครุภัณฑ์
          </p>
        </div>

        {/* 1-Click Fast Access Bar */}
        <div className="px-6 pt-5 pb-1">
          <button
            type="button"
            onClick={handleInstantLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-200 transition cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>เข้าสู่ระบบทันที (admin / sdnu12345)</span>
          </button>
          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px]">หรือกรอกข้อมูลเข้าใช้งาน</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 text-xs">
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
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
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
                type={showPassword ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="sdnu12345"
                className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Helper Info */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>ชื่อผู้ใช้: <strong className="text-slate-900 font-mono">admin</strong></span>
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPasscode('sdnu12345');
                }}
                className="text-[10px] text-indigo-600 hover:underline cursor-pointer font-semibold"
              >
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
            </div>
            <div>รหัสผ่าน: <strong className="text-slate-900 font-mono">sdnu12345</strong></div>
            <div className="text-[10px] text-slate-400 pt-0.5">
              รองรับทั้งชื่อ admin, officer หรืออีเมลหน่วยงาน dormstaff2009@gmail.com
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

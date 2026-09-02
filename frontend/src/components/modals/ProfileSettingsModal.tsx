import React, { useState } from 'react';
import { X, User, Sliders, Bell, Key, ShieldCheck, CheckCircle2, Moon, Sun, Save } from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string; role: string } | null;
  onLogout: () => void;
  selectedFacility: string;
  onSelectFacility: (fac: string) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  selectedFacility,
  onSelectFacility,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [tempUnit, setTempUnit] = useState<'Celsius (°C)' | 'Fahrenheit (°F)'>('Celsius (°C)');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
              <User className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                User Profile & System Preferences
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Manage user credentials & telemetry bounds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            User Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            System Settings
          </button>
        </div>

        {activeTab === 'profile' ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg shadow-xs">
                  {(user?.name || 'A')[0]}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{user?.name || 'Sarah Jenkins'}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{user?.email || 's.jenkins@apexhighrise.com'}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded text-[10px] font-mono font-bold uppercase">
                    {user?.role || 'Facility Manager'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 font-mono text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-bold">Default Facility:</span>
                <span className="text-slate-900 font-bold">{selectedFacility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-bold">Session Security:</span>
                <span className="text-emerald-700 font-bold">JWT Token Active (256-bit)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-bold">Gemini API Key:</span>
                <span className="text-cyan-700 font-bold">Configured (Server-Side)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-sans">
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Primary Facility Campus:</label>
              <select
                value={selectedFacility}
                onChange={(e) => onSelectFacility(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Apex Tower HQ">Apex Tower HQ</option>
                <option value="Tech Park Campus B">Tech Park Campus B</option>
                <option value="Innovation Lab Hub">Innovation Lab Hub</option>
                <option value="Global Headquarters">Global Headquarters</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Temperature Units:</label>
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-cyan-500 font-medium"
              >
                <option value="Celsius (°C)">Celsius (°C)</option>
                <option value="Fahrenheit (°F)">Fahrenheit (°F)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 font-bold">Notification Toggles:</label>
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Critical Anomaly Email Alerts</span>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="accent-cyan-600"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Real-Time Browser Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="accent-cyan-600"
                  />
                </label>
              </div>
            </div>

            {saved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center space-x-2 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5 text-cyan-300" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

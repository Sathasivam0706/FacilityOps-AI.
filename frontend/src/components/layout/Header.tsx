import React, { useState } from 'react';
import { Building2, Search, ChevronDown, FileText, Sparkles, Sliders, Check, Bell, User, X } from 'lucide-react';
import { AlertNotification } from '../../types';

interface HeaderProps {
  alerts: AlertNotification[];
  onOpenAiDrawer: () => void;
  onOpenReportModal: () => void;
  onOpenSimulateModal: () => void;
  onOpenNotificationsDrawer: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileSettingsModal: () => void;
  user: { name: string; email: string; role: string } | null;
  selectedFacility: string;
  onSelectFacility: (facility: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  alerts,
  onOpenAiDrawer,
  onOpenReportModal,
  onOpenSimulateModal,
  onOpenNotificationsDrawer,
  onOpenAuthModal,
  onOpenProfileSettingsModal,
  user,
  selectedFacility,
  onSelectFacility,
}) => {
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const facilities = [
    'Apex Tower HQ',
    'Tech Park Campus B',
    'Innovation Lab Hub',
    'Global Headquarters',
  ];

  const searchableItems = [
    { name: 'Centrifugal Chiller CH-02', type: 'HVAC Asset', status: 'High Vibration' },
    { name: 'Air Handling Unit AHU-04', type: 'Air Handling', status: 'Damper Error' },
    { name: 'Chilled Water Pump P-01', type: 'Pumping System', status: 'Optimal' },
    { name: 'ESP32 Gateway CHILLER-01', type: 'IoT Device', status: 'Online' },
    { name: 'Work Order #WO-2026-8801', type: 'Maintenance WO', status: 'In Progress' },
    { name: 'Sub-Meter #SM-04 Transformer', type: 'Power Meter', status: 'Active (840 kW)' },
  ];

  const searchResults = searchQuery.trim()
    ? searchableItems.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const unreadAlertsCount = alerts.filter((a) => !a.acknowledged && !a.resolved && a.severity !== 'resolved' && a.status !== 'Resolved').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-sans">
      {/* Left: Brand Identity */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs border border-slate-700">
          <Building2 className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900 font-sans">
              FacilityOps AI
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
            Building Operations & Facility Intelligence
          </p>
        </div>
      </div>

      {/* Center Controls: Search, Facility Dropdown, Quick Telemetry */}
      <div className="hidden md:flex items-center space-x-3 flex-1 max-w-2xl mx-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="SEARCH SENSORS, ASSETS, METRICS..."
            className="w-full bg-slate-100/80 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500 uppercase"
          />

          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 flex items-center justify-between">
                <span>Matching Facilities Search</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setShowSearchResults(false)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-extrabold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.type}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Facility Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
            className="flex items-center space-x-2 bg-slate-100/80 border border-slate-200 hover:border-slate-300 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span>{selectedFacility}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isFacilityDropdownOpen && (
            <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-xs font-sans">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100">
                Select Facility Campus
              </div>
              {facilities.map((facility) => (
                <button
                  key={facility}
                  onClick={() => {
                    onSelectFacility(facility);
                    setIsFacilityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedFacility === facility ? 'text-cyan-800 font-bold bg-cyan-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{facility}</span>
                  {selectedFacility === facility && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Live Telemetry Pills */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-100/80 border border-slate-200 px-3 py-1 rounded-lg text-[11px] font-mono text-slate-700 font-medium">
          <span className="text-amber-600 font-bold">⚡ Power: <span className="text-amber-600 font-extrabold">840 kW</span></span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-600 font-bold">📈 COP: <span className="text-emerald-600 font-extrabold">4.1</span></span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Alert Bell Button */}
        <button
          onClick={onOpenNotificationsDrawer}
          className="relative p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Operational Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Report Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Report</span>
        </button>

        {/* Ask AI Button */}
        <button
          onClick={onOpenAiDrawer}
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Ask AI</span>
        </button>

        {/* Simulate Button */}
        <button
          onClick={onOpenSimulateModal}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-100" />
          <span className="hidden sm:inline">Simulate</span>
        </button>

        {/* User Profile / Auth Button */}
        <button
          onClick={user ? onOpenProfileSettingsModal : onOpenAuthModal}
          className="flex items-center space-x-1.5 p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-slate-900 text-white font-extrabold flex items-center justify-center text-xs">
            {user ? user.name[0] : <User className="w-3.5 h-3.5 text-cyan-300" />}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden xl:inline">
            {user ? user.name.split(' ')[0] : 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Camera,
  UserCheck,
  UserX,
  Radio,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Play,
  FileCheck,
  Activity,
  Send,
  Building,
  Key,
  DoorClosed,
  DoorOpen,
  Zap,
  Clock,
  User,
  AlertOctagon,
  Sliders,
  Check,
  X,
  Flame,
  Volume2,
  ChevronRight,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  fetchSecurityEventsApi,
  fetchSecuritySummaryApi,
  fetchAccessLogsApi,
  createSecurityEventApi,
  resolveSecurityEventApi,
  simulateAccessEventApi,
  runSecurityAgentApi,
} from '../../api/client';
import { SecurityEventItem, SecuritySummary, TabType } from '../../types';

interface SecurityDashboardProps {
  activeSubTab?: string;
  onNavigateTab?: (tab: TabType) => void;
  onNavigateToOccupancy?: () => void;
}

interface PortalItem {
  id: string;
  name: string;
  location: string;
  type: string;
  readerProtocol: string;
  lockStatus: 'Locked' | 'Unlocked' | 'Lockout' | 'Emergency_Release';
  readerHealth: 'Online' | 'Offline' | 'Tamper';
  lastBadge: string;
  lastUser: string;
  lastTime: string;
  clearanceRequired: string;
}

interface BadgeHolderItem {
  badgeId: string;
  holderName: string;
  role: string;
  department: string;
  clearanceLevel: 'Level 1 (General)' | 'Level 2 (Staff)' | 'Level 3 (IT & Server)' | 'Level 4 (Hazmat & Plant)' | 'Level 5 (Executive)';
  status: 'Active' | 'Revoked' | 'Suspended';
  issuedDate: string;
  lastAccess: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  activeSubTab = 'security-agent',
  onNavigateTab,
  onNavigateToOccupancy
}) => {
  // Current view tab: 'security-agent' (SOC Threat Engine) vs 'access-monitoring' (Live Events & Badging)
  const currentTab = activeSubTab === 'access-monitoring' ? 'access-monitoring' : 'security-agent';

  // Core data states
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Access Logs filter
  const [accessFilterResult, setAccessFilterResult] = useState<'all' | 'granted' | 'denied'>('all');
  const [accessSearchQuery, setAccessSearchQuery] = useState<string>('');

  // Resolution modal state
  const [selectedEventForResolve, setSelectedEventForResolve] = useState<SecurityEventItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolverName, setResolverName] = useState<string>('Marcus Sterling (SOC Lead)');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Incident Creation Modal State
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);
  const [newIncLocation, setNewIncLocation] = useState('Sub-Level 1 Server Room A');
  const [newIncType, setNewIncType] = useState('Unauthorized Access');
  const [newIncSeverity, setNewIncSeverity] = useState<'critical' | 'warning' | 'info'>('critical');
  const [newIncUser, setNewIncUser] = useState('Unknown Entity');
  const [newIncBadge, setNewIncBadge] = useState('BADGE-9940');
  const [newIncDesc, setNewIncDesc] = useState('Repeated unauthenticated badge presentations detected at secure perimeter vault door.');
  const [newIncAction, setNewIncAction] = useState('Dispatch Patrol Unit & review camera stream.');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  // Simulation state
  const [simBadgeId, setSimBadgeId] = useState('BADGE-9921');
  const [simUserName, setSimUserName] = useState('Unknown Contractor');
  const [simUserRole, setSimUserRole] = useState('Visitor / Unregistered');
  const [simDoor, setSimDoor] = useState('Sub-Level 1 Server Room Main Vault Door');
  const [simLocation, setSimLocation] = useState('Sub-Level 1');
  const [simReason, setSimReason] = useState('Unregistered Cryptographic Token');
  const [isSimulating, setIsSimulating] = useState(false);

  // Security Agent AI State
  const [agentAnalysis, setAgentAnalysis] = useState<any>(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Active CCTV Camera Stream Simulator
  const [selectedCamera, setSelectedCamera] = useState<string>('CAM-DC-01');
  const [cameraZoomed, setCameraZoomed] = useState<boolean>(false);

  // Physical Access Portals Status State
  const [portals, setPortals] = useState<PortalItem[]>([
    {
      id: 'PORT-DC-01',
      name: 'Server Room Main Vault Door',
      location: 'Sub-Level 1 Secure Core',
      type: 'Mag-Lock Heavy Steel Vault',
      readerProtocol: 'OSDP v2 Biometric + Smartcard',
      lockStatus: 'Locked',
      readerHealth: 'Online',
      lastBadge: 'BADGE-9921',
      lastUser: 'Unregistered Keycard',
      lastTime: '14:15:22 (DENIED)',
      clearanceRequired: 'Level 3 (IT & Server)',
    },
    {
      id: 'PORT-CHEM-04',
      name: 'Hazmat Storage Portal B',
      location: 'Building 2 Ground Floor',
      type: 'Electro-Magnetic Interlock',
      readerProtocol: 'HID Signo Dual-Frequency',
      lockStatus: 'Locked',
      readerHealth: 'Online',
      lastBadge: 'BADGE-4421',
      lastUser: 'Ethan Vance',
      lastTime: '13:42:08 (DENIED)',
      clearanceRequired: 'Level 4 (Hazmat & Plant)',
    },
    {
      id: 'PORT-ATR-01',
      name: 'Main Atrium East Turnstile 3',
      location: 'Floor 1 Main Atrium',
      type: 'Optical Speed Gate Turnstile',
      readerProtocol: 'RFID + Optical Tailgating IR',
      lockStatus: 'Unlocked',
      readerHealth: 'Online',
      lastBadge: 'BADGE-1082',
      lastUser: 'Carlos Mendes',
      lastTime: '12:28:44 (GRANTED)',
      clearanceRequired: 'Level 1 (General)',
    },
    {
      id: 'PORT-EXEC-02',
      name: 'Executive Suite 204 Lockset',
      location: 'Floor 2 Executive Suite',
      type: 'Motorized Electronic Mortise',
      readerProtocol: 'Keypad PIN + NFC Mobile Credential',
      lockStatus: 'Locked',
      readerHealth: 'Online',
      lastBadge: 'BADGE-EX-098',
      lastUser: 'Executive Assistant',
      lastTime: '11:15:30 (GRANTED)',
      clearanceRequired: 'Level 5 (Executive)',
    },
    {
      id: 'PORT-ROOF-01',
      name: 'Central Chiller Plant Egress Door',
      location: 'Roof Plant Room B',
      type: 'Heavy Weatherproof Mag-Lock',
      readerProtocol: 'HID iClass High Security',
      lockStatus: 'Locked',
      readerHealth: 'Online',
      lastBadge: 'BADGE-2201',
      lastUser: 'Samantha Wright',
      lastTime: '07:45:10 (GRANTED)',
      clearanceRequired: 'Level 4 (Hazmat & Plant)',
    },
    {
      id: 'PORT-FIRE-B',
      name: 'Stairwell B Fire Exit Door',
      location: 'Building 1 Rear Egress',
      type: 'Panic Hardware + Reed Switch Sensor',
      readerProtocol: 'Magnetic Contact Sensor + Siren',
      lockStatus: 'Locked',
      readerHealth: 'Online',
      lastBadge: 'DOOR-REED-S02',
      lastUser: 'Delivery Contractor',
      lastTime: '09:50:14 (LATCHED)',
      clearanceRequired: 'Emergency Only',
    },
  ]);

  // Badge Directory State
  const [badgeDirectory, setBadgeDirectory] = useState<BadgeHolderItem[]>([
    {
      badgeId: 'BADGE-0012',
      holderName: 'Dr. Evelyn Reed',
      role: 'Facility Director',
      department: 'Executive Operations',
      clearanceLevel: 'Level 5 (Executive)',
      status: 'Active',
      issuedDate: '2024-01-15',
      lastAccess: 'Main Atrium Gate 1 (08:32)',
    },
    {
      badgeId: 'BADGE-1082',
      holderName: 'Carlos Mendes',
      role: 'Senior Software Engineer',
      department: 'Engineering & R&D',
      clearanceLevel: 'Level 2 (Staff)',
      status: 'Active',
      issuedDate: '2024-06-20',
      lastAccess: 'East Turnstile 3 (12:28)',
    },
    {
      badgeId: 'BADGE-2201',
      holderName: 'Samantha Wright',
      role: 'HVAC Specialist',
      department: 'Central Plant Ops',
      clearanceLevel: 'Level 4 (Hazmat & Plant)',
      status: 'Active',
      issuedDate: '2023-11-04',
      lastAccess: 'Roof Plant Room (07:45)',
    },
    {
      badgeId: 'BADGE-3031',
      holderName: 'Liam O\'Connor',
      role: 'Lead Security Officer',
      department: 'Security Operations',
      clearanceLevel: 'Level 5 (Executive)',
      status: 'Active',
      issuedDate: '2023-08-10',
      lastAccess: 'CCTV Control Center (06:00)',
    },
    {
      badgeId: 'BADGE-4421',
      holderName: 'Ethan Vance',
      role: 'Maintenance Technician',
      department: 'Facilities General',
      clearanceLevel: 'Level 2 (Staff)',
      status: 'Active',
      issuedDate: '2025-02-14',
      lastAccess: 'Hazmat Portal B (13:42 Denied)',
    },
    {
      badgeId: 'BADGE-9921',
      holderName: 'Unregistered Token #9921',
      role: 'Visitor / Unknown Contractor',
      department: 'Unassigned',
      clearanceLevel: 'Level 1 (General)',
      status: 'Suspended',
      issuedDate: '2026-08-01',
      lastAccess: 'Server Room Main Vault (14:15 Denied)',
    },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, summaryRes, logsRes] = await Promise.all([
        fetchSecurityEventsApi({
          severity: filterSeverity !== 'all' ? filterSeverity : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        }),
        fetchSecuritySummaryApi(),
        fetchAccessLogsApi(),
      ]);

      if (eventsRes && eventsRes.events) {
        setEvents(eventsRes.events);
      }
      if (summaryRes && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (logsRes && logsRes.data) {
        setAccessLogs(logsRes.data);
      }
    } catch (err) {
      console.warn('Failed to load security telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterSeverity, filterStatus]);

  const handleResolveEvent = async () => {
    if (!selectedEventForResolve) return;
    try {
      const res = await resolveSecurityEventApi(
        selectedEventForResolve.id,
        resolutionNotes || 'Physical perimeter verified. Credential cleared.',
        resolverName
      );
      if (res && res.success) {
        setActionSuccessMsg(`Incident ${selectedEventForResolve.id} has been marked RESOLVED.`);
        setSelectedEventForResolve(null);
        setResolutionNotes('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIncident(true);
    try {
      const res = await createSecurityEventApi({
        location: newIncLocation,
        eventType: newIncType,
        severity: newIncSeverity,
        userName: newIncUser,
        badgeId: newIncBadge,
        description: newIncDesc,
        recommendedAction: newIncAction,
      });

      if (res && res.success) {
        setActionSuccessMsg(`New security incident registered and dispatched to SOC active ledger.`);
        setIsCreateIncidentOpen(false);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleSimulateAccess = async (granted: boolean) => {
    setIsSimulating(true);
    setActionSuccessMsg(null);
    try {
      const res = await simulateAccessEventApi({
        badgeId: simBadgeId,
        userName: simUserName,
        userRole: simUserRole,
        doorName: simDoor,
        location: simLocation,
        accessGranted: granted,
        reason: granted ? 'Access Granted — Valid Badge Clearance' : simReason,
      });

      if (res && res.success) {
        setActionSuccessMsg(
          granted
            ? `ACCESS GRANTED logged for ${simUserName} at ${simDoor}.`
            : `SECURITY BREACH DETECTED: Access DENIED logged for ${simUserName} at ${simDoor}. Incident logged in SOC feed.`
        );

        // Update local portal last swipe
        setPortals((prev) =>
          prev.map((p) => {
            if (p.name.includes(simDoor) || simDoor.includes(p.name)) {
              return {
                ...p,
                lastBadge: simBadgeId,
                lastUser: simUserName,
                lastTime: `${new Date().toLocaleTimeString()} (${granted ? 'GRANTED' : 'DENIED'})`,
              };
            }
            return p;
          })
        );

        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleDoorLock = (portalId: string) => {
    setPortals((prev) =>
      prev.map((p) => {
        if (p.id === portalId) {
          const nextStatus = p.lockStatus === 'Locked' ? 'Unlocked' : 'Locked';
          setActionSuccessMsg(`${p.name} manually set to: ${nextStatus.toUpperCase()}`);
          return { ...p, lockStatus: nextStatus };
        }
        return p;
      })
    );
  };

  const handleToggleBadgeStatus = (badgeId: string) => {
    setBadgeDirectory((prev) =>
      prev.map((b) => {
        if (b.badgeId === badgeId) {
          const nextStatus = b.status === 'Active' ? 'Suspended' : 'Active';
          setActionSuccessMsg(`Badge token ${badgeId} (${b.holderName}) updated to: ${nextStatus.toUpperCase()}`);
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const handleRunSecurityAgent = async (customPrompt?: string) => {
    setIsAgentRunning(true);
    try {
      const promptToRun = customPrompt || agentPrompt || undefined;
      const res = await runSecurityAgentApi(promptToRun);
      if (res && res.data) {
        setAgentAnalysis(res.data);
      }
    } catch (err) {
      console.error('Agent analysis error:', err);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleTriggerEmergencyLockdown = () => {
    setPortals((prev) =>
      prev.map((p) => ({
        ...p,
        lockStatus: p.name.includes('Fire') ? 'Emergency_Release' : 'Locked',
      }))
    );
    setActionSuccessMsg('🚨 FACILITY EMERGENCY LOCKDOWN TRIGGERED: All perimeter and high-security doors sealed. Fire exits set to Fail-Safe Egress.');
  };

  const filteredEvents = events.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.location?.toLowerCase().includes(q) ||
      e.eventType?.toLowerCase().includes(q) ||
      e.userName?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q) ||
      e.badgeId?.toLowerCase().includes(q)
    );
  });

  const filteredAccessLogs = accessLogs.filter((log) => {
    if (accessFilterResult === 'granted' && !log.accessGranted) return false;
    if (accessFilterResult === 'denied' && log.accessGranted) return false;
    if (!accessSearchQuery) return true;
    const q = accessSearchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.badgeId?.toLowerCase().includes(q) ||
      log.doorName?.toLowerCase().includes(q) ||
      log.location?.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q)
    );
  });

  const cameras = [
    {
      id: 'CAM-DC-01',
      name: 'Cam 01 — Sub-Level 1 Data Center Vault',
      location: 'Sub-Level 1 Corridor',
      status: 'ALERT',
      statusColor: 'bg-rose-500',
      feedType: 'Optical AI + IR Night Vision',
      detections: '1 Unregistered Entity (Invalid Keycard)',
      fps: '30 FPS • 4K UHD',
    },
    {
      id: 'CAM-ATRIUM-03',
      name: 'Cam 02 — Main Entrance East Turnstiles',
      location: 'Floor 1 Atrium East Gate',
      status: 'WARNING',
      statusColor: 'bg-amber-500',
      feedType: 'Optical Flow + Tailgating Detector',
      detections: 'Tailgating event detected at Turnstile 3',
      fps: '60 FPS • 1080p AI Tracking',
    },
    {
      id: 'CAM-HAZ-02',
      name: 'Cam 03 — Building 2 Hazmat Portal',
      location: 'Building 2 Chemical Storage',
      status: 'ALERT',
      statusColor: 'bg-rose-500',
      feedType: 'Restricted Access Biometric Portal',
      detections: 'Contractor clearance Level-4 mismatch',
      fps: '30 FPS • HDR Color',
    },
    {
      id: 'CAM-STAIR-02',
      name: 'Cam 04 — Rear Emergency Fire Exit B',
      location: 'Stairwell B Perimeter Door',
      status: 'SECURE',
      statusColor: 'bg-emerald-500',
      feedType: 'Magnetic Reed Sensor + Optical Verification',
      detections: 'Door latched and secure',
      fps: '15 FPS • Low Latency PoE',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header & Sub-Tab Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Milestone 3 Security Operations Center (SOC)</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900">
              Autonomous Security & Access Intelligence
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-3xl">
              AI-powered physical perimeter protection, credential verification, anti-tailgating surveillance, and real-time badging access monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh SOC</span>
            </button>
            <button
              onClick={() => handleRunSecurityAgent()}
              disabled={isAgentRunning}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAgentRunning ? 'animate-spin' : ''}`} />
              <span>{isAgentRunning ? 'Evaluating...' : 'Run Threat Assessment'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center space-x-2 border-t border-slate-200 pt-3">
          <button
            onClick={() => onNavigateTab ? onNavigateTab('security-agent') : undefined}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'security-agent'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security Agent (Access Threat Engine)</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
              currentTab === 'security-agent' ? 'bg-purple-900 text-purple-100' : 'bg-purple-100 text-purple-800'
            }`}>
              SOC
            </span>
          </button>

          <button
            onClick={() => onNavigateTab ? onNavigateTab('access-monitoring') : undefined}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'access-monitoring'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Access Monitoring (Live Events & Badging)</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              currentTab === 'access-monitoring' ? 'bg-indigo-900 text-indigo-100' : 'bg-rose-100 text-rose-800'
            }`}>
              LIVE
            </span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: SECURITY AGENT (ACCESS THREAT ENGINE - SOC)                       */}
      {/* ========================================================================= */}
      {currentTab === 'security-agent' && (
        <div className="space-y-6">
          {/* KPI Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Perimeter Health Score</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">{summary?.securityHealthScore ?? 82}%</span>
                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                  (summary?.securityHealthScore ?? 82) > 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {summary?.status || 'Elevated Risk'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">12 Access Gates & Turnstiles Online</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Security Alerts</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-rose-600">{summary?.activeAlertsCount ?? 2}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">ACTION REQUIRED</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">2 Critical breaches awaiting clearance</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unauthorized Swipes</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-amber-600">{summary?.unauthorizedAttempts ?? 1}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">PAST 24H</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Target: Sub-Level 1 Server Room</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Patrol Readiness</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-purple-700">Team Delta</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">STANDBY</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Officer Jackson assigned to Sub-Level 1</div>
            </div>
          </div>

          {/* Autonomous AI Security Agent Console */}
          <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5 border border-purple-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-700/80 text-purple-200 rounded-xl shadow-xs border border-purple-600">
                  <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm lg:text-base font-extrabold text-white flex items-center gap-2">
                    <span>Autonomous SOC Security Agent</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-800 text-purple-200 rounded-md border border-purple-700">
                      Gemini 3.6 Flash / SOC Reasoning
                    </span>
                  </h2>
                  <p className="text-xs text-purple-200/90 font-medium">
                    Continuous threat correlation across optical vision, access logs, electronic locksets, and perimeter sensors.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTriggerEmergencyLockdown}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-600 transition-colors"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Lockdown Facility</span>
                </button>
              </div>
            </div>

            {/* Quick Prompt Scenario Presets */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                Tactical Security Queries & Scenario Presets:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    setAgentPrompt('Perform full forensic analysis of Server Room token breach on BADGE-9921.');
                    handleRunSecurityAgent('Perform full forensic analysis of Server Room token breach on BADGE-9921.');
                  }}
                  className="p-2.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/80 rounded-xl text-left text-xs text-purple-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">Forensic Token Breach Audit</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setAgentPrompt('Evaluate tailgating risk and optical beam sensor triggers at East Atrium Turnstile 3.');
                    handleRunSecurityAgent('Evaluate tailgating risk and optical beam sensor triggers at East Atrium Turnstile 3.');
                  }}
                  className="p-2.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/80 rounded-xl text-left text-xs text-purple-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">Turnstile Tailgating Risk</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setAgentPrompt('Generate containment and clearance protocol for Hazmat Vault Level-4 violation.');
                    handleRunSecurityAgent('Generate containment and clearance protocol for Hazmat Vault Level-4 violation.');
                  }}
                  className="p-2.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/80 rounded-xl text-left text-xs text-purple-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">Hazmat Vault Containment</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    setAgentPrompt('Recommend optimal physical security guard patrol routing for Sub-Level 1 and roof plant.');
                    handleRunSecurityAgent('Recommend optimal physical security guard patrol routing for Sub-Level 1 and roof plant.');
                  }}
                  className="p-2.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-700/80 rounded-xl text-left text-xs text-purple-100 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="truncate">Guard Patrol Routing</span>
                  <ChevronRight className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                </button>
              </div>
            </div>

            {/* Prompt Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={agentPrompt}
                onChange={(e) => setAgentPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSecurityAgent()}
                placeholder="Ask Security Agent (e.g. 'Investigate Sub-Level 1 invalid token entries and dispatch guard')..."
                className="flex-1 bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-purple-300/70 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => handleRunSecurityAgent()}
                disabled={isAgentRunning}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAgentRunning ? 'Analyzing...' : 'Dispatch AI'}</span>
              </button>
            </div>

            {/* AI Security Agent Output Display */}
            {agentAnalysis && (
              <div className="bg-purple-950/80 border border-purple-700/90 rounded-xl p-4 space-y-3.5 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-purple-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white uppercase tracking-wider font-mono">
                      Threat Assessment Output [{agentAnalysis.engineType || 'Gemini 3.6 Flash'}]
                    </span>
                  </div>
                  <button
                    onClick={() => setAgentAnalysis(null)}
                    className="text-purple-300 hover:text-white font-bold cursor-pointer text-xs"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-purple-100 font-medium leading-relaxed">{agentAnalysis.summary}</p>

                  {agentAnalysis.threatAssessment && (
                    <div className="p-3 bg-purple-900/50 border border-purple-700/80 rounded-lg text-purple-100">
                      <span className="font-bold text-amber-300 block mb-1">Forensic Threat Assessment:</span>
                      {agentAnalysis.threatAssessment}
                    </div>
                  )}

                  {agentAnalysis.recommendations && agentAnalysis.recommendations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-purple-300 uppercase tracking-wider font-mono text-[11px] block">
                        Tactical Containment Actions:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {agentAnalysis.recommendations.map((rec: string, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-purple-900/60 rounded-lg text-purple-100 border border-purple-700/80 flex items-start gap-2"
                          >
                            <span className="text-purple-300 font-bold font-mono">{idx + 1}.</span>
                            <span className="leading-snug">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-purple-800/80 text-[11px]">
                    {agentAnalysis.patrolProtocol && (
                      <div className="p-2.5 bg-purple-900/30 rounded-lg border border-purple-800/80 text-purple-200">
                        <span className="font-bold text-emerald-300 block mb-0.5">Recommended Patrol Protocol:</span>
                        {agentAnalysis.patrolProtocol}
                      </div>
                    )}
                    {agentAnalysis.accessControlAdjustment && (
                      <div className="p-2.5 bg-purple-900/30 rounded-lg border border-purple-800/80 text-purple-200">
                        <span className="font-bold text-sky-300 block mb-0.5">Access Control Adjustment:</span>
                        {agentAnalysis.accessControlAdjustment}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CCTV Optical Surveillance Simulation Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  Live CCTV Optical Perimeter & AI Vision Streams
                </h2>
                <p className="text-xs text-slate-500">Real-time edge neural inference for anti-tailgating, badge verification, and door latch anomalies.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-mono font-bold text-slate-700">4 / 4 FEEDS SYNCHRONIZED</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cameras.map((cam) => {
                const isSelected = selectedCamera === cam.id;
                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam.id)}
                    className={`rounded-xl border p-3 space-y-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-900 truncate">{cam.name}</span>
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${cam.statusColor} ${cam.status === 'ALERT' ? 'animate-ping' : ''}`}></span>
                        <span className="text-[9px] font-mono font-bold text-slate-700">{cam.status}</span>
                      </span>
                    </div>

                    {/* Simulated Video Canvas with Neural AI bounding box */}
                    <div className="bg-slate-950 rounded-lg h-32 flex flex-col justify-between p-2 text-slate-400 font-mono text-[10px] relative overflow-hidden group">
                      <div className="flex justify-between items-center z-10">
                        <span className="bg-red-600 text-white font-bold px-1.5 py-0.2 rounded text-[8px] animate-pulse">● LIVE</span>
                        <span className="text-slate-400 text-[9px]">{new Date().toLocaleTimeString()}</span>
                      </div>

                      {/* Visual bounding box simulation */}
                      <div className="flex items-center justify-center space-y-1 flex-col text-slate-500 relative">
                        <Eye className="w-6 h-6 text-slate-400" />
                        <span className="text-[9px] text-slate-400 font-sans">{cam.location}</span>
                        {cam.status === 'ALERT' && (
                          <div className="absolute inset-0 border-2 border-rose-500/80 rounded bg-rose-500/10 flex items-center justify-center animate-pulse">
                            <span className="text-[8px] font-mono font-bold text-rose-300 bg-rose-950/80 px-1 py-0.2 rounded">
                              AI DETECT: 98.4%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="z-10 bg-slate-900/90 text-slate-300 px-1.5 py-0.5 rounded text-[9px] truncate border border-slate-800">
                        {cam.detections}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span className="truncate">{cam.feedType}</span>
                      <span className="text-slate-400 text-[9px] shrink-0">{cam.fps}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Incident Ledger & Anomaly Register */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-600" />
                  Security Incident Ledger & Threat Register
                </h2>
                <p className="text-xs text-slate-500">Active threats, unauthorized badge swiping, and door tamper events with supervisor sign-off.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCreateIncidentOpen(true)}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Incident</span>
                </button>

                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 cursor-pointer"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="warning">Warning Only</option>
                  <option value="info">Info</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search security incidents by location, event type, badge token, or perpetrator identifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Event Cards */}
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-10 text-slate-500 font-mono text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No security incidents matching the current criteria.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isCritical = evt.severity === 'critical';
                  const isWarning = evt.severity === 'warning';
                  const isActive = evt.status === 'active' || evt.status === 'investigating';

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isCritical && isActive
                          ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                          : isWarning && isActive
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isWarning
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {evt.severity}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">{evt.eventType}</span>
                          <span className="text-[10px] font-mono text-slate-500">[{evt.id}]</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              isActive ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {evt.status.toUpperCase()}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{evt.timestamp}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white/80 p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 font-sans font-bold block">Location / Portal</span>
                          <span className="text-slate-900 font-bold">{evt.location}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-sans font-bold block">User / Credential</span>
                          <span className="text-slate-900 font-bold">{evt.userName || evt.userIdentifier} {evt.badgeId ? `(${evt.badgeId})` : ''}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium">{evt.description}</p>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-600 font-mono">
                          <span className="font-bold text-purple-700">Action Protocol:</span> {evt.recommendedAction}
                        </div>

                        {isActive ? (
                          <button
                            onClick={() => setSelectedEventForResolve(evt)}
                            className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-colors"
                          >
                            Resolve & Clear Incident
                          </button>
                        ) : (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Cleared by {evt.resolvedBy || 'Supervisor'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ACCESS MONITORING (LIVE EVENTS & BADGING - LIVE)                   */}
      {/* ========================================================================= */}
      {currentTab === 'access-monitoring' && (
        <div className="space-y-6">
          {/* Top Access Statistics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Authorized Badgings</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-emerald-600">{summary?.authorizedCount ?? 38}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">97.4% SUCCESS</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">All readers operating nominally</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Denied Swipes (Past 24h)</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-rose-600">{summary?.failedAttempts ?? 4}</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">SECURITY AUDIT</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">1 Unregistered token, 1 Hazmat mismatch</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Smart Portals</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-slate-900">{portals.length} Portals</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">100% ONLINE</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">PoE / OSDP v2 Encrypted Stream</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peak Ingress Velocity</div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-extrabold text-indigo-600">142 swipes/hr</span>
                <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">08:30 PEAK</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">Main Atrium East & West Turnstiles</div>
            </div>
          </div>

          {/* Main Grid: Live Badging Simulator + Live Reader Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col (1 Col): Live RFID / Keycard Simulator */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-indigo-600" />
                  Live RFID & Keycard Simulator
                </h2>
                <p className="text-xs text-slate-500">Test physical access portals in real time to trigger live auth logging and threat detections.</p>
              </div>

              {/* Quick credential selection presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">Credential Test Preset</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setSimBadgeId('BADGE-0012');
                      setSimUserName('Dr. Evelyn Reed');
                      setSimUserRole('Facility Director (Level 5)');
                      setSimDoor('Main Entrance Speed Gate 01');
                      setSimLocation('Floor 1 Atrium');
                      setSimReason('Valid Level-5 Executive Token');
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-[10px] font-bold text-slate-800 truncate cursor-pointer"
                  >
                    Director (L5)
                  </button>
                  <button
                    onClick={() => {
                      setSimBadgeId('BADGE-2201');
                      setSimUserName('Samantha Wright');
                      setSimUserRole('HVAC Specialist (Level 4)');
                      setSimDoor('Roof Central Plant AHU-01');
                      setSimLocation('Roof Plant Room');
                      setSimReason('Valid Plant Clearance');
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-[10px] font-bold text-slate-800 truncate cursor-pointer"
                  >
                    HVAC Tech (L4)
                  </button>
                  <button
                    onClick={() => {
                      setSimBadgeId('BADGE-4421');
                      setSimUserName('Ethan Vance');
                      setSimUserRole('Maintenance Contractor (Level 2)');
                      setSimDoor('Hazmat Storage Portal B (Reader CHEM-04)');
                      setSimLocation('Building 2 Floor 1');
                      setSimReason('Missing Level-4 Hazmat Certification');
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-[10px] font-bold text-slate-800 truncate cursor-pointer"
                  >
                    Contractor (L2 Denied)
                  </button>
                  <button
                    onClick={() => {
                      setSimBadgeId('BADGE-9921');
                      setSimUserName('Unregistered Keycard');
                      setSimUserRole('Unknown Entity');
                      setSimDoor('Sub-Level 1 Server Room A');
                      setSimLocation('Sub-Level 1');
                      setSimReason('Unregistered Cryptographic Token');
                    }}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-[10px] font-bold text-slate-800 truncate cursor-pointer text-rose-700"
                  >
                    Unregistered Token
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Access Portal</label>
                  <select
                    value={simDoor}
                    onChange={(e) => {
                      setSimDoor(e.target.value);
                      if (e.target.value.includes('Server')) setSimLocation('Sub-Level 1');
                      else if (e.target.value.includes('Hazmat')) setSimLocation('Building 2 Floor 1');
                      else if (e.target.value.includes('Roof')) setSimLocation('Roof Plant Room');
                      else if (e.target.value.includes('Executive')) setSimLocation('Floor 2 Executive Suite');
                      else setSimLocation('Floor 1 Atrium');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 text-xs"
                  >
                    <option value="Sub-Level 1 Server Room A">Sub-Level 1 Server Room A (Tier-3 DC)</option>
                    <option value="Hazmat Storage Portal B (Reader CHEM-04)">Building 2 Chemical & Battery Vault</option>
                    <option value="Main Entrance Speed Gate 01">Floor 1 Main Atrium Turnstile</option>
                    <option value="Executive Suite 204 Lockset">Floor 2 Executive Suite West</option>
                    <option value="Roof Central Plant AHU-01">Roof Level Central Chiller Room</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Badge ID Token</label>
                  <input
                    type="text"
                    value={simBadgeId}
                    onChange={(e) => setSimBadgeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Bearer Name</label>
                    <input
                      type="text"
                      value={simUserName}
                      onChange={(e) => setSimUserName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Role / Clearance</label>
                    <input
                      type="text"
                      value={simUserRole}
                      onChange={(e) => setSimUserRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Denial Reason (If testing breach)</label>
                  <input
                    type="text"
                    value={simReason}
                    onChange={(e) => setSimReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800 font-mono text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleSimulateAccess(true)}
                    disabled={isSimulating}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Simulate Grant</span>
                  </button>

                  <button
                    onClick={() => handleSimulateAccess(false)}
                    disabled={isSimulating}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Simulate Breach</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col (2 Cols): Live Access Event Stream & Audit Log */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    Live Reader Badging Stream & Access Logs
                  </h2>
                  <p className="text-xs text-slate-500">Real-time RFID/OSDP swipe stream from all building turnstiles and security portals.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={accessFilterResult}
                    onChange={(e: any) => setAccessFilterResult(e.target.value)}
                    className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 cursor-pointer"
                  >
                    <option value="all">All Events</option>
                    <option value="granted">Granted Only</option>
                    <option value="denied">Denied / Breaches</option>
                  </select>
                </div>
              </div>

              {/* Search Bar for Access Logs */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter access logs by user name, badge ID, door reader, or location..."
                  value={accessSearchQuery}
                  onChange={(e) => setAccessSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Access Logs Scrollable Table / Cards */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredAccessLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 font-mono text-xs bg-slate-50 rounded-xl border border-slate-200">
                    No badging logs found matching filter.
                  </div>
                ) : (
                  filteredAccessLogs.map((log: any) => {
                    const isGranted = Boolean(log.accessGranted);
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                          isGranted
                            ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                            : 'bg-rose-50/60 border-rose-200 hover:bg-rose-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              isGranted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isGranted ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-extrabold text-slate-900">{log.userName || log.badgeId}</span>
                              <span className="text-[10px] font-mono text-slate-500 font-bold">[{log.badgeId}]</span>
                              {log.userRole && (
                                <span className="text-[10px] text-slate-600 bg-slate-200/60 px-1.5 py-0.2 rounded">
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2 mt-0.5">
                              <span>{log.doorName || log.location}</span>
                              <span>•</span>
                              <span>{log.location}</span>
                            </div>
                            {!isGranted && log.reason && (
                              <div className="text-[10px] text-rose-700 font-mono font-bold mt-1">
                                Denial Trigger: {log.reason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center shrink-0">
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                              isGranted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-600 text-white shadow-2xs'
                            }`}
                          >
                            {isGranted ? 'GRANTED' : 'DENIED'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 mt-1">
                            {log.timestamp ? (log.timestamp.includes('T') ? log.timestamp.replace('T', ' ').substring(0, 16) : log.timestamp) : 'Live'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Physical Access Portals & Electronic Lockset Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Physical Access Portals & Electronic Lockset Matrix
                </h2>
                <p className="text-xs text-slate-500">Live hardware telemetry and remote lock override controls for critical doors.</p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPortals((prev) => prev.map((p) => ({ ...p, lockStatus: 'Locked' })));
                    setActionSuccessMsg('All building portals set to: LOCKED');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Lock All
                </button>
                <button
                  onClick={() => {
                    setPortals((prev) => prev.map((p) => ({ ...p, lockStatus: 'Unlocked' })));
                    setActionSuccessMsg('All building portals set to: UNLOCKED');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Unlock All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portals.map((portal) => {
                const isLocked = portal.lockStatus === 'Locked';
                const isEmergency = portal.lockStatus === 'Emergency_Release';

                return (
                  <div
                    key={portal.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 truncate">{portal.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isEmergency
                            ? 'bg-amber-100 text-amber-800'
                            : isLocked
                            ? 'bg-slate-900 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{portal.lockStatus.toUpperCase()}</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-bold text-slate-800">{portal.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hardware:</span>
                        <span className="text-slate-800">{portal.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Required Level:</span>
                        <span className="text-purple-700 font-bold">{portal.clearanceRequired}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-100">
                        <span className="text-slate-400">Last Swipe:</span>
                        <span className="text-slate-700 font-bold truncate max-w-[160px]">{portal.lastUser}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleToggleDoorLock(portal.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                          isLocked
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isLocked ? 'Remote Unlock' : 'Manual Lock'}</span>
                      </button>

                      <button
                        onClick={() => setActionSuccessMsg(`Audio buzzer tested on ${portal.name}. Reader LED flashed green.`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors"
                        title="Test Reader Buzzer"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge & Credential Directory (Role-Based Access Control) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600" />
                  Badge & Credential Management Directory
                </h2>
                <p className="text-xs text-slate-500">Registered access tokens, clearance levels, active status, and instant token revocation.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Bearer Name & ID</th>
                    <th className="py-2.5 px-3">Role / Department</th>
                    <th className="py-2.5 px-3">Clearance Tier</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Portal Swipe</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {badgeDirectory.map((b) => (
                    <tr key={b.badgeId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-extrabold text-slate-900">{b.holderName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{b.badgeId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{b.role}</div>
                        <div className="text-[10px] text-slate-500">{b.department}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-purple-700">
                        {b.clearanceLevel}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {b.lastAccess}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleBadgeStatus(b.badgeId)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                            b.status === 'Active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {b.status === 'Active' ? 'Revoke Token' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Incident Resolution Modal */}
      {selectedEventForResolve && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Resolve Security Incident</h3>
                  <span className="text-[10px] font-mono text-slate-500">ID: {selectedEventForResolve.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventForResolve(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">{selectedEventForResolve.eventType}</div>
                <div className="text-slate-600 font-mono">{selectedEventForResolve.location}</div>
                <p className="text-slate-700 text-[11px] mt-1">{selectedEventForResolve.description}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Supervisor Resolution Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Officer Jackson verified physical credentials. Access privileges restored and door locked."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Officer / Clearing Supervisor</label>
                <input
                  type="text"
                  value={resolverName}
                  onChange={(e) => setResolverName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedEventForResolve(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveEvent}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Security Incident Modal */}
      {isCreateIncidentOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Log Security Incident</h3>
                  <span className="text-[10px] font-mono text-slate-500">Security Operations Center Dispatch</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateIncidentOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewIncident} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Event Type</label>
                  <select
                    value={newIncType}
                    onChange={(e) => setNewIncType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
                  >
                    <option value="Unauthorized Access">Unauthorized Access</option>
                    <option value="Restricted Area Access">Restricted Area Access</option>
                    <option value="Tailgating Detected">Tailgating Detected</option>
                    <option value="Door Forced Open">Door Forced Open</option>
                    <option value="Keypad Tamper Lockout">Keypad Tamper Lockout</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newIncSeverity}
                    onChange={(e: any) => setNewIncSeverity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
                  >
                    <option value="critical">Critical (P1)</option>
                    <option value="warning">Warning (P2)</option>
                    <option value="info">Info (P3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Location / Access Portal</label>
                <input
                  type="text"
                  value={newIncLocation}
                  onChange={(e) => setNewIncLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject / Person of Interest</label>
                  <input
                    type="text"
                    value={newIncUser}
                    onChange={(e) => setNewIncUser(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Badge / Token ID</label>
                  <input
                    type="text"
                    value={newIncBadge}
                    onChange={(e) => setNewIncBadge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Description / Anomaly Notes</label>
                <textarea
                  rows={2}
                  value={newIncDesc}
                  onChange={(e) => setNewIncDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Recommended Action Protocol</label>
                <input
                  type="text"
                  value={newIncAction}
                  onChange={(e) => setNewIncAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateIncidentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs transition-colors"
                >
                  {isSubmittingIncident ? 'Registering...' : 'Dispatch Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

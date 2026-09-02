export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  facilityId: string;
  passwordHash?: string;
  salt?: string;
}

export interface EquipmentData {
  id: string;
  name: string;
  category: string;
  location: string;
  healthScore: number;
  status: 'Optimal' | 'Warning' | 'Critical';
  vibrationMms: number;
  temperatureC: number;
  copEfficiency: number;
  rulDays: number;
  rulHours?: number;
  operatingHours?: number;
  lastService: string;
  nextService?: string;
  criticality?: 'High' | 'Medium' | 'Low';
}

export interface FailureRiskFactor {
  metric: string;
  currentValue: string;
  threshold: string;
  weight: string;
  contributionScore: number;
  severity: 'normal' | 'warning' | 'critical';
}

export interface FailureRiskData {
  equipmentId: string;
  equipmentName: string;
  riskScore: number; // 0 - 100%
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  primaryFailureMode: string;
  timeToFailureEstimate: string;
  riskFactors: FailureRiskFactor[];
  modelType: string;
  modelDisclaimer: string;
}

export interface MaintenanceScheduleData {
  id: string;
  equipmentId: string;
  equipmentName: string;
  taskType: string;
  scheduledDate: string;
  recurrence: string;
  assignedTechnician: string;
  estimatedDurationHrs: number;
  status: 'Scheduled' | 'In Progress' | 'Pending Parts' | 'Completed';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  instructions?: string;
}

export interface MaintenanceRecordData {
  id: string;
  equipmentId: string;
  equipmentName: string;
  workOrderId?: string;
  completedDate: string;
  serviceType: string;
  technician: string;
  costUsd: number;
  downtimeRecordedHrs: number;
  partsReplaced: string[];
  findings: string;
  outcome: string;
}

export interface IotDeviceData {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'Online' | 'Offline' | 'Degraded';
  rssi: string;
  firmware: string;
  uptime: string;
  lastPing: string;
  lastPingTimestamp?: number;
  isPhysicalHardware?: boolean;
}

export interface TelemetryData {
  timestamp: string;
  deviceId: string;
  topic: string;
  payload: Record<string, any>;
}

export interface OccupancyZoneData {
  id: string;
  facilityId?: string;
  buildingId?: string;
  floor: number;
  zone: string;
  name: string;
  location?: string;
  currentOccupancy: number;
  occupantCount: number;
  capacity: number;
  maxCapacity: number;
  occupancyPercentage: number;
  co2Ppm: number;
  tempC: number;
  humidityPct: number;
  status: string;
  hvacLoadPct: number;
  timestamp: string;
  recommendedAction?: string;
  historical: Array<{ time: string; occupantCount: number; co2Ppm: number }>;
}

export interface SecurityEventData {
  id: string;
  eventId: string;
  location: string;
  accessPoint: string;
  userIdentifier?: string;
  userName?: string;
  userRole?: string;
  eventType: 
    | 'Authorized Access'
    | 'Unauthorized Access'
    | 'Failed Access'
    | 'Restricted Area Access'
    | 'Suspicious Activity'
    | 'Tailgating Detected'
    | 'Door Forced Open';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  description: string;
  recommendedAction: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  badgeId?: string;
  cameraFeedId?: string;
}

export interface AccessEventData {
  id: string;
  badgeId: string;
  userName: string;
  userRole: string;
  doorName: string;
  location: string;
  accessGranted: boolean;
  reason?: string;
  timestamp: string;
}

export interface PortfolioSiteData {
  id: string;
  name: string;
  location: string;
  sqft: number;
  occupantCount: number;
  activeDemandKw: number;
  healthScore: number;
  status: 'Optimal' | 'Warning' | 'Critical';
}

export interface WorkOrderData {
  id: string;
  facilityId: string;
  assetId: string;
  assetName: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTechnician: string;
  createdAt: string;
  estimatedCostUsd: number;
  preventedDowntimeHrs: number;
  generatedBy: string;
  sparePartsRequired: string[];
}

export interface AlertLogData {
  id: string;
  timestamp: string;
  channel: string;
  recipient: string;
  subject: string;
  title?: string;
  body: string;
  message?: string;
  status: string;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  severity?: 'critical' | 'warning' | 'info' | 'resolved';
  category?: 'energy' | 'maintenance' | 'occupancy' | 'security';
  equipmentId?: string;
  equipmentName?: string;
  detectionSource?: string;
  metricTrigger?: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  workOrderId?: string;
}

export interface RecommendationData {
  id: string;
  agentType: 'energy' | 'maintenance' | 'occupancy';
  title: string;
  description: string;
  estimatedSavingsUsdMonth: number;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

export interface ReportData {
  id: string;
  filename: string;
  title: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'energy' | 'maintenance' | 'ai-analysis' | 'executive';
  format: 'csv' | 'pdf';
  facilityId?: string;
  facilityName?: string;
  dateRange?: string;
  content: string;
  summaryStats?: Record<string, any>;
  generatedAt: string;
  generatedBy?: string;
  fileSizeKb?: number;
}

// Stores
export const usersStore: UserData[] = [
  {
    id: 'USR-001',
    name: 'Sarah Jenkins',
    email: 's.jenkins@apexhighrise.com',
    role: 'Facility Manager',
    facilityId: 'apex-hq'
  },
  {
    id: 'USR-002',
    name: 'Marcus Vance',
    email: 'marcus.vance@apexhighrise.com',
    role: 'Chief Engineer',
    facilityId: 'apex-hq'
  },
  {
    id: 'USR-003',
    name: 'Dave Miller',
    email: 'dave.miller@apexhighrise.com',
    role: 'Maintenance Tech',
    facilityId: 'apex-hq'
  }
];

export const equipmentStore: EquipmentData[] = [
  {
    id: 'CHILLER-01',
    name: 'Centrifugal Water Chiller CH-01',
    category: 'HVAC Chilled Water Plant',
    location: 'Basement Mechanical Room A',
    healthScore: 94,
    status: 'Optimal',
    vibrationMms: 1.8,
    temperatureC: 42.1,
    copEfficiency: 4.35,
    rulDays: 180,
    rulHours: 4320,
    operatingHours: 11400,
    lastService: '2026-07-15',
    nextService: '2026-10-15',
    criticality: 'High'
  },
  {
    id: 'CHILLER-02',
    name: 'Centrifugal Water Chiller CH-02',
    category: 'HVAC Chilled Water Plant',
    location: 'Basement Mechanical Room B',
    healthScore: 68,
    status: 'Warning',
    vibrationMms: 4.8,
    temperatureC: 78.4,
    copEfficiency: 3.20,
    rulDays: 18,
    rulHours: 432,
    operatingHours: 18250,
    lastService: '2026-03-10',
    nextService: '2026-08-18',
    criticality: 'High'
  },
  {
    id: 'AHU-04',
    name: 'Air Handling Unit AHU-04',
    category: 'Air Distribution',
    location: 'Mechanical Floor 4',
    healthScore: 74,
    status: 'Warning',
    vibrationMms: 3.2,
    temperatureC: 54.0,
    copEfficiency: 3.80,
    rulDays: 32,
    rulHours: 768,
    operatingHours: 14600,
    lastService: '2026-05-20',
    nextService: '2026-08-25',
    criticality: 'Medium'
  },
  {
    id: 'PUMP-01',
    name: 'Chilled Water Circulation Pump P-01',
    category: 'Hydronic Primary Loop',
    location: 'Pump House West',
    healthScore: 98,
    status: 'Optimal',
    vibrationMms: 1.1,
    temperatureC: 38.5,
    copEfficiency: 4.50,
    rulDays: 240,
    rulHours: 5760,
    operatingHours: 8900,
    lastService: '2026-06-01',
    nextService: '2026-12-01',
    criticality: 'Medium'
  },
  {
    id: 'COOLING-TWR-01',
    name: 'Induced Draft Cooling Tower CT-01',
    category: 'Heat Rejection Plant',
    location: 'Roof Deck North',
    healthScore: 71,
    status: 'Warning',
    vibrationMms: 3.9,
    temperatureC: 64.2,
    copEfficiency: 3.95,
    rulDays: 24,
    rulHours: 576,
    operatingHours: 16400,
    lastService: '2026-04-12',
    nextService: '2026-08-22',
    criticality: 'High'
  }
];

export const maintenanceSchedulesStore: MaintenanceScheduleData[] = [
  {
    id: 'SCH-2026-01',
    equipmentId: 'CHILLER-02',
    equipmentName: 'Centrifugal Water Chiller CH-02',
    taskType: 'Condition-Triggered Drive Bearing Overhaul & Alignment',
    scheduledDate: '2026-08-18',
    recurrence: 'Condition-Triggered',
    assignedTechnician: 'Marcus Vance (Chief Engineer)',
    estimatedDurationHrs: 6.5,
    status: 'Scheduled',
    priority: 'Critical',
    instructions: 'Perform ISO 10816 high-frequency vibration teardown, replace angular contact drive bearings, inspect hydrodynamic oil film, and descale condenser tube bundle.'
  },
  {
    id: 'SCH-2026-02',
    equipmentId: 'COOLING-TWR-01',
    equipmentName: 'Induced Draft Cooling Tower CT-01',
    taskType: 'Fan Gearbox Backlash & Dynamic Balancing',
    scheduledDate: '2026-08-22',
    recurrence: 'Condition-Triggered',
    assignedTechnician: 'Dave Miller (Senior Tech)',
    estimatedDurationHrs: 4.0,
    status: 'Scheduled',
    priority: 'High',
    instructions: 'Check gear oil viscosity, re-torque blade hub clamps, and balance rotor assembly to under 1.5 mm/s.'
  },
  {
    id: 'SCH-2026-03',
    equipmentId: 'AHU-04',
    equipmentName: 'Air Handling Unit AHU-04',
    taskType: 'HEPA / MERV Filter Replacement & Actuator Calibration',
    scheduledDate: '2026-08-25',
    recurrence: 'Quarterly',
    assignedTechnician: 'Dave Miller (Senior Tech)',
    estimatedDurationHrs: 3.0,
    status: 'Scheduled',
    priority: 'Medium',
    instructions: 'Replace differential pressure filter banks and calibrate 0-10V fresh air damper modulation.'
  },
  {
    id: 'SCH-2026-04',
    equipmentId: 'CHILLER-01',
    equipmentName: 'Centrifugal Water Chiller CH-01',
    taskType: 'Quarterly Refrigerant Spectrometry & Oil Analysis',
    scheduledDate: '2026-10-15',
    recurrence: 'Quarterly',
    assignedTechnician: 'Marcus Vance (Chief Engineer)',
    estimatedDurationHrs: 2.5,
    status: 'Scheduled',
    priority: 'Low',
    instructions: 'Sample synthetic polyolester oil for moisture and acid levels, check subcooling.'
  }
];

export const maintenanceRecordsStore: MaintenanceRecordData[] = [
  {
    id: 'REC-HIST-2026-01',
    equipmentId: 'CHILLER-02',
    equipmentName: 'Centrifugal Water Chiller CH-02',
    workOrderId: 'WO-2026-8801',
    completedDate: '2026-03-10',
    serviceType: 'Bearing Lubricant Replenishment & Dynamic Rotor Balancing',
    technician: 'Marcus Vance',
    costUsd: 1450,
    downtimeRecordedHrs: 3.5,
    partsReplaced: ['SKF Lithium Complex EP2 Grease', 'Shaft Oil Seal Kit #402'],
    findings: 'Initial vibration 4.6 mm/s at 120 Hz. Flushed contaminated grease and realigned coupling. Post-service vibration 2.1 mm/s.',
    outcome: 'Resolved — Restored to Nominal Operating Limits'
  },
  {
    id: 'REC-HIST-2026-02',
    equipmentId: 'AHU-04',
    equipmentName: 'Air Handling Unit AHU-04',
    workOrderId: 'WO-2026-8742',
    completedDate: '2026-05-20',
    serviceType: 'Supply Fan V-Belt Replacement & Belt Tensioning',
    technician: 'Dave Miller',
    costUsd: 680,
    downtimeRecordedHrs: 2.0,
    partsReplaced: ['Gates Quad-Power 4 V-Belts (Set of 4)', 'Tension Pulley Bearing'],
    findings: 'Found slipping belts causing airflow reduction and motor heat. Tension set to 55 lbs deflection.',
    outcome: 'Resolved — Airflow Restored to 14,500 CFM'
  },
  {
    id: 'REC-HIST-2026-03',
    equipmentId: 'PUMP-01',
    equipmentName: 'Chilled Water Circulation Pump P-01',
    workOrderId: 'WO-2026-8619',
    completedDate: '2026-06-01',
    serviceType: 'Mechanical Seal Inspection & Impeller Flush',
    technician: 'Dave Miller',
    costUsd: 890,
    downtimeRecordedHrs: 1.5,
    partsReplaced: ['Silicon Carbide Mechanical Seal Ring', 'EPDM Gasket Set'],
    findings: 'Minor weeping at primary seal. Flushed sediment and installed new silicon carbide seal face. Zero leakage verified.',
    outcome: 'Resolved — Hydrostatic test passed at 150 PSI'
  }
];

export const iotDevicesStore: IotDeviceData[] = [
  {
    id: 'GW-ESP32-CHILLER-01',
    name: 'Chiller Plant ESP32 Gateway',
    location: 'Chiller Plant Room B',
    type: 'ESP32 Modbus/MQTT Node',
    status: 'Online',
    rssi: '-58 dBm',
    firmware: 'v2.4.1-bms',
    uptime: '99.98%',
    lastPing: 'Just now'
  },
  {
    id: 'GW-ESP32-AHU-FLOOR3',
    name: 'AHU Mechanical Gateway 03',
    location: 'AHU Mech Room 3',
    type: 'ESP32 RS485 Node',
    status: 'Online',
    rssi: '-62 dBm',
    firmware: 'v2.4.1-bms',
    uptime: '99.91%',
    lastPing: '2s ago'
  },
  {
    id: 'GW-ESP32-POWER-MAIN',
    name: 'Substation Transformer Node',
    location: 'Substation Transformer 2',
    type: 'ESP32 Power Meter Bridge',
    status: 'Online',
    rssi: '-48 dBm',
    firmware: 'v2.5.0-bms',
    uptime: '100.00%',
    lastPing: 'Just now'
  },
  {
    id: 'GW-ESP32-CO2-LOBBY',
    name: 'Lobby Environmental Node',
    location: 'Main Entrance Lobby',
    type: 'ESP32 IAQ Sensor Gateway',
    status: 'Degraded',
    rssi: '-81 dBm',
    firmware: 'v2.3.9-bms',
    uptime: '96.40%',
    lastPing: '12s ago'
  }
];

export const telemetryStore: TelemetryData[] = [
  {
    timestamp: new Date().toISOString(),
    deviceId: 'GW-ESP32-CHILLER-01',
    topic: 'telemetry/chiller1/vibration',
    payload: { rms_x: 4.82, rms_y: 3.12, peak_fz: 120.4, status: 'Warning' }
  },
  {
    timestamp: new Date().toISOString(),
    deviceId: 'GW-ESP32-CHILLER-01',
    topic: 'telemetry/chiller1/temperature',
    payload: { bearing_outboard: 78.4, evap_in: 12.1, evap_out: 6.8 }
  },
  {
    timestamp: new Date().toISOString(),
    deviceId: 'GW-ESP32-POWER-MAIN',
    topic: 'telemetry/power/main',
    payload: { active_kw: 840.2, pf: 0.98, harmonic_thd: 2.1 }
  }
];

export const occupancyStore: OccupancyZoneData[] = [
  {
    id: 'ZONE-CONF-HALL-A',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 2,
    zone: 'Zone B - Conference Center',
    name: 'Conference Hall A',
    location: 'Floor 2 West Wing',
    currentOccupancy: 108,
    occupantCount: 108,
    capacity: 100,
    maxCapacity: 100,
    occupancyPercentage: 108,
    co2Ppm: 1280,
    tempC: 24.8,
    humidityPct: 62,
    status: 'Overcrowded',
    hvacLoadPct: 98,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Reduce occupancy or redirect users to available spaces (Conference Hub B or Cafeteria). Boost HVAC fresh air intake.',
    historical: [
      { time: '08:00', occupantCount: 15, co2Ppm: 450 },
      { time: '10:00', occupantCount: 75, co2Ppm: 780 },
      { time: '12:00', occupantCount: 102, co2Ppm: 1120 },
      { time: '14:00', occupantCount: 108, co2Ppm: 1280 },
      { time: '16:00', occupantCount: 88, co2Ppm: 990 },
      { time: '18:00', occupantCount: 22, co2Ppm: 520 },
    ],
  },
  {
    id: 'ZONE-PROD-FLOOR-A',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 1,
    zone: 'Zone A - Production',
    name: 'Production Floor A',
    location: 'Building 1 Ground Floor',
    currentOccupancy: 42,
    occupantCount: 42,
    capacity: 60,
    maxCapacity: 60,
    occupancyPercentage: 70,
    co2Ppm: 640,
    tempC: 21.8,
    humidityPct: 48,
    status: 'Moderate',
    hvacLoadPct: 65,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Nominal operational state. Scheduled shift change at 16:00.',
    historical: [
      { time: '08:00', occupantCount: 38, co2Ppm: 580 },
      { time: '10:00', occupantCount: 44, co2Ppm: 650 },
      { time: '12:00', occupantCount: 30, co2Ppm: 560 },
      { time: '14:00', occupantCount: 42, co2Ppm: 640 },
      { time: '16:00', occupantCount: 45, co2Ppm: 660 },
      { time: '18:00', occupantCount: 20, co2Ppm: 500 },
    ],
  },
  {
    id: 'ZONE-SERVER-ROOM-A',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 1,
    zone: 'Zone S - Data Center',
    name: 'Server Room A (Tier-3 DC)',
    location: 'Sub-Level 1 Secure Enclosure',
    currentOccupancy: 2,
    occupantCount: 2,
    capacity: 5,
    maxCapacity: 5,
    occupancyPercentage: 40,
    co2Ppm: 420,
    tempC: 19.2,
    humidityPct: 42,
    status: 'Normal',
    hvacLoadPct: 85,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Precision CRAC cooling in active closed-loop balance. High security area.',
    historical: [
      { time: '08:00', occupantCount: 1, co2Ppm: 410 },
      { time: '10:00', occupantCount: 2, co2Ppm: 420 },
      { time: '12:00', occupantCount: 2, co2Ppm: 430 },
      { time: '14:00', occupantCount: 2, co2Ppm: 420 },
      { time: '16:00', occupantCount: 1, co2Ppm: 410 },
      { time: '18:00', occupantCount: 0, co2Ppm: 400 },
    ],
  },
  {
    id: 'ZONE-RD-CLEAN-LAB',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-02',
    floor: 4,
    zone: 'Zone R - Research',
    name: 'R&D Cleanroom Lab 4B',
    location: 'Building 2 Floor 4',
    currentOccupancy: 14,
    occupantCount: 14,
    capacity: 20,
    maxCapacity: 20,
    occupancyPercentage: 70,
    co2Ppm: 520,
    tempC: 20.5,
    humidityPct: 45,
    status: 'Moderate',
    hvacLoadPct: 75,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Cleanroom ISO-6 positive pressure maintained. HEPA filter delta P normal.',
    historical: [
      { time: '08:00', occupantCount: 8, co2Ppm: 460 },
      { time: '10:00', occupantCount: 15, co2Ppm: 530 },
      { time: '12:00', occupantCount: 11, co2Ppm: 490 },
      { time: '14:00', occupantCount: 14, co2Ppm: 520 },
      { time: '16:00', occupantCount: 12, co2Ppm: 510 },
      { time: '18:00', occupantCount: 3, co2Ppm: 440 },
    ],
  },
  {
    id: 'ZONE-LOBBY',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 1,
    zone: 'Zone A - Ground',
    name: 'Main Entrance & Atrium Lobby',
    location: 'Floor 1 Main Atrium',
    currentOccupancy: 142,
    occupantCount: 142,
    capacity: 300,
    maxCapacity: 300,
    occupancyPercentage: 47,
    co2Ppm: 680,
    tempC: 22.4,
    humidityPct: 45,
    status: 'Normal',
    hvacLoadPct: 45,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Optimal natural ventilation mix.',
    historical: [
      { time: '08:00', occupantCount: 45, co2Ppm: 480 },
      { time: '10:00', occupantCount: 98, co2Ppm: 560 },
      { time: '12:00', occupantCount: 165, co2Ppm: 720 },
      { time: '14:00', occupantCount: 142, co2Ppm: 680 },
      { time: '16:00', occupantCount: 110, co2Ppm: 610 },
      { time: '18:00', occupantCount: 35, co2Ppm: 510 },
    ],
  },
  {
    id: 'ZONE-FLOOR2-EXEC',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 2,
    zone: 'Zone B - Corporate',
    name: 'Floor 2 Executive Suites',
    location: 'Floor 2 West Wing',
    currentOccupancy: 180,
    occupantCount: 180,
    capacity: 250,
    maxCapacity: 250,
    occupancyPercentage: 72,
    co2Ppm: 510,
    tempC: 23.0,
    humidityPct: 46,
    status: 'Moderate',
    hvacLoadPct: 52,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Standard thermal comfort profile active.',
    historical: [
      { time: '08:00', occupantCount: 30, co2Ppm: 420 },
      { time: '10:00', occupantCount: 120, co2Ppm: 480 },
      { time: '12:00', occupantCount: 195, co2Ppm: 530 },
      { time: '14:00', occupantCount: 180, co2Ppm: 510 },
      { time: '16:00', occupantCount: 140, co2Ppm: 490 },
      { time: '18:00', occupantCount: 40, co2Ppm: 440 },
    ],
  },
  {
    id: 'ZONE-FLOOR3-EAST',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 3,
    zone: 'Zone C - Engineering',
    name: 'Floor 3 Open Workspace (East Wing)',
    location: 'Floor 3 Engineering Wing',
    currentOccupancy: 280,
    occupantCount: 280,
    capacity: 300,
    maxCapacity: 300,
    occupancyPercentage: 93,
    co2Ppm: 1120,
    tempC: 24.1,
    humidityPct: 58,
    status: 'High',
    hvacLoadPct: 88,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Ventilation boost suggested. CO2 levels approaching 1200 ppm threshold.',
    historical: [
      { time: '08:00', occupantCount: 60, co2Ppm: 510 },
      { time: '10:00', occupantCount: 210, co2Ppm: 820 },
      { time: '12:00', occupantCount: 290, co2Ppm: 1180 },
      { time: '14:00', occupantCount: 280, co2Ppm: 1120 },
      { time: '16:00', occupantCount: 250, co2Ppm: 990 },
      { time: '18:00', occupantCount: 90, co2Ppm: 650 },
    ],
  },
  {
    id: 'ZONE-CAFETERIA',
    facilityId: 'apex-hq',
    buildingId: 'BLDG-01',
    floor: 1,
    zone: 'Zone D - Dining',
    name: 'Main Cafeteria & Food Court',
    location: 'Floor 1 North Pavilion',
    currentOccupancy: 195,
    occupantCount: 195,
    capacity: 200,
    maxCapacity: 200,
    occupancyPercentage: 98,
    co2Ppm: 980,
    tempC: 23.4,
    humidityPct: 52,
    status: 'High',
    hvacLoadPct: 92,
    timestamp: new Date().toISOString(),
    recommendedAction: 'Near maximum capacity. Exhaust hoods running at 100%.',
    historical: [
      { time: '08:00', occupantCount: 25, co2Ppm: 450 },
      { time: '10:00', occupantCount: 40, co2Ppm: 510 },
      { time: '12:00', occupantCount: 198, co2Ppm: 1050 },
      { time: '14:00', occupantCount: 195, co2Ppm: 980 },
      { time: '16:00', occupantCount: 45, co2Ppm: 560 },
      { time: '18:00', occupantCount: 20, co2Ppm: 460 },
    ],
  },
];

export const securityEventsStore: SecurityEventData[] = [
  {
    id: 'SEC-EV-901',
    eventId: 'EV-2026-901',
    location: 'Sub-Level 1 Server Room A',
    accessPoint: 'Server Room Main Vault Door (Reader DC-01)',
    userIdentifier: 'UNKNOWN_BADGE_9921',
    userName: 'Unregistered Keycard',
    userRole: 'Visitor / Unassigned',
    eventType: 'Unauthorized Access',
    severity: 'critical',
    timestamp: '2026-08-07 14:15',
    status: 'active',
    description: 'Repeated invalid cryptographic token presented to Tier-3 Data Center access gate after business hours.',
    recommendedAction: 'Verify access credentials and review security footage on Camera FEED-DC-01. Dispatch patrol officer if unverified.',
    badgeId: 'BADGE-9921',
    cameraFeedId: 'CAM-DC-01'
  },
  {
    id: 'SEC-EV-902',
    eventId: 'EV-2026-902',
    location: 'Building 2 Chemical & Battery Vault',
    accessPoint: 'Hazmat Storage Portal B (Reader CHEM-04)',
    userIdentifier: 'EMP-4421',
    userName: 'Ethan Vance (Facilities Tech)',
    userRole: 'Maintenance Contractor',
    eventType: 'Restricted Area Access',
    severity: 'critical',
    timestamp: '2026-08-07 13:42',
    status: 'investigating',
    description: 'Badge swipe attempted at Class 1 Hazmat vault without active Level-4 Chem Safety certification on file.',
    recommendedAction: 'Verify authorization manifest with EHS Safety Officer. Confirm badge privileges in Access Control Manager.',
    badgeId: 'BADGE-4421',
    cameraFeedId: 'CAM-HAZ-02'
  },
  {
    id: 'SEC-EV-903',
    eventId: 'EV-2026-903',
    location: 'Floor 1 Main Atrium East Gate',
    accessPoint: 'East Optical Turnstile 03',
    userIdentifier: 'EMP-1082',
    userName: 'Carlos Mendes',
    userRole: 'Software Engineer',
    eventType: 'Tailgating Detected',
    severity: 'warning',
    timestamp: '2026-08-07 12:28',
    status: 'active',
    description: 'Optical beam sensors detected two individuals passing through Turnstile 3 on a single badge authorization.',
    recommendedAction: 'Alert receptionist & lobby guard station. Check visitor registration registry.',
    badgeId: 'BADGE-1082',
    cameraFeedId: 'CAM-ATRIUM-03'
  },
  {
    id: 'SEC-EV-904',
    eventId: 'EV-2026-904',
    location: 'Floor 2 Executive Suite West',
    accessPoint: 'Executive Suite 204 Lockset',
    userIdentifier: 'BADGE-EX-098',
    userName: 'Anonymous / Failed Keycode',
    userRole: 'Unknown',
    eventType: 'Failed Access',
    severity: 'warning',
    timestamp: '2026-08-07 11:15',
    status: 'resolved',
    description: '5 consecutive invalid keypad PIN entries within 90 seconds. Electronic lock went into anti-tamper lockout for 5 minutes.',
    recommendedAction: 'Lockout expired. Verified as executive assistant entering updated temporary visitor PIN.',
    resolutionNotes: 'Executive assistant updated expired PIN. Incident cleared by Security Supervisor.',
    resolvedAt: '2026-08-07 11:30',
    resolvedBy: 'Marcus Sterling (Chief Security Officer)',
    badgeId: 'BADGE-EX-098',
    cameraFeedId: 'CAM-EXEC-01'
  },
  {
    id: 'SEC-EV-905',
    eventId: 'EV-2026-905',
    location: 'Building 1 Rear Emergency Exit',
    accessPoint: 'Stairwell B Fire Exit Door (Door Contact S-02)',
    userIdentifier: 'NONE (Door Magnetic Contact)',
    userName: 'Perimeter Sensor',
    userRole: 'Perimeter Security',
    eventType: 'Door Forced Open',
    severity: 'critical',
    timestamp: '2026-08-07 09:50',
    status: 'resolved',
    description: 'Magnetic reed switch tripped without authorized egress button press or fire alarm relay trigger.',
    recommendedAction: 'Inspect emergency exit door latching mechanism. Verify whether door was propped open for delivery.',
    resolutionNotes: 'Delivery contractor was loading supplies. Door re-latched and alarm contact reset.',
    resolvedAt: '2026-08-07 10:05',
    resolvedBy: 'Officer Jackson (Patrol Team Alpha)',
    cameraFeedId: 'CAM-STAIR-02'
  },
  {
    id: 'SEC-EV-906',
    eventId: 'EV-2026-906',
    location: 'Floor 1 Main Atrium',
    accessPoint: 'Main Entrance Speed Gate 01',
    userIdentifier: 'EMP-0012',
    userName: 'Dr. Evelyn Reed',
    userRole: 'Facility Director',
    eventType: 'Authorized Access',
    severity: 'info',
    timestamp: '2026-08-07 08:32',
    status: 'resolved',
    description: 'Biometric fingerprint + RFID badge matched. Clearance verified.',
    recommendedAction: 'Standard entry logging.',
    badgeId: 'BADGE-0012',
    cameraFeedId: 'CAM-ATRIUM-01'
  }
];

export const accessEventsStore: AccessEventData[] = [
  { id: 'ACC-01', badgeId: 'BADGE-0012', userName: 'Dr. Evelyn Reed', userRole: 'Facility Director', doorName: 'Main Atrium Turnstile 1', location: 'Floor 1 Atrium', accessGranted: true, timestamp: '2026-08-07 08:32' },
  { id: 'ACC-02', badgeId: 'BADGE-1082', userName: 'Carlos Mendes', userRole: 'Software Engineer', doorName: 'East Turnstile 3', location: 'Floor 1 East', accessGranted: true, timestamp: '2026-08-07 12:28' },
  { id: 'ACC-03', badgeId: 'BADGE-9921', userName: 'Unregistered Card', userRole: 'Unknown', doorName: 'Server Room Main Vault Door', location: 'Sub-Level 1', accessGranted: false, reason: 'Invalid Clearance / Expired Credential', timestamp: '2026-08-07 14:15' },
  { id: 'ACC-04', badgeId: 'BADGE-4421', userName: 'Ethan Vance', userRole: 'Maintenance Tech', doorName: 'Hazmat Portal B', location: 'Building 2 Floor 1', accessGranted: false, reason: 'Missing Level-4 Hazmat Certification', timestamp: '2026-08-07 13:42' },
  { id: 'ACC-05', badgeId: 'BADGE-2201', userName: 'Samantha Wright', userRole: 'HVAC Specialist', doorName: 'Roof Central Plant AHU-01', location: 'Roof Plant Room', accessGranted: true, timestamp: '2026-08-07 07:45' },
  { id: 'ACC-06', badgeId: 'BADGE-3031', userName: 'Liam O\'Connor', userRole: 'Security Officer', doorName: 'CCTV Control Center', location: 'Building 1 Floor 2', accessGranted: true, timestamp: '2026-08-07 06:00' },
];

export const portfolioSitesStore: PortfolioSiteData[] = [
  { id: 'SITE-01', name: 'Apex Tower HQ (New York)', location: 'New York, NY', sqft: 450000, occupantCount: 1420, activeDemandKw: 840, healthScore: 88, status: 'Optimal' },
  { id: 'SITE-02', name: 'Tech Park Campus B (Austin)', location: 'Austin, TX', sqft: 320000, occupantCount: 980, activeDemandKw: 620, healthScore: 92, status: 'Optimal' },
  { id: 'SITE-03', name: 'Innovation Lab Hub (San Francisco)', location: 'San Francisco, CA', sqft: 180000, occupantCount: 410, activeDemandKw: 310, healthScore: 84, status: 'Warning' },
];

export const recommendationsStore: RecommendationData[] = [
  {
    id: 'REC-001',
    agentType: 'energy',
    title: 'Apply +1.5°C HVAC Chilled Water Setback',
    description: 'Shift CH-02 load to CH-01 during peak tariff rate ($0.28/kWh from 12:00 to 16:00).',
    estimatedSavingsUsdMonth: 4250,
    status: 'pending',
    createdAt: '2026-08-07 08:00'
  },
  {
    id: 'REC-002',
    agentType: 'maintenance',
    title: 'Pre-emptive Bearing Overhaul for Chiller CH-02',
    description: 'Schedule maintenance prior to RUL expiry (18 days remaining) to avoid $45,000 emergency outage cost.',
    estimatedSavingsUsdMonth: 12800,
    status: 'pending',
    createdAt: '2026-08-07 09:30'
  }
];

export const workOrdersStore: WorkOrderData[] = [
  {
    id: 'WO-2026-8801',
    facilityId: 'apex-hq',
    assetId: 'ast-chiller-02',
    assetName: 'Centrifugal Water Chiller CH-02',
    title: 'Predictive Bearing Replacement & Condenser Descaling',
    description: 'Maintenance Agent detected 4.8 mm/s vibration peak at 120Hz harmonics and 78.4°C bearing heat. Recommended overhaul prior to catastrophic impeller alignment loss.',
    priority: 'High',
    status: 'In Progress',
    assignedTechnician: 'Marcus Vance (Senior HVAC Specialist)',
    createdAt: '2026-08-06 09:30',
    estimatedCostUsd: 2850,
    preventedDowntimeHrs: 48,
    generatedBy: 'Maintenance Agent',
    sparePartsRequired: ['SKF 7320 Double Angular Bearing', 'Neoprene O-Ring Kit CH-2', 'Descaling Agent 50L']
  },
  {
    id: 'WO-2026-8802',
    facilityId: 'apex-hq',
    assetId: 'ast-ahu-04',
    assetName: 'Air Handling Unit AHU-04',
    title: 'Recalibrate Actuator & Replace MERV 14 Filters',
    description: 'Energy Agent identified stuck damper positioner causing outside air thermal penalty. Maintenance Agent scheduled filter changeout & servo motor calibration.',
    priority: 'Medium',
    status: 'Assigned',
    assignedTechnician: 'Sarah Jenkins (Controls Engineer)',
    createdAt: '2026-08-07 10:15',
    estimatedCostUsd: 620,
    preventedDowntimeHrs: 12,
    generatedBy: 'Maintenance Agent',
    sparePartsRequired: ['Honeywell Modutrol Actuator', 'MERV 14 Pocket Filter 24x24x12 (4x)']
  }
];

export const alertsLogStore: AlertLogData[] = [
  {
    id: 'ALT-1001',
    timestamp: '2026-08-14 05:45',
    channel: 'Slack #facility-alerts',
    recipient: '@oncall-hvac-lead',
    subject: 'CRITICAL VIBRATION & THERMAL SPIKE — CHILLER CH-02',
    title: 'Critical Vibration & Thermal Spike: Chiller CH-02',
    body: 'Predictive Vibration FFT detected 4.82 mm/s RMS (threshold: 3.5 mm/s) at 120Hz harmonics. Bearing temperature elevated to 78.4°C. RUL: 18 days.',
    message: 'Predictive Vibration FFT detected 4.82 mm/s RMS (threshold: 3.5 mm/s) at 120Hz harmonics. Bearing temperature elevated to 78.4°C. RUL: 18 days.',
    status: 'Delivered',
    acknowledged: false,
    severity: 'critical',
    category: 'maintenance',
    equipmentId: 'CHILLER-02',
    equipmentName: 'Centrifugal Water Chiller CH-02',
    detectionSource: 'Predictive Vibration FFT & Bearing RTD',
    metricTrigger: 'RMS Velocity: 4.82 mm/s (Limit: 3.50 mm/s) • Bearing Temp: 78.4°C',
    resolved: false
  },
  {
    id: 'ALT-1002',
    timestamp: '2026-08-14 06:15',
    channel: 'Email / Dashboard Push',
    recipient: 'Sarah Jenkins',
    subject: 'ELEVATED CO2 LEVEL & AIR DAMPER ERROR — FLOOR 3 EAST',
    title: 'Elevated CO2 & Damper Position Error: Floor 3 East',
    body: 'Occupancy Sensor Node detected CO2 concentration at 1,120 PPM in Floor 3 East open office. AHU-04 outside air damper positioner unresponsive.',
    message: 'Occupancy Sensor Node detected CO2 concentration at 1,120 PPM in Floor 3 East open office. AHU-04 outside air damper positioner unresponsive.',
    status: 'Delivered',
    acknowledged: false,
    severity: 'warning',
    category: 'occupancy',
    equipmentId: 'AHU-04',
    equipmentName: 'Air Handling Unit AHU-04',
    detectionSource: 'IAQ Modbus Gateway & Damper Actuator Feedback',
    metricTrigger: 'CO2: 1,120 PPM (Threshold: 1,000 PPM) • Damper Feedback: 0% Demand',
    resolved: false
  },
  {
    id: 'ALT-1003',
    timestamp: '2026-08-14 06:30',
    channel: 'SMS / FacilityOps Push',
    recipient: 'Operations Dispatch',
    subject: 'PEAK DEMAND TARIFF HORIZON ADVISORY',
    title: 'Peak Tariff Horizon Approaching (12:00 - 16:00)',
    body: 'Substation Transformer 2 active demand at 840.2 kW. On-peak tariff rate ($0.28/kWh) begins at 12:00. Energy Agent recommends +1.5°C chilled water setback.',
    message: 'Substation Transformer 2 active demand at 840.2 kW. On-peak tariff rate ($0.28/kWh) begins at 12:00. Energy Agent recommends +1.5°C chilled water setback.',
    status: 'Delivered',
    acknowledged: true,
    acknowledgedAt: '2026-08-14 06:35',
    acknowledgedBy: 'Sarah Jenkins',
    severity: 'info',
    category: 'energy',
    equipmentId: 'GW-ESP32-POWER-MAIN',
    equipmentName: 'Substation Transformer 2',
    detectionSource: 'Substation Power Meter Bridge',
    metricTrigger: 'Active Demand: 840.2 kW • Power Factor: 0.98',
    resolved: false
  },
  {
    id: 'ALT-1004',
    timestamp: '2026-08-13 14:10',
    channel: 'Slack #facility-alerts',
    recipient: 'Dave Miller',
    subject: 'RESOLVED: PUMP-01 MECHANICAL SEAL WEEPING',
    title: 'Resolved: Chilled Water Pump P-01 Mechanical Seal',
    body: 'Primary hydronic loop pump seal weeping detected via casing moisture sensor. Replacement silicon carbide seal ring installed and hydrostatic pressure test passed at 150 PSI.',
    message: 'Primary hydronic loop pump seal weeping detected via casing moisture sensor. Replacement silicon carbide seal ring installed and hydrostatic pressure test passed at 150 PSI.',
    status: 'Resolved',
    acknowledged: true,
    acknowledgedAt: '2026-08-13 14:15',
    acknowledgedBy: 'Dave Miller',
    severity: 'resolved',
    category: 'maintenance',
    equipmentId: 'PUMP-01',
    equipmentName: 'Chilled Water Circulation Pump P-01',
    detectionSource: 'Hydronic Pressure Sensor & Casing Moisture Probe',
    metricTrigger: 'Seal Chamber Pressure Restored: 150 PSI',
    resolved: true,
    resolvedAt: '2026-08-13 16:45',
    resolvedBy: 'Dave Miller (Senior Tech)',
    resolutionNotes: 'Installed new silicon carbide seal ring and EPDM gasket kit. Verified zero weepage under full 150 PSI hydronic load.',
    workOrderId: 'WO-2026-8619'
  }
];

export const reportsStore: ReportData[] = [
  {
    id: 'RPT-2026-8801',
    filename: 'FacilityOps_Executive_Audit_2026-08-14.csv',
    title: 'Daily Operations & Telemetry Audit',
    reportType: 'daily',
    format: 'csv',
    facilityId: 'SITE-01',
    facilityName: 'Apex Tower HQ (New York)',
    dateRange: '2026-08-14',
    content: 'FacilityOps AI - Executive Facility Operations Audit Report\nGenerated Date,2026-08-14T08:00:00.000Z\nTarget Facility,Apex Tower HQ (New York)\nOverall Health Score Index,88/100\nReal-Time Live Energy Demand,840.5 kW\nChiller COP Efficiency,4.12 COP\nHVAC Peak Tariff Savings,$4250.00 / month\n',
    summaryStats: {
      healthScore: 88,
      totalEnergyKwh: 14850,
      peakDemandKw: 840.5,
      totalCostUsd: 2680.5,
      co2EmissionsKg: 5717.2,
      activeAnomalies: 2,
      openWorkOrders: 3
    },
    generatedAt: '2026-08-14 08:00',
    generatedBy: 'System Automation Agent',
    fileSizeKb: 14.2
  },
  {
    id: 'RPT-2026-8802',
    filename: 'FacilityOps_Weekly_Energy_Summary_W32.pdf',
    title: 'Weekly Energy Optimization & COP Analysis',
    reportType: 'weekly',
    format: 'pdf',
    facilityId: 'SITE-01',
    facilityName: 'Apex Tower HQ (New York)',
    dateRange: '2026-08-07 - 2026-08-14',
    content: 'Weekly Energy Optimization Report\nPeriod: Aug 7 - Aug 14, 2026\nFacility: Apex Tower HQ\nAverage COP: 4.15\nTotal Energy Consumed: 104,250 kWh\nPeak Tariff Savings: $4,250.00\nCarbon Reduced: 6.2 tCO2e',
    summaryStats: {
      averageCop: 4.15,
      totalEnergyKwh: 104250,
      peakSavingsUsd: 4250,
      carbonReducedTons: 6.2,
      complianceRate: 98.4
    },
    generatedAt: '2026-08-14 07:30',
    generatedBy: 'Energy Agent',
    fileSizeKb: 28.5
  },
  {
    id: 'RPT-2026-8803',
    filename: 'FacilityOps_Monthly_Maintenance_Health_July.csv',
    title: 'Monthly Asset Reliability & ISO 10816 Health Review',
    reportType: 'maintenance',
    format: 'csv',
    facilityId: 'SITE-01',
    facilityName: 'Apex Tower HQ (New York)',
    dateRange: '2026-07-01 - 2026-07-31',
    content: 'Monthly Asset Reliability & Predictive Maintenance Review\nPeriod: July 2026\nFleet Health Score: 88.5\nDispatched Work Orders: 5\nPrevented Unplanned Downtime: 62.0 Hours\nAvoided Outage Costs: $68,500.00',
    summaryStats: {
      fleetHealthScore: 88.5,
      dispatchedWorkOrders: 5,
      avoidedDowntimeHours: 62.0,
      avoidedOutageCostUsd: 68500,
      partsCostUsd: 3470
    },
    generatedAt: '2026-08-01 09:00',
    generatedBy: 'Maintenance Agent',
    fileSizeKb: 18.6
  }
];

// Helper functions for MongoDB/Mongoose or In-Memory CRUD Operations
import { isDbConnected } from '../config/db';
import {
  UserModel,
  EquipmentModel,
  IotDeviceModel,
  TelemetryModel,
  OccupancyZoneModel,
  WorkOrderModel,
  AlertLogModel,
  RecommendationModel,
  ReportModel,
  MaintenanceScheduleModel,
  MaintenanceRecordModel,
  SecurityEventModel,
  AccessEventModel,
} from './schemas';

export async function getUsersDb(): Promise<UserData[]> {
  if (isDbConnected()) {
    const docs = await (UserModel as any).find().lean();
    return docs as unknown as UserData[];
  }
  return usersStore;
}

export async function findUserByEmailDb(email: string): Promise<UserData | null> {
  if (isDbConnected()) {
    const doc = await (UserModel as any).findOne({ email: email.toLowerCase() }).lean();
    return doc as unknown as UserData | null;
  }
  return usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUserDb(user: UserData): Promise<UserData> {
  if (isDbConnected()) {
    const created = await (UserModel as any).create(user);
    return created.toObject() as unknown as UserData;
  }
  usersStore.push(user);
  return user;
}

export async function getEquipmentDb(): Promise<EquipmentData[]> {
  if (isDbConnected()) {
    const docs = await (EquipmentModel as any).find().lean();
    return docs as unknown as EquipmentData[];
  }
  return equipmentStore;
}

export async function updateEquipmentDb(id: string, update: Partial<EquipmentData>): Promise<EquipmentData | null> {
  if (isDbConnected()) {
    const res = await (EquipmentModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as EquipmentData | null;
  }
  const eq = equipmentStore.find((e) => e.id === id);
  if (eq) {
    Object.assign(eq, update);
    return eq;
  }
  return null;
}

export async function getIotDevicesDb(): Promise<IotDeviceData[]> {
  if (isDbConnected()) {
    const docs = await (IotDeviceModel as any).find().lean();
    return docs as unknown as IotDeviceData[];
  }
  return iotDevicesStore;
}

export async function updateIotDeviceDb(id: string, update: Partial<IotDeviceData>): Promise<IotDeviceData | null> {
  if (isDbConnected()) {
    const res = await (IotDeviceModel as any).findOneAndUpdate({ id }, update, { new: true, upsert: true }).lean();
    return res as unknown as IotDeviceData | null;
  }
  const device = iotDevicesStore.find((d) => d.id === id);
  if (device) {
    Object.assign(device, update);
    return device;
  } else {
    const newDev: IotDeviceData = {
      id,
      name: update.name || `ESP32 Node (${id})`,
      location: update.location || 'Facility Edge Node',
      type: update.type || 'ESP32 Gateway',
      status: update.status || 'Online',
      rssi: update.rssi || '-60 dBm',
      firmware: update.firmware || 'v2.5.0-bms',
      uptime: update.uptime || '100.00%',
      lastPing: update.lastPing || 'Just now',
      lastPingTimestamp: update.lastPingTimestamp || Date.now(),
      isPhysicalHardware: update.isPhysicalHardware ?? true,
    };
    iotDevicesStore.push(newDev);
    return newDev;
  }
}

export async function getTelemetryDb(): Promise<TelemetryData[]> {
  if (isDbConnected()) {
    const docs = await (TelemetryModel as any).find().sort({ timestamp: -1 }).limit(50).lean();
    return docs as unknown as TelemetryData[];
  }
  return telemetryStore;
}

export async function saveTelemetryDb(data: TelemetryData): Promise<TelemetryData> {
  if (isDbConnected()) {
    const created = await (TelemetryModel as any).create(data);
    return created.toObject() as unknown as TelemetryData;
  }
  telemetryStore.unshift(data);
  if (telemetryStore.length > 50) telemetryStore.pop();
  return data;
}

export async function getOccupancyZonesDb(): Promise<OccupancyZoneData[]> {
  if (isDbConnected()) {
    const docs = await (OccupancyZoneModel as any).find().lean();
    return docs as unknown as OccupancyZoneData[];
  }
  return occupancyStore;
}

export async function updateOccupancyZoneDb(id: string, update: Partial<OccupancyZoneData>): Promise<OccupancyZoneData | null> {
  if (isDbConnected()) {
    const res = await (OccupancyZoneModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as OccupancyZoneData | null;
  }
  const zone = occupancyStore.find((z) => z.id === id);
  if (zone) {
    Object.assign(zone, update);
    return zone;
  }
  return null;
}

export async function getWorkOrdersDb(): Promise<WorkOrderData[]> {
  if (isDbConnected()) {
    const docs = await (WorkOrderModel as any).find().sort({ createdAt: -1 }).lean();
    return docs as unknown as WorkOrderData[];
  }
  return workOrdersStore;
}

export async function createWorkOrderDb(data: WorkOrderData): Promise<WorkOrderData> {
  if (isDbConnected()) {
    const created = await (WorkOrderModel as any).create(data);
    return created.toObject() as unknown as WorkOrderData;
  }
  workOrdersStore.unshift(data);
  return data;
}

export async function updateWorkOrderDb(id: string, update: Partial<WorkOrderData>): Promise<WorkOrderData | null> {
  if (isDbConnected()) {
    const res = await (WorkOrderModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as WorkOrderData | null;
  }
  const wo = workOrdersStore.find((w) => w.id === id);
  if (wo) {
    Object.assign(wo, update);
    return wo;
  }
  return null;
}

export async function getAlertsDb(): Promise<AlertLogData[]> {
  if (isDbConnected()) {
    const docs = await (AlertLogModel as any).find().sort({ timestamp: -1 }).lean();
    return docs as unknown as AlertLogData[];
  }
  return alertsLogStore;
}

export async function createAlertDb(data: AlertLogData): Promise<AlertLogData> {
  if (isDbConnected()) {
    const created = await (AlertLogModel as any).create(data);
    return created.toObject() as unknown as AlertLogData;
  }
  alertsLogStore.unshift(data);
  return data;
}

export async function acknowledgeAlertDb(id: string, user?: string): Promise<AlertLogData | null> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updateData = {
    acknowledged: true,
    acknowledgedAt: now,
    acknowledgedBy: user || 'Sarah Jenkins (Facility Manager)',
    status: 'Acknowledged'
  };

  if (isDbConnected()) {
    const res = await (AlertLogModel as any).findOneAndUpdate({ id }, updateData, { new: true }).lean();
    return res as unknown as AlertLogData | null;
  }
  const alert = alertsLogStore.find((a) => a.id === id);
  if (alert) {
    Object.assign(alert, updateData);
    return alert;
  }
  return null;
}

export async function resolveAlertDb(
  id: string,
  resolution: { notes?: string; resolvedBy?: string; workOrderId?: string } = {}
): Promise<AlertLogData | null> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updateData: Partial<AlertLogData> = {
    acknowledged: true,
    resolved: true,
    severity: 'resolved',
    status: 'Resolved',
    resolvedAt: now,
    resolvedBy: resolution.resolvedBy || 'Sarah Jenkins (Facility Manager)',
    resolutionNotes: resolution.notes || 'Anomalous condition inspected and operational parameters restored to baseline.',
    workOrderId: resolution.workOrderId
  };

  if (isDbConnected()) {
    const res = await (AlertLogModel as any).findOneAndUpdate({ id }, updateData, { new: true }).lean();
    return res as unknown as AlertLogData | null;
  }
  const alert = alertsLogStore.find((a) => a.id === id);
  if (alert) {
    Object.assign(alert, updateData);
    return alert;
  }
  return null;
}

export async function updateAlertDb(id: string, update: Partial<AlertLogData>): Promise<AlertLogData | null> {
  if (isDbConnected()) {
    const res = await (AlertLogModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as AlertLogData | null;
  }
  const alert = alertsLogStore.find((a) => a.id === id);
  if (alert) {
    Object.assign(alert, update);
    return alert;
  }
  return null;
}

export async function deleteAlertDb(id: string): Promise<boolean> {
  if (isDbConnected()) {
    const res = await (AlertLogModel as any).deleteOne({ id });
    return (res.deletedCount || 0) > 0;
  }
  const idx = alertsLogStore.findIndex((a) => a.id === id);
  if (idx !== -1) {
    alertsLogStore.splice(idx, 1);
    return true;
  }
  return false;
}

export async function bulkUpdateAlertsDb(action: 'acknowledge_all' | 'resolve_all' | 'clear_resolved' | 'delete_all', ids?: string[]): Promise<AlertLogData[]> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  if (action === 'acknowledge_all') {
    for (const a of alertsLogStore) {
      if (!a.acknowledged) {
        a.acknowledged = true;
        a.acknowledgedAt = now;
        a.acknowledgedBy = 'Sarah Jenkins';
        if (a.status === 'Delivered' || a.status === 'Active') a.status = 'Acknowledged';
      }
    }
  } else if (action === 'resolve_all') {
    for (const a of alertsLogStore) {
      a.acknowledged = true;
      a.resolved = true;
      a.severity = 'resolved';
      a.status = 'Resolved';
      a.resolvedAt = now;
      a.resolvedBy = 'Sarah Jenkins';
      if (!a.resolutionNotes) a.resolutionNotes = 'Bulk resolved during shift transition.';
    }
  } else if (action === 'clear_resolved') {
    for (let i = alertsLogStore.length - 1; i >= 0; i--) {
      if (alertsLogStore[i].resolved || alertsLogStore[i].severity === 'resolved' || alertsLogStore[i].status === 'Resolved') {
        alertsLogStore.splice(i, 1);
      }
    }
  } else if (action === 'delete_all') {
    alertsLogStore.length = 0;
  }
  return alertsLogStore;
}

export async function getRecommendationsDb(): Promise<RecommendationData[]> {
  if (isDbConnected()) {
    const docs = await (RecommendationModel as any).find().sort({ createdAt: -1 }).lean();
    return docs as unknown as RecommendationData[];
  }
  return recommendationsStore;
}

export async function updateRecommendationDb(id: string, update: Partial<RecommendationData>): Promise<RecommendationData | null> {
  if (isDbConnected()) {
    const res = await (RecommendationModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as RecommendationData | null;
  }
  const rec = recommendationsStore.find((r) => r.id === id);
  if (rec) {
    Object.assign(rec, update);
    return rec;
  }
  return null;
}

export async function getReportsDb(): Promise<ReportData[]> {
  if (isDbConnected()) {
    const docs = await (ReportModel as any).find().sort({ generatedAt: -1 }).lean();
    return docs as unknown as ReportData[];
  }
  return reportsStore;
}

export async function getReportByIdDb(id: string): Promise<ReportData | null> {
  if (isDbConnected()) {
    const doc = await (ReportModel as any).findOne({ id }).lean();
    return doc as unknown as ReportData | null;
  }
  return reportsStore.find((r) => r.id === id) || null;
}

export async function saveReportDb(data: ReportData): Promise<ReportData> {
  if (isDbConnected()) {
    const created = await (ReportModel as any).create(data);
    return created.toObject() as unknown as ReportData;
  }
  const existingIdx = reportsStore.findIndex((r) => r.id === data.id);
  if (existingIdx >= 0) {
    reportsStore[existingIdx] = data;
  } else {
    reportsStore.unshift(data);
  }
  return data;
}

export async function deleteReportDb(id: string): Promise<boolean> {
  if (isDbConnected()) {
    const res = await (ReportModel as any).deleteOne({ id });
    return (res?.deletedCount || 0) > 0;
  }
  const idx = reportsStore.findIndex((r) => r.id === id);
  if (idx >= 0) {
    reportsStore.splice(idx, 1);
    return true;
  }
  return false;
}

export async function getPortfolioSitesDb(): Promise<PortfolioSiteData[]> {
  return portfolioSitesStore;
}

export async function getMaintenanceSchedulesDb(): Promise<MaintenanceScheduleData[]> {
  if (isDbConnected()) {
    const docs = await (MaintenanceScheduleModel as any).find().sort({ scheduledDate: 1 }).lean();
    return docs as unknown as MaintenanceScheduleData[];
  }
  return maintenanceSchedulesStore;
}

export async function createMaintenanceScheduleDb(data: MaintenanceScheduleData): Promise<MaintenanceScheduleData> {
  if (isDbConnected()) {
    const created = await (MaintenanceScheduleModel as any).create(data);
    return created.toObject() as unknown as MaintenanceScheduleData;
  }
  maintenanceSchedulesStore.push(data);
  return data;
}

export async function updateMaintenanceScheduleDb(id: string, update: Partial<MaintenanceScheduleData>): Promise<MaintenanceScheduleData | null> {
  if (isDbConnected()) {
    const res = await (MaintenanceScheduleModel as any).findOneAndUpdate({ id }, update, { new: true }).lean();
    return res as unknown as MaintenanceScheduleData | null;
  }
  const item = maintenanceSchedulesStore.find((s) => s.id === id);
  if (item) {
    Object.assign(item, update);
    return item;
  }
  return null;
}

export async function getMaintenanceRecordsDb(): Promise<MaintenanceRecordData[]> {
  if (isDbConnected()) {
    const docs = await (MaintenanceRecordModel as any).find().sort({ completedDate: -1 }).lean();
    return docs as unknown as MaintenanceRecordData[];
  }
  return maintenanceRecordsStore;
}

export async function createMaintenanceRecordDb(data: MaintenanceRecordData): Promise<MaintenanceRecordData> {
  if (isDbConnected()) {
    const created = await (MaintenanceRecordModel as any).create(data);
    return created.toObject() as unknown as MaintenanceRecordData;
  }
  maintenanceRecordsStore.unshift(data);
  return data;
}

// ==========================================
// MILESTONE 3: OCCUPANCY INTELLIGENCE DB
// ==========================================

export async function addOccupancyZoneDb(data: OccupancyZoneData): Promise<OccupancyZoneData> {
  if (isDbConnected()) {
    const created = await (OccupancyZoneModel as any).create(data);
    return created.toObject() as unknown as OccupancyZoneData;
  }
  const existingIdx = occupancyStore.findIndex(z => z.id === data.id);
  if (existingIdx >= 0) {
    occupancyStore[existingIdx] = data;
  } else {
    occupancyStore.push(data);
  }
  return data;
}

export async function getOccupancySummaryDb(): Promise<any> {
  const zones = await getOccupancyZonesDb();
  let currentOccupancy = 0;
  let totalCapacity = 0;
  let overcrowdedCount = 0;
  let highOccupancyCount = 0;
  let normalCount = 0;

  let mostOccupiedZone: OccupancyZoneData | null = null;
  let leastOccupiedZone: OccupancyZoneData | null = null;

  for (const z of zones) {
    const occ = z.currentOccupancy ?? z.occupantCount ?? 0;
    const cap = z.capacity ?? z.maxCapacity ?? 100;
    const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;
    
    currentOccupancy += occ;
    totalCapacity += cap;

    if (pct > 100) {
      overcrowdedCount++;
    } else if (pct >= 85) {
      highOccupancyCount++;
    } else {
      normalCount++;
    }

    if (!mostOccupiedZone || pct > ((mostOccupiedZone.currentOccupancy / mostOccupiedZone.capacity) * 100)) {
      mostOccupiedZone = z;
    }
    if (!leastOccupiedZone || pct < ((leastOccupiedZone.currentOccupancy / leastOccupiedZone.capacity) * 100)) {
      leastOccupiedZone = z;
    }
  }

  const occupancyPercentage = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;
  const availableCapacity = Math.max(0, totalCapacity - currentOccupancy);

  return {
    currentOccupancy,
    totalCapacity,
    occupancyPercentage,
    availableCapacity,
    totalOccupiedSpaces: zones.filter(z => (z.currentOccupancy || z.occupantCount) > 0).length,
    totalSpaces: zones.length,
    peakOccupancy: Math.round(currentOccupancy * 1.15),
    peakTime: '12:00 - 14:00',
    averageOccupancy: Math.round(currentOccupancy / Math.max(1, zones.length)),
    overcrowdedCount,
    highOccupancyCount,
    normalCount,
    mostOccupiedZone: mostOccupiedZone ? {
      id: mostOccupiedZone.id,
      name: mostOccupiedZone.name,
      percentage: Math.round(((mostOccupiedZone.currentOccupancy || mostOccupiedZone.occupantCount) / (mostOccupiedZone.capacity || mostOccupiedZone.maxCapacity)) * 100),
      currentOccupancy: mostOccupiedZone.currentOccupancy || mostOccupiedZone.occupantCount,
      capacity: mostOccupiedZone.capacity || mostOccupiedZone.maxCapacity,
    } : undefined,
    leastOccupiedZone: leastOccupiedZone ? {
      id: leastOccupiedZone.id,
      name: leastOccupiedZone.name,
      percentage: Math.round(((leastOccupiedZone.currentOccupancy || leastOccupiedZone.occupantCount) / (leastOccupiedZone.capacity || leastOccupiedZone.maxCapacity)) * 100),
      currentOccupancy: leastOccupiedZone.currentOccupancy || leastOccupiedZone.occupantCount,
      capacity: leastOccupiedZone.capacity || leastOccupiedZone.maxCapacity,
    } : undefined,
  };
}

export async function getOccupancyTrendsDb(): Promise<any[]> {
  const zones = await getOccupancyZonesDb();
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const totalCap = zones.reduce((acc, z) => acc + (z.capacity || z.maxCapacity || 100), 0);

  return timeSlots.map((time, idx) => {
    let slotTotal = 0;
    zones.forEach(z => {
      const match = z.historical?.find(h => h.time === time);
      if (match) {
        slotTotal += match.occupantCount;
      } else {
        const factor = idx === 2 || idx === 3 ? 0.9 : idx === 1 || idx === 4 ? 0.7 : idx === 0 ? 0.3 : 0.15;
        slotTotal += Math.round((z.capacity || z.maxCapacity || 100) * factor);
      }
    });

    const isPeak = time === '12:00' || time === '14:00';
    const forecast = Math.round(slotTotal * (isPeak ? 1.05 : 0.98));
    const pct = totalCap > 0 ? (slotTotal / totalCap) * 100 : 0;
    const status = pct > 100 ? 'Overcrowded' : pct >= 85 ? 'High' : pct >= 70 ? 'Moderate' : 'Normal';

    return {
      time,
      occupancy: slotTotal,
      forecast,
      capacity: totalCap,
      isPeak,
      status,
      utilizationPct: Math.round(pct)
    };
  });
}

// ==========================================
// MILESTONE 3: SECURITY INTELLIGENCE DB
// ==========================================

export async function getSecurityEventsDb(filters?: { severity?: string; status?: string; eventType?: string }): Promise<SecurityEventData[]> {
  if (isDbConnected()) {
    const query: any = {};
    if (filters?.severity && filters.severity !== 'all') query.severity = filters.severity;
    if (filters?.status && filters.status !== 'all') query.status = filters.status;
    if (filters?.eventType && filters.eventType !== 'all') query.eventType = filters.eventType;
    const docs = await (SecurityEventModel as any).find(query).sort({ timestamp: -1 }).lean();
    return docs as unknown as SecurityEventData[];
  }
  let events = [...securityEventsStore];
  if (filters?.severity && filters.severity !== 'all') {
    events = events.filter(e => e.severity === filters.severity);
  }
  if (filters?.status && filters.status !== 'all') {
    events = events.filter(e => e.status === filters.status);
  }
  if (filters?.eventType && filters.eventType !== 'all') {
    events = events.filter(e => e.eventType === filters.eventType);
  }
  return events;
}

export async function getSecurityAlertsDb(): Promise<SecurityEventData[]> {
  const events = await getSecurityEventsDb();
  return events.filter(e => e.status === 'active' || e.status === 'investigating');
}

export async function getSecuritySummaryDb(): Promise<any> {
  const events = await getSecurityEventsDb();
  const totalEvents = events.length;
  const authorizedCount = events.filter(e => e.eventType === 'Authorized Access').length;
  const failedAttempts = events.filter(e => e.eventType === 'Failed Access').length;
  const unauthorizedAttempts = events.filter(e => e.eventType === 'Unauthorized Access').length;
  const restrictedAreaAttempts = events.filter(e => e.eventType === 'Restricted Area Access' || e.eventType === 'Door Forced Open' || e.eventType === 'Tailgating Detected').length;
  const activeAlertsCount = events.filter(e => e.status === 'active' || e.status === 'investigating').length;

  const criticalCount = events.filter(e => e.severity === 'critical' && e.status === 'active').length;
  const warningCount = events.filter(e => e.severity === 'warning' && e.status === 'active').length;

  let securityHealthScore = 100 - (criticalCount * 18) - (warningCount * 6);
  securityHealthScore = Math.max(10, Math.min(100, securityHealthScore));

  const status = criticalCount > 0 ? 'Critical Incident' : warningCount > 0 ? 'Elevated Risk' : 'Secure';

  return {
    totalEvents,
    authorizedCount,
    failedAttempts,
    unauthorizedAttempts,
    restrictedAreaAttempts,
    activeAlertsCount,
    securityHealthScore,
    status,
    recentIncidents: events.slice(0, 5)
  };
}

export async function addSecurityEventDb(data: SecurityEventData): Promise<SecurityEventData> {
  if (isDbConnected()) {
    const created = await (SecurityEventModel as any).create(data);
    return created.toObject() as unknown as SecurityEventData;
  }
  securityEventsStore.unshift(data);
  return data;
}

export async function resolveSecurityEventDb(
  id: string,
  resolution: { notes?: string; resolvedBy?: string }
): Promise<SecurityEventData | null> {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updateData: Partial<SecurityEventData> = {
    status: 'resolved',
    resolvedAt: now,
    resolvedBy: resolution.resolvedBy || 'Security Supervisor',
    resolutionNotes: resolution.notes || 'Incident reviewed and logged in security incident ledger.'
  };

  if (isDbConnected()) {
    const res = await (SecurityEventModel as any).findOneAndUpdate({ id }, updateData, { new: true }).lean();
    return res as unknown as SecurityEventData | null;
  }
  const event = securityEventsStore.find(e => e.id === id || e.eventId === id);
  if (event) {
    Object.assign(event, updateData);
    return event;
  }
  return null;
}

export async function getAccessEventsDb(): Promise<AccessEventData[]> {
  if (isDbConnected()) {
    const docs = await (AccessEventModel as any).find().sort({ timestamp: -1 }).lean();
    return docs as unknown as AccessEventData[];
  }
  return accessEventsStore;
}

export async function addAccessEventDb(data: AccessEventData): Promise<AccessEventData> {
  if (isDbConnected()) {
    const created = await (AccessEventModel as any).create(data);
    return created.toObject() as unknown as AccessEventData;
  }
  accessEventsStore.unshift(data);
  return data;
}

// ---------------- CNN CONVOLUTIONAL NEURAL NETWORK STORE ----------------

export const cnnCameraFeedsStore = [
  {
    id: 'CAM-CNN-01',
    name: 'Ceiling Optical Node #01 - Floor 2 Workstations',
    zoneId: 'ZONE-FLOOR2-EXEC',
    zoneName: 'Floor 2 Executive Suites & Open Plan',
    floor: 2,
    modelArchitecture: 'YOLOv8-CrowdNet (CNN)' as const,
    resolution: '1920x1080 @ 30 FPS',
    frameRateFps: 29.8,
    detectedHeadcount: 180,
    rfidBadgeCount: 174,
    deltaDiscrepancy: 6,
    confidenceScore: 98.7,
    densityStatus: 'moderate' as const,
    densityHeadsPerSqM: 0.72,
    streamStatus: 'active' as const,
    lastInferenceMs: 14.2,
    featureMapDescription: 'Conv2D 64-channel spatial feature extraction active with high edge saliency on torso/head contours.',
    boundingBoxes: [
      { id: 'bb-01', x: 12, y: 22, width: 9, height: 18, confidence: 0.99, label: 'Person', status: 'normal' as const },
      { id: 'bb-02', x: 26, y: 28, width: 8, height: 17, confidence: 0.98, label: 'Person', status: 'normal' as const },
      { id: 'bb-03', x: 42, y: 20, width: 9, height: 19, confidence: 0.99, label: 'Person', status: 'normal' as const },
      { id: 'bb-04', x: 58, y: 35, width: 9, height: 18, confidence: 0.97, label: 'Person', status: 'normal' as const },
      { id: 'bb-05', x: 74, y: 30, width: 8, height: 17, confidence: 0.98, label: 'Person', status: 'normal' as const },
      { id: 'bb-06', x: 85, y: 45, width: 9, height: 19, confidence: 0.99, label: 'Person', status: 'normal' as const },
      { id: 'bb-07', x: 34, y: 55, width: 9, height: 18, confidence: 0.96, label: 'Person', status: 'untracked' as const },
      { id: 'bb-08', x: 62, y: 60, width: 8, height: 17, confidence: 0.97, label: 'Person', status: 'normal' as const },
    ],
    heatmapPoints: [
      { x: 15, y: 25, weight: 0.8 },
      { x: 30, y: 32, weight: 0.7 },
      { x: 45, y: 24, weight: 0.85 },
      { x: 60, y: 38, weight: 0.75 },
      { x: 78, y: 34, weight: 0.8 },
      { x: 88, y: 48, weight: 0.9 },
      { x: 38, y: 58, weight: 0.65 },
    ],
  },
  {
    id: 'CAM-CNN-02',
    name: 'Wide-Angle Optical Node #02 - Conference Hall A',
    zoneId: 'ZONE-CONF-HALL-A',
    zoneName: 'Conference Hall A (Auditorium)',
    floor: 3,
    modelArchitecture: 'CSRNet Density Estimator' as const,
    resolution: '2560x1440 @ 30 FPS',
    frameRateFps: 29.4,
    detectedHeadcount: 108,
    rfidBadgeCount: 94,
    deltaDiscrepancy: 14,
    confidenceScore: 99.2,
    densityStatus: 'overcrowded' as const,
    densityHeadsPerSqM: 1.18,
    streamStatus: 'active' as const,
    lastInferenceMs: 16.8,
    featureMapDescription: 'Dilated Convolutional Neural backend indicates critical spatial crowd clustering (1.18 heads/m² > 0.90 max threshold).',
    boundingBoxes: [
      { id: 'bb-11', x: 15, y: 20, width: 10, height: 22, confidence: 0.99, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-12', x: 28, y: 22, width: 10, height: 22, confidence: 0.99, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-13', x: 40, y: 24, width: 9, height: 21, confidence: 0.98, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-14', x: 52, y: 26, width: 10, height: 22, confidence: 0.99, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-15', x: 65, y: 28, width: 9, height: 21, confidence: 0.98, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-16', x: 78, y: 25, width: 10, height: 22, confidence: 0.99, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-17', x: 22, y: 48, width: 10, height: 22, confidence: 0.97, label: 'Person', status: 'untracked' as const },
      { id: 'bb-18', x: 45, y: 52, width: 10, height: 22, confidence: 0.98, label: 'Person', status: 'overcrowded_cluster' as const },
      { id: 'bb-19', x: 68, y: 50, width: 10, height: 22, confidence: 0.99, label: 'Person', status: 'overcrowded_cluster' as const },
    ],
    heatmapPoints: [
      { x: 18, y: 24, weight: 0.98 },
      { x: 31, y: 26, weight: 0.99 },
      { x: 43, y: 28, weight: 0.95 },
      { x: 55, y: 30, weight: 0.99 },
      { x: 68, y: 32, weight: 0.97 },
      { x: 81, y: 29, weight: 0.98 },
      { x: 26, y: 52, weight: 0.92 },
      { x: 48, y: 56, weight: 0.94 },
      { x: 72, y: 54, weight: 0.96 },
    ],
  },
  {
    id: 'CAM-CNN-03',
    name: 'Overhead 360° Fisheye Node #03 - Atrium & Lobby',
    zoneId: 'ZONE-LOBBY',
    zoneName: 'Main Entrance & Atrium Lobby',
    floor: 1,
    modelArchitecture: 'YOLOv8-CrowdNet (CNN)' as const,
    resolution: '1920x1080 @ 60 FPS',
    frameRateFps: 59.2,
    detectedHeadcount: 142,
    rfidBadgeCount: 139,
    deltaDiscrepancy: 3,
    confidenceScore: 98.4,
    densityStatus: 'optimal' as const,
    densityHeadsPerSqM: 0.47,
    streamStatus: 'active' as const,
    lastInferenceMs: 11.5,
    featureMapDescription: 'De-warped fisheye input processed through Multi-Scale Feature Pyramid (FPN) with rapid centroid tracking.',
    boundingBoxes: [
      { id: 'bb-21', x: 20, y: 30, width: 11, height: 24, confidence: 0.99, label: 'Person', status: 'normal' as const },
      { id: 'bb-22', x: 38, y: 34, width: 10, height: 23, confidence: 0.98, label: 'Person', status: 'normal' as const },
      { id: 'bb-23', x: 55, y: 28, width: 11, height: 24, confidence: 0.99, label: 'Person', status: 'normal' as const },
      { id: 'bb-24', x: 72, y: 40, width: 10, height: 23, confidence: 0.97, label: 'Person', status: 'normal' as const },
      { id: 'bb-25', x: 48, y: 62, width: 11, height: 24, confidence: 0.98, label: 'Person', status: 'normal' as const },
    ],
    heatmapPoints: [
      { x: 22, y: 33, weight: 0.6 },
      { x: 40, y: 37, weight: 0.65 },
      { x: 58, y: 31, weight: 0.7 },
      { x: 74, y: 43, weight: 0.55 },
      { x: 50, y: 65, weight: 0.62 },
    ],
  },
  {
    id: 'CAM-CNN-04',
    name: 'Thermal + Optical Dual Node #04 - R&D Cleanroom',
    zoneId: 'ZONE-RD-CLEAN-LAB',
    zoneName: 'R&D Cleanroom Lab 4B',
    floor: 4,
    modelArchitecture: 'ResNet-50-FPN' as const,
    resolution: '1920x1080 @ 30 FPS',
    frameRateFps: 29.9,
    detectedHeadcount: 14,
    rfidBadgeCount: 14,
    deltaDiscrepancy: 0,
    confidenceScore: 99.6,
    densityStatus: 'optimal' as const,
    densityHeadsPerSqM: 0.28,
    streamStatus: 'active' as const,
    lastInferenceMs: 18.1,
    featureMapDescription: 'Dual-band RGB + Long-Wave Infrared (LWIR) fusion ensuring 100% PPE/cleanroom bunny suit classification.',
    boundingBoxes: [
      { id: 'bb-31', x: 25, y: 35, width: 12, height: 26, confidence: 0.99, label: 'PPE Suit', status: 'normal' as const },
      { id: 'bb-32', x: 52, y: 40, width: 12, height: 26, confidence: 0.99, label: 'PPE Suit', status: 'normal' as const },
      { id: 'bb-33', x: 75, y: 38, width: 12, height: 26, confidence: 0.99, label: 'PPE Suit', status: 'normal' as const },
    ],
    heatmapPoints: [
      { x: 28, y: 38, weight: 0.4 },
      { x: 55, y: 43, weight: 0.45 },
      { x: 78, y: 41, weight: 0.42 },
    ],
  },
];

export const cnnLayerActivationsStore = [
  {
    layerIndex: 1,
    layerName: 'Input_Tensor (RGB Frame)',
    type: 'Conv2D' as const,
    kernelSize: '3x3, Stride 1',
    filterCount: 64,
    outputShape: '[1, 640, 640, 64]',
    activationMapSummary: 'Extracts low-level edge contours, brightness gradients, and ambient lighting normalization.',
    receptiveField: '3x3 px',
    latencyMs: 1.8,
  },
  {
    layerIndex: 2,
    layerName: 'BatchNorm_ReLU_01',
    type: 'BatchNorm' as const,
    kernelSize: 'N/A',
    filterCount: 64,
    outputShape: '[1, 640, 640, 64]',
    activationMapSummary: 'Zero-mean unit variance normalization with non-linear activation thresholding.',
    receptiveField: '3x3 px',
    latencyMs: 0.6,
  },
  {
    layerIndex: 3,
    layerName: 'MaxPool2D_Downsample_1',
    type: 'MaxPool2D' as const,
    kernelSize: '2x2, Stride 2',
    filterCount: 64,
    outputShape: '[1, 320, 320, 64]',
    activationMapSummary: 'Spatial reduction discarding translation variance and accelerating feature extraction.',
    receptiveField: '6x6 px',
    latencyMs: 0.9,
  },
  {
    layerIndex: 4,
    layerName: 'Deep_Conv2D_Bottleneck',
    type: 'Conv2D' as const,
    kernelSize: '3x3, Stride 1',
    filterCount: 128,
    outputShape: '[1, 320, 320, 128]',
    activationMapSummary: 'Mid-level human semantic features: shoulders, head silhouettes, seated postures.',
    receptiveField: '14x14 px',
    latencyMs: 3.4,
  },
  {
    layerIndex: 5,
    layerName: 'Dilated_Conv_Density_Head',
    type: 'DilatedConv' as const,
    kernelSize: '3x3, Rate d=2',
    filterCount: 256,
    outputShape: '[1, 160, 160, 256]',
    activationMapSummary: 'High receptive field density estimation modeling crowd clusters without losing spatial resolution.',
    receptiveField: '46x46 px',
    latencyMs: 4.8,
  },
  {
    layerIndex: 6,
    layerName: 'Regressor_Headcount_Tensor',
    type: 'Dense' as const,
    kernelSize: '1x1 Conv Regression',
    filterCount: 1,
    outputShape: '[1, 160, 160, 1]',
    activationMapSummary: 'Continuous crowd density integral mapping yielding exact headcount and bounding coordinates.',
    receptiveField: 'Full Context',
    latencyMs: 2.7,
  },
];

export async function getCnnInferenceDataDb() {
  const totalVisual = cnnCameraFeedsStore.reduce((acc, cam) => acc + cam.detectedHeadcount, 0);
  const totalBadge = cnnCameraFeedsStore.reduce((acc, cam) => acc + cam.rfidBadgeCount, 0);
  const untracked = Math.max(0, totalVisual - totalBadge);
  const avgConf = Math.round((cnnCameraFeedsStore.reduce((acc, cam) => acc + cam.confidenceScore, 0) / cnnCameraFeedsStore.length) * 10) / 10;
  const avgLatency = Math.round((cnnCameraFeedsStore.reduce((acc, cam) => acc + cam.lastInferenceMs, 0) / cnnCameraFeedsStore.length) * 10) / 10;

  return {
    timestamp: new Date().toISOString(),
    activeModel: 'YOLOv8-CrowdNet + CSRNet Dilated CNN Fusion',
    backboneArchitecture: 'Deep Convolutional Neural Network (PyTorch / TensorRT Edge)',
    totalVisualHeadcount: totalVisual,
    totalBadgeHeadcount: totalBadge,
    untrackedOccupantsDelta: untracked,
    avgConfidence: avgConf,
    fpsThroughput: 38.6,
    inferenceLatencyMs: avgLatency,
    cameras: cnnCameraFeedsStore,
    layerActivations: cnnLayerActivationsStore,
    aiVisionInsight: `CNN Optical Vision successfully cross-referenced optical headcounts against badge sensors. Detected a +14 headcount disparity in Conference Hall A caused by unregistered guest attendees. Recommended immediate ventilation surge (+25%) to purge CO2 to 650 PPM.`,
  };
}

export async function triggerCnnScanDb(modelOverride?: string) {
  // Simulate live CNN forward pass execution
  cnnCameraFeedsStore.forEach((cam) => {
    // Add micro jitter to simulate real live video inference
    const jitter = Math.floor(Math.random() * 3) - 1;
    cam.detectedHeadcount = Math.max(1, cam.detectedHeadcount + jitter);
    cam.deltaDiscrepancy = Math.max(0, cam.detectedHeadcount - cam.rfidBadgeCount);
    cam.confidenceScore = Math.min(99.9, Math.max(97.5, Math.round((98.5 + (Math.random() * 1.2)) * 10) / 10));
    cam.lastInferenceMs = Math.round((12.0 + Math.random() * 6.0) * 10) / 10;
    if (modelOverride) {
      cam.modelArchitecture = modelOverride as any;
    }
  });

  return getCnnInferenceDataDb();
}

export async function updateCnnCameraConfigDb(cameraId: string, updates: Record<string, any>) {
  const camera = cnnCameraFeedsStore.find((c) => c.id === cameraId);
  if (camera) {
    Object.assign(camera, updates);
    return camera;
  }
  return null;
}

// =========================================================================
// MILESTONE 4: COST OPTIMIZATION & ENTERPRISE DEPLOYMENT STORE & DATA
// =========================================================================

export interface CostCategoryBreakdown {
  id: string;
  category: 'Energy Costs' | 'Maintenance Costs' | 'Security Costs' | 'Resource Costs' | 'Administrative Costs';
  monthlyCost: number;
  percentageOfTotal: number;
  reductionPercentage: number;
  estimatedAnnualSavings: number;
  color: string;
  subcategories: { name: string; cost: number; trend: 'up' | 'down' | 'stable' }[];
}

export interface DepartmentCostItem {
  department: string;
  monthlyCost: number;
  annualBudget: number;
  utilizationPct: number;
  headcount: number;
  savingsOpportunity: number;
}

export interface MonthlyCostTrendItem {
  month: string;
  actualCost: number;
  predictedBaseline: number;
  aiOptimizedCost: number;
  energyCost: number;
  maintenanceCost: number;
  securityCost: number;
  resourceCost: number;
  savingsGenerated: number;
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'Energy' | 'Equipment' | 'Workspace' | 'Operational';
  capacity: number;
  currentUsage: number;
  unit: string;
  utilizationPct: number;
  status: 'Underutilized' | 'Optimal' | 'Overutilized' | 'Wasted';
  monthlyWasteCost: number;
  recommendation: string;
  actionableStep: string;
  estimatedSavings: number;
}

export interface BudgetDepartmentItem {
  id: string;
  department: string;
  totalBudget: number;
  currentSpending: number;
  remainingBudget: number;
  utilizationPct: number;
  monthlyRunRate: number;
  forecastEndYear: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  varianceAmt: number;
  notes: string;
}

export interface CostSavingRecommendationItem {
  id: string;
  title: string;
  problem: string;
  estimatedImpact: string;
  estimatedSavings: number; // monthly in USD
  annualSavings: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidenceScore: number; // 0 - 100%
  relatedAgent: 'Energy Agent' | 'Maintenance Agent' | 'Occupancy Agent' | 'Security Agent' | 'Cross-Agent Engine';
  suggestedAction: string;
  status: 'Pending' | 'Applied' | 'Dismissed';
  appliedAt?: string;
  paybackDays?: number;
  category: 'Energy' | 'Maintenance' | 'Space' | 'Operations';
}

export interface CrossAgentInsight {
  id: string;
  timestamp: string;
  sourceAgents: string[];
  triggerEvent: string;
  synthesisSummary: string;
  financialImpact: number;
  actionTaken: string;
  status: 'Active' | 'Resolved' | 'Automated';
}

export interface EnterpriseDeploymentNode {
  id: string;
  nodeName: string;
  role: 'Edge Gateway' | 'AI Inference Cluster' | 'BMS Controller Bridge' | 'Core Platform Server';
  location: string;
  ipAddress: string;
  status: 'Healthy' | 'Warning' | 'Standby';
  uptimeDays: number;
  cpuUsagePct: number;
  memoryUsagePct: number;
  latencyMs: number;
  activeWorkloads: string[];
  firmwareVersion: string;
}

// ---------------- IN-MEMORY STORES FOR MILESTONE 4 ----------------

export const costCategoriesStore: CostCategoryBreakdown[] = [
  {
    id: 'CAT-01',
    category: 'Energy Costs',
    monthlyCost: 142500,
    percentageOfTotal: 38,
    reductionPercentage: 14.8,
    estimatedAnnualSavings: 253000,
    color: '#f59e0b', // amber
    subcategories: [
      { name: 'Grid Electricity (Peak/Off-Peak)', cost: 98000, trend: 'down' },
      { name: 'Chilled Water & District Cooling', cost: 32000, trend: 'down' },
      { name: 'Natural Gas Boiler Heating', cost: 12500, trend: 'stable' },
    ],
  },
  {
    id: 'CAT-02',
    category: 'Maintenance Costs',
    monthlyCost: 78200,
    percentageOfTotal: 21,
    reductionPercentage: 18.2,
    estimatedAnnualSavings: 170800,
    color: '#10b981', // emerald
    subcategories: [
      { name: 'Emergency Breakdown Repairs', cost: 22000, trend: 'down' },
      { name: 'Scheduled Preventive Servicing', cost: 36200, trend: 'stable' },
      { name: 'OEM Parts & Filters Replacement', cost: 20000, trend: 'down' },
    ],
  },
  {
    id: 'CAT-03',
    category: 'Resource Costs',
    monthlyCost: 64200,
    percentageOfTotal: 17,
    reductionPercentage: 11.5,
    estimatedAnnualSavings: 88500,
    color: '#06b6d4', // cyan
    subcategories: [
      { name: 'Domestic & Cooling Tower Water', cost: 28500, trend: 'down' },
      { name: 'Cleaning & Consumables Logistics', cost: 21200, trend: 'stable' },
      { name: 'Waste Disposal & Recycling Audits', cost: 14500, trend: 'down' },
    ],
  },
  {
    id: 'CAT-04',
    category: 'Security Costs',
    monthlyCost: 45600,
    percentageOfTotal: 12,
    reductionPercentage: 8.6,
    estimatedAnnualSavings: 47000,
    color: '#8b5cf6', // purple
    subcategories: [
      { name: 'Manned Guarding Off-Hours Dispatch', cost: 24000, trend: 'down' },
      { name: 'Access Control Systems Licensing', cost: 12800, trend: 'stable' },
      { name: 'CCTV Neural Stream Cloud Ingest', cost: 8800, trend: 'stable' },
    ],
  },
  {
    id: 'CAT-05',
    category: 'Administrative Costs',
    monthlyCost: 44500,
    percentageOfTotal: 12,
    reductionPercentage: 6.2,
    estimatedAnnualSavings: 33100,
    color: '#64748b', // slate
    subcategories: [
      { name: 'Compliance & Environmental Reporting', cost: 19500, trend: 'stable' },
      { name: 'Facility Management Software Seats', cost: 14000, trend: 'stable' },
      { name: 'Insurance & Unscheduled Contingency', cost: 11000, trend: 'down' },
    ],
  },
];

export const departmentCostsStore: DepartmentCostItem[] = [
  {
    department: 'Central Plant & HVAC Operations',
    monthlyCost: 154000,
    annualBudget: 2100000,
    utilizationPct: 73.3,
    headcount: 14,
    savingsOpportunity: 24500,
  },
  {
    department: 'Lighting, Power & Electrical',
    monthlyCost: 68500,
    annualBudget: 920000,
    utilizationPct: 74.5,
    headcount: 8,
    savingsOpportunity: 11200,
  },
  {
    department: 'Vertical Transport (Elevators/Lifts)',
    monthlyCost: 38200,
    annualBudget: 500000,
    utilizationPct: 76.4,
    headcount: 4,
    savingsOpportunity: 5800,
  },
  {
    department: 'Data Center & IT Server Rooms',
    monthlyCost: 52400,
    annualBudget: 680000,
    utilizationPct: 77.1,
    headcount: 12,
    savingsOpportunity: 7400,
  },
  {
    department: 'Physical Security & Access Operations',
    monthlyCost: 39500,
    annualBudget: 520000,
    utilizationPct: 75.9,
    headcount: 16,
    savingsOpportunity: 4200,
  },
  {
    department: 'Janitorial, Waste & Environmental',
    monthlyCost: 22400,
    annualBudget: 300000,
    utilizationPct: 74.7,
    headcount: 22,
    savingsOpportunity: 3100,
  },
];

export const monthlyCostTrendsStore: MonthlyCostTrendItem[] = [
  { month: 'Sep 2025', actualCost: 432000, predictedBaseline: 430000, aiOptimizedCost: 430000, energyCost: 168000, maintenanceCost: 98000, securityCost: 52000, resourceCost: 71000, savingsGenerated: 0 },
  { month: 'Oct 2025', actualCost: 425000, predictedBaseline: 435000, aiOptimizedCost: 420000, energyCost: 164000, maintenanceCost: 94000, securityCost: 51000, resourceCost: 70000, savingsGenerated: 10000 },
  { month: 'Nov 2025', actualCost: 412000, predictedBaseline: 440000, aiOptimizedCost: 405000, energyCost: 158000, maintenanceCost: 91000, securityCost: 49000, resourceCost: 68000, savingsGenerated: 28000 },
  { month: 'Dec 2025', actualCost: 401000, predictedBaseline: 448000, aiOptimizedCost: 395000, energyCost: 153000, maintenanceCost: 88000, securityCost: 48000, resourceCost: 67000, savingsGenerated: 47000 },
  { month: 'Jan 2026', actualCost: 392000, predictedBaseline: 445000, aiOptimizedCost: 388000, energyCost: 149000, maintenanceCost: 84000, securityCost: 47000, resourceCost: 66000, savingsGenerated: 53000 },
  { month: 'Feb 2026', actualCost: 384000, predictedBaseline: 442000, aiOptimizedCost: 380000, energyCost: 146000, maintenanceCost: 81000, securityCost: 46000, resourceCost: 65000, savingsGenerated: 58000 },
  { month: 'Mar 2026', actualCost: 375000, predictedBaseline: 446000, aiOptimizedCost: 372000, energyCost: 142500, maintenanceCost: 78200, securityCost: 45600, resourceCost: 64200, savingsGenerated: 71000 },
  // Projected Future 5 Months
  { month: 'Apr 2026 (F)', actualCost: 368000, predictedBaseline: 450000, aiOptimizedCost: 365000, energyCost: 139000, maintenanceCost: 76000, securityCost: 45000, resourceCost: 63000, savingsGenerated: 82000 },
  { month: 'May 2026 (F)', actualCost: 362000, predictedBaseline: 455000, aiOptimizedCost: 358000, energyCost: 136000, maintenanceCost: 74500, securityCost: 44500, resourceCost: 62000, savingsGenerated: 93000 },
  { month: 'Jun 2026 (F)', actualCost: 358000, predictedBaseline: 462000, aiOptimizedCost: 352000, energyCost: 134000, maintenanceCost: 73000, securityCost: 44000, resourceCost: 61000, savingsGenerated: 104000 },
  { month: 'Jul 2026 (F)', actualCost: 354000, predictedBaseline: 468000, aiOptimizedCost: 348000, energyCost: 132000, maintenanceCost: 72000, securityCost: 43800, resourceCost: 60500, savingsGenerated: 114000 },
  { month: 'Aug 2026 (F)', actualCost: 350000, predictedBaseline: 472000, aiOptimizedCost: 344000, energyCost: 130000, maintenanceCost: 71000, securityCost: 43500, resourceCost: 60000, savingsGenerated: 122000 },
];

export const resourceUtilizationStore: ResourceItem[] = [
  {
    id: 'RES-01',
    name: 'Chilled Water Plant Capacity',
    category: 'Energy',
    capacity: 2400,
    currentUsage: 1480,
    unit: 'Tons Cooling',
    utilizationPct: 61.6,
    status: 'Optimal',
    monthlyWasteCost: 2800,
    recommendation: 'Stage Chiller #2 down to minimum VFD frequency between 18:00 and 06:00.',
    actionableStep: 'Enable autonomous staging rule on Trane Tracer BMS controller.',
    estimatedSavings: 3850,
  },
  {
    id: 'RES-02',
    name: 'Grid Peak Demand Tariff Reservoir',
    category: 'Energy',
    capacity: 1200,
    currentUsage: 1045,
    unit: 'kW Peak',
    utilizationPct: 87.1,
    status: 'Overutilized',
    monthlyWasteCost: 8900,
    recommendation: 'Pre-cool building thermal mass between 05:00-08:00 to shave afternoon grid peak spikes.',
    actionableStep: 'Activate automated precooling routine on AHU supply fans.',
    estimatedSavings: 9400,
  },
  {
    id: 'RES-03',
    name: 'Air Handling Unit Fan Banks (AHU 1-8)',
    category: 'Equipment',
    capacity: 180000,
    currentUsage: 115000,
    unit: 'CFM Airflow',
    utilizationPct: 63.8,
    status: 'Underutilized',
    monthlyWasteCost: 3400,
    recommendation: 'Reset static pressure setpoints based on real-time CO2 zone damper demand.',
    actionableStep: 'Trim static duct pressure from 1.8 in. w.g. down to 1.3 in. w.g.',
    estimatedSavings: 4200,
  },
  {
    id: 'RES-04',
    name: 'Floor 3 Conference Hall A Seating',
    category: 'Workspace',
    capacity: 100,
    currentUsage: 108,
    unit: 'Occupants',
    utilizationPct: 108.0,
    status: 'Overutilized',
    monthlyWasteCost: 1900,
    recommendation: 'Auto-redirect meeting overflow to Conference Hub B (Floor 2, only 15% loaded).',
    actionableStep: 'Send digital signage overflow guidance and boost AHU-02 purge damper.',
    estimatedSavings: 2100,
  },
  {
    id: 'RES-05',
    name: 'Floor 5 & 6 Open Plan Desks (Evening)',
    category: 'Workspace',
    capacity: 240,
    currentUsage: 18,
    unit: 'Desks Active',
    utilizationPct: 7.5,
    status: 'Wasted',
    monthlyWasteCost: 5200,
    recommendation: 'Consolidate after-hours occupants to Floor 4 wing; trigger HVAC setback on Floors 5-6.',
    actionableStep: 'Turn off zone VAV boxes and perimeter lighting loops past 19:30.',
    estimatedSavings: 5600,
  },
  {
    id: 'RES-06',
    name: 'Emergency Backup Diesel Generators',
    category: 'Equipment',
    capacity: 2500,
    currentUsage: 0,
    unit: 'kVA Standby',
    utilizationPct: 0.0,
    status: 'Optimal',
    monthlyWasteCost: 650,
    recommendation: 'Participate in utility demand response grid event next Thursday for $4,200 grid rebate.',
    actionableStep: 'Enroll in NYISO 4-hour scheduled synchronous reserve test.',
    estimatedSavings: 4200,
  },
  {
    id: 'RES-07',
    name: 'Cooling Tower Water Evaporation Loss',
    category: 'Operational',
    capacity: 45000,
    currentUsage: 38200,
    unit: 'Gal / Day',
    utilizationPct: 84.8,
    status: 'Overutilized',
    monthlyWasteCost: 4100,
    recommendation: 'Increase cycles of concentration from 3.2 to 5.5 using automated chemical TDS dosing.',
    actionableStep: 'Calibrate blowdown conductivity solenoid sensor on Tower #1.',
    estimatedSavings: 4600,
  },
  {
    id: 'RES-08',
    name: 'Security Patrol Vehicle & Manned Guards',
    category: 'Operational',
    capacity: 120,
    currentUsage: 64,
    unit: 'Patrol Hours',
    utilizationPct: 53.3,
    status: 'Underutilized',
    monthlyWasteCost: 3100,
    recommendation: 'Replace fixed hourly exterior patrols with CNN Optical intrusion virtual geofencing.',
    actionableStep: 'Reassign 1 roving guard to desk dispatch; automate perimeter alerts.',
    estimatedSavings: 3800,
  },
];

export const budgetDepartmentsStore: BudgetDepartmentItem[] = [
  {
    id: 'BDG-01',
    department: 'Central Plant & HVAC Operations',
    totalBudget: 2100000,
    currentSpending: 1540000,
    remainingBudget: 560000,
    utilizationPct: 73.3,
    monthlyRunRate: 154000,
    forecastEndYear: 1980000,
    status: 'NORMAL',
    varianceAmt: -120000,
    notes: 'Operating $120k under budget due to AI chilled water optimization and COP improvements.',
  },
  {
    id: 'BDG-02',
    department: 'Electrical Utilities & Lighting',
    totalBudget: 920000,
    currentSpending: 685000,
    remainingBudget: 235000,
    utilizationPct: 74.5,
    monthlyRunRate: 68500,
    forecastEndYear: 880000,
    status: 'NORMAL',
    varianceAmt: -40000,
    notes: 'Under budget. Automated daylight harvesting and smart occupancy dimming functioning properly.',
  },
  {
    id: 'BDG-03',
    department: 'Equipment Maintenance & Repairs',
    totalBudget: 850000,
    currentSpending: 710000,
    remainingBudget: 140000,
    utilizationPct: 83.5,
    monthlyRunRate: 78200,
    forecastEndYear: 895000,
    status: 'WARNING',
    varianceAmt: 45000,
    notes: 'Warning: Elevated due to early Q1 chiller overhaul parts purchase, now trending downwards.',
  },
  {
    id: 'BDG-04',
    department: 'Data Center & IT Infrastructure',
    totalBudget: 680000,
    currentSpending: 524000,
    remainingBudget: 156000,
    utilizationPct: 77.1,
    monthlyRunRate: 52400,
    forecastEndYear: 672000,
    status: 'NORMAL',
    varianceAmt: -8000,
    notes: 'On track within 1.2% of planned allocation. Server thermal load stable.',
  },
  {
    id: 'BDG-05',
    department: 'Security & Access Operations',
    totalBudget: 520000,
    currentSpending: 395000,
    remainingBudget: 125000,
    utilizationPct: 75.9,
    monthlyRunRate: 39500,
    forecastEndYear: 508000,
    status: 'NORMAL',
    varianceAmt: -12000,
    notes: 'Benefiting from automated AI badge threat triage and reduced overtime.',
  },
  {
    id: 'BDG-06',
    department: 'Water, Janitorial & Grounds',
    totalBudget: 350000,
    currentSpending: 312000,
    remainingBudget: 38000,
    utilizationPct: 89.1,
    monthlyRunRate: 28500,
    forecastEndYear: 378000,
    status: 'CRITICAL',
    varianceAmt: 28000,
    notes: 'Critical alert: Cooling tower water evaporation charges exceeded projections in January freeze.',
  },
];

export const costRecommendationsStore: CostSavingRecommendationItem[] = [
  {
    id: 'REC-COST-01',
    title: 'HVAC Dynamic Static Pressure & Temperature Reset',
    problem: 'Chillers and AHUs operating at constant design static pressure regardless of actual occupant density.',
    estimatedImpact: 'Reduces central chiller plant electrical demand by 62 kW during shoulder hours.',
    estimatedSavings: 4850,
    annualSavings: 58200,
    priority: 'Critical',
    confidenceScore: 98.4,
    relatedAgent: 'Energy Agent',
    suggestedAction: 'Deploy Trane Tracer BMS static pressure setpoint trim algorithm (-0.35 in. w.g.).',
    status: 'Pending',
    paybackDays: 1,
    category: 'Energy',
  },
  {
    id: 'REC-COST-02',
    title: 'Preventive Bearing Swap for Chiller #2 Compressor',
    problem: 'Vibration frequency analysis detected high-frequency harmonics (4.2 mm/s RMS) indicating stage-2 bearing wear.',
    estimatedImpact: 'Prevents catastrophic compressor seizure and unscheduled building downtime.',
    estimatedSavings: 18400,
    annualSavings: 36800,
    priority: 'Critical',
    confidenceScore: 97.2,
    relatedAgent: 'Maintenance Agent',
    suggestedAction: 'Dispatch mechanical contractor for scheduled bearing overhaul during weekend shutdown.',
    status: 'Pending',
    paybackDays: 14,
    category: 'Maintenance',
  },
  {
    id: 'REC-COST-03',
    title: 'Off-Hours Zone Consolidation & Setback Scheduling',
    problem: 'Floors 5 & 6 maintaining full 21.5°C comfort cooling with only 7.5% human occupancy past 19:30.',
    estimatedImpact: 'Eliminates 38,000 kWh of unnecessary evening cooling and lighting waste monthly.',
    estimatedSavings: 5600,
    annualSavings: 67200,
    priority: 'High',
    confidenceScore: 96.1,
    relatedAgent: 'Occupancy Agent',
    suggestedAction: 'Engage nighttime zone setback (24.0°C) and consolidate late workers to Floor 4 East Wing.',
    status: 'Pending',
    paybackDays: 2,
    category: 'Space',
  },
  {
    id: 'REC-COST-04',
    title: 'Peak Demand Shaving via Thermal Storage Pre-Cooling',
    problem: 'Building peaks at 1,045 kW between 13:30 and 15:30 incurring severe utility coincident peak demand charges ($24.50/kW).',
    estimatedImpact: 'Shaves 180 kW off billing demand peak via early morning thermal mass subcooling.',
    estimatedSavings: 4410,
    annualSavings: 52920,
    priority: 'High',
    confidenceScore: 95.5,
    relatedAgent: 'Cross-Agent Engine',
    suggestedAction: 'Pre-cool building to 20.5°C between 05:00-08:00; float setpoint to 23.5°C during 14:00 peak.',
    status: 'Pending',
    paybackDays: 3,
    category: 'Energy',
  },
  {
    id: 'REC-COST-05',
    title: 'Cooling Tower Water Cycles Optimization',
    problem: 'Blowdown valve triggering prematurely at 3.2 cycles of concentration wasting chemical inhibitor and water.',
    estimatedImpact: 'Saves 340,000 gallons of city water and decreases sewage discharge fees.',
    estimatedSavings: 3800,
    annualSavings: 45600,
    priority: 'Medium',
    confidenceScore: 94.0,
    relatedAgent: 'Maintenance Agent',
    suggestedAction: 'Recalibrate conductivity probe and automate polymer anti-scale dosing to target 5.5 cycles.',
    status: 'Pending',
    paybackDays: 12,
    category: 'Operations',
  },
  {
    id: 'REC-COST-06',
    title: 'CNN Virtual Perimeter Guarding vs Manned Overtime',
    problem: 'Paying $95/hr overtime rates for manual physical guards to patrol exterior perimeter loading bays.',
    estimatedImpact: 'Automated deep learning optical geofencing replaces 18 hours of manual patrol shifts weekly.',
    estimatedSavings: 6840,
    annualSavings: 82080,
    priority: 'High',
    confidenceScore: 96.8,
    relatedAgent: 'Security Agent',
    suggestedAction: 'Activate optical edge CNN intrusion bounding boxes with automated audio deterrence broadcast.',
    status: 'Pending',
    paybackDays: 7,
    category: 'Operations',
  },
  {
    id: 'REC-COST-07',
    title: 'Air Filter Differential Pressure Dynamic Replacement',
    problem: 'Filters being replaced on fixed 90-day calendar intervals rather than actual loading differential pressure (in. w.g.).',
    estimatedImpact: 'Extends MERV-13 filter life by 42% without degrading indoor particulate filtration.',
    estimatedSavings: 2400,
    annualSavings: 28800,
    priority: 'Medium',
    confidenceScore: 92.5,
    relatedAgent: 'Maintenance Agent',
    suggestedAction: 'Switch work order trigger to Magnehelic pressure drop sensors (> 0.8 in. w.g.).',
    status: 'Applied',
    appliedAt: '2026-02-15T10:30:00Z',
    paybackDays: 10,
    category: 'Maintenance',
  },
  {
    id: 'REC-COST-08',
    title: 'Automated Conference Room Auto-Release on No-Show',
    problem: 'Rooms reserved on Microsoft Outlook remaining empty while HVAC and lights run at full comfort levels.',
    estimatedImpact: 'Releases 140 reserved hours weekly and trims zone air dampers when rooms remain vacant for >10 mins.',
    estimatedSavings: 1950,
    annualSavings: 23400,
    priority: 'Low',
    confidenceScore: 91.2,
    relatedAgent: 'Occupancy Agent',
    suggestedAction: 'Sync Exchange room calendar with CNN optical camera headcounter to cancel ghost reservations.',
    status: 'Applied',
    appliedAt: '2026-02-18T14:00:00Z',
    paybackDays: 5,
    category: 'Space',
  },
];

export const crossAgentInsightsStore: CrossAgentInsight[] = [
  {
    id: 'X-INS-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    sourceAgents: ['Energy Agent', 'Occupancy Agent'],
    triggerEvent: 'Floor 5 Power Demand = 48 kW while Optical Headcount = 2 Occupants',
    synthesisSummary: 'High energy consumption detected in nearly empty zone. Recommended immediate VAV flow trim and partial lighting sweep.',
    financialImpact: 1450, // monthly savings
    actionTaken: 'Autonomous command dispatched to VAV-05-1 through 05-4 to throttle CFM to minimum ventilation.',
    status: 'Automated',
  },
  {
    id: 'X-INS-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    sourceAgents: ['Maintenance Agent', 'Energy Agent'],
    triggerEvent: 'Chiller #1 COP dropped to 3.8 while Condenser Water Delta-T increased to 7.4°C',
    synthesisSummary: 'Micro-fouling detected on condenser tubes, causing 11% energy penalty. Recommended proactive chemical descaling before peak summer tariffs.',
    financialImpact: 3200,
    actionTaken: 'High priority work order WO-CH-4891 created with auto-attached diagnostic logs.',
    status: 'Active',
  },
  {
    id: 'X-INS-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    sourceAgents: ['Security Agent', 'Occupancy Agent'],
    triggerEvent: 'CNN Vision Headcount = 108 in Conf Hall A vs RFID Badge Swipes = 82',
    synthesisSummary: '26 untracked occupants detected (Tailgating / Guest Assembly). Cross-correlated with IAQ CO2 spike (1,280 PPM).',
    financialImpact: 850,
    actionTaken: 'Ventilation purge boosted (+25% OA) and physical security guard notified of guest lobby bypass.',
    status: 'Resolved',
  },
  {
    id: 'X-INS-04',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    sourceAgents: ['Maintenance Agent', 'Occupancy Agent', 'Energy Agent'],
    triggerEvent: 'Elevator Car #3 Motor Temperature 72°C during Peak Lobby Commute (12:30)',
    synthesisSummary: 'Thermal stress on traction machine. Cross-agent engine adjusted dispatch algorithm to route lobby passengers across Cars #1, #2, #4.',
    financialImpact: 6400, // failure avoidance
    actionTaken: 'Dispatch load balancing active. Motor temperature normalized to 58°C within 35 minutes.',
    status: 'Automated',
  },
];

export const enterpriseDeploymentNodesStore: EnterpriseDeploymentNode[] = [
  {
    id: 'NODE-01',
    nodeName: 'Apex Edge Gateway #1 (Central Plant)',
    role: 'Edge Gateway',
    location: 'Sub-Basement B2 Plant Room',
    ipAddress: '10.14.2.11',
    status: 'Healthy',
    uptimeDays: 142,
    cpuUsagePct: 24.5,
    memoryUsagePct: 41.2,
    latencyMs: 4.8,
    activeWorkloads: ['BACnet/IP Polling', 'Modbus RTU Bridge', 'Chiller Telemetry Ingest'],
    firmwareVersion: 'v3.8.4-edge-rt',
  },
  {
    id: 'NODE-02',
    nodeName: 'Apex Neural Vision Ingest #1',
    role: 'AI Inference Cluster',
    location: 'Floor 1 Data Center Rack D3',
    ipAddress: '10.14.2.12',
    status: 'Healthy',
    uptimeDays: 89,
    cpuUsagePct: 68.2,
    memoryUsagePct: 74.0,
    latencyMs: 15.1,
    activeWorkloads: ['YOLOv8-CrowdNet', 'CSRNet Density TensorRT', 'RTSP Video Decode'],
    firmwareVersion: 'v4.1.0-cuda12',
  },
  {
    id: 'NODE-03',
    nodeName: 'Apex Access & Security Bridge',
    role: 'BMS Controller Bridge',
    location: 'Floor 2 Security Operations Center',
    ipAddress: '10.14.2.14',
    status: 'Healthy',
    uptimeDays: 210,
    cpuUsagePct: 18.0,
    memoryUsagePct: 32.5,
    latencyMs: 8.2,
    activeWorkloads: ['OSDP RFID Ingest', 'Tailgating Detection Hook', 'Fire Alarm Interface'],
    firmwareVersion: 'v2.9.2-sec',
  },
  {
    id: 'NODE-04',
    nodeName: 'Cloud Run Enterprise Container (Production)',
    role: 'Core Platform Server',
    location: 'GCP Cloud Run (Multi-Zone High Availability)',
    ipAddress: 'Internal Ingress Port 3000',
    status: 'Healthy',
    uptimeDays: 99,
    cpuUsagePct: 34.0,
    memoryUsagePct: 52.8,
    latencyMs: 18.4,
    activeWorkloads: ['Cross-Agent AI Engine', 'Cost Optimization Core', 'REST API Service', 'WebSocket Syncer'],
    firmwareVersion: 'v2.4.0-prod',
  },
];

// ---------------- DATABASE ACCESS FUNCTIONS FOR MILESTONE 4 ----------------

export async function getCostOverviewDb() {
  const totalMonthlyCost = costCategoriesStore.reduce((acc, c) => acc + c.monthlyCost, 0);
  const totalAnnualBaseline = totalMonthlyCost * 12;
  const currentMonthlySavings = costRecommendationsStore
    .filter((r) => r.status === 'Applied')
    .reduce((acc, r) => acc + r.estimatedSavings, 0);
  const potentialMonthlySavings = costRecommendationsStore
    .filter((r) => r.status === 'Pending')
    .reduce((acc, r) => acc + r.estimatedSavings, 0);
  const totalAnnualSavings = (currentMonthlySavings + potentialMonthlySavings) * 12;
  const costReductionPct = Math.round((totalAnnualSavings / totalAnnualBaseline) * 1000) / 10;

  return {
    totalMonthlyCost,
    totalAnnualCost: totalAnnualBaseline,
    currentMonthlySavings,
    potentialMonthlySavings,
    totalAnnualSavings,
    costReductionPct, // e.g. 11.8%
    budgetUtilizationPct: 78.1,
    facilityHealthScore: 91,
    activeCostAnomalies: 2,
    currency: 'USD',
    categories: costCategoriesStore,
  };
}

export async function getCostAnalyticsDb() {
  const overview = await getCostOverviewDb();
  return {
    ...overview,
    categories: costCategoriesStore,
    departmentCosts: departmentCostsStore,
    monthlyTrends: monthlyCostTrendsStore,
  };
}

export async function getResourceUtilizationDb() {
  const underutilized = resourceUtilizationStore.filter((r) => r.status === 'Underutilized');
  const overutilized = resourceUtilizationStore.filter((r) => r.status === 'Overutilized');
  const wasted = resourceUtilizationStore.filter((r) => r.status === 'Wasted');
  const optimal = resourceUtilizationStore.filter((r) => r.status === 'Optimal');

  const totalMonthlyWasteCost = resourceUtilizationStore.reduce((acc, r) => acc + r.monthlyWasteCost, 0);
  const totalPotentialSavings = resourceUtilizationStore.reduce((acc, r) => acc + r.estimatedSavings, 0);
  const averageUtilizationPct = Math.round(
    resourceUtilizationStore.reduce((acc, r) => acc + r.utilizationPct, 0) / resourceUtilizationStore.length
  );

  return {
    resources: resourceUtilizationStore,
    summary: {
      totalResourcesTracked: resourceUtilizationStore.length,
      underutilizedCount: underutilized.length,
      overutilizedCount: overutilized.length,
      wastedCount: wasted.length,
      optimalCount: optimal.length,
      averageUtilizationPct,
      totalMonthlyWasteCost,
      totalPotentialSavings,
      annualWasteAvoidance: totalPotentialSavings * 12,
    },
  };
}

export async function getBudgetMonitoringDb() {
  const totalBudget = budgetDepartmentsStore.reduce((acc, d) => acc + d.totalBudget, 0);
  const currentSpending = budgetDepartmentsStore.reduce((acc, d) => acc + d.currentSpending, 0);
  const remainingBudget = totalBudget - currentSpending;
  const utilizationPct = Math.round((currentSpending / totalBudget) * 1000) / 10;
  const monthlySpending = Math.round(currentSpending / 10);
  const forecastEndYear = budgetDepartmentsStore.reduce((acc, d) => acc + d.forecastEndYear, 0);

  const criticalDepts = budgetDepartmentsStore.filter((d) => d.status === 'CRITICAL');
  const warningDepts = budgetDepartmentsStore.filter((d) => d.status === 'WARNING');
  const normalDepts = budgetDepartmentsStore.filter((d) => d.status === 'NORMAL');

  const overallStatus = criticalDepts.length > 0 ? 'CRITICAL' : warningDepts.length > 0 ? 'WARNING' : 'NORMAL';

  return {
    totalBudget,
    currentSpending,
    remainingBudget,
    utilizationPct,
    monthlySpending,
    forecastEndYear,
    varianceToBudget: forecastEndYear - totalBudget, // negative means under budget
    overallStatus,
    departments: budgetDepartmentsStore,
    summary: {
      criticalCount: criticalDepts.length,
      warningCount: warningDepts.length,
      normalCount: normalDepts.length,
    },
  };
}

export async function getRoiAnalyticsDb() {
  // Simple, transparent financial calculations
  const investmentCost = 240000; // Platform hardware, sensors, setup
  const annualEnergySavings = 194400; // Kilowatt hour reductions
  const annualMaintenanceSavings = 112000; // Prevented downtime and scheduled swaps
  const annualOperationalSavings = 80000; // Water, space, security optimization
  const totalAnnualSavings = annualEnergySavings + annualMaintenanceSavings + annualOperationalSavings; // $386,400

  const costAvoidance = 184000; // Catastrophic equipment failure avoidance & peak demand fines avoided
  const netFirstYearBenefit = totalAnnualSavings - investmentCost;
  const roiPct = Math.round((totalAnnualSavings / investmentCost) * 100); // 161%
  const paybackPeriodMonths = Math.round((investmentCost / (totalAnnualSavings / 12)) * 10) / 10; // 7.4 months

  // 3-Year Projection Curve
  const projections = [
    { year: 'Year 0 (Setup)', cumulativeInvestment: 240000, cumulativeSavings: 0, netCashFlow: -240000 },
    { year: 'Year 1', cumulativeInvestment: 255000, cumulativeSavings: 386400, netCashFlow: 131400 },
    { year: 'Year 2', cumulativeInvestment: 270000, cumulativeSavings: 785000, netCashFlow: 515000 },
    { year: 'Year 3', cumulativeInvestment: 285000, cumulativeSavings: 1198000, netCashFlow: 913000 },
  ];

  return {
    investmentCost,
    totalAnnualSavings,
    annualEnergySavings,
    annualMaintenanceSavings,
    annualOperationalSavings,
    roiPct,
    paybackPeriodMonths,
    costAvoidance,
    netFirstYearBenefit,
    threeYearNpv: 913000,
    projections,
    metrics: [
      { label: 'Initial Platform Investment', value: '$240,000', detail: 'Hardware gateways, IoT sensors, Edge deployment' },
      { label: 'Validated Annual Savings', value: `$${totalAnnualSavings.toLocaleString()}`, detail: 'Utility reduction & operational efficiencies' },
      { label: 'Return on Investment (ROI)', value: `${roiPct}%`, detail: 'First year net cash flow performance' },
      { label: 'Estimated Payback Period', value: `${paybackPeriodMonths} Months`, detail: 'Full capital recovery timeline' },
      { label: 'Catastrophic Cost Avoidance', value: `$${costAvoidance.toLocaleString()}`, detail: 'Unscheduled downtime & emergency parts avoided' },
      { label: '3-Year Net Projected Benefit', value: '$913,000', detail: 'Total cumulative cash flow return' },
    ],
  };
}

export async function getCostRecommendationsDb() {
  return costRecommendationsStore;
}

export async function applyCostRecommendationDb(id: string) {
  const rec = costRecommendationsStore.find((r) => r.id === id);
  if (rec) {
    rec.status = 'Applied';
    rec.appliedAt = new Date().toISOString();
    return rec;
  }
  return null;
}

export async function createCostRecommendationDb(item: Partial<CostSavingRecommendationItem>) {
  const newItem: CostSavingRecommendationItem = {
    id: `REC-COST-${String(costRecommendationsStore.length + 1).padStart(2, '0')}`,
    title: item.title || 'AI Optimized Facility Tuning',
    problem: item.problem || 'Operational inefficiency detected by cross-agent analysis.',
    estimatedImpact: item.estimatedImpact || 'Reduces operational wastage across facility equipment.',
    estimatedSavings: item.estimatedSavings || 3200,
    annualSavings: (item.estimatedSavings || 3200) * 12,
    priority: item.priority || 'High',
    confidenceScore: item.confidenceScore || 95.0,
    relatedAgent: item.relatedAgent || 'Cross-Agent Engine',
    suggestedAction: item.suggestedAction || 'Deploy automated setpoint reset command.',
    status: 'Pending',
    paybackDays: 3,
    category: item.category || 'Operations',
  };
  costRecommendationsStore.unshift(newItem);
  return newItem;
}

export async function getCrossAgentIntelligenceDb() {
  return {
    status: 'Active Synchronization',
    engineModel: 'Cross-Agent Spatial & Energy Fusion Engine (v4.0)',
    activeAgentsConnected: [
      { name: 'Energy Intelligence Agent', status: 'Online', telemetryRate: '1.0s', anomaliesActive: 2 },
      { name: 'Predictive Maintenance Agent', status: 'Online', telemetryRate: '2.5s', equipmentMonitored: 8 },
      { name: 'Occupancy Agent', status: 'Online', telemetryRate: '0.5s', zonesMonitored: 12 },
      { name: 'Security Agent', status: 'Online', telemetryRate: '1.0s', threatScore: 'Low' },
      { name: 'Cost Optimization Agent', status: 'Online', telemetryRate: 'Real-time', potentialSavingsMo: '$47,850' },
    ],
    insights: crossAgentInsightsStore,
  };
}

export async function getFacilityHealthScoreDb() {
  // Detailed 5-pillar mathematical score
  const energyScore = 94; // Baseline vs actual, COP index
  const maintenanceScore = 88; // Mean RUL, critical equipment vibration
  const occupancyScore = 92; // Density balance, CO2 fresh air compliance
  const securityScore = 96; // Zero critical breaches, CNN geofence operational
  const costScore = 86; // Budget adherence, savings target achievement

  const overallScore = Math.round(
    energyScore * 0.25 +
    maintenanceScore * 0.25 +
    occupancyScore * 0.2 +
    securityScore * 0.15 +
    costScore * 0.15
  );

  const getStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Moderate';
    if (score >= 60) return 'Needs Attention';
    return 'Critical';
  };

  return {
    score: overallScore, // 91 / 100
    status: getStatus(overallScore),
    facilityName: 'Apex Tower HQ (New York)',
    lastEvaluated: new Date().toISOString(),
    breakdown: [
      { category: 'Energy Performance', score: energyScore, weightPct: 25, status: getStatus(energyScore), detail: 'HVAC COP at 4.1, solar offset active, peak demand shaved 180 kW.' },
      { category: 'Equipment Health', score: maintenanceScore, weightPct: 25, status: getStatus(maintenanceScore), detail: '7 of 8 critical assets optimal. Chiller #2 bearing overhaul scheduled.' },
      { category: 'Occupancy Efficiency', score: occupancyScore, weightPct: 20, status: getStatus(occupancyScore), detail: 'Space utilization at 71%. 1 overcrowded conference room purged.' },
      { category: 'Security Status', score: securityScore, weightPct: 15, status: getStatus(securityScore), detail: 'Zero unauthorized breaches. CNN tailgating verification active.' },
      { category: 'Cost Performance', score: costScore, weightPct: 15, status: getStatus(costScore), detail: '78.1% budget utilization. $386k/yr validated savings generated.' },
    ],
  };
}

export async function getExecutiveDashboardDb() {
  const [costOverview, healthScore, budget, roi, crossAgent] = await Promise.all([
    getCostOverviewDb(),
    getFacilityHealthScoreDb(),
    getBudgetMonitoringDb(),
    getRoiAnalyticsDb(),
    getCrossAgentIntelligenceDb(),
  ]);

  return {
    facilityName: 'Apex Tower HQ (New York)',
    reportingPeriod: 'Fiscal Year 2026 (Live Operational Snapshot)',
    facilityHealth: healthScore,
    kpis: {
      costReductionPct: costOverview.costReductionPct,
      roiGeneratedPct: roi.roiPct,
      facilityHealthScore: healthScore.score,
      totalMonthlyEnergyKw: 840.5,
      equipmentHealthAvg: 88,
      securityThreatLevel: 'Low (Safe)',
      occupancyEfficiencyPct: 71,
      totalOptimizationOpportunities: costRecommendationsStore.length,
      validatedAnnualSavings: roi.totalAnnualSavings,
      budgetHealthStatus: budget.overallStatus,
    },
    costDistribution: costCategoriesStore,
    topAiRecommendations: costRecommendationsStore.slice(0, 4),
    activeAnomalies: [
      { agent: 'Energy Agent', title: 'Chilled water supply delta-T low', impact: '$240/day waste', priority: 'High' },
      { agent: 'Maintenance Agent', title: 'Chiller #2 stage-2 bearing harmonic vibration', impact: '$18,400 failure risk', priority: 'Critical' },
      { agent: 'Occupancy Agent', title: 'Floor 3 Conference Hall A density exceeded (108%)', impact: 'CO2 elevated (1,280 PPM)', priority: 'Medium' },
    ],
    crossAgentSummary: crossAgent.insights.slice(0, 3),
    savingsOpportunities: {
      immediateAvailableMonthly: costOverview.potentialMonthlySavings,
      validatedRealizedMonthly: costOverview.currentMonthlySavings,
      annualTotalProjection: costOverview.totalAnnualSavings,
    },
  };
}

export async function getEnterpriseDeploymentDb() {
  return {
    platformVersion: 'v4.2.0-enterprise-milestone4',
    deploymentStatus: 'PRODUCTION_HEALTHY',
    clusterRegion: 'asia-east1 / us-east1 (Multi-Region Failover)',
    slaUptimePct: 99.98,
    meanApiLatencyMs: 18.2,
    activeMqttBrokers: 3,
    activeEdgeGateways: 4,
    totalConnectedIoTSensors: 48,
    nodes: enterpriseDeploymentNodesStore,
    serviceMeshHealth: [
      { service: 'BMS Ingest Pipeline', status: 'Healthy', latency: '4.2ms', throughput: '1,200 msg/sec' },
      { service: 'CNN Vision Inference Engine', status: 'Healthy', latency: '15.1ms', throughput: '38.6 FPS' },
      { service: 'Cross-Agent Decision Core', status: 'Healthy', latency: '22.0ms', throughput: 'Real-time' },
      { service: 'Cost Optimization Analytics API', status: 'Healthy', latency: '12.4ms', throughput: 'Operational' },
      { service: 'Automated Work Order Dispatcher', status: 'Healthy', latency: '8.0ms', throughput: 'Idle' },
    ],
  };
}

export async function generateFacilityReportDb(period: 'daily' | 'weekly' | 'monthly', facility: string = 'Apex Tower HQ') {
  const [executive, health, cost, budget, roi] = await Promise.all([
    getExecutiveDashboardDb(),
    getFacilityHealthScoreDb(),
    getCostOverviewDb(),
    getBudgetMonitoringDb(),
    getRoiAnalyticsDb(),
  ]);

  const reportId = `REP-${period.toUpperCase()}-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    reportId,
    title: `Enterprise Facility Intelligence & Cost Optimization Report (${period.toUpperCase()})`,
    facilityName: facility,
    period,
    generatedAt: new Date().toISOString(),
    displayDate: dateStr,
    executiveSummary: `The ${facility} facility operated at ${health.score}/100 health during this reporting cycle. AI autonomous optimizations shaved 180 kW of peak demand, avoiding coincident peak tariff spikes. Total validated annual savings run rate stands at $${roi.totalAnnualSavings.toLocaleString()} with a payback period of ${roi.paybackPeriodMonths} months.`,
    facilityHealthScore: health,
    energyPerformance: {
      currentDemandKw: 840.5,
      baselineDemandKw: 720.0,
      copEfficiency: 4.1,
      costAvoidance: '$18,400/yr',
      status: 'Optimal (ASHRAE 90.1 Compliant)',
    },
    maintenanceStatus: {
      totalEquipment: 8,
      optimalCount: 7,
      scheduledRepairs: 1,
      criticalAsset: 'Chiller #2 Compressor (Overhaul Scheduled for Weekend)',
      averageRulDays: 184,
    },
    occupancyInsights: {
      totalOccupants: 1046,
      capacityPct: 71,
      overcrowdedZonesCount: 1,
      primaryAction: 'Automated fresh air purge and occupant redistribution to Floor 2 Hub B.',
    },
    securityOverview: {
      threatLevel: 'Low',
      unauthorizedAttempts: 0,
      cnnOpticalHeadcountSynced: true,
      mannedOvertimeReducedHrs: 18,
    },
    costAnalysis: {
      monthlyRunRate: cost.totalMonthlyCost,
      annualSavingsRealized: roi.totalAnnualSavings,
      budgetVariance: budget.varianceToBudget,
      topExpenseCategory: 'Energy Costs ($142,500/mo, 38%)',
    },
    topRecommendations: costRecommendationsStore.slice(0, 5),
    savingsOpportunities: [
      { opportunity: 'Dynamic static pressure reset on Central Plant AHUs', savings: '$58,200/yr' },
      { opportunity: 'Chiller #2 preventive overhaul (preventing emergency failure)', savings: '$36,800/yr' },
      { opportunity: 'Floor 5 & 6 evening temperature and lighting setback', savings: '$67,200/yr' },
      { opportunity: 'Peak demand shaving via pre-cooling thermal storage', savings: '$52,920/yr' },
    ],
  };
}







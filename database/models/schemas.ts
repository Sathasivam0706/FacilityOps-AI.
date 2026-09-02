import mongoose, { Schema, Document } from 'mongoose';

// 1. User Schema
export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  role: string;
  facilityId: string;
  passwordHash?: string;
  salt?: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: { type: String, required: true, default: 'Facility Manager' },
    facilityId: { type: String, required: true, default: 'apex-hq' },
    passwordHash: { type: String },
    salt: { type: String },
  },
  { timestamps: true }
);

// 2. Equipment Health & Maintenance Schema
export interface IEquipment extends Document {
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

const EquipmentSchema = new Schema<IEquipment>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    healthScore: { type: Number, required: true },
    status: { type: String, enum: ['Optimal', 'Warning', 'Critical'], required: true },
    vibrationMms: { type: Number, required: true },
    temperatureC: { type: Number, required: true },
    copEfficiency: { type: Number, required: true },
    rulDays: { type: Number, required: true },
    rulHours: { type: Number, default: 720 },
    operatingHours: { type: Number, default: 10000 },
    lastService: { type: String, required: true },
    nextService: { type: String, default: '2026-09-01' },
    criticality: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  },
  { timestamps: true }
);

// 3. IoT Device Schema
export interface IIotDevice extends Document {
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

const IotDeviceSchema = new Schema<IIotDevice>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['Online', 'Offline', 'Degraded'], required: true },
    rssi: { type: String, required: true },
    firmware: { type: String, required: true },
    uptime: { type: String, required: true },
    lastPing: { type: String, required: true },
    lastPingTimestamp: { type: Number },
    isPhysicalHardware: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 4. Telemetry Time-Series Schema
export interface ITelemetry extends Document {
  timestamp: string;
  deviceId: string;
  topic: string;
  payload: Record<string, any>;
}

const TelemetrySchema = new Schema<ITelemetry>(
  {
    timestamp: { type: String, required: true, default: () => new Date().toISOString() },
    deviceId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// 5. Energy History Schema
export interface IEnergyHistory extends Document {
  facilityId: string;
  time: string;
  actualKw: number;
  optimizedKw: number;
  cop: number;
  isPeak: boolean;
  timestamp: Date;
}

const EnergyHistorySchema = new Schema<IEnergyHistory>(
  {
    facilityId: { type: String, required: true, default: 'apex-hq' },
    time: { type: String, required: true },
    actualKw: { type: Number, required: true },
    optimizedKw: { type: Number, required: true },
    cop: { type: Number, required: true },
    isPeak: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 6. Occupancy Zone Schema
export interface IOccupancyZone extends Document {
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
  timestamp: string;
  hvacLoadPct?: number;
  recommendedAction?: string;
  historical?: Array<{ time: string; occupantCount: number; co2Ppm: number }>;
}

const OccupancyZoneSchema = new Schema<IOccupancyZone>(
  {
    id: { type: String, required: true, unique: true },
    facilityId: { type: String, default: 'apex-hq' },
    buildingId: { type: String, default: 'BLDG-01' },
    floor: { type: Number, default: 1 },
    zone: { type: String, default: 'Zone A' },
    name: { type: String, required: true },
    location: { type: String, default: 'Main Building' },
    currentOccupancy: { type: Number, default: 0 },
    occupantCount: { type: Number, required: true },
    capacity: { type: Number, default: 100 },
    maxCapacity: { type: Number, required: true },
    occupancyPercentage: { type: Number, required: true },
    co2Ppm: { type: Number, required: true },
    tempC: { type: Number, required: true },
    humidityPct: { type: Number, required: true },
    status: { type: String, required: true },
    timestamp: { type: String, required: true, default: () => new Date().toISOString() },
    hvacLoadPct: { type: Number, default: 50 },
    recommendedAction: { type: String },
    historical: [
      {
        time: { type: String },
        occupantCount: { type: Number },
        co2Ppm: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

// 7. Work Order / Maintenance Record Schema
export interface IWorkOrder extends Document {
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

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    id: { type: String, required: true, unique: true },
    facilityId: { type: String, required: true, default: 'apex-hq' },
    assetId: { type: String, required: true },
    assetName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, required: true, default: 'Medium' },
    status: { type: String, required: true, default: 'Open' },
    assignedTechnician: { type: String, required: true },
    createdAt: { type: String, required: true },
    estimatedCostUsd: { type: Number, required: true },
    preventedDowntimeHrs: { type: Number, required: true },
    generatedBy: { type: String, required: true, default: 'Maintenance Agent' },
    sparePartsRequired: [{ type: String }],
  },
  { timestamps: true }
);

// 8. Alert & Notification Log Schema
export interface IAlertLog extends Document {
  id: string;
  timestamp: string;
  channel: string;
  recipient: string;
  subject: string;
  title?: string;
  body: string;
  message?: string;
  status: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
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

const AlertLogSchema = new Schema<IAlertLog>(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true },
    channel: { type: String, required: true },
    recipient: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String },
    body: { type: String, required: true },
    message: { type: String },
    status: { type: String, required: true, default: 'Delivered' },
    acknowledged: { type: Boolean, required: true, default: false },
    acknowledgedAt: { type: String },
    acknowledgedBy: { type: String },
    severity: { type: String, enum: ['critical', 'warning', 'info', 'resolved'], default: 'warning' },
    category: { type: String, default: 'maintenance' },
    equipmentId: { type: String },
    equipmentName: { type: String },
    detectionSource: { type: String },
    metricTrigger: { type: String },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: String },
    resolvedBy: { type: String },
    resolutionNotes: { type: String },
    workOrderId: { type: String },
  },
  { timestamps: true }
);

// 9. AI Recommendation Schema
export interface IRecommendation extends Document {
  id: string;
  agentType: 'energy' | 'maintenance' | 'occupancy';
  title: string;
  description: string;
  estimatedSavingsUsdMonth: number;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    id: { type: String, required: true, unique: true },
    agentType: { type: String, enum: ['energy', 'maintenance', 'occupancy'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedSavingsUsdMonth: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'applied', 'dismissed'], default: 'pending' },
    createdAt: { type: String, required: true },
  },
  { timestamps: true }
);

// 10. Audit Report Schema
export interface IReport extends Document {
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

const ReportSchema = new Schema<IReport>(
  {
    id: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    title: { type: String, default: 'Facility Operations Audit Report' },
    reportType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'energy', 'maintenance', 'ai-analysis', 'executive'],
      default: 'executive',
    },
    format: { type: String, enum: ['csv', 'pdf'], default: 'csv' },
    facilityId: { type: String, default: 'SITE-01' },
    facilityName: { type: String, default: 'Apex Tower HQ (New York)' },
    dateRange: { type: String, default: 'Current Period' },
    content: { type: String, required: true },
    summaryStats: { type: Schema.Types.Mixed },
    generatedAt: { type: String, required: true },
    generatedBy: { type: String, default: 'System Automation Agent' },
    fileSizeKb: { type: Number, default: 12 },
  },
  { timestamps: true }
);

// 11. Maintenance Schedule Schema
export interface IMaintenanceSchedule extends Document {
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

const MaintenanceScheduleSchema = new Schema<IMaintenanceSchedule>(
  {
    id: { type: String, required: true, unique: true },
    equipmentId: { type: String, required: true },
    equipmentName: { type: String, required: true },
    taskType: { type: String, required: true },
    scheduledDate: { type: String, required: true },
    recurrence: { type: String, default: 'Quarterly' },
    assignedTechnician: { type: String, required: true },
    estimatedDurationHrs: { type: Number, default: 4 },
    status: { type: String, enum: ['Scheduled', 'In Progress', 'Pending Parts', 'Completed'], default: 'Scheduled' },
    priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
    instructions: { type: String },
  },
  { timestamps: true }
);

// 12. Historical Maintenance Record Schema
export interface IMaintenanceRecord extends Document {
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

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>(
  {
    id: { type: String, required: true, unique: true },
    equipmentId: { type: String, required: true },
    equipmentName: { type: String, required: true },
    workOrderId: { type: String },
    completedDate: { type: String, required: true },
    serviceType: { type: String, required: true },
    technician: { type: String, required: true },
    costUsd: { type: Number, required: true },
    downtimeRecordedHrs: { type: Number, default: 0 },
    partsReplaced: [{ type: String }],
    findings: { type: String, required: true },
    outcome: { type: String, default: 'Resolved' },
  },
  { timestamps: true }
);

// 13. Security Event Schema
export interface ISecurityEvent extends Document {
  id: string;
  eventId: string;
  location: string;
  accessPoint: string;
  userIdentifier?: string;
  userName?: string;
  userRole?: string;
  eventType: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  status: string;
  description: string;
  recommendedAction: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  badgeId?: string;
  cameraFeedId?: string;
}

const SecurityEventSchema = new Schema<ISecurityEvent>(
  {
    id: { type: String, required: true, unique: true },
    eventId: { type: String, required: true },
    location: { type: String, required: true },
    accessPoint: { type: String, required: true },
    userIdentifier: { type: String },
    userName: { type: String },
    userRole: { type: String },
    eventType: { type: String, required: true },
    severity: { type: String, enum: ['critical', 'warning', 'info'], required: true, default: 'warning' },
    timestamp: { type: String, required: true, default: () => new Date().toISOString() },
    status: { type: String, required: true, default: 'active' },
    description: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    resolutionNotes: { type: String },
    resolvedAt: { type: String },
    resolvedBy: { type: String },
    badgeId: { type: String },
    cameraFeedId: { type: String },
  },
  { timestamps: true }
);

// 14. Access Event Log Schema
export interface IAccessEvent extends Document {
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

const AccessEventSchema = new Schema<IAccessEvent>(
  {
    id: { type: String, required: true, unique: true },
    badgeId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, default: 'Visitor' },
    doorName: { type: String, required: true },
    location: { type: String, required: true },
    accessGranted: { type: Boolean, required: true },
    reason: { type: String },
    timestamp: { type: String, required: true, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const EquipmentModel = mongoose.models.Equipment || mongoose.model<IEquipment>('Equipment', EquipmentSchema);
export const IotDeviceModel = mongoose.models.IotDevice || mongoose.model<IIotDevice>('IotDevice', IotDeviceSchema);
export const TelemetryModel = mongoose.models.Telemetry || mongoose.model<ITelemetry>('Telemetry', TelemetrySchema);
export const EnergyHistoryModel = mongoose.models.EnergyHistory || mongoose.model<IEnergyHistory>('EnergyHistory', EnergyHistorySchema);
export const OccupancyZoneModel = mongoose.models.OccupancyZone || mongoose.model<IOccupancyZone>('OccupancyZone', OccupancyZoneSchema);
export const WorkOrderModel = mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
export const AlertLogModel = mongoose.models.AlertLog || mongoose.model<IAlertLog>('AlertLog', AlertLogSchema);
export const RecommendationModel = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export const MaintenanceScheduleModel = mongoose.models.MaintenanceSchedule || mongoose.model<IMaintenanceSchedule>('MaintenanceSchedule', MaintenanceScheduleSchema);
export const MaintenanceRecordModel = mongoose.models.MaintenanceRecord || mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema);
export const SecurityEventModel = mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
export const AccessEventModel = mongoose.models.AccessEvent || mongoose.model<IAccessEvent>('AccessEvent', AccessEventSchema);


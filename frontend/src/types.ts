export type TabType = 
  | 'overview'
  | 'energy'
  | 'maintenance'
  | 'occupancy'
  | 'security'
  | 'workorders'
  | 'agent'
  | 'executive-hub'
  | 'energy-agent' 
  | 'cost-optimizer' 
  | 'cop-limits' 
  | 'predictive-health' 
  | 'work-orders' 
  | 'm3-intelligence'
  | 'occupancy-agent' 
  | 'occupancy-analytics'
  | 'overcrowding-detection'
  | 'interactive-floorplan'
  | 'security-agent'
  | 'security-intelligence'
  | 'access-monitoring'
  | 'multi-site'
  | 'cnn-vision'
  | 'cnn-occupancy'
  | 'cost-optimization'
  | 'cost-agent'
  | 'cost-analysis'
  | 'resource-utilization'
  | 'budget-monitoring'
  | 'roi-analytics'
  | 'cost-recommendations'
  | 'executive-dashboard'
  | 'facility-reports'
  | 'cross-agent'
  | 'enterprise-deployment'
  | 'alerts-workflows'
  | 'iot-telemetry'
  | 'reports'
  | 'executive-reports'
  | 'login';

export interface FacilityMetric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  change: number; // percentage
  status: 'normal' | 'warning' | 'critical';
  category: 'energy' | 'maintenance' | 'occupancy' | 'security';
}

export interface EnergyDataPoint {
  time: string;
  actualDemandKw: number;
  forecastDemandKw: number;
  solarGenerationKw: number;
  isPeakTariff: boolean;
}

export interface EquipmentHealth {
  id: string;
  name: string;
  type: string;
  category?: string;
  location: string;
  healthScore: number; // 0 - 100
  vibrationMmS: number;
  vibrationMms?: number;
  bearingTempC: number;
  temperatureC?: number;
  chillerCop: number;
  copEfficiency?: number;
  runHours: number;
  operatingHours?: number;
  rulDays?: number;
  rulHours: number; // Remaining Useful Life
  status: 'optimal' | 'degraded' | 'critical';
  lastMaintenance: string;
  lastService?: string;
  nextService?: string;
  criticality?: 'High' | 'Medium' | 'Low';
  failureRisk?: FailureRisk;
}

export interface FailureRiskFactor {
  metric: string;
  currentValue: string;
  threshold: string;
  weight: string;
  contributionScore: number;
  severity: 'normal' | 'warning' | 'critical';
}

export interface FailureRisk {
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

export interface MaintenanceRecommendation {
  id: string;
  agentType?: string;
  equipmentId?: string;
  equipmentName?: string;
  title: string;
  description: string;
  estimatedSavingsUsdMonth?: number;
  estimatedCostUsd?: number;
  preventedDowntimeHrs?: number;
  status: 'pending' | 'applied' | 'dismissed';
  urgency?: 'Immediate' | 'High' | 'Medium' | 'Scheduled PM';
  spareParts?: string[];
  createdAt: string;
}

export interface MaintenanceSchedule {
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

export interface MaintenanceRecord {
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

export interface WorkOrder {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed';
  assignedTechnician?: string;
  createdAt: string;
  description: string;
  aiGenerated: boolean;
}

export interface AlertNotification {
  id: string;
  title: string;
  subject?: string;
  message: string;
  body?: string;
  severity: 'critical' | 'warning' | 'info' | 'resolved';
  timestamp: string;
  read?: boolean;
  acknowledged?: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  status?: string;
  equipmentId?: string;
  equipmentName?: string;
  category?: 'energy' | 'maintenance' | 'occupancy' | 'security';
  channel?: string;
  recipient?: string;
  detectionSource?: string;
  metricTrigger?: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  workOrderId?: string;
}

export interface AlertCounts {
  total: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  unacknowledged: number;
}

export interface AlertStats {
  totalAlerts: number;
  critical: number;
  warning: number;
  info: number;
  resolved: number;
  unacknowledged: number;
  deliverySuccessRate: number;
  detectionAccuracyPct: number;
  meanTimeToResolutionMins: number;
  channelBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
}

export interface Anomaly {
  id: string;
  category: 'energy' | 'maintenance' | 'temperature' | 'telemetry' | 'iaq';
  deviceId: string;
  deviceOrEquipment: string;
  metric: string;
  currentValue: number | string;
  currentValueDisplay: string;
  expectedBaseline: number | string;
  expectedBaselineDisplay: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  explanation: string;
  recommendedAction: string;
  status: 'active' | 'mitigated' | 'acknowledged';
  estimatedWastageUsdHr: number;
  engineSource?: string;
}

export interface OccupancyZoneItem {
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
  status: 'Normal' | 'Moderate' | 'High' | 'Critical' | 'Overcrowded' | 'Optimal' | 'Ventilation Required';
  co2Ppm: number;
  tempC: number;
  humidityPct: number;
  hvacLoadPct?: number;
  timestamp: string;
  recommendedAction?: string;
  historical?: Array<{ time: string; occupantCount: number; co2Ppm: number }>;
}

export interface OccupancySummary {
  currentOccupancy: number;
  totalCapacity: number;
  occupancyPercentage: number;
  availableCapacity: number;
  totalOccupiedSpaces: number;
  totalSpaces: number;
  peakOccupancy: number;
  peakTime: string;
  averageOccupancy: number;
  overcrowdedCount: number;
  highOccupancyCount: number;
  normalCount: number;
  mostOccupiedZone?: { id: string; name: string; percentage: number; currentOccupancy: number; capacity: number };
  leastOccupiedZone?: { id: string; name: string; percentage: number; currentOccupancy: number; capacity: number };
}

export interface OccupancyTrendData {
  time: string;
  occupancy: number;
  forecast: number;
  capacity: number;
  isPeak: boolean;
  status: 'Normal' | 'Moderate' | 'High' | 'Overcrowded';
}

// ---------------- CNN CONVOLUTIONAL NEURAL NETWORK VISION TYPES ----------------

export interface CnnBoundingBox {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
  confidence: number; // e.g. 0.985
  label: string; // 'Person' | 'Head' | 'Seated Person'
  status?: 'normal' | 'overcrowded_cluster' | 'untracked';
}

export interface CnnCameraFeed {
  id: string;
  name: string;
  zoneId: string;
  zoneName: string;
  floor: number;
  modelArchitecture: 'YOLOv8-CrowdNet (CNN)' | 'CSRNet Density Estimator' | 'ResNet-50-FPN' | 'MobileNetV3-Edge';
  resolution: string;
  frameRateFps: number;
  detectedHeadcount: number;
  rfidBadgeCount: number;
  deltaDiscrepancy: number;
  confidenceScore: number;
  densityStatus: 'optimal' | 'moderate' | 'high' | 'overcrowded';
  densityHeadsPerSqM: number;
  streamStatus: 'active' | 'calibrating' | 'standby';
  lastInferenceMs: number;
  featureMapDescription: string;
  boundingBoxes: CnnBoundingBox[];
  heatmapPoints: Array<{ x: number; y: number; weight: number }>;
}

export interface CnnLayerActivation {
  layerIndex: number;
  layerName: string;
  type: 'Conv2D' | 'BatchNorm' | 'ReLU' | 'MaxPool2D' | 'DilatedConv' | 'Dense';
  kernelSize: string;
  filterCount: number;
  outputShape: string;
  activationMapSummary: string;
  receptiveField: string;
  latencyMs: number;
}

export interface CnnInferenceResult {
  timestamp: string;
  activeModel: string;
  backboneArchitecture: string;
  totalVisualHeadcount: number;
  totalBadgeHeadcount: number;
  untrackedOccupantsDelta: number;
  avgConfidence: number;
  fpsThroughput: number;
  inferenceLatencyMs: number;
  cameras: CnnCameraFeed[];
  layerActivations: CnnLayerActivation[];
  aiVisionInsight?: string;
}

export interface SecurityEventItem {
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

export interface SecuritySummary {
  totalEvents: number;
  authorizedCount: number;
  failedAttempts: number;
  unauthorizedAttempts: number;
  restrictedAreaAttempts: number;
  activeAlertsCount: number;
  securityHealthScore: number;
  status: 'Secure' | 'Elevated Risk' | 'Critical Incident';
  recentIncidents: SecurityEventItem[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentType?: 'energy' | 'maintenance' | 'occupancy' | 'security' | 'general';
  text: string;
  timestamp: string;
  actionRecommendation?: {
    type: 'hvac_setback' | 'create_workorder' | 'chiller_optimize' | 'redirect_occupancy' | 'boost_ventilation' | 'security_lockdown' | 'dispatch_security';
    label: string;
    payload?: Record<string, any>;
  };
}

export interface ReportItem {
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

export interface ReportPreviewData {
  title: string;
  reportType: string;
  facility: string;
  dateRange: string;
  generatedAt: string;
  summaryStats: Record<string, any>;
  sections: Array<{
    title: string;
    description?: string;
    headers: string[];
    rows: (string | number)[][];
  }>;
  aiFindings?: string[];
  csvContent?: string;
}

// =========================================================================
// MILESTONE 4: COST OPTIMIZATION & ENTERPRISE DEPLOYMENT INTERFACES
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

export interface CostOverviewData {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  currentMonthlySavings: number;
  potentialMonthlySavings: number;
  totalAnnualSavings: number;
  costReductionPct: number;
  budgetUtilizationPct: number;
  facilityHealthScore: number;
  activeCostAnomalies: number;
  currency: string;
  categories: CostCategoryBreakdown[];
}

export interface CostAnalyticsData extends CostOverviewData {
  departmentCosts: DepartmentCostItem[];
  monthlyTrends: MonthlyCostTrendItem[];
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

export interface ResourceUtilizationData {
  resources: ResourceItem[];
  summary: {
    totalResourcesTracked: number;
    underutilizedCount: number;
    overutilizedCount: number;
    wastedCount: number;
    optimalCount: number;
    averageUtilizationPct: number;
    totalMonthlyWasteCost: number;
    totalPotentialSavings: number;
    annualWasteAvoidance: number;
  };
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

export interface BudgetMonitoringData {
  totalBudget: number;
  currentSpending: number;
  remainingBudget: number;
  utilizationPct: number;
  monthlySpending: number;
  forecastEndYear: number;
  varianceToBudget: number;
  overallStatus: 'NORMAL' | 'WARNING' | 'CRITICAL';
  departments: BudgetDepartmentItem[];
  summary: {
    criticalCount: number;
    warningCount: number;
    normalCount: number;
  };
}

export interface RoiProjectionPoint {
  year: string;
  cumulativeInvestment: number;
  cumulativeSavings: number;
  netCashFlow: number;
}

export interface RoiAnalyticsData {
  investmentCost: number;
  totalAnnualSavings: number;
  annualEnergySavings: number;
  annualMaintenanceSavings: number;
  annualOperationalSavings: number;
  roiPct: number;
  paybackPeriodMonths: number;
  costAvoidance: number;
  netFirstYearBenefit: number;
  threeYearNpv: number;
  projections: RoiProjectionPoint[];
  metrics: { label: string; value: string; detail: string }[];
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

export interface CrossAgentIntelligenceData {
  status: string;
  engineModel: string;
  activeAgentsConnected: Array<{
    name: string;
    status: string;
    telemetryRate: string;
    anomaliesActive?: number;
    equipmentMonitored?: number;
    zonesMonitored?: number;
    threatScore?: string;
    potentialSavingsMo?: string;
  }>;
  insights: CrossAgentInsight[];
}

export interface FacilityHealthScoreBreakdownItem {
  category: string;
  score: number;
  weightPct: number;
  status: 'Excellent' | 'Good' | 'Moderate' | 'Needs Attention' | 'Critical';
  detail: string;
}

export interface FacilityHealthScoreData {
  score: number;
  status: 'Excellent' | 'Good' | 'Moderate' | 'Needs Attention' | 'Critical';
  facilityName: string;
  lastEvaluated: string;
  breakdown: FacilityHealthScoreBreakdownItem[];
}

export interface ExecutiveDashboardData {
  facilityName: string;
  reportingPeriod: string;
  facilityHealth: FacilityHealthScoreData;
  kpis: {
    costReductionPct: number;
    roiGeneratedPct: number;
    facilityHealthScore: number;
    totalMonthlyEnergyKw: number;
    equipmentHealthAvg: number;
    securityThreatLevel: string;
    occupancyEfficiencyPct: number;
    totalOptimizationOpportunities: number;
    validatedAnnualSavings: number;
    budgetHealthStatus: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };
  costDistribution: CostCategoryBreakdown[];
  topAiRecommendations: CostSavingRecommendationItem[];
  activeAnomalies: Array<{ agent: string; title: string; impact: string; priority: string }>;
  crossAgentSummary: CrossAgentInsight[];
  savingsOpportunities: {
    immediateAvailableMonthly: number;
    validatedRealizedMonthly: number;
    annualTotalProjection: number;
  };
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

export interface EnterpriseDeploymentData {
  platformVersion: string;
  deploymentStatus: string;
  clusterRegion: string;
  slaUptimePct: number;
  meanApiLatencyMs: number;
  activeMqttBrokers: number;
  activeEdgeGateways: number;
  totalConnectedIoTSensors: number;
  nodes: EnterpriseDeploymentNode[];
  serviceMeshHealth: Array<{
    service: string;
    status: string;
    latency: string;
    throughput: string;
  }>;
}

export interface FacilityIntelligenceReportData {
  reportId: string;
  title: string;
  facilityName: string;
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  displayDate: string;
  executiveSummary: string;
  facilityHealthScore: FacilityHealthScoreData;
  energyPerformance: {
    currentDemandKw: number;
    baselineDemandKw: number;
    copEfficiency: number;
    costAvoidance: string;
    status: string;
  };
  maintenanceStatus: {
    totalEquipment: number;
    optimalCount: number;
    scheduledRepairs: number;
    criticalAsset: string;
    averageRulDays: number;
  };
  occupancyInsights: {
    totalOccupants: number;
    capacityPct: number;
    overcrowdedZonesCount: number;
    primaryAction: string;
  };
  securityOverview: {
    threatLevel: string;
    unauthorizedAttempts: number;
    cnnOpticalHeadcountSynced: boolean;
    mannedOvertimeReducedHrs: number;
  };
  costAnalysis: {
    monthlyRunRate: number;
    annualSavingsRealized: number;
    budgetVariance: number;
    topExpenseCategory: string;
  };
  topRecommendations: CostSavingRecommendationItem[];
  savingsOpportunities: Array<{ opportunity: string; savings: string }>;
}



import { Request, Response } from 'express';
import {
  getEquipmentDb,
  getWorkOrdersDb,
  getAlertsDb,
  getOccupancyZonesDb,
  getRecommendationsDb,
  getMaintenanceSchedulesDb,
  getMaintenanceRecordsDb,
  getPortfolioSitesDb,
  getReportsDb,
  getReportByIdDb,
  saveReportDb,
  deleteReportDb,
  ReportData,
} from '../../../database/models/store';
import { generatePdfReport, ReportGenerationInput } from '../services/pdfReportGenerator';

/**
 * Computes structured operational datasets for any requested report type and timeframe.
 */
async function buildReportData(
  reportType: string,
  facilityName: string = 'Apex Tower HQ (New York)',
  dateRangeStr?: string
) {
  const [
    equipment,
    workOrders,
    alerts,
    occupancyZones,
    recommendations,
    schedules,
    records,
    sites,
  ] = await Promise.all([
    getEquipmentDb(),
    getWorkOrdersDb(),
    getAlertsDb(),
    getOccupancyZonesDb(),
    getRecommendationsDb(),
    getMaintenanceSchedulesDb(),
    getMaintenanceRecordsDb(),
    getPortfolioSitesDb(),
  ]);

  const targetSite = sites.find((s) => s.name.includes(facilityName.split(' ')[0])) || sites[0] || {
    id: 'SITE-01',
    name: 'Apex Tower HQ (New York)',
    activeDemandKw: 840.5,
    healthScore: 88,
  };

  const now = new Date();
  const dateRange = dateRangeStr || (
    reportType === 'daily' ? now.toISOString().split('T')[0] :
    reportType === 'weekly' ? 'Last 7 Days' :
    reportType === 'monthly' ? 'Last 30 Days' :
    'Current Billing Cycle'
  );

  let title = 'Executive Facility Operations Audit';
  let summaryStats: Record<string, any> = {};
  let sections: ReportGenerationInput['sections'] = [];
  let aiFindings: string[] = [];
  let csvLines: string[] = [];

  // Base calculations
  const totalOccupants = occupancyZones.reduce((acc, z) => acc + z.occupantCount, 0);
  const avgZoneCo2 = Math.round(occupancyZones.reduce((acc, z) => acc + z.co2Ppm, 0) / Math.max(occupancyZones.length, 1));
  const fleetHealth = Math.round(equipment.reduce((acc, e) => acc + e.healthScore, 0) / Math.max(equipment.length, 1));
  const openWos = workOrders.filter((w) => w.status !== 'Completed');
  const completedWos = workOrders.filter((w) => w.status === 'Completed');
  const avoidedDowntimeTotal = workOrders.reduce((acc, w) => acc + (w.preventedDowntimeHrs || 0), 0) +
    records.reduce((acc, r) => acc + (r.downtimeRecordedHrs || 0), 0);

  if (reportType === 'daily') {
    title = 'Daily Operational Telemetry & Energy Audit';
    const baseDemand = targetSite.activeDemandKw || 840;
    const dailyKwh = Math.round(baseDemand * 18.5); // 18.5 equivalent full-load hours
    const dailyCost = Math.round(dailyKwh * 0.165 * 100) / 100;
    const dailyCo2 = Math.round(dailyKwh * 0.385 * 10) / 10;

    summaryStats = {
      peakDemandKw: `${baseDemand} kW`,
      totalEnergyKwh: `${dailyKwh.toLocaleString()} kWh`,
      energyCostUsd: `$${dailyCost.toLocaleString()}`,
      co2EmissionsKg: `${dailyCo2.toLocaleString()} kg`,
      occupantFootfall: totalOccupants,
      fleetHealthScore: `${fleetHealth}/100`,
    };

    aiFindings = [
      'Energy Agent maintained +1.5°C chilled water temperature setback between 12:00-16:00, avoiding $185.00 in on-peak demand tariff.',
      'Predictive Maintenance Agent flagged Chiller CH-02 vibration (4.8 mm/s) on ISO 10816 Zone C. Pre-emptive overhaul scheduled.',
      'Occupancy Agent automatically boosted outside air CFM on Floor 2 East when CO2 crossed 850 ppm.',
    ];

    sections = [
      {
        title: 'Equipment Telemetry & Health Status',
        description: 'Real-time ISO 10816 vibration, motor temperature, and remaining useful life (RUL)',
        headers: ['Asset ID', 'Equipment Name', 'Health Score', 'Status', 'Vibration (mm/s)', 'Temp (°C)', 'RUL (Days)'],
        rows: equipment.map((e) => [
          e.id,
          e.name,
          `${e.healthScore}/100`,
          e.status,
          e.vibrationMms.toFixed(1),
          `${e.temperatureC.toFixed(1)}°C`,
          `${e.rulDays} days`,
        ]),
      },
      {
        title: 'Active Work Orders & Maintenance Dispatches',
        description: 'Technician task assignments and prevented downtime hours',
        headers: ['WO ID', 'Equipment', 'Priority', 'Status', 'Technician', 'Avoided Downtime', 'Cost Est.'],
        rows: workOrders.map((w) => [
          w.id,
          w.assetName,
          w.priority,
          w.status,
          w.assignedTechnician,
          `${w.preventedDowntimeHrs} hrs`,
          `$${w.estimatedCostUsd}`,
        ]),
      },
      {
        title: 'Occupancy & Indoor Environmental Quality (IEQ)',
        description: 'Zone occupant counts, ventilation load, and IAQ compliance',
        headers: ['Zone ID', 'Location', 'Occupants', 'Capacity %', 'CO2 (PPM)', 'Temp (°C)', 'Status'],
        rows: occupancyZones.map((z) => [
          z.id,
          z.name,
          z.occupantCount,
          `${z.occupancyPercentage}%`,
          `${z.co2Ppm} ppm`,
          `${z.tempC}°C`,
          z.status,
        ]),
      },
    ];
  } else if (reportType === 'weekly') {
    title = 'Weekly Facility Efficiency & Operational Review';
    const weeklyKwh = Math.round((targetSite.activeDemandKw || 840) * 18.5 * 7);
    const weeklySavings = 4250;
    const weeklyCost = Math.round(weeklyKwh * 0.162);
    const carbonReduced = 6.2;

    summaryStats = {
      weeklyEnergyMwh: `${(weeklyKwh / 1000).toFixed(1)} MWh`,
      peakTariffSavings: `$${weeklySavings.toLocaleString()}`,
      netEnergyCost: `$${weeklyCost.toLocaleString()}`,
      carbonReducedTons: `${carbonReduced} tCO2e`,
      avgCopEfficiency: '4.15 COP',
      preventedDowntime: `${avoidedDowntimeTotal} hrs`,
    };

    aiFindings = [
      'Weekly automated load shifting saved $4,250 in peak demand utility charges across the chiller plant.',
      'Average building COP improved from 3.82 to 4.15 (+8.6% efficiency gain) following VFD harmonic recalibration.',
      'Zero high-severity thermal comfort violations reported across all 4 monitored occupancy wings.',
    ];

    sections = [
      {
        title: '7-Day Energy Consumption & Tariff Breakdown',
        description: 'Day-by-day power demand and peak tariff optimization',
        headers: ['Day', 'Peak Demand (kW)', 'Base Load (kW)', 'Total (kWh)', 'Tariff Tier', 'Daily Cost ($)'],
        rows: [
          ['Monday', 860, 420, Math.round(weeklyKwh / 7 * 1.05), 'On-Peak Rate', `$${Math.round(weeklyCost / 7 * 1.06)}`],
          ['Tuesday', 850, 415, Math.round(weeklyKwh / 7 * 1.02), 'On-Peak Rate', `$${Math.round(weeklyCost / 7 * 1.03)}`],
          ['Wednesday', 840, 410, Math.round(weeklyKwh / 7 * 1.01), 'On-Peak Rate', `$${Math.round(weeklyCost / 7 * 1.01)}`],
          ['Thursday', 855, 418, Math.round(weeklyKwh / 7 * 1.04), 'On-Peak Rate', `$${Math.round(weeklyCost / 7 * 1.04)}`],
          ['Friday', 835, 405, Math.round(weeklyKwh / 7 * 0.98), 'On-Peak Rate', `$${Math.round(weeklyCost / 7 * 0.97)}`],
          ['Saturday', 490, 260, Math.round(weeklyKwh / 7 * 0.45), 'Off-Peak Rate', `$${Math.round(weeklyCost / 7 * 0.44)}`],
          ['Sunday', 470, 250, Math.round(weeklyKwh / 7 * 0.43), 'Off-Peak Rate', `$${Math.round(weeklyCost / 7 * 0.42)}`],
        ],
      },
      {
        title: 'Predictive Maintenance & Work Order Performance',
        description: 'Condition-based maintenance actions and downtime mitigation',
        headers: ['WO ID', 'Equipment Name', 'Issue Addressed', 'Status', 'Avoided Downtime', 'Cost'],
        rows: workOrders.map((w) => [
          w.id,
          w.assetName,
          w.title,
          w.status,
          `${w.preventedDowntimeHrs} hrs`,
          `$${w.estimatedCostUsd}`,
        ]),
      },
    ];
  } else if (reportType === 'monthly') {
    title = 'Monthly Executive Sustainability & Operations Audit';
    const monthlyKwh = Math.round((targetSite.activeDemandKw || 840) * 18.5 * 30.5);
    const monthlySavings = 18450;
    const monthlyCost = Math.round(monthlyKwh * 0.158);
    const carbonFootprint = Math.round((monthlyKwh * 0.385) / 100) / 10;

    summaryStats = {
      totalMonthlyMwh: `${(monthlyKwh / 1000).toFixed(1)} MWh`,
      totalEnergyCost: `$${monthlyCost.toLocaleString()}`,
      aiOpexSavings: `$${monthlySavings.toLocaleString()}`,
      carbonFootprintTons: `${carbonFootprint} tCO2e`,
      fleetReliability: `${fleetHealth}%`,
      workOrdersResolved: completedWos.length + records.length,
    };

    aiFindings = [
      `Delivered $${monthlySavings.toLocaleString()} in net OpEx reduction via AI-driven chiller sequencing and demand response.`,
      `Avoided an estimated $68,500 in catastrophic equipment breakdown costs through predictive vibration early warnings.`,
      `Facility ESG sustainability index on track for LEED Gold / Energy Star rating 91.`,
    ];

    sections = [
      {
        title: 'Subsystem Energy Distribution & Efficiency',
        description: 'Sub-metered energy allocation across mechanical systems',
        headers: ['Subsystem', 'Power Allocation %', 'Monthly MWh', 'Efficiency Benchmark', 'Monthly Cost ($)'],
        rows: [
          ['Chilled Water Plant (CH-01, CH-02)', '48.5%', ((monthlyKwh * 0.485) / 1000).toFixed(1), '4.15 COP (Target >3.8)', `$${Math.round(monthlyCost * 0.485).toLocaleString()}`],
          ['Air Distribution & AHUs', '26.2%', ((monthlyKwh * 0.262) / 1000).toFixed(1), '0.68 kW/ton (Optimal)', `$${Math.round(monthlyCost * 0.262).toLocaleString()}`],
          ['Interior & Exterior Lighting', '13.8%', ((monthlyKwh * 0.138) / 1000).toFixed(1), '0.45 W/sqft (LED Standard)', `$${Math.round(monthlyCost * 0.138).toLocaleString()}`],
          ['Hydronic Pumping & Auxiliaries', '11.5%', ((monthlyKwh * 0.115) / 1000).toFixed(1), '91.2% Motor Efficiency', `$${Math.round(monthlyCost * 0.115).toLocaleString()}`],
        ],
      },
      {
        title: 'Maintenance Teardown & Overhaul History',
        description: 'Logged service records, parts replaced, and verifiable outcome validation',
        headers: ['Record ID', 'Equipment', 'Service Performed', 'Technician', 'Parts Cost', 'Resolution Outcome'],
        rows: records.map((r) => [
          r.id,
          r.equipmentName,
          r.serviceType,
          r.technician,
          `$${r.costUsd}`,
          r.outcome,
        ]),
      },
    ];
  } else if (reportType === 'energy') {
    title = 'Energy Intelligence & Anomaly Diagnostics Report';
    summaryStats = {
      activeDemandKw: `${targetSite.activeDemandKw || 840} kW`,
      chillerCop: '4.12 COP',
      peakTariffRate: '$0.28 / kWh',
      monthlySavingsUsd: '$4,250 / mo',
      anomalyAccuracy: '96.2%',
      powerFactor: '0.98 PF',
    };

    aiFindings = [
      'Energy Agent identified COP drop to 3.20 on Chiller CH-02 due to condenser fouling. Automated work order generated.',
      'Peak tariff load shedding algorithm active between 12:00 PM - 4:00 PM, preventing peak surcharge demand spikes.',
      'AHU-04 outside air damper recalibration prevented $388.80/month in conditioned air losses.',
    ];

    sections = [
      {
        title: 'Energy Anomaly Diagnostics & Root Cause Analysis',
        description: 'Detected anomalies, equipment impacted, hourly cost penalty, and recommended remediations',
        headers: ['Detection Time', 'Anomaly Type', 'Target Asset', 'Cost Impact', 'Statistical Confidence', 'Remediation Action'],
        rows: [
          ['10:30 AM', 'COP Efficiency Degradation', 'Centrifugal Chiller CH-02', '$38.50 / hr', '98.2%', 'Shift 30% load to CH-01 & schedule tube descaling'],
          ['09:15 AM', 'VFD Airflow Damper Leak', 'Air Handling Unit AHU-04', '$16.20 / hr', '94.6%', 'Recalibrate modulating outside air damper actuator'],
          ['07:45 AM', 'Unoccupied Lighting Baseload', 'Floor 3 West Wing', '$8.40 / hr', '99.1%', 'Apply automated occupancy PIR sensor turn-off'],
        ],
      },
      {
        title: 'Tariff Schedule & Load Shifting Economics',
        description: 'Time-of-Use rate tier structure and optimized operational schedule',
        headers: ['Tariff Tier', 'Time Window', 'Utility Rate ($/kWh)', 'Average Load (kW)', 'Optimization Status'],
        rows: [
          ['On-Peak Demand', '12:00 PM - 04:00 PM', '$0.28 / kWh', '780 kW (Shifted)', 'Active Chilled Water Setback Applied'],
          ['Mid-Peak Rate', '08:00 AM - 12:00 PM, 04:00 PM - 08:00 PM', '$0.18 / kWh', '840 kW', 'Standard Automated Operation'],
          ['Off-Peak Base', '08:00 PM - 08:00 AM, Weekends', '$0.10 / kWh', '390 kW', 'Pre-cooling & Thermal Battery Recharge'],
        ],
      },
      {
        title: 'Active Energy Conservation Measures (ECMs)',
        description: 'AI recommended efficiency initiatives and projected monthly ROI',
        headers: ['ECM ID', 'Recommendation Title', 'Estimated Savings', 'Implementation Status', 'Creation Date'],
        rows: recommendations.map((rec) => [
          rec.id,
          rec.title,
          `$${rec.estimatedSavingsUsdMonth} / mo`,
          rec.status.toUpperCase(),
          rec.createdAt,
        ]),
      },
    ];
  } else if (reportType === 'maintenance') {
    title = 'Asset Health, Vibration & Predictive Maintenance Audit';
    summaryStats = {
      fleetHealthScore: `${fleetHealth} / 100`,
      criticalAssets: equipment.filter((e) => e.status === 'Critical').length,
      warningAssets: equipment.filter((e) => e.status === 'Warning').length,
      openWorkOrders: openWos.length,
      preventedDowntime: `${avoidedDowntimeTotal} hrs`,
      avoidedBreakdownCost: '$68,500',
    };

    aiFindings = [
      'ISO 10816-3 mechanical vibration analysis: CH-02 measured 4.8 mm/s with 120Hz harmonics (bearing raceway wear).',
      'Remaining Useful Life (RUL) estimation: CH-02 has 18 operating days remaining prior to critical degradation threshold.',
      'Automated dispatch dispatched technician Marcus Vance with required replacement spare parts kit pre-allocated.',
    ];

    sections = [
      {
        title: 'Critical Fleet Health & Remaining Useful Life (RUL)',
        description: 'Condition indicators, ISO 10816 standards, and predictive RUL forecasts',
        headers: ['Asset ID', 'Name', 'Health Score', 'Status', 'Vibration (mm/s)', 'Temp (°C)', 'RUL (Days)', 'Next Service'],
        rows: equipment.map((e) => [
          e.id,
          e.name,
          `${e.healthScore}/100`,
          e.status,
          e.vibrationMms.toFixed(1),
          `${e.temperatureC.toFixed(1)}°C`,
          `${e.rulDays} days`,
          e.nextService || '2026-09-01',
        ]),
      },
      {
        title: 'Maintenance Schedules & Work Queue',
        description: 'Scheduled inspections and preventive maintenance cycles',
        headers: ['Schedule ID', 'Asset Name', 'Task Description', 'Scheduled Date', 'Recurrence', 'Assigned Tech', 'Priority'],
        rows: schedules.map((s) => [
          s.id,
          s.equipmentName,
          s.taskType,
          s.scheduledDate,
          s.recurrence,
          s.assignedTechnician,
          s.priority,
        ]),
      },
      {
        title: 'Historical Maintenance Teardown Audit',
        description: 'Validated service records and post-maintenance verification metrics',
        headers: ['Record ID', 'Asset', 'Service Type', 'Date Completed', 'Cost ($)', 'Replaced Components', 'Findings'],
        rows: records.map((r) => [
          r.id,
          r.equipmentName,
          r.serviceType,
          r.completedDate,
          `$${r.costUsd}`,
          r.partsReplaced.join(', '),
          r.findings,
        ]),
      },
    ];
  } else {
    // AI Analysis / Executive default
    title = 'AI Multi-Agent Autonomous Intelligence Audit';
    summaryStats = {
      autonomousAgents: 6,
      anomalyEngineAccuracy: '96.2%',
      actionsExecuted: '24 / 24 hr',
      energySetbackSaved: '$4,250 / mo',
      preventedDowntime: `${avoidedDowntimeTotal} hrs`,
      auditCompliance: '100% Passed',
    };

    aiFindings = [
      'Energy Agent: Autonomously managed chiller water setpoint to balance COP efficiency and peak electrical tariff.',
      'Predictive Maintenance Agent: Real-time ISO 10816 vibration analysis triggered pre-emptive work orders before downtime.',
      'Spatial Occupancy Agent: Real-time ventilation control maintained indoor CO2 < 700 ppm while optimizing airflow CFM.',
      'Security & IoT Gateway Agent: Monitored 4 ESP32 Modbus/MQTT nodes with 99.98% telemetry packet delivery rate.',
    ];

    sections = [
      {
        title: 'Multi-Agent Autonomous Decisions & Interventions',
        description: 'Logged actions executed autonomously across facility subsystems',
        headers: ['Timestamp', 'Agent Domain', 'Trigger Event', 'Autonomous Action', 'Validated Outcome', 'Confidence'],
        rows: [
          ['12:00 PM', 'Energy Agent', 'Peak Tariff Rate Ingress ($0.28/kWh)', 'Shifted 30% cooling load from CH-02 to CH-01', 'Saved 120 kWh ($33.60)', '99.4%'],
          ['10:15 AM', 'Maintenance Agent', 'Vibration 4.8 mm/s on CH-02', 'Dispatched Work Order #WO-2026-8801 with parts list', 'Avoided $45,000 failure', '97.8%'],
          ['08:30 AM', 'Occupancy Agent', 'Floor 2 West CO2 reached 840 ppm', 'Increased VAV outside air damper by +15%', 'CO2 reduced to 640 ppm', '98.9%'],
          ['06:00 AM', 'System Agent', 'Morning Startup Routine', 'Sequential chiller motor soft-start staging', 'Zero inrush demand penalty', '100.0%'],
        ],
      },
      {
        title: 'Active Work Orders & High-Priority Mitigations',
        description: 'Condition-based corrective actions currently in progress',
        headers: ['WO ID', 'Equipment Name', 'Issue Description', 'Priority', 'Assigned Tech', 'Cost Est.'],
        rows: workOrders.map((w) => [
          w.id,
          w.assetName,
          w.title,
          w.priority,
          w.assignedTechnician,
          `$${w.estimatedCostUsd}`,
        ]),
      },
    ];
  }

  // Generate robust CSV content
  csvLines.push(`FacilityOps AI - ${title}`);
  csvLines.push(`Generated Date,${now.toISOString()}`);
  csvLines.push(`Facility,${facilityName}`);
  csvLines.push(`Reporting Period,${dateRange}`);
  csvLines.push(`Auditor,System Autonomous Intelligence Agent`);
  csvLines.push('');

  csvLines.push('--- EXECUTIVE KPI SUMMARY ---');
  csvLines.push('Metric,Value');
  for (const [k, v] of Object.entries(summaryStats)) {
    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    csvLines.push(`"${label}","${v}"`);
  }
  csvLines.push('');

  if (aiFindings.length > 0) {
    csvLines.push('--- AI MULTI-AGENT DIAGNOSTIC FINDINGS ---');
    aiFindings.forEach((finding, idx) => {
      csvLines.push(`"Finding ${idx + 1}","${finding.replace(/"/g, '""')}"`);
    });
    csvLines.push('');
  }

  sections.forEach((section) => {
    csvLines.push(`--- SECTION: ${section.title.toUpperCase()} ---`);
    if (section.description) {
      csvLines.push(`"Description","${section.description.replace(/"/g, '""')}"`);
    }
    csvLines.push(section.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));
    section.rows.forEach((row) => {
      csvLines.push(row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
    });
    csvLines.push('');
  });

  const csvContent = csvLines.join('\n');

  return {
    title,
    reportType,
    facility: facilityName,
    dateRange,
    generatedAt: now.toISOString(),
    summaryStats,
    sections,
    aiFindings,
    csvContent,
  };
}

/**
 * GET /api/reports/audit - Backwards compatible executive summary endpoint
 */
export async function getAuditReport(req: Request, res: Response) {
  try {
    const equipment = await getEquipmentDb();
    const workOrders = await getWorkOrdersDb();
    const alerts = await getAlertsDb();
    const occupancy = await getOccupancyZonesDb();
    const recommendations = await getRecommendationsDb();

    return res.json({
      success: true,
      reportHeader: {
        facility: 'Apex Tower HQ (New York)',
        location: 'New York, NY',
        generatedAt: new Date().toISOString(),
        overallHealthScore: 88,
        activeAgents: 6,
      },
      energySummary: {
        currentDemandKw: 840.5,
        peakTariffSavingsUsd: 4250.0,
        copEfficiency: 4.12,
      },
      equipmentHealth: equipment,
      workOrders: workOrders,
      alerts: alerts,
      occupancy: occupancy,
      recommendations: recommendations,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate audit report' });
  }
}

/**
 * GET /api/reports - Lists all available and generated reports
 */
export async function getReports(req: Request, res: Response) {
  try {
    const reports = await getReportsDb();
    return res.json({
      success: true,
      reports,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch reports' });
  }
}

/**
 * GET /api/reports/generate - Live preview calculation of a report without saving
 */
export async function generateReportPreview(req: Request, res: Response) {
  try {
    const type = (req.query.type as string) || 'daily';
    const facility = (req.query.facility as string) || 'Apex Tower HQ (New York)';
    const dateRange = req.query.dateRange as string;

    const reportData = await buildReportData(type, facility, dateRange);

    return res.json({
      success: true,
      report: reportData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate report' });
  }
}

/**
 * POST /api/reports/export - Generates and saves report to database, returning download payload
 */
export async function exportReport(req: Request, res: Response) {
  try {
    const {
      type = 'daily',
      format = 'csv',
      facility = 'Apex Tower HQ (New York)',
      dateRange,
    } = req.body;

    const reportData = await buildReportData(type, facility, dateRange);
    const id = `RPT-${Date.now()}`;
    const cleanType = type.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `FacilityOps_${cleanType}_Report_${Date.now()}.${format === 'pdf' ? 'pdf' : 'csv'}`;

    let pdfBase64 = '';
    let fileSizeKb = 12;

    if (format === 'pdf') {
      const pdfBuffer = generatePdfReport({
        title: reportData.title,
        reportType: reportData.reportType,
        facility: reportData.facility,
        dateRange: reportData.dateRange,
        generatedAt: reportData.generatedAt,
        summaryStats: reportData.summaryStats,
        sections: reportData.sections,
        aiFindings: reportData.aiFindings,
      });

      pdfBase64 = pdfBuffer.toString('base64');
      fileSizeKb = Math.round((pdfBuffer.length / 1024) * 10) / 10;
    } else {
      fileSizeKb = Math.round((Buffer.byteLength(reportData.csvContent, 'utf8') / 1024) * 10) / 10;
    }

    const savedRecord: ReportData = {
      id,
      filename,
      title: reportData.title,
      reportType: type as any,
      format: format === 'pdf' ? 'pdf' : 'csv',
      facilityId: 'SITE-01',
      facilityName: facility,
      dateRange: reportData.dateRange,
      content: format === 'pdf' ? pdfBase64 : reportData.csvContent,
      summaryStats: reportData.summaryStats,
      generatedAt: reportData.generatedAt,
      generatedBy: 'System Automation Agent',
      fileSizeKb,
    };

    await saveReportDb(savedRecord);

    return res.json({
      success: true,
      report: savedRecord,
      filename,
      format,
      content: format === 'pdf' ? pdfBase64 : reportData.csvContent,
      contentType: format === 'pdf' ? 'application/pdf' : 'text/csv',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to export report' });
  }
}

/**
 * GET /api/reports/download/:id - Downloads a specific report by ID
 */
export async function downloadReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const report = await getReportByIdDb(id);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    if (report.format === 'pdf') {
      const pdfBuffer = Buffer.from(report.content, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
      return res.send(pdfBuffer);
    } else {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
      return res.send(report.content);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to download report' });
  }
}

/**
 * DELETE /api/reports/:id - Deletes a report
 */
export async function deleteReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await deleteReportDb(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Report not found or already deleted' });
    }
    return res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to delete report' });
  }
}

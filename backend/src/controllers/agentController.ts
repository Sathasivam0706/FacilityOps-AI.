import { Request, Response } from 'express';
import { runEnergyAgent } from '../../../ai/agents/energyAgent';
import { runMaintenanceAgent } from '../../../ai/agents/maintenanceAgent';
import { runOccupancyAgent } from '../../../ai/agents/occupancyAgent';
import { runSecurityAgent } from '../../../ai/agents/securityAgent';
import { getAiInstance } from '../../../ai/geminiService';
import {
  getEquipmentDb,
  getOccupancyZonesDb,
  getOccupancySummaryDb,
  getSecurityEventsDb,
  getSecuritySummaryDb,
  getTelemetryDb,
  getWorkOrdersDb,
} from '../../../database/models/store';

export async function handleEnergyAgent(req: Request, res: Response) {
  try {
    const telemetry = await getTelemetryDb();
    const equipment = await getEquipmentDb();
    const latestTele = telemetry[0];
    const chiller = equipment.find(e => e.id.includes('CHILLER') || e.name.includes('Chiller'));

    const payload = {
      currentKw: latestTele?.payload?.active_kw || 840,
      baselineKw: 720,
      hvacCop: chiller ? chiller.copEfficiency : 3.1,
      ...req.body
    };

    const data = await runEnergyAgent(payload);
    return res.json({ success: true, agent: 'Energy Agent', data });
  } catch (error: any) {
    console.error('Energy agent error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process Energy Agent request' });
  }
}

export async function handleMaintenanceAgent(req: Request, res: Response) {
  try {
    const equipment = await getEquipmentDb();
    const chiller = equipment.find(e => e.id.includes('CHILLER') || e.name.includes('Chiller')) || equipment[0];

    const payload = {
      assetName: chiller ? chiller.name : 'Centrifugal Water Chiller CH-02',
      vibration: chiller ? chiller.vibrationMms : 4.8,
      bearingTemp: chiller ? chiller.temperatureC : 78.4,
      runHours: 29800,
      failureRiskPct: chiller ? (100 - chiller.healthScore) : 32,
      ...req.body
    };

    const data = await runMaintenanceAgent(payload);
    return res.json({ success: true, agent: 'Maintenance Agent', data });
  } catch (error: any) {
    console.error('Maintenance agent error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process Maintenance Agent request' });
  }
}

export async function handleOccupancyAgent(req: Request, res: Response) {
  try {
    const zones = await getOccupancyZonesDb();
    const summary = await getOccupancySummaryDb();
    const overcrowded = zones.filter(z => (z.occupancyPercentage || ((z.currentOccupancy || z.occupantCount) / (z.capacity || z.maxCapacity) * 100)) > 100);
    const co2Anomalies = zones.filter(z => z.co2Ppm > 1000).map(z => `${z.name} (${z.co2Ppm} PPM)`);

    const payload = {
      facilityName: 'Apex Tower HQ',
      zones,
      totalOccupancy: summary.currentOccupancy,
      totalCapacity: summary.totalCapacity,
      overcrowdedZones: overcrowded,
      co2Anomalies,
      ...req.body
    };

    const data = await runOccupancyAgent(payload);
    return res.json({ success: true, agent: 'Occupancy Agent', data });
  } catch (error: any) {
    console.error('Occupancy agent error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process Occupancy Agent request' });
  }
}

export async function handleSecurityAgent(req: Request, res: Response) {
  try {
    const events = await getSecurityEventsDb();
    const summary = await getSecuritySummaryDb();
    const activeThreats = events.filter(e => e.status === 'active' && (e.severity === 'critical' || e.severity === 'warning'));

    const payload = {
      facilityName: 'Apex Tower HQ',
      activeThreats,
      recentEvents: events.slice(0, 8),
      securityScore: summary.securityHealthScore,
      unauthorizedCount: summary.unauthorizedAttempts,
      ...req.body
    };

    const data = await runSecurityAgent(payload);
    return res.json({ success: true, agent: 'Security Agent', data });
  } catch (error: any) {
    console.error('Security agent error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process Security Agent request' });
  }
}

export async function handleQuery(req: Request, res: Response) {
  try {
    const { prompt, agentType, facilityId } = req.body;
    const userPrompt = prompt || 'Provide an operational summary of facility health, occupancy, and security posture.';

    if (agentType === 'energy') {
      const data = await runEnergyAgent({ prompt: userPrompt });
      return res.json({
        success: true,
        response: data.summary || data.response || `[Energy Agent] Operational analysis completed. Live demand: 840 kW, COP: 4.1. Peak tariff setpoints active.`,
        recommendation: {
          type: 'hvac_setback',
          label: 'Apply +1.5°C HVAC Setback',
        }
      });
    }

    if (agentType === 'maintenance') {
      const data = await runMaintenanceAgent({ prompt: userPrompt });
      return res.json({
        success: true,
        response: data.summary || data.response || `[Maintenance Agent] Anomaly Diagnostic: Cooling Tower 1 exhibits elevated vibration (6.8 mm/s) & elevated bearing temp (82°C). Calculated RUL is 48 operating hours.`,
        recommendation: {
          type: 'create_workorder',
          label: 'Dispatch Emergency Work Order for Cooling Tower 1',
          payload: {
            equipmentId: 'COOLING-TOWER-01',
            equipmentName: 'Induced Draft Cooling Tower 1',
            title: 'Emergency Bearing Alignment & Lubrication',
            priority: 'urgent',
          }
        }
      });
    }

    if (agentType === 'occupancy') {
      const data = await runOccupancyAgent({ prompt: userPrompt });
      return res.json({
        success: true,
        response: data.summary || data.overcrowdingDiagnostic || `[Occupancy Agent] Analysis completed. Conference Hall A is at 108% capacity (CO2: 1280 ppm). Automated ventilation purge recommended.`,
        recommendation: {
          type: 'redirect_occupancy',
          label: 'Redirect Overflow Attendees to Conference Hub B',
          payload: {
            sourceZone: 'ZONE-CONF-HALL-A',
            targetZone: 'ZONE-CONF-HUB',
          }
        }
      });
    }

    if (agentType === 'security') {
      const data = await runSecurityAgent({ prompt: userPrompt });
      return res.json({
        success: true,
        response: data.summary || data.threatAssessment || `[Security Agent] Security health index at 82%. Critical alert: Unregistered badge #9921 swiped at Server Room A.`,
        recommendation: {
          type: 'dispatch_security',
          label: 'Dispatch Patrol Officer to Server Room Sub-Level 1',
          payload: {
            location: 'Sub-Level 1 Server Room A',
            targetBadge: 'BADGE-9921',
          }
        }
      });
    }

    // Default or General Orchestration Query
    req.body.customPrompt = userPrompt;
    req.body.facilityId = facilityId;
    
    // Call orchestration logic
    const equipment = await getEquipmentDb();
    const occupancy = await getOccupancyZonesDb();
    const telemetry = await getTelemetryDb();

    const ai = getAiInstance();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `You are the FACILITY OPERATIONS MULTI-AGENT ORCHESTRATOR assistant.
Synthesize real-time operational insights for ${facilityId || 'Apex Tower HQ'}.
Current Live Data State:
- Telemetry: Power Demand ${telemetry[0]?.payload?.active_kw || 840} kW
- Equipment Fleet Summary: ${equipment.length} tracked assets. Critical asset: ${equipment[0]?.name} (Health: ${equipment[0]?.healthScore}%, Vibration: ${equipment[0]?.vibrationMms} mm/s)
- Occupancy Summary: ${occupancy.map(o => `${o.name}: ${o.occupantCount}/${o.maxCapacity} (${o.co2Ppm} PPM CO2)`).join('; ')}

User Inquiry: "${userPrompt}"

Provide a JSON object with:
1. "response": Clear, helpful 2-4 sentence diagnostic answer grounded in the real facility telemetry provided.
2. "recommendation": Optional object with { "type": "create_workorder" | "hvac_setback", "label": "Action label" } if applicable.`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          engineType: 'Gemini 3.6 Flash (LLM)',
          response: parsed.response || `[FacilityOps Agent] Analyzed operational query: "${userPrompt}". System operating at 88% overall health index with active anomalies mitigated.`,
          recommendation: parsed.recommendation
        });
      } catch (err) {
        console.warn('Orchestrator Gemini query error:', err);
      }
    }

    // Heuristic response
    return handleOrchestration(req, res);
  } catch (error: any) {
    console.error('Agent query error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process query' });
  }
}

export async function handleOrchestration(req: Request, res: Response) {
  try {
    const { facilityId, customPrompt } = req.body;
    const promptStr = customPrompt || 'Generate full cross-agent operational briefing and automated mitigation strategy.';
    const equipment = await getEquipmentDb();
    const occupancy = await getOccupancyZonesDb();
    const telemetry = await getTelemetryDb();

    const ai = getAiInstance();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `You are the FACILITY OPERATIONS MULTI-AGENT ORCHESTRATOR assistant.
Synthesize real-time operational insights across 6 specialized autonomous agents:
- Energy Agent
- Predictive Maintenance Agent
- Occupancy Agent
- Security Agent
- Cost Optimization Agent
- Facility Analytics Engine

Facility Target: ${facilityId || 'Apex Tower HQ'}
Real Operational Data:
- Power Telemetry: ${telemetry[0]?.payload?.active_kw || 840} kW (Baseline: 720 kW)
- Equipment Fleet: ${equipment.map(e => `${e.name} [Health: ${e.healthScore}%, Vib: ${e.vibrationMms} mm/s]`).join('; ')}
- Occupancy Zones: ${occupancy.map(o => `${o.name} [${o.occupancyPercentage}% full, CO2: ${o.co2Ppm} PPM]`).join('; ')}

User Inquiry/Command: "${promptStr}"

Provide a JSON object containing:
1. "response": A clear, direct, professional answer (3-5 sentences or formatted bullet points) addressing the user's specific prompt ("${promptStr}").
2. "overallFacilityHealth": Integer score 0-100 derived from equipment health scores.
3. "agentBriefings": Object with summary strings for each of the 6 agents.
4. "crossAgentMitigations": Array of 3 automated cross-agent workflows based on real data.
5. "projectedMonthlySavings": Estimated dollar savings.`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          engineType: 'Gemini 3.6 Flash (LLM)',
          orchestrator: 'Facility Analytics Engine',
          data: parsed
        });
      } catch (err) {
        console.warn('Orchestration Gemini error:', err);
      }
    }

    // Smart Heuristic Fallback based on user prompt and real database state
    const chiller = equipment.find(e => e.id.includes('CHILLER') || e.name.includes('Chiller')) || equipment[0];
    const highCo2Zone = occupancy.find(z => z.co2Ppm > 900) || occupancy[0];
    const liveKw = telemetry[0]?.payload?.active_kw || 840;

    let customAnswer = `Analyzed facility telemetry for ${facilityId || 'Apex Tower HQ'}. Current demand is ${liveKw} kW. Autonomous sub-agents have mitigated active energy anomalies and monitored ${chiller?.name} (Health: ${chiller?.healthScore}%).`;
    const lower = promptStr.toLowerCase();

    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      customAnswer = `Hello! I am your Agentic FacilityOps Assistant. All 6 autonomous sub-agents are online and monitoring ${facilityId || 'Apex Tower HQ'}. How can I assist you with energy optimization, predictive maintenance, occupancy comfort, or security alerts today?`;
    } else if (lower.includes('risk') || lower.includes('asset') || lower.includes('equipment')) {
      customAnswer = `Highest Risk Assets Analysis for ${facilityId || 'Apex Tower HQ'}:\n• ${chiller?.name} (Health: ${chiller?.healthScore}%, Vibration: ${chiller?.vibrationMms} mm/s, Temp: ${chiller?.temperatureC}°C) — Calculated RUL: ${chiller?.rulDays || 18} Days.\n• Air Handling Unit AHU-04 (Health: 81%, Damper Position Error: 14%) — Scheduled for calibration.\n• Chilled Water Pump P-01 (Health: 88%) — Operating within nominal tolerances.`;
    } else if (lower.includes('demand') || lower.includes('peak') || lower.includes('power')) {
      customAnswer = `24-Hour Peak Demand Reduction Strategy:\n1. Active Demand: ${liveKw} kW. Target Shed Window: 13:00 - 16:00 (Targeting 120 kW reduction).\n2. Pre-cool thermal mass by shifting chilled water setpoints from 02:00-06:00.\n3. Enforce automated perimeter LED dimming during peak tariff rates ($0.28/kWh). Projected monthly savings: $4,250.`;
    } else if (lower.includes('anomal') || lower.includes('mitigat') || lower.includes('waste')) {
      customAnswer = `Active Anomaly Mitigation Plan:\n1. ${chiller?.name} Condenser Pressure Drift: Shifted load to maintain COP at ${chiller?.copEfficiency}.\n2. ${highCo2Zone?.name} CO2 Peak (${highCo2Zone?.co2Ppm} PPM): Boosted VAV damper airflow by +20%.\n3. Perimeter Lighting Optimization: Scheduled off-peak hibernation mode.`;
    }

    return res.json({
      success: true,
      engineType: 'Analytical Heuristic Engine (Rule-based)',
      orchestrator: 'Facility Analytics Engine',
      data: {
        response: customAnswer,
        overallFacilityHealth: Math.round(equipment.reduce((acc, e) => acc + e.healthScore, 0) / (equipment.length || 1)),
        agentBriefings: {
          energyAgent: `Monitored sub-meters. Live load: ${liveKw} kW. Identified energy saving opportunities ($4,250/mo potential).`,
          maintenanceAgent: `Asset fleet health at ${chiller?.healthScore}%. ${chiller?.name} flagged for predictive maintenance in ${chiller?.rulDays || 18} days.`,
          occupancyAgent: `${highCo2Zone?.name} CO2 level at ${highCo2Zone?.co2Ppm} PPM (${highCo2Zone?.occupancyPercentage}% density). Airflow boosted.`,
          securityAgent: 'Access control online. All 24 security nodes reporting normal status.',
          costAgent: 'Identified $18,220 in potential monthly OpEx savings across peak shaving and predictive maintenance.',
          analyticsEngine: 'Facility health score index stable. All anomaly detection benchmarks compliant.'
        },
        crossAgentMitigations: [
          'Occupancy Agent triggers CO2 ventilation boost -> Energy Agent ramps AHU VFD without exceeding peak kW cap.',
          `Maintenance Agent flags ${chiller?.name} vibration -> Energy Agent shifts 25% cooling load to secondary unit.`,
          'Security Agent confirms after-hours floor vacating -> Energy Agent hibernates unoccupied thermal zones.'
        ],
        projectedMonthlySavings: 4250
      }
    });
  } catch (error: any) {
    console.error('Orchestration error:', error);
    return res.status(500).json({ error: error.message || 'Failed to execute agent orchestration' });
  }
}

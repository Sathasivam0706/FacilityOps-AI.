import { Request, Response } from 'express';
import { runPythonScript } from '../services/pythonRunner';

export async function handleEnergyForecast(req: Request, res: Response) {
  try {
    const { currentKw = 420.0, sqft = 125000.0 } = req.body;
    const result = await runPythonScript('energy_forecast.py', [
      String(currentKw),
      String(sqft)
    ]);
    return res.json({ success: true, engineStatus: 'active', data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleAnomalyDetection(req: Request, res: Response) {
  try {
    const { cop = 3.2, vibration = 4.82, co2 = 1120.0, power = 840.2, temp = 78.4 } = req.body || {};
    const result = await runPythonScript('anomaly_detection.py', [
      String(cop),
      String(vibration),
      String(co2),
      String(power),
      String(temp)
    ]);
    return res.json({ success: true, engineStatus: 'active', data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleAgentOptimization(req: Request, res: Response) {
  try {
    const { facilityId = 'HQ-01', occupancy = 450, rate = 0.22 } = req.body;
    const result = await runPythonScript('agent_optimizer.py', [
      facilityId,
      String(occupancy),
      String(rate)
    ]);
    return res.json({ success: true, engineStatus: 'active', data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

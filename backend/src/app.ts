import { Router } from 'express';
import agentRoutes from './routes/agentRoutes';
import workOrderRoutes from './routes/workOrderRoutes';
import alertRoutes from './routes/alertRoutes';
import pythonRoutes from './routes/pythonRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import iotRoutes from './routes/iotRoutes';
import energyRoutes from './routes/energyRoutes';
import occupancyRoutes from './routes/occupancyRoutes';
import securityRoutes from './routes/securityRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import reportRoutes from './routes/reportRoutes';
import anomalyRoutes from './routes/anomalyRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import costRoutes from './routes/costRoutes';
import executiveRoutes from './routes/executiveRoutes';
import { isGeminiConfigured } from '../../ai/geminiService';

const apiRouter = Router();

const getMiddleware = (mod: any) => (mod && typeof mod === 'object' && mod.default ? mod.default : mod);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Agentic AI For Smart Facility Operations And Optimizations',
    engineStatus: 'active',
    geminiConfigured: isGeminiConfigured(),
    activeAgents: [
      'Energy Agent',
      'Maintenance Agent',
      'Occupancy Agent',
      'Security Agent',
      'Cost Optimization Agent',
      'Facility Analytics Engine'
    ],
    milestonesComplete: [
      'Milestone 1: Energy Intelligence',
      'Milestone 2: Predictive Maintenance',
      'Milestone 3: Occupancy & Security Intelligence',
      'Milestone 4: Cost Optimization & Enterprise Deployment'
    ]
  });
});

apiRouter.use('/auth', getMiddleware(authRoutes));
apiRouter.use('/dashboard', getMiddleware(dashboardRoutes));
apiRouter.use('/iot', getMiddleware(iotRoutes));
apiRouter.use('/devices', getMiddleware(iotRoutes));
apiRouter.use('/energy', getMiddleware(energyRoutes));
apiRouter.use('/occupancy', getMiddleware(occupancyRoutes));
apiRouter.use('/security', getMiddleware(securityRoutes));
apiRouter.use('/cost', getMiddleware(costRoutes));
apiRouter.use('/executive', getMiddleware(executiveRoutes));
apiRouter.use('/recommendations', getMiddleware(recommendationRoutes));
apiRouter.use('/reports', getMiddleware(reportRoutes));
apiRouter.use('/agent', getMiddleware(agentRoutes));
apiRouter.use('/workorders', getMiddleware(workOrderRoutes));
apiRouter.use('/maintenance', getMiddleware(maintenanceRoutes));
apiRouter.use('/alerts', getMiddleware(alertRoutes));
apiRouter.use('/anomalies', getMiddleware(anomalyRoutes));
apiRouter.use('/python', getMiddleware(pythonRoutes));

export default apiRouter;
export { apiRouter };


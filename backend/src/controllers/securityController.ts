import { Request, Response } from 'express';
import {
  getSecurityEventsDb,
  getSecurityAlertsDb,
  getSecuritySummaryDb,
  addSecurityEventDb,
  resolveSecurityEventDb,
  getAccessEventsDb,
  addAccessEventDb,
  createAlertDb,
} from '../../../database/models/store';
import { runSecurityAgent } from '../../../ai/agents/securityAgent';

export async function getSecurityEvents(req: Request, res: Response) {
  try {
    const { severity, status, eventType } = req.query as {
      severity?: string;
      status?: string;
      eventType?: string;
    };

    const events = await getSecurityEventsDb({ severity, status, eventType });
    const summary = await getSecuritySummaryDb();

    return res.json({
      success: true,
      events,
      summary,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch security events' });
  }
}

export async function getSecurityAlerts(req: Request, res: Response) {
  try {
    const alerts = await getSecurityAlertsDb();
    return res.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch security alerts' });
  }
}

export async function getSecuritySummary(req: Request, res: Response) {
  try {
    const summary = await getSecuritySummaryDb();
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch security summary' });
  }
}

export async function createSecurityEvent(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.location || !data.eventType) {
      return res.status(400).json({ success: false, error: 'Location and eventType are required' });
    }

    const eventId = data.eventId || `EV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const id = data.id || `SEC-${eventId}`;

    const newEvent = {
      id,
      eventId,
      location: data.location,
      accessPoint: data.accessPoint || 'Access Portal',
      userIdentifier: data.userIdentifier || data.badgeId || 'UNASSIGNED',
      userName: data.userName || 'Anonymous Entity',
      userRole: data.userRole || 'Visitor',
      eventType: data.eventType,
      severity: data.severity || (data.eventType.includes('Unauthorized') || data.eventType.includes('Forced') ? 'critical' : 'warning'),
      timestamp: data.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active',
      description: data.description || `Security anomaly detected at ${data.location}: ${data.eventType}.`,
      recommendedAction: data.recommendedAction || 'Verify access credentials and review security footage.',
      badgeId: data.badgeId,
      cameraFeedId: data.cameraFeedId || 'CAM-MAIN-01',
    };

    const saved = await addSecurityEventDb(newEvent as any);

    // Also trigger linked Alert if severity is critical or warning
    if (newEvent.severity === 'critical' || newEvent.severity === 'warning') {
      try {
        await createAlertDb({
          id: `ALT-${Date.now().toString(36).toUpperCase()}`,
          timestamp: newEvent.timestamp,
          channel: 'Security Operations Center (SOC)',
          recipient: '@oncall-security-lead',
          subject: `SECURITY ALERT: ${newEvent.eventType.toUpperCase()} — ${newEvent.location}`,
          title: `Security Anomaly: ${newEvent.eventType}`,
          body: newEvent.description,
          message: newEvent.description,
          status: 'Delivered',
          acknowledged: false,
          severity: newEvent.severity,
          category: 'security',
          detectionSource: 'Access Control Gateway & AI Perimeter Guard',
          metricTrigger: `${newEvent.eventType} at ${newEvent.accessPoint}`,
          resolved: false,
        });
      } catch (err) {
        console.warn('Failed to dispatch linked alert:', err);
      }
    }

    return res.json({ success: true, event: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to create security event' });
  }
}

export async function resolveSecurityEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { notes, resolvedBy } = req.body;

    const resolved = await resolveSecurityEventDb(id, {
      notes,
      resolvedBy: resolvedBy || 'Security Supervisor',
    });

    if (!resolved) {
      return res.status(404).json({ success: false, error: 'Security event not found' });
    }

    return res.json({
      success: true,
      message: `Security incident ${id} resolved successfully.`,
      event: resolved,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to resolve security event' });
  }
}

export async function getAccessLogs(req: Request, res: Response) {
  try {
    const logs = await getAccessEventsDb();
    return res.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch access logs' });
  }
}

export async function simulateAccessEvent(req: Request, res: Response) {
  try {
    const { badgeId, userName, userRole, doorName, location, accessGranted, reason } = req.body;

    const newLog = {
      id: `ACC-${Date.now().toString(36).toUpperCase()}`,
      badgeId: badgeId || 'BADGE-SIM-01',
      userName: userName || 'Employee Card',
      userRole: userRole || 'Staff',
      doorName: doorName || 'Main Atrium Turnstile',
      location: location || 'Floor 1 Atrium',
      accessGranted: Boolean(accessGranted),
      reason: reason || (accessGranted ? 'Authorized Access Verified' : 'Invalid Clearance / Denied'),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const saved = await addAccessEventDb(newLog);

    if (!accessGranted) {
      // Auto-create security event
      await createSecurityEvent({
        body: {
          location: newLog.location,
          accessPoint: newLog.doorName,
          badgeId: newLog.badgeId,
          userName: newLog.userName,
          userRole: newLog.userRole,
          eventType: 'Unauthorized Access',
          severity: 'warning',
          description: `Access denied at ${newLog.doorName}: ${newLog.reason}.`,
          recommendedAction: 'Verify access credentials and review security footage.',
        }
      } as any, {
        json: () => {},
        status: () => ({ json: () => {} }),
      } as any);
    }

    return res.json({
      success: true,
      accessEvent: saved,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to simulate access event' });
  }
}

export async function runSecurityAgentAction(req: Request, res: Response) {
  try {
    const events = await getSecurityEventsDb();
    const summary = await getSecuritySummaryDb();
    const activeThreats = events.filter(e => e.status === 'active' && (e.severity === 'critical' || e.severity === 'warning'));

    const result = await runSecurityAgent({
      facilityName: 'Apex Tower HQ',
      activeThreats,
      recentEvents: events.slice(0, 8),
      securityScore: summary.securityHealthScore,
      unauthorizedCount: summary.unauthorizedAttempts,
      prompt: req.body?.prompt,
    });

    return res.json({ success: true, agent: 'Security Agent', data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to execute Security Agent' });
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

// Type stubs for missing models - support Mongoose query chains
interface QueryChain {
  populate: (path: string, select?: string) => QueryChain;
  sort: (sort: any) => QueryChain;
  lean: () => QueryChain;
  exec: () => Promise<any>;
  then: (onFulfilled?: any, onRejected?: any) => Promise<any>;
}

interface AdminLog {
  find: (query?: any) => QueryChain;
  findById: (id: string) => QueryChain;
  findByIdAndDelete: (id: string) => QueryChain;
  countDocuments: (query?: any) => Promise<number>;
  deleteMany: (query: any) => Promise<any>;
  aggregate: (pipeline: any[]) => Promise<any>;
  constructor: any;
}

const mockQueryChain = (): QueryChain => ({
  populate: () => mockQueryChain(),
  sort: () => mockQueryChain(),
  lean: () => mockQueryChain(),
  exec: async () => [],
  then: async () => []
});

const AdminLog: any = {
  find: () => mockQueryChain(),
  findById: () => mockQueryChain(),
  findByIdAndDelete: () => mockQueryChain(),
  countDocuments: async () => 0,
  deleteMany: async () => ({ deletedCount: 0 }),
  aggregate: async () => []
};

// Get admin logs
export const getAdminLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action as string | undefined;
    const severity = req.query.severity as string | undefined;

    const filter: any = {};
    if (action) filter.action = action;
    if (severity) filter.severity = severity;

    const logs = await AdminLog.find(filter)
      .populate('userId', 'username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AdminLog.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
};

// Create admin log entry
export const createAdminLog = async (req: AuthRequest, res: Response) => {
  try {
    const { action, actionType, details, status, severity } = req.body;

    const log = new AdminLog({
      userId: req.user?.id,
      action,
      actionType,
      details,
      status,
      severity,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create log' });
  }
};

// Delete logs (admin only)
export const deleteAdminLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { days } = req.body;

    if (!days || days < 1) {
      return res.status(400).json({ success: false, message: 'Days parameter required' });
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await AdminLog.deleteMany({ timestamp: { $lt: cutoffDate } });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} log entries older than ${days} days`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete logs' });
  }
};

// Get log statistics
export const getLogStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalLogs = await AdminLog.countDocuments();
    
    const byAction = await AdminLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const bySeverity = await AdminLog.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const failedActions = await AdminLog.countDocuments({ status: 'failed' });
    const successfulActions = await AdminLog.countDocuments({ status: 'success' });

    res.json({
      success: true,
      data: {
        total: totalLogs,
        successful: successfulActions,
        failed: failedActions,
        by_action: byAction,
        by_severity: bySeverity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};

// Export logs to CSV
export const exportLogsToCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate as string);
      if (endDate) filter.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await AdminLog.find(filter)
      .populate('userId', 'username email')
      .lean();

    // CSV format
    const header = 'Timestamp,User,Action,Type,Status,Severity,Details,IP Address\n';
    const rows = logs.map((log: any) => 
      `"${log.timestamp}","${log.userId?.username || 'Unknown'}","${log.action}","${log.actionType}","${log.status}","${log.severity}","${log.details}","${log.ipAddress}"`
    ).join('\n');

    const csv = header + rows;

    res.setHeader('Content-Disposition', 'attachment; filename="admin-logs.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export logs' });
  }
};

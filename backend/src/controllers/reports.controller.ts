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

interface ScanReport {
  find: (query?: any) => QueryChain;
  findById: (id: string) => QueryChain;
  findByIdAndDelete: (id: string) => QueryChain;
  countDocuments: (query?: any) => Promise<number>;
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

const ScanReport: any = {
  find: () => mockQueryChain(),
  findById: () => mockQueryChain(),
  findByIdAndDelete: () => mockQueryChain(),
  countDocuments: async () => 0,
  aggregate: async () => []
};

// Get all forensic reports
export const getAllReports = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const reports = await ScanReport.find()
      .populate('userId', 'username email')
      .populate('platform')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ScanReport.countDocuments();

    res.json({
      success: true,
      data: reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Get single report by ID
export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = await ScanReport.findById(reportId)
      .populate('userId', 'username email')
      .populate('detectedIndicators.ruleId', 'name riskScore');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch report' });
  }
};

// Download report as PDF/JSON
export const downloadReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const format = req.query.format || 'pdf';

    const report = await ScanReport.findById(reportId)
      .populate('userId', 'username email')
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="report.json"');
      res.json(report);
    } else {
      res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      // PDF generation would go here
      res.send(`PDF Report for ${report._id}`);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to download report' });
  }
};

// Delete report
export const deleteReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const report = await ScanReport.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete report' });
  }
};

// Get report statistics
export const getReportStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const totalReports = await ScanReport.countDocuments();
    const suspiciousProfiles = await ScanReport.countDocuments({ verdict: 'suspicious' });
    const likelyFakeProfiles = await ScanReport.countDocuments({ verdict: 'likely_fake' });
    
    const avgRiskScore = await ScanReport.aggregate([
      { $group: { _id: null, avg: { $avg: '$riskScore' } } }
    ]);

    const reportsByPlatform = await ScanReport.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        total: totalReports,
        suspicious: suspiciousProfiles,
        likelyFake: likelyFakeProfiles,
        legitimate: totalReports - suspiciousProfiles - likelyFakeProfiles,
        avgRiskScore: avgRiskScore[0]?.avg || 0,
        byPlatform: reportsByPlatform
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
